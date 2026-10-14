/**
 * World data from the API: the base map at startup, then plots and
 * businesses per district, loaded lazily as the player explores.
 */
import { create } from 'zustand';
import { api, type WorldData } from '@/api';
import type { MapBusiness, Plot } from '@/types/business';
import type { DistrictId } from '@/types/geo';

interface DistrictContent {
  plots: Plot[];
  businesses: MapBusiness[];
}

interface WorldState {
  data: WorldData | null;
  error: string | null;
  /** Loaded district content keyed by district id. */
  districts: Partial<Record<DistrictId, DistrictContent>>;
  load(): Promise<void>;
  loadDistrict(id: DistrictId): Promise<void>;
}

const inflight = new Set<DistrictId>();

export const useWorldStore = create<WorldState>((set, get) => ({
  data: null,
  error: null,
  districts: {},
  load: async () => {
    if (get().data) return;
    try {
      set({ data: await api.geo.getWorld(), error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
  loadDistrict: async (id) => {
    if (get().districts[id] || inflight.has(id)) return;
    inflight.add(id);
    try {
      const content = await api.map.getDistrict(id);
      set((s) => ({ districts: { ...s.districts, [id]: content } }));
    } finally {
      inflight.delete(id);
    }
  },
}));

/** Find a loaded business by id (across loaded districts). */
export function findBusiness(id: string | null): MapBusiness | undefined {
  if (!id) return undefined;
  for (const c of Object.values(useWorldStore.getState().districts)) {
    const b = c?.businesses.find((x) => x.id === id);
    if (b) return b;
  }
  return undefined;
}
