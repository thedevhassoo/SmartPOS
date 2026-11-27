import type { Handler } from '../../core/registry.ts';
import { date, day, fail } from '../../core/model.ts';
import { demand, daysAgo, netUnits } from '../../core/analytics.ts';
export const reportsSummary: Handler = ({ s, body, n }) => {
    const from = body.from ? date(body.from) : daysAgo(n, 29);
    const to = body.to ? date(body.to) : day(n);
    if (from > to) {
        fail('Start date must not follow end date');
    }
    const inRange = (v: string) => day(new Date(v)) >= from && day(new Date(v)) <= to;
    const sales = s.sales.filter(x => inRange(x.at));
    const refunds = s.refunds.filter(r => r.state === 'Refunded' && r.confirmed && inRange(r.confirmed));
    const gross = sales.reduce((a, x) => a + x.total, 0);
    const refunded = refunds.reduce((a, x) => a + x.amount, 0);
    const chart = Object.entries(sales.reduce<Record<string, number>>((a, x) => {
        const d = day(new Date(x.at));
        a[d] = (a[d] ?? 0) + x.total;
        return a;
    }, {})).sort().map(([date, gross]) => ({ date, gross }));
    const products = s.products.map(p => {
        const lines = sales.flatMap(x => x.lines.filter(l => l.product === p.id));
        const rs = refunds.filter(r => r.line === p.id);
        const revenue = lines.reduce((a, l) => a + l.total, 0) - rs.reduce((a, r) => a + r.amount, 0);
        const allocations = lines.flatMap(l => l.allocations);
        const restocks = s.refunds.filter(r => r.line === p.id && r.restocked && r.disposedAt && inRange(r.disposedAt));
        const cost = allocations.some(a => a.cost === null) || restocks.some(r => r.returnCost === null) ? null : allocations.reduce((a, l) => a + l.quantity * (l.cost ?? 0), 0) - restocks.reduce((a, r) => a + (r.returnCost ?? 0), 0);
        const d = demand(s, p, n);
        const peers = s.products.filter(x => x.category === p.category).map(x => demand(s, x, n)).filter(x => x.history);
        const mean = peers.length ? peers.reduce((a, x) => a + x.velocity, 0) / peers.length : 0;
        const classification = !d.history || peers.length < 3 || mean === 0 ? 'Insufficient Data' : d.velocity >= 1.2 * mean ? 'High' : d.velocity <= 0.8 * mean ? 'Low' : 'Average';
        const previous = netUnits(s, p.id, daysAgo(n, 59), daysAgo(n, 30));
        const longHistory = p.created.slice(0, 10) <= daysAgo(n, 59);
        const trend = !longHistory || !previous ? 'Insufficient Data' : d.units >= 1.2 * previous ? 'Rising' : d.units <= 0.8 * previous ? 'Falling' : 'Stable';
        return {
            demand: classification, trend, id: p.id, name: p.name, category: p.category, units: lines.reduce((a, l) => a + l.quantity, 0), refundedUnits: rs.reduce((a, r) => a + r.quantity, 0), revenue, cost, profit: cost === null ? null : revenue - cost, margin: cost === null || revenue <= 0 ? null : 100 * (revenue - cost) / revenue, velocity: d.velocity, sufficient: d.sufficient
        };
    });
    return {
        from, to, gross, count: sales.length, refunded, net: gross - refunded, units: products.reduce((a, p) => a + p.units, 0), chart, products
    };
};
