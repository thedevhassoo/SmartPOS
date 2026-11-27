import { type State, type Item, type QuoteLine, find, fail } from './model.ts';
let scheduledOffersEnabled = false;
export function enableScheduledOffers() {
    scheduledOffersEnabled = true;
}
export function quote(s: State, items: Item[], n: Date) {
    const lines: QuoteLine[] = items.map(i => {
        const p = find(s.products, i.product, 'Product');
        return {
            ...i, name: p.name, barcode: p.barcode, price: p.price, subtotal: p.price * i.quantity, discount: 0, total: p.price * i.quantity
        };
    });
    const subtotal = lines.reduce((a, l) => a + l.subtotal, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal > 1e12) {
        fail('Bill total exceeds supported limit');
    }
    const offer = scheduledOffersEnabled ? s.offers.find(o => !o.cancelled && o.start <= n.toISOString() && n.toISOString() < o.end) : undefined;
    const discount = offer ? Math.min(subtotal, offer.kind === 'fixed' ? offer.value : Number((BigInt(subtotal) * BigInt(offer.value) + 5000n) / 10000n)) : 0;
    let assigned = 0;
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        const prior = lines.slice(0, i + 1).reduce((a, x) => a + x.subtotal, 0);
        const cumulative = subtotal ? Number(BigInt(discount) * BigInt(prior) / BigInt(subtotal)) : 0;
        l.discount = cumulative - assigned;
        assigned = cumulative;
        l.total = l.subtotal - l.discount;
    }
    return {
        lines, subtotal, discount, total: subtotal - discount, offer: offer?.id ?? null
    };
}
