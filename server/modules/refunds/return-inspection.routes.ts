import { type Registry, all, managers } from '../../core/registry.ts';
import { returnsInspect, returnsDisposition } from './return-inspection.service.ts';
export const routes: Registry = {
    "returns.inspect": { roles: all, run: returnsInspect },
    "returns.disposition": { roles: managers, run: returnsDisposition }
};
