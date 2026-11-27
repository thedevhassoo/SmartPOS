import type { Handler } from '../../core/registry.ts';
import { find, money, str, opt, stamp, fail, audit } from '../../core/model.ts';
export const refundsReview: Handler = ({ s, u, body, n }) => {
    const r = find(s.refunds, body.id, 'Refund');
    if (r.state !== 'Pending') {
        fail('Refund is not pending', 409);
    }
    if (body.decision === 'Reject') {
        r.state = 'Rejected';
    }
    else if (body.decision === 'Approve') {
        const amount = body.amount === '' || body.amount === undefined ? r.amount : money(body.amount);
        if (amount > r.amount) {
            fail('Cannot approve more than reserved');
        }
        r.amount = amount;
        r.state = 'Approved';
    }
    else {
        fail('Choose Approve or Reject');
    }
    audit(s, u, 'refund.review', r, n);
    return r;
};
export const refundsComplete: Handler = ({ s, u, body, n }) => {
    const r = find(s.refunds, body.id, 'Refund');
    if (r.state === 'Refunded') {
        if (r.reference === body.reference) {
            return r;
        }
        fail('Refund already completed', 409);
    }
    if (r.state !== 'Approved') {
        fail('Refund must be approved', 409);
    }
    if (body.confirm !== true) {
        r.issue = opt(body.issue, 500) || 'External refund outcome uncertain';
        audit(s, u, 'refund.reconcile', r, n);
        return r;
    }
    r.reference = str(body.reference, 'External confirmation reference');
    r.confirmed = stamp(n);
    r.state = 'Refunded';
    r.issue = '';
    audit(s, u, 'refund.completed', r, n);
    return r;
};
