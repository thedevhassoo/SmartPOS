import { type Registry, all } from '../../core/registry.ts';
import { login, me, logout } from './authentication.service.ts';
export const routes: Registry = {
    "login": { roles: 'public', run: login },
    "me": { roles: all, run: me },
    "logout": { roles: all, run: logout }
};
