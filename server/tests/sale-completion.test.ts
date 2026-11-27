import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S13: sale atomicity, idempotency, mismatch and concurrent last-unit attempts in memory', async () => {
    const s = fixture();
    const p = product(s);
    receive(s, p, 1);
    const a = call(s, 'drafts.save', { items: [{ product: p.id, quantity: 1 }] }, 'cashier') as {
        draft: {
            id: string;
        };
    };
    const b = call(s, 'drafts.save', { items: [{ product: p.id, quantity: 1 }] }, 'cashier') as {
        draft: {
            id: string;
        };
    };
    const st = new MemoryStore(s);
    const payload = (d: {
        draft: {
            id: string;
        };
    }) => ({
        draft: d.draft.id, key: d.draft.id, paid: '10', paymentChecked: true
    });
    const results = await Promise.allSettled([st.transaction(x => call(x, 'sales.push', payload(a), 'cashier')), st.transaction(x => call(x, 'sales.push', payload(b), 'cashier'))]);
    assert.equal(results.filter(x => x.status === 'fulfilled').length, 1);
    assert.equal(st.state.sales.length, 1);
    assert.equal(available(st.state, p.id, now), 0);
    const win = results[0].status === 'fulfilled' ? a : b;
    const replay = await st.transaction(x => call(x, 'sales.push', payload(win), 'cashier')) as Sale;
    assert.equal(replay.id, st.state.sales[0].id);
    await assert.rejects(st.transaction(x => call(x, 'sales.push', { ...payload(win), paid: '9' }, 'cashier')), /different payload/);
    assert.equal(st.state.drafts.filter(d => !d.completed).length, 1);
});
