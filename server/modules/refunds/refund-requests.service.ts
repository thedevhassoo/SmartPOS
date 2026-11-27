import type { Handler } from '../../core/registry.ts';
import { find, id, integer, money, stamp, fail, audit, opt, obj, type Refund } from '../../core/model.ts';
import { elapsedEligible, refundLimit, reserveUnits } from '../../core/refund.ts';
export const refundsList: Handler = ({ s, u }) => u.role === 'Cashier' ? s.refunds.filter(r => r.by === u.id) : s.refunds;
export const refundsEligibility: Handler = ({ s, body, n }) => {
    const sale = find(s.sales, body.sale, 'Receipt');
    return {
        id: sale.id, eligible: elapsedEligible(sale.at, n), lines: sale.lines.map(line => {
            const previous = s.refunds.filter(r => r.sale === sale.id && r.line === line.product && r.state !== 'Rejected');
            const remaining = line.quantity - previous.reduce((sum, r) => sum + r.quantity, 0);
            return {
                product: line.product, name: line.name, quantity: line.quantity, remaining, maximum: remaining > 0 ? refundLimit(line, previous, remaining) : 0
            };
        })
    };
};
export const refundsRequest: Handler = ({ s, u, body, n }) => {
    const sale = find(s.sales, body.sale, 'Receipt');
    if (!elapsedEligible(sale.at, n)) {
        fail('Refund outside 168-hour eligibility window', 409);
    }
    const entries = Array.isArray(body.items) ? body.items.map(obj) : [body];
    if (!entries.length || entries.length > 500) {
        fail('Select at least one sale item');
    }
    const records: Refund[] = [];
    for (const entry of entries) {
        const line = sale.lines.find(x => x.product === entry.product);
        if (!line) {
            fail('Sale item not found', 404);
        }
        const quantity = integer(entry.quantity, 'Quantity', 1);
        const previous = [...s.refunds, ...records].filter(r => r.sale === sale.id && r.line === line.product);
        const unitRanges = reserveUnits(line, previous, quantity);
        const maximum = refundLimit(line, previous, quantity);
        const amount = entry.amount === '' || entry.amount === undefined ? maximum : money(entry.amount);
        if (amount > maximum) {
            fail('Refund exceeds available amount', 409);
        }
        records.push({
            id: id(), sale: sale.id, line: line.product, quantity, amount, requestedAmount: amount, state: 'Pending', requested: stamp(n), by: u.id, confirmed: null, reference: '', issue: '', inspection: null, disposition: null, restocked: 0, returnCost: null, reason: opt(entry.reason ?? body.reason, 500), unitRanges
        });
    }
    for (const record of records) {
        s.refunds.push(record);
        audit(s, u, 'refund.request', record, n);
    }
    return Array.isArray(body.items) ? records : records[0];
};
