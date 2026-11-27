import { existsSync } from 'node:fs';
import { z } from 'zod';
if (existsSync('.env')) {
    process.loadEnvFile('.env');
}
export const config = z.object({
    DATABASE_URL: z.string().min(1), OWNER_USERNAME: z.string().min(1).default('owner'), OWNER_PASSWORD: z.string().min(10).optional(), PORT: z.coerce.number().int().min(1).max(65535).default(3000), HOST: z.string().default('127.0.0.1'), COOKIE_SECURE: z.enum(['true', 'false']).default('false')
}).parse(process.env);
