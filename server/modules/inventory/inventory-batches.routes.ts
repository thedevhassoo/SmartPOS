import { type Registry, managers } from '../../core/registry.ts';
import { stockList, stockReceive, stockCorrect } from './inventory-batches.service.ts';
export const routes: Registry = {
    "stock.list": { roles: managers, run: stockList },
    "stock.receive": { roles: managers, run: stockReceive },
    "stock.correct": { roles: managers, run: stockCorrect }
};
