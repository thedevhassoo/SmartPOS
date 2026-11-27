import { type Registry, managers } from '../../core/registry.ts';
import { offersList, offersSave, offersCancel } from './scheduled-offers.service.ts';
export const routes: Registry = {
    "offers.list": { roles: managers, run: offersList },
    "offers.save": { roles: managers, run: offersSave },
    "offers.cancel": { roles: managers, run: offersCancel }
};
