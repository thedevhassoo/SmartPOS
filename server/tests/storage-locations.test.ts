import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S05: location normalization, assignment and rename', () => {
    const s = fixture();
    const p = product(s);
    const l = call(s, 'locations.save', { name: 'Shelf-A' }) as {
        id: string;
    };
    assert.throws(() => call(s, 'locations.save', { name: 'shelf a' }), /already exists/);
    call(s, 'locations.assign', { product: p.id, location: l.id });
    assert.equal(s.products[0].location, l.id);
    call(s, 'locations.save', { id: l.id, name: 'Shelf B' });
    assert.equal(s.locations[0].name, 'Shelf B');
});
