import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S06: filtering and confirmed deletion unassign products', () => {
    const s = fixture();
    const p = product(s);
    const l = call(s, 'locations.save', { name: 'Shelf A' }) as {
        id: string;
    };
    call(s, 'locations.assign', { product: p.id, location: l.id });
    assert.equal((call(s, 'locations.filter', { location: l.id }) as Product[]).length, 1);
    assert.throws(() => call(s, 'locations.delete', { id: l.id }), /confirmation/);
    call(s, 'locations.delete', { id: l.id, confirm: true });
    assert.equal(s.products.length, 1);
    assert.equal(s.products[0].location, null);
});
