import { type Registry, managers } from '../../core/registry.ts';
import { locationsList, locationsSave, locationsAssign } from './storage-locations.service.ts';
export const routes: Registry = {
    "locations.list": { roles: managers, run: locationsList },
    "locations.save": { roles: managers, run: locationsSave },
    "locations.assign": { roles: managers, run: locationsAssign }
};
