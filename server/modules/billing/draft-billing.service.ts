import type { Handler } from '../../core/registry.ts';
import { items, id, find, fail, stamp } from '../../core/model.ts';
import { quote } from '../../core/pricing.ts';
export const draftsList: Handler = ({ s, u }) => s.drafts.filter(d => !d.completed && d.owner === u.id);
export const draftsQuote: Handler = ({ s, body, n }) => quote(s, items(body.items), n);
export const draftsSave: Handler = ({ s, u, body, n }) => {
    const entries = items(body.items);
    const q = quote(s, entries, n);
    const old = body.id ? find(s.drafts, body.id, 'Draft') : null;
    if (old && (old.owner !== u.id || old.completed)) {
        fail('Draft is not editable', 403);
    }
    const d = {
        id: old?.id ?? id(), owner: u.id, items: entries, saved: stamp(n), completed: null
    };
    if (old) {
        Object.assign(old, d);
    }
    else {
        s.drafts.push(d);
    }
    return { draft: d, quote: q };
};
