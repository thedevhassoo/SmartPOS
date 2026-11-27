import type { Handler } from '../../core/registry.ts';
import { find, fail, audit } from '../../core/model.ts';
export const locationsFilter: Handler = ({ s, body }) => {
    const loc = body.location ? find(s.locations, body.location, 'Location').id : null;
    return s.products.filter(p => p.location === loc);
};
export const locationsDelete: Handler = ({ s, u, body, n }) => {
    const l = find(s.locations, body.id, 'Location');
    if (body.confirm !== true) {
        fail('Explicit deletion confirmation required');
    }
    let count = 0;
    for (const p of s.products) {
        if (p.location === l.id) {
            p.location = null;
            count++;
        }
    }
    s.locations = s.locations.filter(x => x.id !== l.id);
    audit(s, u, 'location.delete', { location: l, unassigned: count }, n);
    return { unassigned: count };
};
