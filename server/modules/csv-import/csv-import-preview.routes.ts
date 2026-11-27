import { type Registry, managers } from '../../core/registry.ts';
import { importsList, importsPreview, importsCancel } from './csv-import-preview.service.ts';
export const routes: Registry = {
    "imports.list": { roles: managers, run: importsList },
    "imports.preview": { roles: managers, run: importsPreview },
    "imports.cancel": { roles: managers, run: importsCancel }
};
