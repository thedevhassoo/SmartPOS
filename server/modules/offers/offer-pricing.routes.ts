import { type Registry, all } from '../../core/registry.ts';
import { offersCalculate } from './offer-pricing.service.ts';
export const routes: Registry = {
    "offers.calculate": { roles: all, run: offersCalculate }
};
