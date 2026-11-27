import { type Registry, managers } from '../../core/registry.ts';
import { refundsReview, refundsComplete } from './refund-management.service.ts';
export const routes: Registry = {
    "refunds.review": { roles: managers, run: refundsReview },
    "refunds.complete": { roles: managers, run: refundsComplete }
};
