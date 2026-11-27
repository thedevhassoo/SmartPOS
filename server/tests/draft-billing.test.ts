import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S09: repeat scan items aggregate, quote does not persist, explicit Save does not deduct', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 4);
    const items = [{ product: p.id, quantity: 1 }, { product: p.id, quantity: 2 }];
    const q = call(s, 'drafts.quote', { items }, 'cashier') as {
        total: number;
        lines: unknown[];
    };
    assert.equal(q.total, 3000);
    assert.equal(q.lines.length, 1);
    assert.equal(s.drafts.length, 0);
    call(s, 'drafts.save', { items }, 'cashier');
    assert.equal(s.drafts.length, 1);
    assert.equal(available(s, p.id, now), 4);
    assert.throws(() => call(s, 'drafts.quote', { items: [{ product: p.id, quantity: 0 }] }), /Invalid Quantity/);
});
