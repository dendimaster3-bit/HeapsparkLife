/**
 * Spark Points rules and badges. Tweak the numbers here; the logic lives in
 * the API adapter. Points are for fun only — never money (see /terms).
 */
import type { Badge, BadgeId, PointsReason } from '@/types/player';

export const POINTS: Record<Exclude<PointsReason, 'badge'>, number> = {
  /** First visit each day (Mauritius calendar day). */
  daily: 10,
  /** First time in a district (also stamps the passport). */
  newDistrict: 25,
  /** First unlock of each promo. */
  unlock: 15,
  /** Each code redeemed at a shop. */
  redeem: 50,
};

export const BADGES: Badge[] = [
  { id: 'first-stamp', icon: '🛂', bonus: 10 },
  { id: 'explorer', icon: '🧭', bonus: 50 },
  { id: 'tour-de-lile', icon: '🏝️', bonus: 150 },
  { id: 'first-deal', icon: '🎟️', bonus: 20 },
  { id: 'regular', icon: '🤝', bonus: 30 },
];

/** How each badge is earned, from simple counts. */
export const BADGE_RULES: Record<BadgeId, (c: { stamps: number; unlocks: number; redeems: number }) => boolean> = {
  'first-stamp': (c) => c.stamps >= 1,
  explorer: (c) => c.stamps >= 5,
  'tour-de-lile': (c) => c.stamps >= 9,
  'first-deal': (c) => c.unlocks >= 1,
  regular: (c) => c.redeems >= 1,
};
