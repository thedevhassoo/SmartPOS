import type { Handler } from '../../core/registry.ts';
import { find, fail, audit, day } from '../../core/model.ts';
import { demand } from '../../core/analytics.ts';
export const aiRecommendations: Handler = ({ s, n }) => s.products.map(p => {
    const d = demand(s, p, n);
    const suggestion = d.sufficient ? Math.ceil(d.velocity * 7) : null;
    const expiryLimit = day(new Date(n.getTime() + (p.expiryWarningDays ?? 30) * 86400000));
    const expiryUnits = s.batches.filter(b => b.product === p.id && b.expiry && b.expiry <= expiryLimit).reduce((sum, b) => sum + b.quantity, 0);
    return {
        product: p.id, name: p.name, ...d, suggestion, expiryUnits, reason: suggestion === null ? 'Insufficient Data: requires 30 days and 10 net units' : `Local moving average: ${d.units} net units over 30 days, 7-day coverage. ${d.stock < suggestion ? 'Review restocking priority.' : 'Current coverage meets estimate.'}`, attention: expiryUnits > 0 ? `${expiryUnits} units require expiry review.` : d.history && d.units === 0 ? 'No net units recorded in the observation period; review slow-moving stock, not assumed demand.' : 'No additional expiry attention from recorded facts.', uncertainty: 'Historical demand may not predict future sales. Advisory only.'
    };
});
export const aiAccept: Handler = ({ s, u, body, n }) => {
    if (body.confirm !== true) {
        fail('Explicit acceptance required');
    }
    const p = find(s.products, body.product, 'Product');
    const d = demand(s, p, n);
    if (!d.sufficient) {
        fail('Insufficient Data');
    }
    const threshold = Math.ceil(d.velocity * 7);
    if (Number(body.threshold) !== threshold) {
        fail('Suggestion changed; refresh', 409);
    }
    p.threshold = threshold;
    audit(s, u, 'threshold.ai.accept', { product: p.id, threshold }, n);
    return p;
};
