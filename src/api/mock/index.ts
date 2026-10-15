/**
 * Mock adapter: serves the seed data bundled in `src/data`. Runs entirely
 * in the browser so the game works offline and without a backend.
 * Interaction events are kept in localStorage (capped) for demo stats.
 */
import { DISTRICTS, DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS, TOWNS_BY_ID } from '@/data/towns';
import { LANDMARKS } from '@/data/landmarks';
import { CATEGORIES, CATEGORIES_BY_ID, SUBCATEGORIES, SUBCATEGORIES_BY_ID } from '@/data/categories';
import { DEMO_BUSINESSES } from '@/data/demoBusinesses';
import { isOpenAt, mauritiusWeekday } from '@/lib/hours';
import { mauritiusHour } from '@/lib/time';
import { normalize } from '@/lib/text';
import type { AnalyticsEvent, Business, EventSummary, MapBusiness } from '@/types/business';
import { isPromoLive } from '@/lib/promo';
import type { HeapsparkApi } from '../types';
import { db } from './db';
import { authApi, promosApi, validationApi } from './players';
import { progressApi } from './progress';
import { adsApi, partnersApi } from './ads';

const activePromos = (businessId: string) => db().promos.filter((p) => p.businessId === businessId && isPromoLive(p));

const toMap = (b: Business): MapBusiness => {
  const roles = db().partners.filter((p) => p.businessId === b.id);
  return {
    ...b,
    activePromoCount: activePromos(b.id).length,
    partner: {
      district: roles.find((p) => p.type === 'districtFounding')?.districtId,
      subcategory: roles.find((p) => p.type === 'categoryFounding')?.subcategoryId,
    },
  };
};

const approved = () => DEMO_BUSINESSES.filter((b) => b.status === 'approved');

/** Text the search matches against, built once per business. */
const haystack = new Map<string, { name: string; rest: string }>();
function searchText(b: Business) {
  let h = haystack.get(b.id);
  if (!h) {
    const sub = SUBCATEGORIES_BY_ID[b.subcategoryId];
    const cat = sub && CATEGORIES_BY_ID[sub.categoryId];
    h = {
      name: normalize(b.name),
      rest: normalize(
        [sub?.name, cat?.name, TOWNS_BY_ID[b.townId]?.name, DISTRICTS_BY_ID[b.districtId]?.name, b.description]
          .filter(Boolean)
          .join(' '),
      ),
    };
    haystack.set(b.id, h);
  }
  return h;
}

// --- events (localStorage, capped) -----------------------------------------
const EVENTS_KEY = 'hs.events';
const MAX_EVENTS = 5000;
function readEvents(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AnalyticsEvent[];
  } catch {
    return [];
  }
}

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
      const businesses = approved().filter((b) => b.districtId === districtId).map(toMap);
      const byPlot = new Map(businesses.map((b) => [b.plotId, b.id]));
      const plots = getAllPlots()
        .filter((p) => p.districtId === districtId)
        .map((p) => ({ ...p, businessId: byPlot.get(p.id) ?? null }));
      return { plots, businesses };
    },
  },

  directory: {
    async search({ query, categoryId, subcategoryId, districtId, openNow, hasPromo }) {
      const q = normalize(query ?? '');
      const terms = q ? q.split(' ') : [];
      const day = mauritiusWeekday();
      const hour = mauritiusHour();
      const scored: { b: MapBusiness; score: number }[] = [];
      for (const b of approved()) {
        const sub = SUBCATEGORIES_BY_ID[b.subcategoryId];
        if (categoryId && sub?.categoryId !== categoryId) continue;
        if (subcategoryId && b.subcategoryId !== subcategoryId) continue;
        if (districtId && b.districtId !== districtId) continue;
        if (openNow && !isOpenAt(b.hours, day, hour)) continue;
        const mb = toMap(b);
        if (hasPromo && mb.activePromoCount === 0) continue;
        let score = 1;
        if (terms.length) {
          const { name, rest } = searchText(b);
          // Every term must match somewhere; name matches rank higher.
          score = 0;
          for (const t of terms) {
            if (name.startsWith(t) || name.includes(` ${t}`)) score += 3;
            else if (name.includes(t)) score += 2;
            else if (rest.includes(t)) score += 1;
            else {
              score = -1;
              break;
            }
          }
          if (score < 0) continue;
        }
        // Category Founding Partners always lead their subcategory's results;
        // founding members and active promos get a gentle boost.
        if (mb.partner.subcategory && (subcategoryId || categoryId || terms.length)) score += 100;
        score += (mb.isFoundingMember ? 0.3 : 0) + (mb.activePromoCount ? 0.2 : 0);
        scored.push({ b: mb, score });
      }
      return scored.sort((a, z) => z.score - a.score || a.b.name.localeCompare(z.b.name)).map((s) => s.b);
    },

    async getBusiness(id) {
      const b = approved().find((x) => x.id === id);
      if (!b) return null;
      const { getAllPlots } = await import('@/game/world/plots');
      const plot = getAllPlots().find((p) => p.id === b.plotId);
      if (!plot) return null;
      return {
        business: toMap(b),
        plot: { ...plot, businessId: b.id },
        promos: activePromos(b.id),
      };
    },
  },

  auth: authApi,
  promos: promosApi,
  validation: validationApi,
  progress: progressApi,
  ads: adsApi,
  partners: partnersApi,

  events: {
    track(type, businessId) {
      try {
        const events = readEvents();
        events.push({ type, businessId, at: new Date().toISOString() });
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
      } catch {
        /* storage unavailable: tracking is best-effort */
      }
    },
    async summary(businessId) {
      const out: EventSummary = { view: 0, cardOpen: 0, call: 0, whatsapp: 0, website: 0, share: 0, adClick: 0 };
      for (const e of readEvents()) if (e.businessId === businessId) out[e.type]++;
      return out;
    },
  },
};
