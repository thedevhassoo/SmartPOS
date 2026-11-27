import type { Handler } from '../../core/registry.ts';
import { str, opt, money, id, find, fail, stamp, audit, available, integer, type Product } from '../../core/model.ts';
export const productsList: Handler = ({ s, n }) => s.products.map(p => ({
    ...p, available: available(s, p.id, n), locationName: s.locations.find(l => l.id === p.location)?.name ?? 'Unassigned'
}));
export const productsLookup: Handler = ({ s, body, n }) => {
    const code = opt(body.barcode, 128);
    const q = opt(body.name).toLowerCase();
    if (!code && !q) {
        fail('Enter barcode or product name');
    }
    return s.products.filter(p => code ? p.barcode === code : p.name.toLowerCase().includes(q)).map(p => ({
        id: p.id, name: p.name, barcode: p.barcode, price: p.price, category: p.category, location: s.locations.find(l => l.id === p.location)?.name ?? 'Unassigned', available: available(s, p.id, n)
    }));
};
export const productsSave: Handler = ({ s, u, body, n }) => {
    const name = str(body.name, 'Name');
    const barcode = str(body.barcode, 'Barcode', 128);
    const price = money(body.price);
    const category = str(body.category, 'Category');
    const old = body.id ? find(s.products, body.id, 'Product') : null;
    if (s.products.some(p => p.barcode === barcode && p.id !== old?.id)) {
        fail('Duplicate barcode', 409);
    }
    const location = body.location === undefined ? old?.location ?? null : body.location ? find(s.locations, body.location, 'Location').id : null;
    const threshold = body.threshold === undefined ? old?.threshold ?? 0 : integer(body.threshold, 'Threshold');
    const p: Product = {
        id: old?.id ?? id(), name, barcode, price, category, location, threshold, expiryWarningDays: old?.expiryWarningDays ?? 30, created: old?.created ?? stamp(n)
    };
    const before = old ? { ...old } : null;
    if (old) {
        Object.assign(old, p);
    }
    else {
        s.products.push(p);
    }
    audit(s, u, 'product.save', { before, after: p }, n);
    return p;
};
