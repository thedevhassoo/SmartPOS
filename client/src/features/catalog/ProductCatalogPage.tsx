import { useState } from 'react';
import { ActionForm, Card, Table, Errors, useLoad, managers, type Page, type Row } from '../../ui';
function Products() {
    const { data, error, refresh } = useLoad<Row[]>('products.list', []);
    const [edit, setEdit] = useState<Row | undefined>();
    return <>
        <Errors message={error}/>
        <ActionForm
            title="Register or edit product"
            action="products.save"
            initial={edit}
            fields={[
        {
            key: 'id', label: 'Existing product ID (optional)', optional: true
        },
        { key: 'name', label: 'Product name' }, { key: 'barcode', label: 'Barcode (scan or type)' }, { key: 'price', label: 'Selling price (PKR)' }, { key: 'category', label: 'Category' }
    ]}
            onDone={() => {
        setEdit(undefined);
        void refresh();
    }}
        />
        <Card title="Product catalogue">
            <Table
                rows={data}
                columns={['name', 'barcode', 'category', 'price', 'available', 'locationName']}
                onSelect={r => setEdit({ ...r, price: (Number(r.price) / 100).toFixed(2) })}
            />
        </Card>
    </>;
}
export const page: Page = {
    id: 'products', title: 'Products', roles: managers, component: Products
};
