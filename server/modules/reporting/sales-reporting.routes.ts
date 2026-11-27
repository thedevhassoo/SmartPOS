import { type Registry, managers } from '../../core/registry.ts';
import { reportsSummary } from './sales-reporting.service.ts';
export const routes: Registry = {
    "reports.summary": { roles: managers, run: reportsSummary }
};
