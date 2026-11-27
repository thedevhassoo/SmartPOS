import { useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { api, cash } from '../../api';
import { Card, Table, Errors, useLoad, all, type Page, type Row } from '../../ui';
type EligibleLine = {
    product: string;
    name: string;
    quantity: number;
    remaining: number;
    maximum: number;
};
type Eligibility = {
    id: string;
    eligible: boolean;
    lines: EligibleLine[];
};
function RefundRequest() {
    const requests = useLoad<Row[]>('refunds.list', []);
    const [receiptId, setReceiptId] = useState('');
    const [eligibility, setEligibility] = useState<Eligibility | null>(null);
    const [quantities, setQuantities] = useState<Record<string, string>>({});
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    async function verify() {
        try {
            const result = await api<Eligibility>('refunds.eligibility', { sale: receiptId });
            setEligibility(result);
            setQuantities({});
            setError('');
        }
        catch (e) {
            setEligibility(null);
            setError((e as Error).message);
        }
    }
    async function submit() {
        if (!eligibility) {
            return;
        }
        setBusy(true);
        setError('');
        setNotice('');
        try {
            const items = eligibility.lines.filter(line => Number(quantities[line.product]) > 0).map(line => ({ product: line.product, quantity: quantities[line.product] }));
            if (!items.length) {
                throw Error('Select at least one remaining unit.');
            }
            await api('refunds.request', {
                sale: eligibility.id, items, reason
            });
            setNotice('Refund request recorded. Management approval is required.');
            await requests.refresh();
            await verify();
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    return <>
        <Errors message={requests.error || error}/>
        {notice && <Alert severity="success" sx={{ mb: 2 }}>
            {notice}
        </Alert>}
        <Card title="Verify original receipt">
            <form className="row" onSubmit={e => {
        e.preventDefault();
        void verify();
    }}>
                <TextField
                    label="Receipt ID"
                    value={receiptId}
                    onChange={e => {
        setReceiptId(e.target.value);
        setEligibility(null);
    }}
                    size="small"
                    sx={{ flex: 1 }}
                    required
                />
                <Button variant="contained" type="submit">Find sale</Button>
            </form>
        </Card>
        {eligibility && <Card title="Eligible full or partial refund">
            {!eligibility.eligible && <Alert severity="warning">This sale is outside the 168-hour eligibility window.</Alert>}
            <p className="muted">Choose quantities from the verified remaining units. The server computes the maximum refundable value.</p>
            <Button
                variant="outlined"
                disabled={!eligibility.eligible}
                onClick={() => setQuantities(Object.fromEntries(eligibility.lines.map(line => [line.product, String(line.remaining)])))}
            >Select all remaining units</Button>
            {eligibility.lines.map(line => <div className="product-result" key={line.product}>
                <div className="product-result-main">
                    <strong>
                        {line.name}
                    </strong>
                    <small>{line.remaining} of {line.quantity} remaining | Maximum {cash(line.maximum)}</small>
                </div>
                <TextField
                    label="Return quantity"
                    size="small"
                    type="number"
                    value={quantities[line.product] ?? '0'}
                    disabled={!eligibility.eligible || !line.remaining}
                    onChange={e => setQuantities(old => ({ ...old, [line.product]: e.target.value }))}
                    slotProps={{ htmlInput: {
                    min: 0, max: line.remaining, step: 1
                } }}
                    sx={{ width: 120 }}
                />
            </div>)}
            <TextField
                fullWidth
                multiline
                minRows={2}
                label="Reason / notes"
                value={reason}
                onChange={e => setReason(e.target.value)}
                sx={{ my: 2 }}
            />
            <Button
                variant="contained"
                disabled={!eligibility.eligible || busy}
                onClick={() => void submit()}
            >Submit request</Button>
        </Card>}
        <Card title="Refund requests">
            <Table rows={requests.data} columns={['id', 'sale', 'line', 'quantity', 'amount', 'state', 'requested', 'reason']}/>
        </Card>
    </>;
}
export const page: Page = {
    id: 'refund-requests', title: 'Refund requests', roles: all, component: RefundRequest
};
