import type { Handler } from '../../core/registry.ts';
import { find, id, str, normalized, fail, audit } from '../../core/model.ts';
export const locationsList: Handler = ({ s }) => s.locations.map(l => ({ ...l, count: s.products.filter(p => p.location === l.id).length }));
export const locationsSave: Handler = ({ s, u, body, n }) => {
    const name = str(body.name, 'Location');
    const old = body.id ? find(s.locations, body.id, 'Location') : null;
    if (s.locations.some(l => normalized(l.name) === normalized(name) && l.id !== old?.id)) {
        fail('Location already exists', 409);
    }
    const l = { id: old?.id ?? id(), name };
    if (old) {
        Object.assign(old, l);
    }
    else {
        s.locations.push(l);
    }
    audit(s, u, 'location.save', l, n);
    return l;
};
export const locationsAssign: Handler = ({ s, u, body, n }) => {
    const p = find(s.products, body.product, 'Product');
    p.location = body.location ? find(s.locations, body.location, 'Location').id : null;
    audit(s, u, 'location.assign', { product: p.id, location: p.location }, n);
    return p;
};
