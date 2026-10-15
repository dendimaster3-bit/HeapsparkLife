/**
 * Admin side of the mock adapter. In demo mode any signed-in player can
 * make themselves admin; with Supabase this is a server-side role.
 */
import { DISTRICTS } from '@/data/districts';
import type { EventSummary } from '@/types/business';
import type { HeapsparkApi } from '../types';
import { currentPlayer, db, save, uid } from './db';
import { readEvents } from './events';

const FOUNDING_LIMIT = 100;

function requireAdmin() {
  const me = currentPlayer();
  if (!me?.roles?.includes('admin')) throw new Error('not-admin');
  return me;
}

export const adminApi: HeapsparkApi['admin'] = {
  async isAdmin() {
    return !!currentPlayer()?.roles?.includes('admin');
  },
  async becomeDemoAdmin() {
    const me = currentPlayer();
    if (!me) throw new Error('sign-in-required');
    me.roles = ['admin'];
    save();
  },
  async overview() {
    requireAdmin();
    const d = db();
    const businesses = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
    for (const b of d.businesses) businesses[b.status]++;
    const events: EventSummary = { view: 0, cardOpen: 0, call: 0, whatsapp: 0, website: 0, share: 0, adClick: 0 };
    for (const e of readEvents()) events[e.type]++;
    const today = new Date().toISOString().slice(0, 10);
    return {
      businesses,
      foundingMembers: d.businesses.filter((b) => b.isFoundingMember).length,
      players: d.players.length,
      promos: { pending: d.promos.filter((p) => p.status === 'pending').length, active: d.promos.filter((p) => p.status === 'active').length },
      codes: { unlocked: d.codes.length, redeemed: d.codes.filter((c) => c.redeemedAt).length },
      events,
      ads: {
        slots: d.slots.length,
        booked: d.slots.filter((s) => d.bookings.some((b) => b.slotId === s.id && b.status === 'active' && b.startDate <= today && b.endDate >= today)).length,
        impressions: Object.values(d.slotStats).reduce((n, s) => n + s.impressions, 0),
        clicks: Object.values(d.slotStats).reduce((n, s) => n + s.clicks, 0),
      },
    };
  },
  async businesses() {
    requireAdmin();
    return [...db().businesses].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async setBusinessStatus(id, status, note) {
    requireAdmin();
    const d = db();
    const b = d.businesses.find((x) => x.id === id);
    if (!b) return;
    // Two businesses can't end up approved on the same plot.
    if (status === 'approved' && d.businesses.some((x) => x.id !== id && x.plotId === b.plotId && x.status === 'approved')) throw new Error('plot-taken');
    b.status = status;
    b.moderationNote = note;
    // First 100 approved businesses become Founding Members (permanent).
    if (status === 'approved' && !b.isFoundingMember) {
      const n = d.businesses.filter((x) => x.isFoundingMember).length;
      if (n < FOUNDING_LIMIT) {
        b.isFoundingMember = true;
        b.foundingMemberNo = Math.max(0, ...d.businesses.map((x) => x.foundingMemberNo ?? 0)) + 1;
      }
    }
    save();
  },
  async setFoundingMember(id, on) {
    requireAdmin();
    const d = db();
    const b = d.businesses.find((x) => x.id === id);
    if (!b) return;
    if (on && !b.isFoundingMember) {
      if (d.businesses.filter((x) => x.isFoundingMember).length >= FOUNDING_LIMIT) throw new Error('founding-full');
      b.foundingMemberNo = Math.max(0, ...d.businesses.map((x) => x.foundingMemberNo ?? 0)) + 1;
    }
    if (!on) b.foundingMemberNo = undefined;
    b.isFoundingMember = on;
    save();
  },
  async removePhoto(id, index) {
    requireAdmin();
    const b = db().businesses.find((x) => x.id === id);
    if (!b) return;
    b.photos = b.photos.filter((_, i) => i !== index);
    save();
  },
  async promos() {
    requireAdmin();
    const d = db();
    return d.promos.map((p) => ({ ...p, businessName: d.businesses.find((b) => b.id === p.businessId)?.name ?? '?' }));
  },
  async setPromoStatus(id, status) {
    requireAdmin();
    const p = db().promos.find((x) => x.id === id);
    if (p) p.status = status;
    save();
  },
  async assignPartner(type, key, businessId) {
    const me = requireAdmin();
    const d = db();
    const match = (p: (typeof d.partners)[number]) => p.type === type && (type === 'districtFounding' ? p.districtId === key : p.subcategoryId === key);
    d.partners = d.partners.filter((p) => !match(p));
    if (businessId) {
      if (type === 'districtFounding' && !DISTRICTS.some((x) => x.id === key)) throw new Error('unknown-district');
      d.partners.push({
        id: `pt-${uid().slice(0, 10)}`,
        type,
        businessId,
        ...(type === 'districtFounding' ? { districtId: key as (typeof DISTRICTS)[number]['id'] } : { subcategoryId: key }),
        assignedAt: new Date().toISOString(),
        assignedBy: me.displayName,
      });
    }
    save();
  },
  async slots() {
    requireAdmin();
    const d = db();
    return d.slots.map((s) => ({ ...s, bookings: d.bookings.filter((b) => b.slotId === s.id), ...(d.slotStats[s.id] ?? { impressions: 0, clicks: 0 }) }));
  },
  async setSlotPrice(slotId, price) {
    requireAdmin();
    const s = db().slots.find((x) => x.id === slotId);
    if (s) s.pricePerMonthRs = Math.max(0, Math.round(price));
    save();
  },
  async saveBooking(input) {
    requireAdmin();
    const d = db();
    let b = input.id ? d.bookings.find((x) => x.id === input.id) : undefined;
    if (b) Object.assign(b, input);
    else {
      b = { ...input, id: `bk-${uid().slice(0, 12)}`, impressions: 0, clicks: 0, isDemo: false };
      d.bookings.push(b);
    }
    if (!save()) throw new Error('storage-full');
    return b;
  },
  async setBookingStatus(id, status) {
    requireAdmin();
    const b = db().bookings.find((x) => x.id === id);
    if (b) b.status = status;
    save();
  },
};
