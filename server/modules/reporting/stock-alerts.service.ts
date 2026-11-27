import type { Handler } from '../../core/registry.ts';
import { available, day, find, integer, audit } from '../../core/model.ts';
export const alertsList: Handler = ({ s, n }) => {
    const today = day(n);
    const stock = s.products.map(p => ({
        product: p.id, name: p.name, quantity: available(s, p.id, n), threshold: p.threshold
    })).filter(p => p.quantity === 0 || p.quantity <= p.threshold).map(p => ({ ...p, status: p.quantity === 0 ? 'Out of Stock' : 'Low Stock' }));
    const expiry = s.batches.filter(b => b.quantity > 0 && b.expiry && b.expiry <= day(new Date(n.getTime() + (s.products.find(p => p.id === b.product)?.expiryWarningDays ?? 30) * 86400000))).map(b => ({
        ...b, name: s.products.find(p => p.id === b.product)?.name, status: b.expiry! < today ? 'Expired' : 'Approaching Expiry'
    }));
    return { stock: stock.sort((a, b) => a.quantity - b.quantity), expiry: expiry.sort((a, b) => String(a.expiry).localeCompare(String(b.expiry))) };
};
export const alertsThreshold: Handler = ({ s, u, body, n }) => {
    const p = find(s.products, body.product, 'Product');
    p.threshold = integer(body.threshold, 'Threshold');
    if (body.expiryWarningDays !== undefined && body.expiryWarningDays !== '') {
        p.expiryWarningDays = integer(body.expiryWarningDays, 'Expiry warning days', 0, 365);
    }
    audit(s, u, 'threshold.manual', { product: p.id, threshold: p.threshold }, n);
    return p;
};
