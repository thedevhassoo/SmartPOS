import { parse } from 'csv-parse/sync';
import { setCsvParser } from './core/csv.ts';
import bcrypt from 'bcryptjs';
import { setPasswordCodec } from './core/model.ts';
import { config } from './core/config.ts';
import { PgStore } from './core/postgres.ts';
import { loadRoutes } from './core/load.ts';
import { startImportWorker } from './core/import-worker.ts';
import { makeApp } from './app.ts';
setCsvParser(input => parse(input, {
    bom: true, relax_column_count: true, skip_empty_lines: true
}) as string[][]);
setPasswordCodec({ hash: v => bcrypt.hashSync(v, 12), verify: (v, h) => bcrypt.compareSync(v, h) });
const store = new PgStore(config.DATABASE_URL);
await store.pool.query('SELECT 1 FROM smartpos.transaction_lock WHERE id=1');
const reg = await loadRoutes();
const stopWorker = startImportWorker(store, reg);
const server = makeApp(store, reg, config.COOKIE_SECURE === 'true').listen(config.PORT, config.HOST, () => console.log(`SmartPOS listening on ${config.HOST}:${config.PORT}`));
process.on('SIGTERM', () => {
    stopWorker();
    server.close(() => void store.pool.end());
});
