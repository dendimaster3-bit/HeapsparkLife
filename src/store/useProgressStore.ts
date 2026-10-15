/**
 * Spark Points, passport and badges on the client. Turns awards into
 * toasts, and on load shows anything earned while away (e.g. a code
 * redeemed at a shop).
 */
import { create } from 'zustand';
import { api } from '@/api';
import { translate, type TranslationKey } from '@/i18n';
import { DISTRICTS, DISTRICTS_BY_ID } from '@/data/districts';
import { BADGES } from '@/data/rewards';
import type { Award, PointsEntry, Progress } from '@/types/player';
import type { DistrictId } from '@/types/geo';
import { useToastStore } from './useToastStore';
import { useUiStore } from './useUiStore';

const SEEN_KEY = 'hs.progressSeenAt';

const t = (key: TranslationKey, vars?: Record<string, string | number>) => translate(useUiStore.getState().locale, key, vars);

function toastFor(entry: PointsEntry, extra: Partial<Award> = {}, stampCount = 0) {
  const push = useToastStore.getState().push;
  const pts = t('points.plus', { n: entry.delta });
  switch (entry.reason) {
    case 'newDistrict': {
      const id = (extra.stampDistrictId ?? entry.refKey.split(':')[1]) as DistrictId;
      const d = DISTRICTS_BY_ID[id];
      push({ icon: '🛂', title: t('points.stamped', { name: d?.name ?? id }), body: `${t('passport.count', { n: stampCount, total: DISTRICTS.length })} · ${pts}`, color: d?.color });
      break;
    }
    case 'badge': {
      const id = (extra.badgeId ?? entry.refKey.split(':')[1]) as (typeof BADGES)[number]['id'];
      const b = BADGES.find((x) => x.id === id);
      push({ icon: b?.icon ?? '🏅', title: t('points.badge', { name: t(`badge.${id}.name` as TranslationKey) }), body: pts, color: '#f59e0b' });
      break;
    }
    default:
      push({ icon: entry.reason === 'daily' ? '☀️' : entry.reason === 'unlock' ? '🎟️' : '✅', title: pts, body: t(`points.reason.${entry.reason}` as TranslationKey) });
  }
}

function readSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}
function writeSeen(owner: string, at: string) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify({ ...readSeen(), [owner]: at }));
  } catch {
    /* ignore */
  }
}
const ownerOf = (p: Progress) => p.ledger[0]?.ownerId;

interface ProgressState {
  progress: Progress | null;
  passportOpen: boolean;
  refresh(): Promise<Progress>;
  /** Toast + refresh after an action returned awards. */
  handleAwards(awards: Award[]): Promise<void>;
  /** On start: toast anything earned since last time. */
  catchUp(): Promise<void>;
  dailyVisit(): Promise<void>;
  visitDistrict(id: DistrictId): Promise<void>;
  setPassportOpen(open: boolean): void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,
  passportOpen: false,
  refresh: async () => {
    const progress = await api.progress.get();
    set({ progress });
    return progress;
  },
  handleAwards: async (awards) => {
    const p = await get().refresh();
    awards.forEach((a) => toastFor(a.entry, a, p.stamps.length));
    const owner = ownerOf(p);
    if (owner && awards.length) writeSeen(owner, new Date().toISOString());
  },
  catchUp: async () => {
    const p = await get().refresh();
    const owner = ownerOf(p);
    if (!owner) return;
    const seen = readSeen()[owner];
    if (seen) p.ledger.filter((e) => e.createdAt > seen).reverse().forEach((e) => toastFor(e, {}, p.stamps.length));
    writeSeen(owner, new Date().toISOString());
  },
  dailyVisit: async () => get().handleAwards(await api.progress.dailyVisit()),
  visitDistrict: async (id) => get().handleAwards(await api.progress.visitDistrict(id)),
  setPassportOpen: (passportOpen) => {
    set({ passportOpen });
    if (passportOpen) void get().refresh();
  },
}));
