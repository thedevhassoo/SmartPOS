import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S19: zero stock precedence, threshold equality, expiry warning', () => {
    const s = fixture();
    const p = product(s);
    let a = call(s, 'alerts.list') as {
        stock: {
            status: string;
        }[];
        expiry: unknown[];
    };
    assert.equal(a.stock[0].status, 'Out of Stock');
    receive(s, p, 3);
    call(s, 'alerts.threshold', { product: p.id, threshold: 3 });
    a = call(s, 'alerts.list') as typeof a;
    assert.equal(a.stock[0].status, 'Low Stock');
    assert.equal(a.expiry.length, 1);
    assert.throws(() => call(s, 'alerts.threshold', { product: p.id, threshold: -1 }), /Invalid Threshold/);
});
