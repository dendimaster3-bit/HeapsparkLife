/**
 * Spark Points, passport stamps and badges for the mock adapter. Every
 * award has a unique refKey per owner, so repeating an action never pays
 * twice. Guests earn too; their progress is merged when they sign in.
 */
import { BADGES, BADGE_RULES, POINTS } from '@/data/rewards';
import { MAURITIUS_UTC_OFFSET_HOURS } from '@/lib/time';
import type { Award, PointsReason } from '@/types/player';
import type { HeapsparkApi } from '../types';
import { db, guestOwnerId, ownerId, save, uid } from './db';

/** "2026-10-15" in Mauritius time. */
export function mauritiusDate(d = new Date()) {
  return new Date(d.getTime() + MAURITIUS_UTC_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);
}

/** Add a ledger row unless this owner already got `refKey`. */
function award(owner: string, reason: PointsReason, refKey: string, delta: number): Award | null {
  const d = db();
  if (d.ledger.some((e) => e.ownerId === owner && e.refKey === refKey)) return null;
  const entry = { id: uid(), ownerId: owner, delta, reason, refKey, createdAt: new Date().toISOString() };
  d.ledger.push(entry);
  return { entry };
}

/** Grant any newly-earned badges (each with its bonus points). */
export function checkBadges(owner: string): Award[] {
  const d = db();
  const counts = {
    stamps: d.stamps.filter((s) => s.ownerId === owner).length,
    unlocks: d.ledger.filter((e) => e.ownerId === owner && e.reason === 'unlock').length,
    redeems: d.ledger.filter((e) => e.ownerId === owner && e.reason === 'redeem').length,
  };
  const out: Award[] = [];
  for (const b of BADGES) {
    if (d.badges.some((x) => x.ownerId === owner && x.badgeId === b.id) || !BADGE_RULES[b.id](counts)) continue;
    d.badges.push({ ownerId: owner, badgeId: b.id, earnedAt: new Date().toISOString() });
    const a = award(owner, 'badge', `badge:${b.id}`, b.bonus);
    if (a) out.push({ ...a, badgeId: b.id });
  }
  return out;
}

/** Points for unlocking / redeeming, called from the promo + validation APIs. */
export function awardFor(owner: string, reason: 'unlock' | 'redeem', ref: string): Award[] {
  const a = award(owner, reason, `${reason}:${ref}`, POINTS[reason]);
  return a ? [a, ...checkBadges(owner)] : [];
}

/** Move a guest's progress onto a player account (no double awards). */
export function mergeGuestInto(playerId: string) {
  const d = db();
  const guest = guestOwnerId();
  for (const e of d.ledger.filter((x) => x.ownerId === guest)) {
    if (!d.ledger.some((x) => x.ownerId === playerId && x.refKey === e.refKey)) e.ownerId = playerId;
  }
  for (const s of d.stamps.filter((x) => x.ownerId === guest)) {
    if (!d.stamps.some((x) => x.ownerId === playerId && x.districtId === s.districtId)) s.ownerId = playerId;
  }
  for (const b of d.badges.filter((x) => x.ownerId === guest)) {
    if (!d.badges.some((x) => x.ownerId === playerId && x.badgeId === b.badgeId)) b.ownerId = playerId;
  }
  // Drop whatever duplicated the player's own progress.
  d.ledger = d.ledger.filter((x) => x.ownerId !== guest);
  d.stamps = d.stamps.filter((x) => x.ownerId !== guest);
  d.badges = d.badges.filter((x) => x.ownerId !== guest);
  checkBadges(playerId);
}

/** Erase everything progress-related for an owner (account deletion). */
export function eraseProgress(owner: string) {
  const d = db();
  d.ledger = d.ledger.filter((x) => x.ownerId !== owner);
  d.stamps = d.stamps.filter((x) => x.ownerId !== owner);
  d.badges = d.badges.filter((x) => x.ownerId !== owner);
}

export const progressApi: HeapsparkApi['progress'] = {
  async get() {
    const d = db();
    const owner = ownerId();
    // Rows are appended in order, so reversing gives newest first (stable for same-ms awards).
    const ledger = d.ledger.filter((e) => e.ownerId === owner).reverse();
    return {
      guest: !d.sessionPlayerId,
      points: ledger.reduce((sum, e) => sum + e.delta, 0),
      ledger,
      stamps: d.stamps.filter((s) => s.ownerId === owner),
      badges: d.badges.filter((b) => b.ownerId === owner),
    };
  },
  async dailyVisit() {
    const a = award(ownerId(), 'daily', `daily:${mauritiusDate()}`, POINTS.daily);
    if (a) save();
    return a ? [a] : [];
  },
  async visitDistrict(districtId) {
    const d = db();
    const owner = ownerId();
    if (d.stamps.some((s) => s.ownerId === owner && s.districtId === districtId)) return [];
    d.stamps.push({ ownerId: owner, districtId, stampedAt: new Date().toISOString() });
    const a = award(owner, 'newDistrict', `district:${districtId}`, POINTS.newDistrict);
    const out = [...(a ? [{ ...a, stampDistrictId: districtId }] : []), ...checkBadges(owner)];
    save();
    return out;
  },
};
