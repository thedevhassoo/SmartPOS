import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S15: cutoff boundary and reserved quantities prevent duplicate requests', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p);
    const a = sale(s, p, 2);
    const req = {
        sale: a.id, product: p.id, quantity: 1
    };
    assert.throws(() => call(s, 'refunds.request', req, 'cashier', new Date(now.getTime() + 168 * 3600000)), /outside/);
    const r = call(s, 'refunds.request', req, 'cashier', new Date(now.getTime() + 168 * 3600000 - 1)) as Refund;
    assert.equal(r.state, 'Pending');
    assert.throws(() => call(s, 'refunds.request', { ...req, quantity: 2 }, 'cashier'), /remaining/);
});
