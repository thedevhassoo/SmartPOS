import { ActionForm, Card, Table, Errors, useLoad, managers, type Page, type Row } from '../../ui';
function RefundManagement() {
    const s = useLoad<Row[]>('refunds.list', []);
    const opts = (state: string) => s.data.filter(r => r.state === state).map(r => ({ value: String(r.id), label: `${r.id} | ${r.quantity} units` }));
    return <>
        <Errors message={s.error}/>
        <ActionForm
            title="Approve or reject refund"
            action="refunds.review"
            fields={[
        {
            key: 'id', label: 'Pending request', options: opts('Pending')
        },
        {
            key: 'decision', label: 'Decision', options: ['Approve', 'Reject'].map(value => ({ value, label: value }))
        },
        {
            key: 'amount', label: 'Approved amount PKR (optional)', optional: true
        }
    ]}
            onDone={() => void s.refresh()}
        />
        <ActionForm
            title="Record external refund outcome"
            action="refunds.complete"
            fields={[
        {
            key: 'id', label: 'Approved request', options: opts('Approved')
        },
        {
            key: 'confirm', label: 'External refund confirmed', type: 'checkbox'
        },
        {
            key: 'reference', label: 'External reference (required on confirmation)', optional: true
        },
        {
            key: 'issue', label: 'Reconciliation issue (if unconfirmed)', optional: true
        }
    ]}
            button="Record outcome"
            onDone={() => void s.refresh()}
        />
        <Card title="Refund history">
            <Table rows={s.data} columns={['id', 'sale', 'quantity', 'amount', 'state', 'confirmed', 'reference', 'issue']}/>
        </Card>
    </>;
}
export const page: Page = {
    id: 'refund-management', title: 'Refund management', roles: managers, component: RefundManagement
};
