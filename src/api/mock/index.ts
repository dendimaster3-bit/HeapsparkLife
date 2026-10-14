/**
 * Mock adapter: serves the seed data bundled in `src/data`. Runs entirely
 * in the browser so the game works offline and without a backend.
 */
import { DISTRICTS } from '@/data/districts';
import { TOWNS } from '@/data/towns';
import { LANDMARKS } from '@/data/landmarks';
import { CATEGORIES, SUBCATEGORIES } from '@/data/categories';
import { DEMO_BUSINESSES } from '@/data/demoBusinesses';
import { DEMO_PROMOS } from '@/data/demoPromos';
import type { HeapsparkApi } from '../types';

export const mockApi: HeapsparkApi = {
  geo: {
    async getWorld() {
      return {
        districts: DISTRICTS,
        towns: TOWNS,
        landmarks: LANDMARKS,
        categories: CATEGORIES,
        subcategories: SUBCATEGORIES,
      };
    },
  },
  map: {
    async getDistrict(districtId) {
      // Plot generation needs the road network (three.js), so load it lazily
      // to keep it out of the initial bundle.
      const { getAllPlots } = await import('@/game/world/plots');
      const now = Date.now();
      const businesses = DEMO_BUSINESSES.filter((b) => b.districtId === districtId && b.status === 'approved').map(
        (b) => ({
          ...b,
          activePromoCount: DEMO_PROMOS.filter((p) => p.businessId === b.id && Date.parse(p.expiresAt) > now).length,
        }),
      );
      const byPlot = new Map(businesses.map((b) => [b.plotId, b.id]));
      const plots = getAllPlots()
        .filter((p) => p.districtId === districtId)
        .map((p) => ({ ...p, businessId: byPlot.get(p.id) ?? null }));
      return { plots, businesses };
    },
  },
};
