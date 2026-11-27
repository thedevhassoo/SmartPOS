import { type Registry, all, managers, owners } from '../../core/registry.ts';
import { salesPush, salesReceipt, salesHistory, auditList, auditArchive } from './sale-completion.service.ts';
export const routes: Registry = {
    "sales.push": { roles: all, run: salesPush },
    "sales.receipt": { roles: all, run: salesReceipt },
    "sales.history": { roles: managers, run: salesHistory },
    "audit.list": { roles: managers, run: auditList },
    "audit.archive": { roles: owners, run: auditArchive }
};
