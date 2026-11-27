import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function Adjust() {
    const s = useLoad<{
        products: Row[];
        batches: Row[];
    }>('stock.list', { products: [], batches: [] });
    return <>
        <Errors message={s.error}/>
        <Card title="Compare recorded with physical stock">
            <Table rows={s.data.products} columns={['name', 'recorded', 'available']}/>
        </Card>
        <ActionForm
            title="Audited adjustment"
            action="stock.adjust"
            fields={[
        {
            key: 'product', label: 'Product', options: Options(s.data.products)
        },
        {
            key: 'expected', label: 'Previously recorded quantity', type: 'number'
        },
        {
            key: 'target', label: 'Counted quantity', type: 'number'
        },
        {
            key: 'reason', label: 'Reason', type: 'textarea'
        }
    ]}
            onDone={() => void s.refresh()}
        />
    </>;
}
export const page: Page = {
    id: 'stock-reconciliation', title: 'Stock reconciliation', roles: managers, component: Adjust
};
