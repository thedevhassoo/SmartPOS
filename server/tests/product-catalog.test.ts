import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S03: leading zeros, exact lookup, name lookup, duplicate and invalid prices', () => {
    const s = fixture();
    const p = product(s);
    assert.equal(p.barcode, '000123');
    assert.equal((call(s, 'products.lookup', { barcode: '000123' }, 'cashier') as Product[])[0].id, p.id);
    assert.equal((call(s, 'products.lookup', { barcode: '123' }, 'cashier') as Product[]).length, 0);
    assert.equal((call(s, 'products.lookup', { name: 'tea' }, 'cashier') as Product[]).length, 1);
    assert.throws(() => product(s), /Duplicate/);
    assert.throws(() => call(s, 'products.list', {}, 'cashier'), /Forbidden/);
    assert.throws(() => product(s, '123', '-1'), /Invalid PKR/);
});
