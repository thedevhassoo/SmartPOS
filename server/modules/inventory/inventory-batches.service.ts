import type { Handler } from '../../core/registry.ts';
import { find, id, integer, money, date, day, stamp, fail, audit, recorded, available } from '../../core/model.ts';
export const stockList: Handler = ({ s, n }) => ({ products: s.products.map(p => ({
        id: p.id, name: p.name, recorded: recorded(s, p.id), available: available(s, p.id, n)
    })), batches: s.batches.map(b => ({ ...b, productName: s.products.find(p => p.id === b.product)?.name })) });
export const stockReceive: Handler = ({ s, u, body, n }) => {
    const p = find(s.products, body.product, 'Product');
    const expiry = body.expiry ? date(body.expiry) : null;
    if (expiry && expiry < day(n)) {
        fail('Expired incoming batch');
    }
    const b = {
        id: id(), product: p.id, quantity: integer(body.quantity, 'Quantity', 1), cost: money(body.cost), expiry, received: stamp(n), blocked: false
    };
    s.batches.push(b);
    audit(s, u, 'stock.receive', b, n);
    return b;
};
export const stockCorrect: Handler = ({ s, u, body, n }) => {
    const b = find(s.batches, body.id, 'Batch');
    const expiry = body.expiry ? date(body.expiry) : null;
    const before = { ...b };
    b.expiry = expiry;
    b.blocked = body.blocked === true;
    audit(s, u, 'stock.correct', { before, after: b }, n);
    return b;
};
