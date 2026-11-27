import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S18: inspection, resellability, authorized single restock', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 5);
    const a = sale(s, p, 2);
    const r = call(s, 'refunds.request', {
        sale: a.id, product: p.id, quantity: 1
    }, 'cashier') as Refund;
    call(s, 'returns.inspect', { id: r.id, condition: 'Sealed and intact' }, 'cashier');
    assert.equal(available(s, p.id, now), 3);
    call(s, 'refunds.review', { id: r.id, decision: 'Approve' });
    call(s, 'refunds.complete', {
        id: r.id, confirm: true, reference: 'external-1'
    });
    assert.throws(() => call(s, 'returns.disposition', { id: r.id, decision: 'Resellable' }, 'cashier'), /Forbidden/);
    call(s, 'returns.disposition', { id: r.id, decision: 'Resellable' });
    assert.equal(available(s, p.id, now), 4);
    assert.throws(() => call(s, 'returns.disposition', { id: r.id, decision: 'Resellable' }), /must not be finalized/);
});
