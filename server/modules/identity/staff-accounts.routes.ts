import { type Registry, owners } from '../../core/registry.ts';
import { staffList, staffSave, staffReset } from './staff-accounts.service.ts';
export const routes: Registry = {
    "staff.list": { roles: owners, run: staffList },
    "staff.save": { roles: owners, run: staffSave },
    "staff.reset": { roles: owners, run: staffReset }
};
