import { type Registry, managers } from '../../core/registry.ts';
import { importsChoose, importsDecide } from './csv-import-decisions.service.ts';
export const routes: Registry = {
    "imports.choose": { roles: managers, run: importsChoose },
    "imports.decide": { roles: managers, run: importsDecide }
};
