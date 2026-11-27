import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S07: exact CSV schema, quoted field, BOM, leading zeros, no catalog changes', () => {
    const s = fixture();
    const j = call(s, 'imports.preview', { csv: '\uFEFFproduct_name,barcode,selling_price,storage_location\r\n"Tea, large",000123,12.50,Shelf A\nBad,12,-1,' }) as ImportJob;
    assert.equal(j.rows[0].name, 'Tea, large');
    assert.equal(j.rows[0].barcode, '000123');
    assert.equal(j.rows[0].price, 1250);
    assert.ok(j.rows[1].error);
    assert.equal(s.products.length, 0);
    assert.throws(() => call(s, 'imports.preview', { csv: 'name,barcode,price,location\nTea,001,2,A' }), /header/);
});
