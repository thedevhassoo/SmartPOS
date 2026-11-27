import type { Store, Registry } from './registry.ts';
// Each row runs in its own transaction. Unexpected failures roll back the row,
// then a separate transaction records the attempt. Initial attempt + 3 retries.
export function startImportWorker(store: Store, registry: Registry) {
    if (!registry['imports.confirm']) {
        return () => {
        };
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function tick() {
        try {
            for (let i = 0; i < 4 && !stopped; i++) {
                let selected: {
                    job: string;
                    row: string;
                } | undefined;
                try {
                    const processed = await store.transaction(state => {
                        const job = state.imports.find(j => j.confirmed && j.rows.some(r => r.status === 'Preview') && state.users.some(u => u.id === j.owner && u.active && u.role !== 'Cashier'));
                        if (!job) {
                            return false;
                        }
                        const row = job.rows.find(r => r.status === 'Preview')!;
                        selected = { job: job.id, row: row.id };
                        const user = state.users.find(u => u.id === job.owner)!;
                        registry['imports.confirm'].run({
                            s: state, u: user, n: new Date(), body: {
                                job: job.id, row: row.id, confirm: true
                            }, token: ''
                        });
                        return true;
                    });
                    if (!processed) {
                        break;
                    }
                }
                catch (error) {
                    const target = selected;
                    if (!target) {
                        throw error;
                    }
                    await store.transaction(state => {
                        const row = state.imports.find(j => j.id === target.job)?.rows.find(r => r.id === target.row);
                        if (row?.status !== 'Preview') {
                            return;
                        }
                        row.attempts = (row.attempts ?? 0) + 1;
                        row.message = 'Processing attempt failed. ' + (row.attempts >= 4 ? 'Retry limit reached.' : 'Will retry.');
                        if (row.attempts >= 4) {
                            row.status = 'Failed';
                            row.outcome = 'Failed';
                        }
                    });
                    console.error('Import row processing failed:', error);
                }
            }
        }
        catch (error) {
            console.error('Import worker:', error);
        }
        finally {
            if (!stopped) {
                timer = setTimeout(() => void tick(), 500);
            }
        }
    }
    timer = setTimeout(() => void tick(), 500);
    return () => {
        stopped = true;
        if (timer) {
            clearTimeout(timer);
        }
    };
}
