import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PgStore } from '../core/postgres.ts';
import { dispatch } from '../core/registry.ts';
import { loadRoutes } from '../core/load.ts';
import { id, password, type Product, type State, type Sale } from '../core/model.ts';
// Run only after migrating a dedicated, disposable database; never use live shop data.
const url = process.env.TEST_DATABASE_URL;
describe.skipIf(!url)('PostgreSQL transaction integration', () => {
    it('persists records, rolls back failed work and serializes last-unit checkout', async () => {
        const store = new PgStore(url!);
        const registry = await loadRoutes();
        const token = randomUUID();
        const uid = id();
        const code = '000' + randomUUID();
        const call = (state: State, action: string, body: unknown = {}) => dispatch(registry, state, action, body, token);
        try {
            await store.transaction(state => {
                state.users.push({
                    id: uid, name: 'Integration fixture', username: uid, password: password('Test-only-password'), role: 'Owner', active: true
                });
                state.sessions.push({
                    id: token, user: uid, expires: new Date(Date.now() + 86400000).toISOString()
                });
            });
            const product = await store.transaction(state => call(state, 'products.save', {
                name: 'DB fixture', barcode: code, price: '10', category: 'Testing'
            })) as Product;
            await store.transaction(state => call(state, 'stock.receive', {
                product: product.id, quantity: 1, cost: '4'
            }));
            await expect(store.transaction(state => {
                call(state, 'stock.adjust', {
                    product: product.id, expected: 1, target: 2, reason: 'rollback fixture'
                });
                throw Error('rollback fixture');
            })).rejects.toThrow('rollback fixture');
            const drafts = await Promise.all([1, 2].map(() => store.transaction(state => call(state, 'drafts.save', { items: [{ product: product.id, quantity: 1 }] })) as Promise<{
                draft: {
                    id: string;
                };
            }>));
            const push = (draft: {
                draft: {
                    id: string;
                };
            }) => store.transaction(state => call(state, 'sales.push', {
                draft: draft.draft.id, key: draft.draft.id, paid: '10', paymentChecked: true
            }));
            const outcomes = await Promise.allSettled(drafts.map(push));
            expect(outcomes.filter(outcome => outcome.status === 'fulfilled')).toHaveLength(1);
            const winner = outcomes[0].status === 'fulfilled' ? drafts[0] : drafts[1];
            const receipt = await push(winner) as Sale;
            const persisted = await store.transaction(state => state.sales.filter(sale => sale.draft === winner.draft.id));
            expect(persisted).toHaveLength(1);
            expect(persisted[0].id).toBe(receipt.id);
            const stock = await store.transaction(state => state.batches.filter(b => b.product === product.id).reduce((sum, b) => sum + b.quantity, 0));
            expect(stock).toBe(0);
        }
        finally {
            await store.pool.end();
        }
    }, 30000);
});
