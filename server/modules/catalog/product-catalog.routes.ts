import { type Registry, managers, all } from '../../core/registry.ts';
import { productsList, productsLookup, productsSave } from './product-catalog.service.ts';
export const routes: Registry = {
    "products.list": { roles: managers, run: productsList },
    "products.lookup": { roles: all, run: productsLookup },
    "products.save": { roles: managers, run: productsSave }
};
