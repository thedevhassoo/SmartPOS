import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product } from './fixture.ts';
import type { ImportJob } from '../core/model.ts';
test('S08: duplicate selection precedes catalog matching and Replace/Skip', () => {
    const state = fixture();
    const existing = product(state, '001');
    const job = call(state, 'imports.preview', { csv: 'product_name,barcode,selling_price,storage_location\nTea,001,2,A\nCoffee,001,3,B' }) as ImportJob;
    assert.equal(job.rows[0].existing, null);
    assert.throws(() => call(state, 'imports.decide', {
        job: job.id, row: job.rows[0].id, decision: 'Replace'
    }), /Resolve duplicate/);
    call(state, 'imports.choose', { job: job.id, row: job.rows[0].id });
    assert.equal(job.rows[0].existing, existing.id);
    assert.equal(job.rows[1].decision, 'Skip');
    assert.equal(job.rows[1].duplicateChoice, 'Discard');
    call(state, 'imports.decide', {
        job: job.id, row: job.rows[0].id, decision: 'Replace'
    });
    assert.equal(job.rows[0].decision, 'Replace');
});
