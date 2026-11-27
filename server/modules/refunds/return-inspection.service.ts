import type { Handler } from '../../core/registry.ts';
import { find, str, fail, id, audit, stamp, day, type Batch } from '../../core/model.ts';
export const returnsInspect: Handler = ({ s, u, body, n }) => {
    const refund = find(s.refunds, body.id, 'Refund');
    if (refund.state === 'Rejected' || refund.disposition) {
        fail('Return cannot be inspected');
    }
    if (u.role === 'Cashier' && refund.by !== u.id) {
        fail('Forbidden', 403);
    }
    refund.inspection = str(body.condition, 'Condition', 500);
    audit(s, u, 'return.inspect', refund, n);
    return refund;
};
export const returnsDisposition: Handler = ({ s, u, body, n }) => {
    const refund = find(s.refunds, body.id, 'Refund');
    if (refund.state !== 'Refunded' || !refund.inspection || refund.disposition) {
        fail('Completed refund and inspection required; return must not be finalized', 409);
    }
    if (body.decision !== 'Resellable' && body.decision !== 'Non-resellable') {
        fail('Invalid disposition');
    }
    const sale = find(s.sales, refund.sale, 'Sale');
    const line = sale.lines.find(x => x.product === refund.line);
    if (!line) {
        fail('Original line missing');
    }
    if (body.decision === 'Resellable') {
        if (!refund.unitRanges?.length) {
            fail('Original unit allocation is missing; reconcile before restocking', 409);
        }
        let offset = 0, returned = 0, cost = 0, unknown = false;
        const additions: Batch[] = [];
        for (const allocation of line.allocations) {
            const end = offset + allocation.quantity;
            const count = refund.unitRanges.reduce((sum, range) => sum + Math.max(0, Math.min(end, range.end) - Math.max(offset, range.start)), 0);
            if (count) {
                if (allocation.expiry && allocation.expiry < day(n)) {
                    fail('Expired units cannot be returned to resellable stock');
                }
                additions.push({
                    id: id(), product: line.product, quantity: count, cost: allocation.cost, expiry: allocation.expiry, received: stamp(n), blocked: false
                });
                if (allocation.cost === null) {
                    unknown = true;
                }
                else {
                    cost += allocation.cost * count;
                }
                returned += count;
            }
            offset = end;
        }
        if (returned !== refund.quantity) {
            fail('Return allocation exceeds original stock', 409);
        }
        s.batches.push(...additions);
        refund.restocked = returned;
        refund.returnCost = unknown ? null : cost;
    }
    refund.disposition = body.decision;
    refund.disposedAt = stamp(n);
    audit(s, u, 'return.disposition', refund, n);
    return refund;
};
