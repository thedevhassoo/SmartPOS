import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S04: incoming batch, recorded and available stock, invalid expiry and zero units', () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 5);
    assert.equal(recorded(s, p.id), 5);
    assert.equal(available(s, p.id, now), 5);
    assert.throws(() => receive(s, p, 0), /Invalid Quantity/);
    assert.throws(() => call(s, 'stock.receive', {
        product: p.id, quantity: 1, cost: '1', expiry: '2026-02-30'
    }), /Invalid calendar/);
    assert.throws(() => call(s, 'stock.receive', {
        product: p.id, quantity: 1, cost: '1', expiry: '2026-11-25'
    }), /Expired/);
});
