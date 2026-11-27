import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S11: offer overlap rejected, adjacent interval allowed, discount bounds', () => {
    const s = fixture();
    const o = {
        name: 'Sale', kind: 'percent', value: '10', start: '2026-11-26T10:00:00Z', end: '2026-11-26T11:00:00Z'
    };
    call(s, 'offers.save', o);
    assert.throws(() => call(s, 'offers.save', { ...o, name: 'Overlap' }), /overlap/);
    call(s, 'offers.save', {
        ...o, start: o.end, end: '2026-11-26T12:00:00Z'
    });
    assert.throws(() => call(s, 'offers.save', { ...o, value: '100.01' }), /Invalid discount/);
    assert.equal(s.offers.length, 2);
});
