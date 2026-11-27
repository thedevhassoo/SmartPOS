import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function Stock() {
    const { data, error, refresh } = useLoad<{
        products: Row[];
        batches: Row[];
    }>('stock.list', { products: [], batches: [] });
    return <>
        <Errors message={error}/>
        <ActionForm
            title="Receive incoming batch"
            action="stock.receive"
            fields={[
        {
            key: 'product', label: 'Product', options: Options(data.products)
        },
        {
            key: 'quantity', label: 'Quantity', type: 'number'
        },
        { key: 'cost', label: 'Purchase cost per unit (PKR)' },
        {
            key: 'expiry', label: 'Expiry date (blank if non-expiring)', type: 'date', optional: true
        }
    ]}
            onDone={() => void refresh()}
        />
        <Card title="Stock balances">
            <Table rows={data.products} columns={['name', 'recorded', 'available']}/>
        </Card>
        <Card title="Stock batches">
            <Table rows={data.batches} columns={['id', 'productName', 'quantity', 'cost', 'expiry', 'received', 'blocked']}/>
        </Card>
        <ActionForm
            title="Correct batch expiry or quarantine"
            action="stock.correct"
            fields={[
        {
            key: 'id', label: 'Batch', options: data.batches.map(b => ({ value: String(b.id), label: `${b.productName} | ${b.expiry ?? 'Non-expiring'} | ${b.id}` }))
        },
        {
            key: 'expiry', label: 'Correct expiry (blank if none)', type: 'date', optional: true
        },
        {
            key: 'blocked', label: 'Quarantine', type: 'checkbox'
        }
    ]}
            onDone={() => void refresh()}
        />
    </>;
}
export const page: Page = {
    id: 'inventory', title: 'Inventory & batches', roles: managers, component: Stock
};
