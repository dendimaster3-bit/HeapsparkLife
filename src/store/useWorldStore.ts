/** World data loaded from the API at startup. */
import { create } from 'zustand';
import { api, type WorldData } from '@/api';

interface WorldState {
  data: WorldData | null;
  error: string | null;
  load(): Promise<void>;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  data: null,
  error: null,
  load: async () => {
    if (get().data) return;
    try {
      set({ data: await api.geo.getWorld(), error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
