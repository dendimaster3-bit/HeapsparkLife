/**
 * Ad placements + founding partners, loaded once at startup. `click`
 * implements the click rules: advertiser business → fly there, external
 * link → open it, empty slot → heapspark.com/advertise. Always tracked.
 */
import { create } from 'zustand';
import { api } from '@/api';
import { flyToBusiness } from '@/lib/navigation';
import { ADVERTISE_URL, type AdPlacement, type AdSlotType, type PartnerView } from '@/types/ads';

interface AdsState {
  placements: AdPlacement[];
  partners: PartnerView[];
  loaded: boolean;
  load(): Promise<void>;
  reload(): Promise<void>;
  byType(type: AdSlotType): AdPlacement[];
  click(p: AdPlacement): void;
}

export const useAdsStore = create<AdsState>((set, get) => ({
  placements: [],
  partners: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const [placements, partners] = await Promise.all([api.ads.list(), api.partners.list()]);
    set({ placements, partners, loaded: true });
  },
  reload: async () => {
    set({ loaded: false });
    await get().load();
  },
  byType: (type) => get().placements.filter((p) => p.slot.type === type),
  click: ({ slot, booking }) => {
    api.ads.trackClick(slot.id);
    if (booking?.advertiserBusinessId) {
      api.events.track('adClick', booking.advertiserBusinessId);
      void flyToBusiness(booking.advertiserBusinessId);
    } else {
      window.open(booking?.linkUrl ?? ADVERTISE_URL, '_blank', 'noopener');
    }
  },
}));
