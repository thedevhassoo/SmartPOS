import pg from 'pg';
import type { State } from './model.ts';
import type { Store } from './registry.ts';
import { loadState, saveState } from './relational-repositories.ts';
// DATE is a calendar value, not an instant. Preserve it without local timezone conversion.
pg.types.setTypeParser(1082, value => value);
export class PgStore implements Store {
    readonly pool: pg.Pool;
    constructor(connectionString: string) {
        this.pool = new pg.Pool({
            connectionString, max: 10, connectionTimeoutMillis: 5000
        });
    }
    async transaction<T>(work: (state: State) => T): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            // Conservative single-shop serialization: all reads and writes use this same client.
            await client.query('SELECT id FROM smartpos.transaction_lock WHERE id = 1 FOR UPDATE');
            const state = await loadState(client);
            const before = structuredClone(state);
            const result = work(state);
            await saveState(client, before, state);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
}
