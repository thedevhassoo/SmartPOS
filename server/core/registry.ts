import { type State, type User, type Role, fail, obj, Fault } from './model.ts';
export type Context = {
    s: State;
    u: User;
    n: Date;
    body: Record<string, unknown>;
    token: string;
};
export type Handler = (c: Context) => unknown;
export type Route = {
    roles: Role[] | 'public';
    run: Handler;
};
export type Registry = Record<string, Route>;
export const all: Role[] = ['Owner', 'Manager', 'Cashier'];
export const managers: Role[] = ['Owner', 'Manager'];
export const owners: Role[] = ['Owner'];
export function actor(s: State, token: string, n: Date): User | undefined {
    const session = s.sessions.find(x => x.id === token && x.expires > n.toISOString());
    return session ? s.users.find(x => x.id === session.user && x.active) : undefined;
}
export function dispatch(reg: Registry, s: State, action: string, body: unknown, token: string, n = new Date()): unknown {
    const r = reg[action];
    if (!r || !Object.hasOwn(reg, action)) {
        fail('Unknown action', 404);
    }
    const u = actor(s, token, n);
    if (r.roles !== 'public' && (!u || !r.roles.includes(u.role))) {
        fail(u ? 'Forbidden' : 'Sign in required', u ? 403 : 401);
    }
    return r.run({
        s, u: u!, n, body: obj(body ?? {}), token
    });
}
export interface Store {
    transaction<T>(work: (s: State) => T): Promise<T>;
}
export class MemoryStore implements Store {
    state: State;
    private tail = Promise.resolve();
    constructor(s: State) {
        this.state = structuredClone(s);
    }
    transaction<T>(work: (s: State) => T): Promise<T> {
        const job = this.tail.then(() => {
            const next = structuredClone(this.state);
            const result = work(next);
            this.state = next;
            return structuredClone(result);
        });
        this.tail = job.then(() => {
        }, () => {
        });
        return job;
    }
}
export { Fault };
