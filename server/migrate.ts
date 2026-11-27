import bcrypt from 'bcryptjs';
import { readFile, readdir } from 'node:fs/promises';
import { PgStore } from './core/postgres.ts';
import { config } from './core/config.ts';
import { id, password, setPasswordCodec } from './core/model.ts';
setPasswordCodec({ hash: value => bcrypt.hashSync(value, 12), verify: (value, hash) => bcrypt.compareSync(value, hash) });
const store = new PgStore(config.DATABASE_URL);
try {
    const client = await store.pool.connect();
    try {
        await client.query('SELECT pg_advisory_lock(714203)');
        await client.query('CREATE TABLE IF NOT EXISTS public.smartpos_schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
        const directory = new URL('./database/migrations/', import.meta.url);
        for (const name of (await readdir(directory)).filter(file => file.endsWith('.sql')).sort()) {
            const prior = await client.query('SELECT name FROM public.smartpos_schema_migrations WHERE name = $1', [name]);
            if (prior.rowCount) {
                continue;
            }
            await client.query('BEGIN');
            try {
                await client.query(await readFile(new URL(name, directory), 'utf8'));
                await client.query('INSERT INTO public.smartpos_schema_migrations (name) VALUES ($1)', [name]);
                await client.query('COMMIT');
                console.log('Applied', name);
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
        }
    }
    finally {
        await client.query('SELECT pg_advisory_unlock(714203)').catch(() => {
        });
        client.release();
    }
    await store.transaction(state => {
        if (state.users.length) {
            return;
        }
        if (!config.OWNER_PASSWORD || config.OWNER_PASSWORD.startsWith('CHANGE_ME')) {
            throw Error('Set a strong OWNER_PASSWORD in server/.env before initialization');
        }
        state.users.push({
            id: id(), name: 'Business Owner', username: config.OWNER_USERNAME.toLowerCase(), password: password(config.OWNER_PASSWORD), role: 'Owner', active: true
        });
    });
    console.log('Database ready');
}
finally {
    await store.pool.end();
}
