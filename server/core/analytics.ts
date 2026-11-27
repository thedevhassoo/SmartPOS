import { type State, type Product, available, day } from './model.ts';
export function daysAgo(n: Date, days: number) {
    return day(new Date(n.getTime() - days * 86400000));
}
export function demand(s: State, p: Product, n: Date) {
    const start = daysAgo(n, 29);
    const end = day(n);
    const sales = s.sales.filter(x => day(new Date(x.at)) >= start && day(new Date(x.at)) <= end).flatMap(x => x.lines.filter(l => l.product === p.id));
    const refunded = s.refunds.filter(r => r.state === 'Refunded' && r.line === p.id && r.confirmed && day(new Date(r.confirmed)) >= start && day(new Date(r.confirmed)) <= end).reduce((a, r) => a + r.quantity, 0);
    const units = Math.max(0, sales.reduce((a, l) => a + l.quantity, 0) - refunded);
    const history = Date.parse(end) - Date.parse(day(new Date(p.created))) >= 29 * 86400000;
    return {
        units, velocity: units / 30, history, sufficient: history && units >= 10, stock: available(s, p.id, n), start, end
    };
}
export function netUnits(s: State, p: string, from: string, to: string) {
    const incl = (v: string) => day(new Date(v)) >= from && day(new Date(v)) <= to;
    return Math.max(0, s.sales.filter(x => incl(x.at)).flatMap(x => x.lines.filter(l => l.product === p)).reduce((a, l) => a + l.quantity, 0) - s.refunds.filter(r => r.line === p && r.state === 'Refunded' && r.confirmed && incl(r.confirmed)).reduce((a, r) => a + r.quantity, 0));
}
