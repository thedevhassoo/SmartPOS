import type { Handler } from '../../core/registry.ts';
import { find, recorded, integer, str, audit, id, stamp, fail } from '../../core/model.ts';
export const stockAdjust: Handler = ({ s, u, body, n }) => {
    const p = find(s.products, body.product, 'Product');
    const expected = integer(body.expected, 'Previous recorded quantity');
    const target = integer(body.target, 'Physical count');
    const reason = str(body.reason, 'Reason', 500);
    const before = recorded(s, p.id);
    if (before !== expected) {
        fail('Stock changed; reload before adjusting', 409);
    }
    let diff = target - before;
    if (diff > 0) {
        s.batches.push({
            id: id(), product: p.id, quantity: diff, cost: null, expiry: null, received: stamp(n), blocked: false
        });
    }
    else if (diff < 0) {
        let remove = -diff;
        for (const b of s.batches.filter(x => x.product === p.id).sort((a, b) => (a.expiry ?? '9999').localeCompare(b.expiry ?? '9999'))) {
            const q = Math.min(remove, b.quantity);
            b.quantity -= q;
            remove -= q;
            if (!remove) {
                break;
            }
        }
    }
    audit(s, u, 'stock.adjust', {
        product: p.id, before, after: target, reason
    }, n);
    return {
        product: p.id, before, after: target
    };
};
