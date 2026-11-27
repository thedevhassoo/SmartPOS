import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { makeApp } from '../app.ts';
import { MemoryStore } from '../core/registry.ts';
import { fixture, fixedPassword, testRoutes } from './fixture.ts';
describe('Express boundary', () => {
    it('health, authentication cookie, role denial and CSRF guard', async () => {
        const app = makeApp(new MemoryStore(fixture()), testRoutes);
        const client = request.agent(app);
        await client.get('/api/health').expect(200);
        await client.post('/api/me').set('X-SmartPOS', '1').send({}).expect(401);
        const r = await client.post('/api/login').set('X-SmartPOS', '1').send({ username: 'cashier', password: fixedPassword }).expect(200);
        expect(r.body.role).toBe('Cashier');
        expect(r.headers['set-cookie'][0]).toContain('HttpOnly');
        await client.post('/api/staff.list').set('X-SmartPOS', '1').send({}).expect(403);
        await client.post('/api/me').send({}).expect(403);
        await client.post('/api/logout').set('X-SmartPOS', '1').send({}).expect(200);
        await client.post('/api/me').set('X-SmartPOS', '1').send({}).expect(401);
    });
});
