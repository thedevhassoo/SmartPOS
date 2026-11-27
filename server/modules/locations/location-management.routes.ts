import { type Registry, managers } from '../../core/registry.ts';
import { locationsFilter, locationsDelete } from './location-management.service.ts';
export const routes: Registry = {
    "locations.filter": { roles: managers, run: locationsFilter },
    "locations.delete": { roles: managers, run: locationsDelete }
};
