/**
 * The one interface the whole app talks to. Adapters (mock, Supabase)
 * implement it; UI and game code never import an adapter directly.
 * Later steps add businesses, promos, players, ads, admin…
 */
import type { District, Landmark, Town } from '@/types/geo';

export interface WorldData {
  districts: District[];
  towns: Town[];
  landmarks: Landmark[];
}

export interface HeapsparkApi {
  geo: {
    /** Everything needed to draw the map. Fetched once at startup. */
    getWorld(): Promise<WorldData>;
  };
}
