import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S12: before, at and after offer boundary; half-up and capped discount', () => {
    const s = fixture();
    const p = product(s, '001', '0.05');
    call(s, 'offers.save', {
        name: 'Half', kind: 'percent', value: '50', start: '2026-11-26T10:00:00Z', end: '2026-11-26T11:00:00Z'
    });
    const q = (n: Date) => call(s, 'offers.calculate', { items: [{ product: p.id, quantity: 1 }] }, 'cashier', n) as {
        discount: number;
        total: number;
    };
    assert.equal(q(new Date(now.getTime() - 1)).discount, 0);
    assert.equal(q(now).discount, 3);
    assert.equal(q(new Date('2026-11-26T10:59:59.999Z')).total, 2);
    assert.equal(q(new Date('2026-11-26T11:00:00Z')).discount, 0);
});
