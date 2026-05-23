/**
 * Reports — mock-layer puro. Sem backend hoje. Quando vier, trocar
 * `getOverview` por `apiCall<ReportsOverview>('reports/overview', { query })`.
 */
import { isShowcase } from '@/theme/showcase';
import { EMPTY_REPORTS, SHOWCASE_REPORTS } from './fixtures';
import type { ReportsOverview } from './types';

export const reportsApi = {
  async getOverview(_period?: { fromIso?: string; toIso?: string; area?: string }): Promise<ReportsOverview> {
    // Simula latência para o React Query ter loading state.
    await new Promise((r) => setTimeout(r, 280));
    return isShowcase() ? SHOWCASE_REPORTS : EMPTY_REPORTS;
  },
};
