import type { Handler } from '../../core/registry.ts';
import { items } from '../../core/model.ts';
import { quote, enableScheduledOffers } from '../../core/pricing.ts';
enableScheduledOffers();
export const offersCalculate: Handler = ({ s, body, n }) => quote(s, items(body.items), n);
