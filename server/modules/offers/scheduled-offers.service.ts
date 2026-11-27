import type { Handler } from '../../core/registry.ts';
import { find, id, str, money, instant, fail, audit, type Offer } from '../../core/model.ts';
export const offersList: Handler = ({ s, n }) => s.offers.map(o => ({ ...o, status: o.cancelled ? 'Cancelled' : o.start > n.toISOString() ? 'Scheduled' : o.end <= n.toISOString() ? 'Expired' : 'Active' }));
export const offersSave: Handler = ({ s, u, body, n }) => {
    const old = body.id ? find(s.offers, body.id, 'Offer') : null;
    if (old?.cancelled || old && old.end <= n.toISOString()) {
        fail('Cannot edit cancelled or expired offer');
    }
    const name = str(body.name, 'Offer name');
    const kind = body.kind;
    if (kind !== 'percent' && kind !== 'fixed') {
        fail('Invalid offer type');
    }
    const value = money(body.value);
    if (value <= 0 || kind === 'percent' && value > 10000) {
        fail('Invalid discount');
    }
    const start = instant(body.start), end = instant(body.end);
    if (start >= end) {
        fail('Start must precede end');
    }
    if (s.offers.some(o => !o.cancelled && o.id !== old?.id && start < o.end && o.start < end)) {
        fail('Offer schedules overlap', 409);
    }
    const offer: Offer = {
        id: old?.id ?? id(), name, kind, value, start, end, cancelled: false
    };
    if (old) {
        Object.assign(old, offer);
    }
    else {
        s.offers.push(offer);
    }
    audit(s, u, 'offer.save', offer, n);
    return offer;
};
export const offersCancel: Handler = ({ s, u, body, n }) => {
    const o = find(s.offers, body.id, 'Offer');
    o.cancelled = true;
    audit(s, u, 'offer.cancel', o, n);
    return o;
};
