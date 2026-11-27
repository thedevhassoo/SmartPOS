interface SqlClient {
    query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}
import { empty, type State, type Item, type SaleLine, type Allocation, type ImportRow } from './model.ts';
import { schema, tableOrder, type TableName } from './relational-schema.ts';
type Row = Record<string, unknown> & {
    id: string;
};
type Rows = Record<TableName, Row[]>;
const identifier = (field: string) => `"${field}"`;
const table = (name: TableName) => `smartpos.${name}`;
function project(name: TableName, row: Record<string, unknown>): Row {
    return Object.fromEntries(Object.keys(schema[name]).map(key => [key, row[key] ?? null])) as Row;
}
function withoutParent(row: Row) {
    const { parent, position, ...rest } = row;
    return rest;
}
function children(rows: Row[], id: string) {
    return rows.filter(row => row.parent === id).sort((a, b) => Number(a.position) - Number(b.position));
}
function safeNumber(value: unknown): number {
    const number = Number(value);
    if (!Number.isSafeInteger(number)) {
        throw Error('Stored integer exceeds the safe application range');
    }
    return number;
}
export class RelationalRepository {
    private readonly client: SqlClient;
    private readonly name: TableName;
    constructor(client: SqlClient, name: TableName) {
        this.client = client;
        this.name = name;
    }
    async read(): Promise<Row[]> {
        const columns = Object.keys(schema[this.name]);
        const result = await this.client.query(`SELECT ${columns.map(identifier).join(', ')} FROM ${table(this.name)} ORDER BY id`);
        return result.rows.map(raw => {
            const decoded: Record<string, unknown> = {};
            for (const [key, kind] of Object.entries(schema[this.name])) {
                const value: unknown = raw[key];
                if (value === null || value === undefined) {
                    decoded[key] = null;
                }
                else if (kind === 'number') {
                    decoded[key] = safeNumber(value);
                }
                else if (kind === 'timestamp') {
                    decoded[key] = new Date(value as string | Date).toISOString();
                }
                else if (kind === 'date') {
                    decoded[key] = typeof value === 'string' ? value.slice(0, 10) : new Date(value as Date).toISOString().slice(0, 10);
                }
                else {
                    decoded[key] = value;
                }
            }
            return decoded as Row;
        });
    }
    async writeChanged(before: Row[], after: Row[]): Promise<void> {
        const previous = new Map(before.map(row => [row.id, JSON.stringify(row)]));
        const columns = Object.keys(schema[this.name]);
        const assignments = columns.filter(key => key !== 'id').map(key => `${identifier(key)} = EXCLUDED.${identifier(key)}`);
        const placeholders = columns.map((_, i) => `$${i + 1}`);
        const sql = `INSERT INTO ${table(this.name)} (${columns.map(identifier).join(', ')}) VALUES (${placeholders.join(', ')}) ON CONFLICT (id) DO UPDATE SET ${assignments.join(', ')}`;
        for (const row of after) {
            if (previous.get(row.id) === JSON.stringify(row)) {
                continue;
            }
            const values = columns.map(key => (schema[this.name] as Record<string, string>)[key] === 'json' && row[key] !== null ? JSON.stringify(row[key]) : row[key]);
            await this.client.query(sql, values);
        }
    }
    async removeMissing(before: Row[], after: Row[]): Promise<void> {
        const current = new Set(after.map(row => row.id));
        for (const row of before) {
            if (!current.has(row.id)) {
                await this.client.query(`DELETE FROM ${table(this.name)} WHERE id = $1`, [row.id]);
            }
        }
    }
}
export function flattenState(state: State): Rows {
    const rows = Object.fromEntries(tableOrder.map(name => [name, []])) as unknown as Rows;
    for (const name of Object.keys(state) as (keyof State)[]) {
        rows[name] = state[name].map(record => project(name, record as unknown as Record<string, unknown>));
    }
    for (const draft of state.drafts) {
        draft.items.forEach((item, position) => rows.draft_items.push(project('draft_items', {
            ...item, id: `${draft.id}:${item.product}`, parent: draft.id, position
        })));
    }
    for (const sale of state.sales) {
        sale.lines.forEach((line, position) => {
            const lineId = `${sale.id}:${line.product}`;
            rows.sale_lines.push(project('sale_lines', {
                ...line, id: lineId, parent: sale.id, position
            }));
            line.allocations.forEach((allocation, index) => rows.sale_allocations.push(project('sale_allocations', {
                ...allocation, id: `${lineId}:${index}`, parent: lineId, position: index
            })));
        });
    }
    for (const job of state.imports) {
        job.rows.forEach((row, position) => rows.import_rows.push(project('import_rows', {
            ...row, parent: job.id, position
        })));
    }
    return rows;
}
export function hydrateState(rows: Rows): State {
    const state = empty();
    for (const name of Object.keys(state) as (keyof State)[]) {
        Object.assign(state, { [name]: rows[name] });
    }
    for (const draft of state.drafts) {
        draft.items = children(rows.draft_items, draft.id).map(row => ({ product: String(row.product), quantity: Number(row.quantity) } satisfies Item));
    }
    for (const sale of state.sales) {
        sale.lines = children(rows.sale_lines, sale.id).map(row => {
            const { id, ...line } = withoutParent(row);
            const allocations = children(rows.sale_allocations, id).map(allocation => {
                const { id: _id, ...record } = withoutParent(allocation);
                return record as Allocation;
            });
            return { ...line, allocations } as SaleLine;
        });
    }
    for (const job of state.imports) {
        job.rows = children(rows.import_rows, job.id).map(row => withoutParent(row) as ImportRow);
    }
    return state;
}
export async function loadState(client: SqlClient): Promise<State> {
    const rows = Object.fromEntries(await Promise.all(tableOrder.map(async (name) => [name, await new RelationalRepository(client, name).read()]))) as Rows;
    return hydrateState(rows);
}
export async function saveState(client: SqlClient, before: State, after: State): Promise<void> {
    const previous = flattenState(before);
    const current = flattenState(after);
    // Remove obsolete draft children first, so edits that change line positions do not conflict.
    await new RelationalRepository(client, 'draft_items').removeMissing(previous.draft_items, current.draft_items);
    // Parent rows first; references remain valid for reassignment before deletion.
    for (const name of tableOrder) {
        await new RelationalRepository(client, name).writeChanged(previous[name], current[name]);
    }
    for (const name of [...tableOrder].reverse()) {
        await new RelationalRepository(client, name).removeMissing(previous[name], current[name]);
    }
}
