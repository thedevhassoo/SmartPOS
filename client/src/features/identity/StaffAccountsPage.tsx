import { useState } from 'react';
import { ActionForm, Card, Table, Errors, useLoad, owners, type Page, type Row } from '../../ui';
function Staff() {
    const { data, error, refresh } = useLoad<Row[]>('staff.list', []);
    const [selected, setSelected] = useState<Row | undefined>();
    return <>
        <Errors message={error}/>
        <ActionForm
            title="Add or edit staff"
            action="staff.save"
            initial={selected}
            fields={[
        {
            key: 'id', label: 'Existing staff ID (optional)', optional: true
        },
        { key: 'name', label: 'Full name' }, { key: 'username', label: 'Username' },
        {
            key: 'role', label: 'Role', options: ['Owner', 'Manager', 'Cashier'].map(value => ({ value, label: value }))
        },
        {
            key: 'password', label: 'Password (required for new account)', type: 'password', optional: true
        },
        {
            key: 'active', label: 'Active', type: 'checkbox', value: 'true'
        }
    ]}
            onDone={() => {
        setSelected(undefined);
        void refresh();
    }}
        />
        <Card title="Staff accounts">
            <Table
                rows={data}
                columns={['name', 'username', 'role', 'active', 'id']}
                onSelect={setSelected}
            />
        </Card>
        <ActionForm
            title="Reset password"
            action="staff.reset"
            fields={[{
            key: 'id', label: 'Staff', options: data.map(r => ({ value: String(r.id), label: String(r.name) }))
        }, {
            key: 'password', label: 'New password', type: 'password'
        }]}
            onDone={() => void refresh()}
        />
    </>;
}
export const page: Page = {
    id: 'staff', title: 'Staff accounts', roles: owners, component: Staff
};
