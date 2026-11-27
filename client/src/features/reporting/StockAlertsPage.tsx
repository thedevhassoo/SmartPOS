import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function Alerts() {
    const a = useLoad<{
        stock: Row[];
        expiry: Row[];
    }>('alerts.list', { stock: [], expiry: [] }), p = useLoad<Row[]>('products.list', []);
    return <>
        <Errors message={a.error || p.error}/>
        <Card title="Stock alerts">
            <Table rows={a.data.stock} columns={['name', 'quantity', 'threshold', 'status']}/>
        </Card>
        <Card title="Expiry alerts (configured warning period)">
            <Table rows={a.data.expiry} columns={['name', 'quantity', 'expiry', 'status']}/>
        </Card>
        <ActionForm
            title="Set manual low-stock threshold"
            action="alerts.threshold"
            fields={[
        {
            key: 'product', label: 'Product', options: Options(p.data)
        },
        {
            key: 'threshold', label: 'Low-stock threshold', type: 'number'
        },
        {
            key: 'expiryWarningDays', label: 'Expiry warning days (default 30)', type: 'number', optional: true
        }
    ]}
            onDone={() => void a.refresh()}
        />
    </>;
}
export const page: Page = {
    id: 'stock-alerts', title: 'Stock & expiry alerts', roles: managers, component: Alerts
};
