import { type Registry, managers } from '../../core/registry.ts';
import { alertsList, alertsThreshold } from './stock-alerts.service.ts';
export const routes: Registry = {
    "alerts.list": { roles: managers, run: alertsList },
    "alerts.threshold": { roles: managers, run: alertsThreshold }
};
