import { type Registry, all } from '../../core/registry.ts';
import { refundsList, refundsEligibility, refundsRequest } from './refund-requests.service.ts';
export const routes: Registry = {
    "refunds.list": { roles: all, run: refundsList },
    "refunds.eligibility": { roles: all, run: refundsEligibility },
    "refunds.request": { roles: all, run: refundsRequest }
};
