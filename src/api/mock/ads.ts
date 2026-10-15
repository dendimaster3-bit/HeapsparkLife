/** Ad slots, bookings and founding partners for the mock adapter. */
import { AD_SLOTS } from '@/data/adSlots';
import { DEMO_BUSINESSES } from '@/data/demoBusinesses';
import type { HeapsparkApi } from '../types';
import { db, save } from './db';

const today = () => new Date().toISOString().slice(0, 10);
const seen = new Set<string>();

function activeBooking(slotId: string) {
  const d = today();
  return db().bookings.find((b) => b.slotId === slotId && b.status === 'active' && b.startDate <= d && b.endDate >= d) ?? null;
}

function stat(slotId: string) {
  const s = db().slotStats;
  return (s[slotId] ??= { impressions: 0, clicks: 0 });
}

export const adsApi: HeapsparkApi['ads'] = {
  async list() {
    return AD_SLOTS.map((slot) => ({ slot, booking: activeBooking(slot.id) }));
  },
  trackImpression(slotId) {
    if (seen.has(slotId)) return;
    seen.add(slotId);
    stat(slotId).impressions++;
    const b = activeBooking(slotId);
    if (b) b.impressions++;
    save();
  },
  trackClick(slotId) {
    stat(slotId).clicks++;
    const b = activeBooking(slotId);
    if (b) b.clicks++;
    save();
  },
};

export const partnersApi: HeapsparkApi['partners'] = {
  async list() {
    return db().partners.flatMap((p) => {
      const b = DEMO_BUSINESSES.find((x) => x.id === p.businessId);
      return b ? [{ ...p, businessName: b.name, brandColor: b.brandColor }] : [];
    });
  },
};
