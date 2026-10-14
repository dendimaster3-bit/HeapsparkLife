/**
 * Promos, per-player codes and redemptions. Mirrors the future Supabase
 * tables `promos`, `promo_codes` (unique per player + promo) and
 * `redemptions`.
 */

export type DiscountType = 'percent' | 'amount' | 'freebie';
export type PromoStatus = 'pending' | 'active' | 'paused' | 'expired';

export interface PromoRules {
  /** Only valid on the customer's first visit (checked by staff). */
  firstVisitOnly?: boolean;
  /** Minimum spend in Mauritian rupees. */
  minSpendRs?: number;
}

export interface Promo {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  /** Percent (15) or rupees (100); unused for freebies. */
  discountValue?: number;
  /** Max codes that can be unlocked; null = unlimited. */
  quantityLimit: number | null;
  quantityUnlocked: number;
  startsAt?: string;
  expiresAt: string;
  /** Optional: each code expires this many days after unlocking. */
  codeValidDays?: number;
  rules: PromoRules;
  status: PromoStatus;
  isDemo: boolean;
}

/** One player's unique, single-use code for one promo. */
export interface PromoCode {
  id: string;
  promoId: string;
  businessId: string;
  playerId: string;
  /** e.g. "HS-7KQ2-M9XA" (no ambiguous characters). */
  code: string;
  unlockedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
}

export type RedemptionMethod = 'typed' | 'qr';

export interface Redemption {
  id: string;
  promoCodeId: string;
  businessId: string;
  redeemedAt: string;
  method: RedemptionMethod;
}

/** A wallet entry: the code plus what it's for. */
export interface WalletItem {
  code: PromoCode;
  promo: Promo;
  businessName: string;
  brandColor: string;
}

export type CodeState = 'active' | 'redeemed' | 'expired';

/** Result of looking a code up at the counter. */
export type LookupResult =
  | { ok: true; item: WalletItem; playerName: string }
  | { ok: false; reason: 'not-found' | 'wrong-business' | 'expired' | 'already-redeemed'; item?: WalletItem };

export type UnlockError = 'sign-in-required' | 'sold-out' | 'expired' | 'unavailable';
