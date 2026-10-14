/** Promo/code helpers shared by the card, wallet and validation page. */
import type { CodeState, Promo, PromoCode } from '@/types/promo';

/** Alphabet without look-alikes (no 0/O, 1/I/L). */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** Random code like "HS-7KQ2-M9XA" from a cryptographic RNG. */
export function generateCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
  return `HS-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

/**
 * Normalise whatever staff typed or the camera read into "HS-XXXX-XXXX".
 * Accepts lower case, missing dashes/spaces and full validation URLs.
 */
export function normalizeCode(input: string): string {
  let raw = input.trim();
  try {
    const fromUrl = new URL(raw).searchParams.get('code');
    if (fromUrl) raw = fromUrl;
  } catch {
    /* not a URL */
  }
  const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^HS/, '');
  if (chars.length !== 8) return raw.toUpperCase();
  return `HS-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

export function codeState(code: PromoCode, now = Date.now()): CodeState {
  if (code.redeemedAt) return 'redeemed';
  if (Date.parse(code.expiresAt) <= now) return 'expired';
  return 'active';
}

export function isPromoLive(p: Promo, now = Date.now()) {
  return (
    p.status === 'active' &&
    Date.parse(p.expiresAt) > now &&
    (!p.startsAt || Date.parse(p.startsAt) <= now)
  );
}

export function remaining(p: Promo): number | null {
  return p.quantityLimit === null ? null : Math.max(0, p.quantityLimit - p.quantityUnlocked);
}

/** Short badge text: "-15%", "-Rs 100", "FREE". */
export function discountBadge(p: Promo): string {
  if (p.discountType === 'percent') return `-${p.discountValue}%`;
  if (p.discountType === 'amount') return `-Rs ${p.discountValue}`;
  return 'FREE';
}

/** Link encoded in the QR: opens the validation page with the code filled in. */
export function validationUrl(code: string): string {
  const base = `${location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
  return `${base}/validate?code=${encodeURIComponent(code)}`;
}
