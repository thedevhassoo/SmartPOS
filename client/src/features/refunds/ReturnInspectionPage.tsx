import { ActionForm, Card, Table, Errors, useLoad, all, useUser, type Page, type Row } from '../../ui';
function Returns() {
    const user = useUser();
    const s = useLoad<Row[]>('refunds.list', []);
    const opts = s.data.filter(r => !r.disposition && r.state !== 'Rejected').map(r => ({ value: String(r.id), label: `${r.id} | ${r.quantity} units` }));
    return <>
        <Errors message={s.error}/>
        <ActionForm
            title="Initial inspection"
            action="returns.inspect"
            fields={[{
            key: 'id', label: 'Refund / return', options: opts
        }, {
            key: 'condition', label: 'Observed physical condition', type: 'textarea'
        }]}
            onDone={() => void s.refresh()}
        />
        {user?.role !== 'Cashier' && <ActionForm
            title="Authorized stock disposition (Owner or Manager only)"
            action="returns.disposition"
            fields={[{
                key: 'id', label: 'Inspected completed refund', options: s.data.filter(r => r.state === 'Refunded' && r.inspection && !r.disposition).map(r => ({ value: String(r.id), label: String(r.id) }))
            }, {
                key: 'decision', label: 'Disposition', options: ['Resellable', 'Non-resellable'].map(value => ({ value, label: value }))
            }]}
            onDone={() => void s.refresh()}
        />}
        <Card title="Return status">
            <Table rows={s.data} columns={['id', 'quantity', 'state', 'inspection', 'disposition', 'restocked']}/>
        </Card>
    </>;
}
export const page: Page = {
    id: 'returns', title: 'Returns & inspection', roles: all, component: Returns
};
