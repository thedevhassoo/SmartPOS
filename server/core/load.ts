import { readdir } from 'node:fs/promises';
import type { Registry } from './registry.ts';
export async function loadRoutes(): Promise<Registry> {
    const registry: Registry = Object.create(null);
    const root = new URL('../modules/', import.meta.url);
    for (const directory of (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
        const folder = new URL(directory.name + '/', root);
        const files = (await readdir(folder)).filter(file => /^[a-z][a-z0-9-]*\.routes\.ts$/.test(file)).sort();
        for (const file of files) {
            const module = await import(new URL(file, folder).href) as {
                routes: Registry;
            };
            for (const [name, route] of Object.entries(module.routes)) {
                if (Object.hasOwn(registry, name)) {
                    throw Error(`Duplicate action ${name}`);
                }
                registry[name] = route;
            }
        }
    }
    return registry;
}
