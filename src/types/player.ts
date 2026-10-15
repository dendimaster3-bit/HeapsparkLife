/**
 * Players. We collect the minimum: a display name and ONE contact
 * (email or phone) for sign-in. Mirrors the future `players` table
 * (the contact itself lives in Supabase Auth, not in our tables).
 */
export type ContactKind = 'email' | 'phone';

export interface Player {
  id: string;
  displayName: string;
  contactKind: ContactKind;
  /** Email address or phone number used to sign in. */
  contact: string;
  createdAt: string;
  /** When the player accepted the privacy notice. */
  privacyAcceptedAt: string;
}

export interface Session {
  player: Player;
}

/** Why points were awarded. */
export type PointsReason = 'daily' | 'newDistrict' | 'unlock' | 'redeem' | 'badge';

/**
 * One row of the points ledger. `refKey` makes every award idempotent
 * (e.g. "daily:2026-10-15", "district:flacq", "unlock:<promoId>"), so the
 * same thing can never be rewarded twice. Balance = sum of `delta`.
 * Spark Points are NOT money and can never be cashed out.
 */
export interface PointsEntry {
  id: string;
  /** Player id, or a local guest id before sign-in. */
  ownerId: string;
  delta: number;
  reason: PointsReason;
  refKey: string;
  createdAt: string;
}

export interface PassportStamp {
  ownerId: string;
  districtId: string;
  stampedAt: string;
}

export type BadgeId = 'first-stamp' | 'explorer' | 'tour-de-lile' | 'first-deal' | 'regular';

export interface Badge {
  id: BadgeId;
  icon: string;
  /** Bonus Spark Points when earned. */
  bonus: number;
}

export interface EarnedBadge {
  ownerId: string;
  badgeId: BadgeId;
  earnedAt: string;
}

/** What a single action earned, for toasts. */
export interface Award {
  entry: PointsEntry;
  /** Set when the award came with a stamp or badge. */
  stampDistrictId?: string;
  badgeId?: BadgeId;
}

export interface Progress {
  /** True when progress belongs to a guest (lost if site data is cleared). */
  guest: boolean;
  points: number;
  ledger: PointsEntry[];
  stamps: PassportStamp[];
  badges: EarnedBadge[];
}
