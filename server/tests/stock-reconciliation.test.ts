import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S10: adjustment reason, stale quantity and negative count protection', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 4);
    call(s, 'stock.adjust', {
        product: p.id, expected: 4, target: 2, reason: 'Physical count'
    });
    assert.equal(recorded(s, p.id), 2);
    assert.throws(() => call(s, 'stock.adjust', {
        product: p.id, expected: 4, target: 0, reason: 'Stale'
    }), /Stock changed/);
    assert.throws(() => call(s, 'stock.adjust', {
        product: p.id, expected: 2, target: -1, reason: 'Invalid'
    }), /Invalid Physical/);
    assert.ok(s.audit.some(a => a.action === 'stock.adjust'));
});
