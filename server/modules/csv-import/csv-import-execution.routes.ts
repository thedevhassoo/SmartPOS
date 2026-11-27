import { type Registry, managers } from '../../core/registry.ts';
import { importsConfirm, importsRefresh } from './csv-import-execution.service.ts';
export const routes: Registry = {
    "imports.confirm": { roles: managers, run: importsConfirm },
    "imports.refresh": { roles: managers, run: importsRefresh }
};
