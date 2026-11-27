import { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode, type ComponentType, type FormEvent } from 'react';
import { Alert, Button, Checkbox, Chip, FormControlLabel, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Inbox, Search } from 'lucide-react';
import { api, cash } from './api';
export type Role = 'Owner' | 'Manager' | 'Cashier';
export type User = {
    id: string;
    name: string;
    role: Role;
    username: string;
};
export type Page = {
    id: string;
    title: string;
    roles: Role[];
    component: ComponentType;
};
export const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);
export const all: Role[] = ['Owner', 'Manager', 'Cashier'];
export const managers: Role[] = ['Owner', 'Manager'];
export const owners: Role[] = ['Owner'];
export type Row = Record<string, unknown>;
export type Field = {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'datetime-local' | 'password' | 'checkbox' | 'textarea';
    options?: {
        value: string;
        label: string;
    }[];
    optional?: boolean;
    value?: string;
};
const moneyColumns = new Set(['price', 'cost', 'total', 'subtotal', 'discount', 'amount', 'revenue', 'profit', 'gross', 'net', 'refunded', 'returnCost']);
const statusColumns = new Set(['status', 'state', 'disposition', 'demand', 'trend', 'decision']);
export function val(v: unknown): string {
    if (v === null || v === undefined || v === '') {
        return '-';
    }
    if (typeof v === 'boolean') {
        return v ? 'Yes' : 'No';
    }
    if (typeof v === 'object') {
        return JSON.stringify(v);
    }
    return String(v);
}
function Status({ value }: {
    value: string;
}) {
    const positive = ['Active', 'Applied', 'Approved', 'Refunded', 'Resellable', 'Rising', 'High', 'Replace'];
    const negative = ['Failed', 'Rejected', 'Expired', 'Out of Stock', 'Non-resellable'];
    const warning = ['Pending', 'Low Stock', 'Approaching Expiry', 'Preview', 'Insufficient Data'];
    const color = positive.includes(value) ? 'success' : negative.includes(value) ? 'error' : warning.includes(value) ? 'warning' : 'default';
    return <Chip
        size="small"
        label={value}
        color={color}
        variant="outlined"
        sx={{
        fontWeight: 600, fontSize: 11, height: 24
    }}
    />;
}
function Cell({ column, value }: {
    column: string;
    value: unknown;
}) {
    if (moneyColumns.has(column)) {
        return <>
            {typeof value === 'number' ? cash(value) : 'Unavailable'}
        </>;
    }
    if (statusColumns.has(column) && typeof value === 'string') {
        return <Status value={value}/>;
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))) {
        return <>
            {new Intl.DateTimeFormat('en-PK', {
            timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'short'
        }).format(new Date(value))}
        </>;
    }
    if (column === 'margin' && typeof value === 'number') {
        return <>{value.toFixed(1)}%</>;
    }
    if (column === 'velocity' && typeof value === 'number') {
        return <>
            {value.toFixed(2)}
        </>;
    }
    if (typeof value === 'object' && value !== null) {
        return <details>
            <summary>View details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>
                {JSON.stringify(value, null, 2)}
            </pre>
        </details>;
    }
    return <>
        {val(value)}
    </>;
}
export function Table({ rows, columns, onSelect }: {
    rows: Row[];
    columns?: string[];
    onSelect?: (r: Row) => void;
}) {
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(25);
    const cols = columns ?? Object.keys(rows[0] ?? {}).filter(k => !['password', 'fingerprint', 'key'].includes(k));
    const filtered = rows.filter(r => !search || cols.some(c => val(r[c]).toLowerCase().includes(search.toLowerCase())));
    const displayed = filtered.slice(0, limit);
    return <>
        {rows.length > 5 && <div className="table-toolbar">
            <TextField
                size="small"
                placeholder="Search records"
                aria-label="Search records"
                value={search}
                onChange={e => {
            setSearch(e.target.value);
            setLimit(25);
        }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">
                    <Search size={16}/>
                </InputAdornment> } }}
            />
            <span className="muted">{filtered.length} records</span>
        </div>}
        <div className="tablewrap">
            {displayed.length > 0 ? <table>
                <thead>
                    <tr>
                        {cols.map(k => <th key={k}>
                            {k.replace(/([A-Z])/g, ' $1')}
                        </th>)}
                        {onSelect && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {displayed.map((r, i) => <tr key={String(r.id ?? r.product ?? i)}>
                        {cols.map(k => <td key={k}>
                            <Cell column={k} value={r[k]}/>
                        </td>)}
                        {onSelect && <td>
                            <Button size="small" variant="outlined" onClick={() => onSelect(r)}>Select</Button>
                        </td>}
                    </tr>)}
                </tbody>
            </table> : <div className="table-empty">
                <Inbox size={27} strokeWidth={1.5}/>
                <strong>
                    {search ? 'No matching records' : 'No records yet'}
                </strong>
                <span>
                    {search ? 'Try another search term.' : 'Records will appear here after they are created.'}
                </span>
            </div>}
        </div>
        {filtered.length > limit && <Button sx={{ mt: 1 }} onClick={() => setLimit(v => v + 25)}>Show more ({filtered.length - limit} remaining)</Button>}
    </>;
}
export function Card({ title, children }: {
    title: string;
    children: ReactNode;
}) {
    return <Paper className="panel" elevation={0}>
        <Typography component="h2" className="panel-title" sx={{ mb: 2, fontWeight: 700 }}>
            {title}
        </Typography>
        {children}
    </Paper>;
}
export function useLoad<T>(action: string, initial: T) {
    const [data, setData] = useState(initial);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setData(await api<T>(action));
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setLoading(false);
        }
    }, [action]);
    useEffect(() => {
        void refresh();
    }, [refresh]);
    return {
        data, error, refresh, loading
    };
}
export function Options(rows: Row[], label = 'name') {
    return rows.map(r => ({ value: String(r.id), label: String(r[label] ?? r.id) }));
}
export function ActionForm({ title, action, fields, onDone, initial, button = 'Save' }: {
    title: string;
    action: string;
    fields: Field[];
    onDone?: (r: unknown) => void;
    initial?: Row;
    button?: string;
}) {
    const initialKey = JSON.stringify(initial ?? {});
    const starting = useMemo(() => JSON.parse(initialKey) as Row, [initialKey]);
    const [values, setValues] = useState<Row>(starting);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        setValues(starting);
    }, [starting]);
    async function submit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setErr('');
        setMsg('');
        try {
            const body = { ...values };
            for (const field of fields) {
                if (body[field.key] === undefined && field.value !== undefined) {
                    body[field.key] = field.type === 'checkbox' ? field.value === 'true' : field.value;
                }
            }
            const result = await api(action, body);
            setMsg('Saved successfully.');
            onDone?.(result);
            setValues(starting);
        }
        catch (e) {
            setErr((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    return <Card title={title}>
        <form onSubmit={submit}>
            <div className="fields">
                {fields.map(f => f.type === 'checkbox' ? <FormControlLabel
                    key={f.key}
                    control={<Checkbox checked={values[f.key] === true || (values[f.key] === undefined && f.value === 'true')} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.checked }))}/>}
                    label={f.label}
                /> : <TextField
                    key={f.key}
                    size="small"
                    fullWidth
                    label={f.label}
                    select={!!f.options}
                    type={f.type === 'textarea' ? 'text' : f.type ?? 'text'}
                    multiline={f.type === 'textarea'}
                    minRows={f.type === 'textarea' ? 3 : undefined}
                    required={!f.optional}
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={String(values[f.key] ?? f.value ?? '')}
                    onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                >
                    {f.options?.map(o => <MenuItem key={o.value} value={o.value}>
                        {o.label}
                    </MenuItem>)}
                </TextField>)}
            </div>
            <div className="row" style={{ marginTop: 16 }}>
                <Button variant="contained" type="submit" disabled={busy}>
                    {busy ? 'Working...' : button}
                </Button>
                <Button
                    variant="text"
                    onClick={() => {
        setValues({});
        setMsg('');
        setErr('');
    }}
                    disabled={busy}
                >Clear</Button>
            </div>
            {err && <Alert severity="error" sx={{ mt: 2 }}>
                {err}
            </Alert>}
            {msg && <Alert severity="success" sx={{ mt: 2 }}>
                {msg}
            </Alert>}
        </form>
    </Card>;
}
export function Errors({ message }: {
    message: string;
}) {
    return message ? <Alert severity="error" sx={{ mb: 2 }}>
        {message}
    </Alert> : null;
}
export function ListPage({ title, action, columns, children }: {
    title: string;
    action: string;
    columns?: string[];
    children?: (reload: () => void, rows: Row[]) => ReactNode;
}) {
    const { data, error, refresh } = useLoad<Row[]>(action, []);
    return <>
        <Errors message={error}/>
        {children?.(() => void refresh(), data)}
        <Card title={title}>
            <Button onClick={() => void refresh()}>Refresh</Button>
            <Table rows={data} columns={columns}/>
        </Card>
    </>;
}
export function Message({ children }: {
    children: ReactNode;
}) {
    return <Stack spacing={2}>
        {children}
    </Stack>;
}
