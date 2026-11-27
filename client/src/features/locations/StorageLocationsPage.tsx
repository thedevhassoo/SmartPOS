import { useState } from 'react';
import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function Locations() {
    const l = useLoad<Row[]>('locations.list', []), p = useLoad<Row[]>('products.list', []);
    const [selected, setSelected] = useState<Row | undefined>();
    const refresh = () => {
        void l.refresh();
        void p.refresh();
    };
    return <>
        <Errors message={l.error || p.error}/>
        <ActionForm
            title="Create or rename location"
            action="locations.save"
            initial={selected}
            fields={[{
            key: 'id', label: 'Existing location ID (optional)', optional: true
        }, { key: 'name', label: 'Location name' }]}
            onDone={() => {
        setSelected(undefined);
        refresh();
    }}
        />
        <ActionForm
            title="Assign product"
            action="locations.assign"
            fields={[{
            key: 'product', label: 'Product', options: Options(p.data)
        }, {
            key: 'location', label: 'Location (blank unassigns)', optional: true, options: [{ value: '', label: 'Unassigned' }, ...Options(l.data)]
        }]}
            onDone={refresh}
        />
        <Card title="Storage locations">
            <Table rows={l.data} columns={['name', 'count', 'id']} onSelect={setSelected}/>
        </Card>
    </>;
}
export const page: Page = {
    id: 'locations', title: 'Storage locations', roles: managers, component: Locations
};
