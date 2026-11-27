import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S17: refund approval, uncertain external result, repeat completion and permissions', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p);
    const a = sale(s, p);
    const r = call(s, 'refunds.request', {
        sale: a.id, product: p.id, quantity: 1
    }, 'cashier') as Refund;
    assert.throws(() => call(s, 'refunds.review', { id: r.id, decision: 'Approve' }, 'cashier'), /Forbidden/);
    call(s, 'refunds.review', { id: r.id, decision: 'Approve' });
    call(s, 'refunds.complete', {
        id: r.id, confirm: false, issue: 'Uncertain'
    });
    assert.equal(r.state, 'Approved');
    call(s, 'refunds.complete', {
        id: r.id, confirm: true, reference: 'external-1'
    });
    call(s, 'refunds.complete', {
        id: r.id, confirm: true, reference: 'external-1'
    });
    assert.equal(r.state, 'Refunded');
    assert.throws(() => call(s, 'refunds.complete', {
        id: r.id, confirm: true, reference: 'another'
    }), /already completed/);
});
