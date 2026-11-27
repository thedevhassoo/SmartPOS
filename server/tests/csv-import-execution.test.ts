import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S14: explicit confirm, durable row state, idempotent retry, no stock mutation', () => {
    const s = fixture();
    const j = call(s, 'imports.preview', { csv: 'product_name,barcode,selling_price,storage_location\nTea,0001,2,Shelf A' }) as ImportJob;
    assert.throws(() => call(s, 'imports.confirm', { job: j.id, row: j.rows[0].id }), /confirmation/);
    call(s, 'imports.confirm', { job: j.id, confirm: true });
    call(s, 'imports.confirm', {
        job: j.id, row: j.rows[0].id, confirm: true
    });
    call(s, 'imports.confirm', {
        job: j.id, row: j.rows[0].id, confirm: true
    });
    assert.equal(s.products.length, 1);
    assert.equal(s.products[0].barcode, '0001');
    assert.equal(s.products[0].category, 'Uncategorized');
    assert.equal(s.batches.length, 0);
    assert.equal(j.rows[0].status, 'Applied');
});
