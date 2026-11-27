import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now } from './fixture.ts';
import { available, type Refund, type ImportJob } from '../core/model.ts';
import { flattenState, hydrateState } from '../core/relational-repositories.ts';
import { httpContracts } from '../http-contracts.ts';
import { testRoutes } from './fixture.ts';
test('relational projection reconstructs sale, batch allocations and refund reservations', () => {
    const state = fixture();
    const p = product(state);
    receive(state, p, 5);
    const completed = sale(state, p, 3);
    const refund = call(state, 'refunds.request', {
        sale: completed.id, product: p.id, quantity: 2
    }, 'cashier') as Refund;
    const rows = flattenState(state);
    assert.equal(rows.products[0].barcode, '000123');
    assert.equal(rows.sale_lines.length, 1);
    assert.equal(rows.sale_allocations.length, 1);
    assert.equal(rows.refunds[0].sale, completed.id);
    const restored = hydrateState(structuredClone(rows));
    assert.deepEqual(restored.sales[0].lines, state.sales[0].lines);
    assert.deepEqual(restored.refunds[0].unitRanges, refund.unitRanges);
    assert.equal(available(restored, p.id, now), 2);
    assert.equal(restored.drafts[0].completed, completed.id);
});
test('refund rejected unit ranges are released without duplicating another reservation', () => {
    const state = fixture();
    const p = product(state);
    receive(state, p, 4);
    const completed = sale(state, p, 4);
    const first = call(state, 'refunds.request', {
        sale: completed.id, product: p.id, quantity: 1
    }, 'cashier') as Refund;
    const second = call(state, 'refunds.request', {
        sale: completed.id, product: p.id, quantity: 2
    }, 'cashier') as Refund;
    call(state, 'refunds.review', { id: first.id, decision: 'Reject' });
    const third = call(state, 'refunds.request', {
        sale: completed.id, product: p.id, quantity: 2
    }, 'cashier') as Refund;
    assert.deepEqual(second.unitRanges, [{ start: 1, end: 3 }]);
    assert.deepEqual(third.unitRanges, [{ start: 0, end: 1 }, { start: 3, end: 4 }]);
    assert.throws(() => call(state, 'refunds.request', {
        sale: completed.id, product: p.id, quantity: 1
    }, 'cashier'), /remaining/);
});
test('multiple refund lines are reserved atomically and preserve original stock', () => {
    const state = fixture();
    const p = product(state);
    const q = product(state, '002');
    receive(state, p);
    receive(state, q);
    const draft = call(state, 'drafts.save', { items: [{ product: p.id, quantity: 1 }, { product: q.id, quantity: 1 }] }, 'cashier') as {
        draft: {
            id: string;
        };
        quote: {
            total: number;
        };
    };
    const completed = call(state, 'sales.push', {
        draft: draft.draft.id, key: draft.draft.id, paid: (draft.quote.total / 100).toFixed(2), paymentChecked: true
    }, 'cashier') as {
        id: string;
    };
    assert.throws(() => call(state, 'refunds.request', { sale: completed.id, items: [{ product: p.id, quantity: 1 }, { product: q.id, quantity: 2 }] }, 'cashier'), /remaining/);
    assert.equal(state.refunds.length, 0);
    const refunds = call(state, 'refunds.request', { sale: completed.id, items: [{ product: p.id, quantity: 1 }, { product: q.id, quantity: 1 }] }, 'cashier') as Refund[];
    assert.equal(refunds.length, 2);
    assert.equal(available(state, p.id, now), 19);
});
test('CSV optional final field, cancellation, format and stale match checks', () => {
    const state = fixture();
    const csv = 'product_name,barcode,selling_price,storage_location\nTea,0008,12.50';
    assert.throws(() => call(state, 'imports.preview', { csv, filename: 'products.xlsx' }), /Only .csv/);
    const cancelled = call(state, 'imports.preview', { csv, filename: 'products.csv' }) as ImportJob;
    assert.equal(cancelled.rows[0].error, '');
    call(state, 'imports.cancel', { job: cancelled.id });
    assert.throws(() => call(state, 'imports.confirm', { job: cancelled.id, confirm: true }), /cancelled/);
    assert.equal(state.products.length, 0);
    const job = call(state, 'imports.preview', { csv }) as ImportJob;
    product(state, '0008');
    call(state, 'imports.confirm', {
        job: job.id, confirm: true, row: job.rows[0].id
    });
    assert.equal(job.rows[0].status, 'Failed');
    assert.equal(state.products.length, 1);
    call(state, 'imports.refresh', { job: job.id, row: job.rows[0].id });
    call(state, 'imports.decide', {
        job: job.id, row: job.rows[0].id, decision: 'Replace'
    });
    call(state, 'imports.confirm', {
        job: job.id, confirm: true, row: job.rows[0].id
    });
    assert.equal(job.rows[0].outcome, 'Replaced');
    assert.equal(state.products[0].price, 1250);
});
test('role enforcement and immutable archival history', () => {
    const state = fixture();
    product(state);
    const original = state.audit[0];
    assert.throws(() => call(state, 'audit.list', {}, 'cashier'), /Forbidden/);
    assert.throws(() => call(state, 'audit.archive', {
        id: original.id, confirm: true, reason: 'Retention review'
    }, 'manager'), /Forbidden/);
    call(state, 'audit.archive', {
        id: original.id, confirm: true, reason: 'Retention review'
    });
    assert.ok(original.archivedAt);
    assert.equal(state.audit.length, 2);
    assert.equal(state.audit[1].action, 'audit.archive');
});
test('all declared HTTP facade contracts have implemented handlers', () => {
    for (const contract of httpContracts) {
        assert.ok(testRoutes[contract.action], contract.action);
    }
});
