import { type Registry, all } from '../../core/registry.ts';
import { draftsList, draftsQuote, draftsSave } from './draft-billing.service.ts';
export const routes: Registry = {
    "drafts.list": { roles: all, run: draftsList },
    "drafts.quote": { roles: all, run: draftsQuote },
    "drafts.save": { roles: all, run: draftsSave }
};
