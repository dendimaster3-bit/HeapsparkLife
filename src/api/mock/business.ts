/** Business-owner side of the mock adapter: claims, promos, stats, ads. */
import type { EventSummary } from '@/types/business';
import type { Promo } from '@/types/promo';
import type { HeapsparkApi } from '../types';
import { currentPlayer, db, save, uid } from './db';
import { readEvents } from './events';

function requireOwner(businessId: string) {
  const me = currentPlayer();
  const b = db().businesses.find((x) => x.id === businessId);
  if (!me || !b || b.ownerId !== me.id) throw new Error('not-owner');
  return b;
}

function persist() {
  if (!save()) throw new Error('storage-full');
}

export const businessApi: HeapsparkApi['business'] = {
  async mine() {
    const me = currentPlayer();
    return me ? db().businesses.filter((b) => b.ownerId === me.id) : [];
  },
  async get(id) {
    return db().businesses.find((b) => b.id === id) ?? null;
  },
  async takenPlotIds() {
    return db()
      .businesses.filter((b) => b.status === 'approved' || b.status === 'pending')
      .map((b) => b.plotId);
  },
  async claim(input) {
    const me = currentPlayer();
    if (!me) throw new Error('sign-in-required');
    // Plot generation needs three.js: load it lazily (keeps it out of the main bundle).
    const { getAllPlots } = await import('@/game/world/plots');
    const plot = getAllPlots().find((p) => p.id === input.plotId);
    if (!plot) throw new Error('unknown-plot');
    if ((await businessApi.takenPlotIds()).includes(plot.id)) throw new Error('plot-taken');
    const b = {
      ...input,
      id: `biz-${uid().slice(0, 12)}`,
      ownerId: me.id,
      districtId: plot.districtId,
      townId: plot.townId,
      status: 'pending' as const,
      growthLevel: 1 as const,
      isFoundingMember: false,
      isDemo: false,
      createdAt: new Date().toISOString(),
    };
    db().businesses.push(b);
    persist();
    return b;
  },
  async update(id, patch) {
    const b = requireOwner(id);
    // The plot can't be swapped after claiming.
    const { plotId: _ignored, ...rest } = patch;
    Object.assign(b, rest);
    persist();
    return b;
  },
  async promos(businessId) {
    requireOwner(businessId);
    return db().promos.filter((p) => p.businessId === businessId);
  },
  async savePromo(input) {
    requireOwner(input.businessId);
    const d = db();
    let promo = input.id ? d.promos.find((p) => p.id === input.id) : undefined;
    if (promo) {
      Object.assign(promo, input, { status: 'pending' });
    } else {
      promo = { ...input, id: `promo-${uid().slice(0, 12)}`, quantityUnlocked: 0, status: 'pending', isDemo: false } as Promo;
      d.promos.push(promo);
    }
    persist();
    return promo;
  },
  async setPromoPaused(promoId, paused) {
    const p = db().promos.find((x) => x.id === promoId);
    if (!p) return;
    requireOwner(p.businessId);
    if (p.status === 'active' || p.status === 'paused') p.status = paused ? 'paused' : 'active';
    persist();
  },
  async stats(businessId) {
    requireOwner(businessId);
    const d = db();
    const events: EventSummary = { view: 0, cardOpen: 0, call: 0, whatsapp: 0, website: 0, share: 0, adClick: 0 };
    for (const e of readEvents()) if (e.businessId === businessId) events[e.type]++;
    const codes = d.codes.filter((c) => c.businessId === businessId);
    const bookings = d.bookings.filter((b) => b.advertiserBusinessId === businessId);
    return {
      events,
      codesUnlocked: codes.length,
      codesRedeemed: codes.filter((c) => c.redeemedAt).length,
      perPromo: d.promos
        .filter((p) => p.businessId === businessId)
        .map((p) => {
          const pc = codes.filter((c) => c.promoId === p.id);
          return { promoId: p.id, title: p.title, status: p.status, unlocked: pc.length, redeemed: pc.filter((c) => c.redeemedAt).length, limit: p.quantityLimit };
        }),
      adImpressions: bookings.reduce((n, b) => n + b.impressions, 0),
      adClicks: bookings.reduce((n, b) => n + b.clicks, 0),
    };
  },
  async requestAd(req) {
    const b = requireOwner(req.businessId);
    const booking = {
      id: `bk-${uid().slice(0, 12)}`,
      slotId: req.slotId,
      advertiserBusinessId: b.id,
      advertiserName: b.name,
      creative: req.creative,
      linkUrl: req.linkUrl,
      startDate: req.startDate,
      endDate: req.endDate,
      status: 'pending' as const,
      impressions: 0,
      clicks: 0,
      isDemo: false,
    };
    db().bookings.push(booking);
    persist();
    return booking;
  },
  async bookings(businessId) {
    requireOwner(businessId);
    return db().bookings.filter((b) => b.advertiserBusinessId === businessId);
  },
  async demoTakeOver(businessId) {
    const me = currentPlayer();
    const b = db().businesses.find((x) => x.id === businessId);
    if (!me || !b?.isDemo) throw new Error('not-allowed');
    b.ownerId = me.id;
    persist();
  },
};
