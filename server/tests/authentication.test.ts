import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, call, product, receive, sale, now, fixedPassword, MemoryStore } from './fixture.ts';
import { available, recorded, type Product, type Refund, type ImportJob, type Sale } from '../core/model.ts';
test('S01: valid login, invalid credentials, logout and protected authorization', () => {
    const s = fixture();
    assert.throws(() => call(s, 'login', { username: 'owner', password: 'wrong' }), /Invalid username/);
    const r = call(s, 'login', { username: 'owner', password: fixedPassword }) as {
        token: string;
        user: {
            role: string;
        };
    };
    assert.equal(r.user.role, 'Owner');
    assert.equal((call(s, 'me', {}, 'cashier') as {
        role: string;
    }).role, 'Cashier');
    call(s, 'logout');
    assert.throws(() => call(s, 'me'), /Sign in required/);
});
