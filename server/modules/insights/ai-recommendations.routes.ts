import { type Registry, managers } from '../../core/registry.ts';
import { aiRecommendations, aiAccept } from './ai-recommendations.service.ts';
export const routes: Registry = {
    "ai.recommendations": { roles: managers, run: aiRecommendations },
    "ai.accept": { roles: managers, run: aiAccept }
};
