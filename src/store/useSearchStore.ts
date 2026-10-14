/**
 * Search panel state: query, filters, results, and the set of results
 * currently highlighted on the map ("Show on map").
 */
import { create } from 'zustand';
import { api } from '@/api';
import type { MapBusiness, SearchParams } from '@/types/business';

interface SearchState {
  open: boolean;
  params: SearchParams;
  results: MapBusiness[];
  loading: boolean;
  /** Business ids pinned on the map; empty = no highlight. */
  highlight: string[];
  setOpen(open: boolean): void;
  setParams(patch: Partial<SearchParams>): void;
  reset(): void;
  run(): Promise<void>;
  setHighlight(ids: string[]): void;
}

let seq = 0;

export const useSearchStore = create<SearchState>((set, get) => ({
  open: false,
  params: {},
  results: [],
  loading: false,
  highlight: [],
  setOpen: (open) => {
    set({ open });
    if (open) void get().run();
  },
  setParams: (patch) => {
    const params = { ...get().params, ...patch };
    // Changing category clears a subcategory that no longer applies.
    if ('categoryId' in patch && patch.categoryId !== get().params.categoryId) params.subcategoryId = undefined;
    set({ params });
    void get().run();
  },
  reset: () => {
    set({ params: {} });
    void get().run();
  },
  run: async () => {
    const id = ++seq;
    set({ loading: true });
    const results = await api.directory.search(get().params);
    // Ignore stale responses if the user kept typing.
    if (id === seq) set({ results, loading: false });
  },
  setHighlight: (highlight) => set({ highlight }),
}));

/** True when any filter or query is set. */
export function hasActiveSearch(p: SearchParams) {
  return Boolean(p.query?.trim() || p.categoryId || p.subcategoryId || p.districtId || p.openNow || p.hasPromo);
}
