import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S20: insufficient evidence and transparent forecast with explicit acceptance', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 30);
    let rows = call(s, 'ai.recommendations') as {
        suggestion: number | null;
    }[];
    assert.equal(rows[0].suggestion, null);
    p.created = '2026-10-01T00:00:00Z';
    sale(s, p, 10);
    rows = call(s, 'ai.recommendations') as typeof rows;
    assert.equal(rows[0].suggestion, 3);
    assert.equal(p.threshold, 0);
    assert.throws(() => call(s, 'ai.accept', { product: p.id, threshold: 3 }), /Explicit acceptance/);
    call(s, 'ai.accept', {
        product: p.id, threshold: 3, confirm: true
    });
    assert.equal(p.threshold, 3);
});
