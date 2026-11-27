import { type Registry, managers } from '../../core/registry.ts';
import { stockAdjust } from './stock-reconciliation.service.ts';
export const routes: Registry = {
    "stock.adjust": { roles: managers, run: stockAdjust }
};
