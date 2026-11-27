import { useState } from 'react';
import { ActionForm, Card, Table, Errors, useLoad, Options, managers, type Page, type Row } from '../../ui';
function Offers() {
    const s = useLoad<Row[]>('offers.list', []);
    const [edit, setEdit] = useState<Row | undefined>();
    const local = (v: unknown) => new Date(Date.parse(String(v)) + 5 * 3600000).toISOString().slice(0, 16);
    return <>
        <Errors message={s.error}/>
        <ActionForm
            title="Schedule or edit offer (PKT)"
            action="offers.save"
            initial={edit}
            fields={[
        {
            key: 'id', label: 'Existing offer ID (optional)', optional: true
        },
        { key: 'name', label: 'Offer name' },
        {
            key: 'kind', label: 'Discount type', options: [{ value: 'percent', label: 'Percentage' }, { value: 'fixed', label: 'Fixed PKR' }]
        },
        { key: 'value', label: 'Value' },
        {
            key: 'start', label: 'Start (PKT)', type: 'datetime-local'
        },
        {
            key: 'end', label: 'End (PKT)', type: 'datetime-local'
        }
    ]}
            onDone={() => {
        setEdit(undefined);
        void s.refresh();
    }}
        />
        <Card title="Offer schedules">
            <Table
                rows={s.data}
                columns={['name', 'kind', 'value', 'start', 'end', 'status']}
                onSelect={r => setEdit({
        ...r, value: Number(r.value) / 100, start: local(r.start), end: local(r.end)
    })}
            />
        </Card>
        <ActionForm
            title="Cancel offer"
            action="offers.cancel"
            fields={[{
            key: 'id', label: 'Offer', options: Options(s.data)
        }]}
            button="Cancel schedule"
            onDone={() => void s.refresh()}
        />
    </>;
}
export const page: Page = {
    id: 'offers', title: 'Scheduled offers', roles: managers, component: Offers
};
