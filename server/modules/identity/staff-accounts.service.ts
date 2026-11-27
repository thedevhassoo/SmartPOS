import type { Handler } from '../../core/registry.ts';
import { publicUser, str, password, fail, id, find, audit, type Role } from '../../core/model.ts';
export const staffList: Handler = ({ s }) => s.users.map(publicUser);
export const staffSave: Handler = ({ s, u, body, n }) => {
    const name = str(body.name, 'Name');
    const username = str(body.username, 'Username', 80).toLowerCase();
    const role = str(body.role, 'Role') as Role;
    if (!['Owner', 'Manager', 'Cashier'].includes(role)) {
        fail('Invalid role');
    }
    const old = body.id ? find(s.users, body.id, 'User') : null;
    if (s.users.some(x => x.username === username && x.id !== old?.id)) {
        fail('Username already exists', 409);
    }
    if (old?.id === u.id && (role !== 'Owner' || body.active === false)) {
        fail('Cannot remove your own owner access');
    }
    const active = body.active !== false;
    if (old) {
        Object.assign(old, {
            name, username, role, active
        });
        if (body.password) {
            old.password = password(body.password);
        }
        s.sessions = s.sessions.filter(x => x.user !== old.id);
        audit(s, u, 'staff.update', publicUser(old), n);
        return publicUser(old);
    }
    const user = {
        id: id(), name, username, role, active, password: password(body.password)
    };
    s.users.push(user);
    audit(s, u, 'staff.create', publicUser(user), n);
    return publicUser(user);
};
export const staffReset: Handler = ({ s, u, body, n }) => {
    const target = find(s.users, body.id, 'User');
    target.password = password(body.password);
    s.sessions = s.sessions.filter(x => x.user !== target.id);
    audit(s, u, 'staff.reset', { id: target.id }, n);
    return { ok: true };
};
