import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S02: owner creates staff and resets password, cashier denied', () => {
    const s = fixture();
    const r = call(s, 'staff.save', {
        name: 'New cashier', username: 'new', role: 'Cashier', password: 'Long-password-22'
    }) as {
        id: string;
    };
    assert.throws(() => call(s, 'staff.save', {
        name: 'Duplicate', username: 'new', role: 'Cashier', password: 'Long-password-22'
    }), /Username/);
    assert.throws(() => call(s, 'staff.list', {}, 'manager'), /Forbidden/);
    call(s, 'staff.reset', { id: r.id, password: 'Changed-password-22' });
    assert.throws(() => call(s, 'login', { username: 'new', password: 'Long-password-22' }), /Invalid/);
    assert.ok(call(s, 'login', { username: 'new', password: 'Changed-password-22' }));
});
