import { useState } from 'react';
import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function LocationActions() {
    const l = useLoad<Row[]>('locations.list', []);
    const [rows, setRows] = useState<Row[]>([]);
    return <>
        <Errors message={l.error}/>
        <ActionForm
            title="Filter by current location"
            action="locations.filter"
            fields={[{
            key: 'location', label: 'Storage location', optional: true, options: [{ value: '', label: 'Unassigned' }, ...Options(l.data)]
        }]}
            button="Filter"
            onDone={r => setRows(r as Row[])}
        />
        <Card title="Matching products">
            <Table rows={rows} columns={['name', 'barcode', 'category', 'price']}/>
        </Card>
        <ActionForm
            title="Delete location (products become unassigned)"
            action="locations.delete"
            fields={[{
            key: 'id', label: 'Location', options: Options(l.data)
        }, {
            key: 'confirm', label: 'Confirm deletion and unassignment', type: 'checkbox'
        }]}
            button="Delete location"
            onDone={() => {
        setRows([]);
        void l.refresh();
    }}
        />
    </>;
}
export const page: Page = {
    id: 'location-management', title: 'Location tools', roles: managers, component: LocationActions
};
