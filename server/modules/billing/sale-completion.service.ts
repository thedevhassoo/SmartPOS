import type { Handler } from '../../core/registry.ts';
import { id, find, str, money, fail, stamp, take, audit, available, type Sale } from '../../core/model.ts';
import { quote } from '../../core/pricing.ts';
function receipt(sale: Sale) {
    return {
        ...sale, lines: sale.lines.map(({ allocations, ...line }) => line), fingerprint: undefined, key: undefined
    };
}
export const salesPush: Handler = ({ s, u, body, n }) => {
    const key = str(body.key, 'Idempotency key', 128);
    const draftId = str(body.draft, 'Saved draft');
    const paid = money(body.paid);
    const fingerprint = JSON.stringify([draftId, paid, body.paymentChecked === true]);
    const prior = s.sales.find(x => x.key === key);
    if (prior) {
        if (prior.owner !== u.id || prior.fingerprint !== fingerprint) {
            fail('Push key reused with different payload', 409);
        }
        return receipt(prior);
    }
    const d = find(s.drafts, draftId, 'Draft');
    if (d.owner !== u.id) {
        fail('Forbidden', 403);
    }
    if (d.completed) {
        fail('Draft already completed', 409);
    }
    if (body.paymentChecked !== true) {
        fail('Verify external payment before Push');
    }
    const q = quote(s, d.items, n);
    if (q.total !== paid) {
        fail('Paid amount differs from current bill; reconcile external payment', 409);
    }
    for (const l of q.lines) {
        if (available(s, l.product, n) < l.quantity) {
            fail('Insufficient Available Stock', 409);
        }
    }
    const lines = q.lines.map(l => ({ ...l, allocations: take(s, l.product, l.quantity, n) }));
    const sale: Sale = {
        ...q, offerSnapshot: q.offer ? structuredClone(s.offers.find(o => o.id === q.offer) ?? null) : null, lines, id: id(), draft: d.id, owner: u.id, key, fingerprint, at: stamp(n)
    };
    s.sales.push(sale);
    d.completed = sale.id;
    audit(s, u, 'sale.completed', {
        sale: sale.id, total: sale.total, allocations: lines.map(l => ({ product: l.product, batches: l.allocations }))
    }, n);
    return receipt(sale);
};
export const salesReceipt: Handler = ({ s, body }) => receipt(find(s.sales, body.id, 'Receipt'));
export const salesHistory: Handler = ({ s }) => s.sales.map(sale => ({ ...receipt(sale), refunds: s.refunds.filter(refund => refund.sale === sale.id).map(refund => ({
        id: refund.id, state: refund.state, amount: refund.amount, quantity: refund.quantity
    })) }));
export const auditList: Handler = ({ s }) => s.audit;
export const auditArchive: Handler = ({ s, u, body, n }) => {
    const record = find(s.audit, body.id, 'Audit record');
    if (record.archivedAt) {
        fail('Audit record already archived');
    }
    if (body.confirm !== true) {
        fail('Explicit archive confirmation required');
    }
    const reason = str(body.reason, 'Reason', 500);
    record.archivedAt = stamp(n);
    audit(s, u, 'audit.archive', { id: record.id, reason }, n);
    return { ok: true };
};
