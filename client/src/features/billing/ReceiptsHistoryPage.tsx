import { useState } from 'react';
import { Button, TextField, Alert } from '@mui/material';
import { api, cash } from '../../api';
import { ActionForm, Card, Table, all, useUser, type Page, type Row } from '../../ui';
function Receipts() {
    const user = useUser();
    const [id, setId] = useState(''), [receipt, setReceipt] = useState<Row | null>(null), [error, setError] = useState(''), [rows, setRows] = useState<Row[]>([]), [audit, setAudit] = useState<Row[]>([]);
    async function run(action: string) {
        try {
            setError('');
            if (action === 'sales.receipt') {
                setReceipt(await api<Row>(action, { id }));
            }
            else if (action === 'sales.history') {
                setRows(await api<Row[]>(action));
            }
            else {
                setAudit(await api<Row[]>(action));
            }
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    return <>
        <Card title="Find receipt">
            <div className="row">
                <TextField
                    size="small"
                    label="Receipt ID"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    sx={{ flex: 1 }}
                />
                <Button variant="contained" onClick={() => void run('sales.receipt')}>Find</Button>
            </div>
            {error && <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>}
        </Card>
        {receipt && <Card title="Completed sale receipt">
            <p>Receipt: {String(receipt.id)}</p>
            <p>Time: {String(receipt.at)}</p>
            <Table rows={receipt.lines as Row[]} columns={['name', 'barcode', 'quantity', 'price', 'discount', 'total']}/>
            <h2>
                {cash(Number(receipt.total))}
            </h2>
            <Button onClick={() => window.print()}>Print receipt</Button>
        </Card>}
        {user?.role !== 'Cashier' && <>
            <Card title="Authorized transaction history">
                <Button onClick={() => void run('sales.history')}>Load sales history (management)</Button>
                <Table
                    rows={rows}
                    columns={['id', 'at', 'subtotal', 'discount', 'total']}
                    onSelect={r => {
            setReceipt(r);
            setId(String(r.id));
        }}
                />
            </Card>
            <Card title="Audit trail (management)">
                <Button onClick={() => void run('audit.list')}>Load audit records</Button>
                <Table rows={audit} columns={['id', 'at', 'actor', 'action', 'detail', 'archivedAt']}/>
            </Card>
            {user?.role === 'Owner' && <ActionForm
                title="Archive audit record (original retained)"
                action="audit.archive"
                fields={[
                {
                    key: 'id', label: 'Audit record', options: audit.filter(r => !r.archivedAt).map(r => ({ value: String(r.id), label: String(r.action) + ' | ' + String(r.id) }))
                },
                { key: 'reason', label: 'Archive reason' },
                {
                    key: 'confirm', label: 'Confirm traceable archival', type: 'checkbox'
                }
            ]}
                button="Archive record"
                onDone={() => void run('audit.list')}
            />}
        </>}
    </>;
}
export const page: Page = {
    id: 'receipts', title: 'Receipts & history', roles: all, component: Receipts
};
