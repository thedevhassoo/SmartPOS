import { empty, password, type State, type User, type Product, type Sale } from '../core/model.ts';
import { loadRoutes } from '../core/load.ts';
import { dispatch, MemoryStore } from '../core/registry.ts';
export const now = new Date('2026-11-26T10:00:00.000Z');
export const fixedPassword = 'Test-password-123';
const hash = password(fixedPassword);
export const testRoutes = await loadRoutes();
export function fixture() {
    const s = empty();
    for (const role of ['Owner', 'Manager', 'Cashier'] as const) {
        const u: User = {
            id: role.toLowerCase(), name: role, username: role.toLowerCase(), role, password: hash, active: true
        };
        s.users.push(u);
        s.sessions.push({
            id: u.id + '-session', user: u.id, expires: '2030-01-01T00:00:00Z'
        });
    }
    return s;
}
export function call(s: State, action: string, body: unknown = {}, role = 'owner', time = now) {
    return dispatch(testRoutes, s, action, body, role + '-session', time);
}
export function product(s: State, barcode = '000123', price = '10.00') {
    return call(s, 'products.save', {
        name: 'Tea', barcode, price, category: 'Grocery'
    }) as Product;
}
export function receive(s: State, p: Product, quantity = 20) {
    return call(s, 'stock.receive', {
        product: p.id, quantity, cost: '4.00', expiry: '2026-12-15'
    });
}
export function sale(s: State, p: Product, quantity = 2, time = now) {
    const r = call(s, 'drafts.save', { items: [{ product: p.id, quantity }] }, 'cashier', time) as {
        draft: {
            id: string;
        };
        quote: {
            total: number;
        };
    };
    return call(s, 'sales.push', {
        draft: r.draft.id, key: r.draft.id, paid: (r.quote.total / 100).toFixed(2), paymentChecked: true
    }, 'cashier', time) as Sale;
}
export { MemoryStore };
