import express, { type Request, type Response, type NextFunction } from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { dispatch, type Registry, type Store, Fault } from './core/registry.ts';
import { httpContracts } from './http-contracts.ts';
export function makeApp(store: Store, registry: Registry, secure = false) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '12mb' }));
    app.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'same-origin');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Request-Id', randomUUID());
        next();
    });
    const attempts = new Map<string, {
        count: number;
        until: number;
    }>();
    app.get('/api/health', (_req, res) => res.json({ ok: true }));
    async function invoke(req: Request, res: Response, action: string, body: unknown) {
        if (req.method !== 'GET' && (!req.is('application/json') || req.get('X-SmartPOS') !== '1')) {
            throw new Fault(403, 'Invalid request origin or content type');
        }
        const origin = req.get('origin');
        if (origin) {
            let host: string;
            try {
                host = new URL(origin).host;
            }
            catch {
                throw new Fault(403, 'Invalid request origin');
            }
            const allowed = [req.get('host')];
            if (process.env.NODE_ENV !== 'production') {
                allowed.push('localhost:5173', '127.0.0.1:5173', 'localhost:4173', '127.0.0.1:4173');
            }
            if (!allowed.includes(host)) {
                throw new Fault(403, 'Cross-origin request denied');
            }
        }
        const token = (req.headers.cookie ?? '').split(';').map(s => s.trim()).find(s => s.startsWith('smartpos='))?.slice(9) ?? '';
        if (action === 'login') {
            const key = req.ip ?? 'unknown', now = Date.now();
            for (const [address, value] of attempts) {
                if (value.until <= now) {
                    attempts.delete(address);
                }
            }
            const current = attempts.get(key);
            if (current && current.count >= 12) {
                throw new Fault(429, 'Too many sign-in attempts');
            }
            attempts.set(key, current ? { ...current, count: current.count + 1 } : { count: 1, until: now + 600000 });
        }
        const result = await store.transaction(state => dispatch(registry, state, action, body, token));
        res.setHeader('Cache-Control', 'no-store');
        if (action === 'login') {
            const data = result as {
                token: string;
                user: unknown;
            };
            attempts.delete(req.ip ?? 'unknown');
            res.cookie('smartpos', data.token, {
                httpOnly: true, sameSite: 'strict', secure, maxAge: 7 * 86400000, path: '/'
            });
            res.json(data.user);
        }
        else {
            if (action === 'logout') {
                res.clearCookie('smartpos', {
                    path: '/', httpOnly: true, sameSite: 'strict', secure
                });
            }
            res.json(result);
        }
    }
    for (const contract of httpContracts) {
        app[contract.method]('/api' + contract.path, async (req, res) => {
            const input: Record<string, unknown> = req.method === 'GET' ? { ...req.query } : z.record(z.unknown()).parse(req.body ?? {});
            for (const [param, field] of Object.entries(contract.params ?? {})) {
                input[field] = req.params[param];
            }
            await invoke(req, res, contract.action, { ...input, ...contract.fixed });
        });
    }
    app.post('/api/:action', async (req, res) => {
        const action = z.string().regex(/^[a-z][a-z.]+$/).parse(req.params.action);
        await invoke(req, res, action, req.body);
    });
    app.use('/api', (_req, res) => res.status(404).json({ code: 'NOT_FOUND', error: 'Unknown API endpoint' }));
    const dist = fileURLToPath(new URL('../client/dist/', import.meta.url));
    if (existsSync(dist)) {
        app.use(express.static(dist));
        app.use((_req, res) => res.sendFile(resolve(dist, 'index.html')));
    }
    app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
        const respond = (status: number, message: string) => res.status(status).json({
            code: `HTTP_${status}`, message, error: message, requestId: res.getHeader('X-Request-Id')
        });
        if (error instanceof Fault) {
            respond(error.status, error.message);
        }
        else if (error instanceof z.ZodError) {
            respond(400, 'Invalid request');
        }
        else if (error instanceof SyntaxError) {
            respond(400, 'Malformed JSON');
        }
        else {
            console.error(error);
            respond(500, 'Server error');
        }
    });
    return app;
}
