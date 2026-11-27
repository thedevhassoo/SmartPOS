import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S16: completed sales only, refund event accounting, recorded costs, empty period', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p);
    const a = sale(s, p, 2);
    const r = call(s, 'refunds.request', {
        sale: a.id, product: p.id, quantity: 1
    }, 'cashier') as Refund;
    call(s, 'refunds.review', { id: r.id, decision: 'Approve' });
    call(s, 'refunds.complete', {
        id: r.id, confirm: true, reference: 'external-1'
    });
    const summary = call(s, 'reports.summary') as {
        gross: number;
        net: number;
        refunded: number;
        count: number;
    };
    assert.equal(summary.gross, 2000);
    assert.equal(summary.refunded, 1000);
    assert.equal(summary.net, 1000);
    assert.equal(summary.count, 1);
    assert.equal((call(s, 'reports.summary', { from: '2025-01-01', to: '2025-01-02' }) as {
        gross: number;
    }).gross, 0);
    assert.throws(() => call(s, 'reports.summary', {}, 'cashier'), /Forbidden/);
});
