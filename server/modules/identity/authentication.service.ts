import { randomBytes } from 'node:crypto';
import type { Handler } from '../../core/registry.ts';
import { matches, publicUser, fail, str, stamp } from '../../core/model.ts';
export const login: Handler = ({ s, body, n }) => {
    const username = str(body.username, 'Username').toLowerCase();
    const u = s.users.find(x => x.username === username && x.active);
    if (!u || !matches(body.password, u.password)) {
        fail('Invalid username or password', 401);
    }
    const token = randomBytes(32).toString('hex');
    s.sessions.push({
        id: token, user: u.id, expires: new Date(n.getTime() + 7 * 86400000).toISOString()
    });
    return { token, user: publicUser(u) };
};
export const me: Handler = ({ u }) => publicUser(u);
export const logout: Handler = ({ s, token }) => {
    s.sessions = s.sessions.filter(x => x.id !== token);
    return { ok: true };
};
