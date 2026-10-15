/** Mock auth, promo unlocking and validation on top of the local db. */
import { codeState, generateCode, isPromoLive, normalizeCode, remaining } from '@/lib/promo';
import type { ContactKind, Session } from '@/types/player';
import type { LookupResult, PromoCode, RedemptionMethod, WalletItem } from '@/types/promo';
import type { HeapsparkApi, UnlockResult } from '../types';
import { currentPlayer, db, save, uid } from './db';
import { awardFor, eraseProgress, mergeGuestInto } from './progress';

const DAY = 86_400_000;

export function validContact(kind: ContactKind, contact: string): string | null {
  const c = contact.trim();
  if (kind === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) ? c.toLowerCase() : null;
  const digits = c.replace(/[^\d+]/g, '');
  // Mauritian mobile (5xxx xxxx) or any international number.
  if (/^5\d{7}$/.test(digits)) return `+230${digits}`;
  return /^\+\d{8,15}$/.test(digits) ? digits : null;
}

function toWallet(code: PromoCode): WalletItem | null {
  const promo = db().promos.find((p) => p.id === code.promoId);
  const biz = db().businesses.find((b) => b.id === code.businessId);
  if (!promo || !biz) return null;
  return { code, promo, businessName: biz.name, brandColor: biz.brandColor };
}

const session = (): Session | null => {
  const player = currentPlayer();
  return player ? { player } : null;
};

export const authApi: HeapsparkApi['auth'] = {
  async getSession() {
    return session();
  },
  async requestCode(kind, contact) {
    const c = validContact(kind, contact);
    if (!c) throw new Error('invalid-contact');
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0');
    db().otp = { contact: c, code, expiresAt: Date.now() + 10 * 60_000 };
    save();
    return { demoCode: code };
  },
  async verifyCode({ kind, contact, code, displayName, acceptPrivacy }) {
    const d = db();
    const c = validContact(kind, contact);
    if (!c || !d.otp || d.otp.contact !== c || d.otp.expiresAt < Date.now() || d.otp.code !== code.trim()) {
      throw new Error('invalid-code');
    }
    let player = d.players.find((p) => p.contact === c);
    if (!player) {
      if (!displayName?.trim()) throw new Error('name-required');
      if (!acceptPrivacy) throw new Error('privacy-required');
      player = {
        id: uid(),
        displayName: displayName.trim().slice(0, 40),
        contactKind: kind,
        contact: c,
        createdAt: new Date().toISOString(),
        privacyAcceptedAt: new Date().toISOString(),
      };
      d.players.push(player);
    }
    d.otp = null;
    d.sessionPlayerId = player.id;
    // Keep what they earned while browsing as a guest.
    mergeGuestInto(player.id);
    save();
    return { player };
  },
  async signOut() {
    db().sessionPlayerId = null;
    save();
  },
  async deleteAccount() {
    const d = db();
    const me = currentPlayer();
    if (!me) return;
    // Unused codes go; redeemed ones stay (anonymised) for the business's stats.
    d.codes = d.codes.filter((c) => c.playerId !== me.id || c.redeemedAt);
    for (const c of d.codes) if (c.playerId === me.id) c.playerId = 'deleted';
    d.players = d.players.filter((p) => p.id !== me.id);
    eraseProgress(me.id);
    d.sessionPlayerId = null;
    save();
  },
};

export const promosApi: HeapsparkApi['promos'] = {
  async unlock(promoId): Promise<UnlockResult> {
    const me = currentPlayer();
    if (!me) return { ok: false, error: 'sign-in-required' };
    const d = db();
    const promo = d.promos.find((p) => p.id === promoId);
    if (!promo) return { ok: false, error: 'unavailable' };
    // One code per player per promo: unlocking again just shows it.
    const existing = d.codes.find((c) => c.promoId === promoId && c.playerId === me.id);
    if (existing) return { ok: true, item: toWallet(existing)!, already: true, awards: [] };
    if (!isPromoLive(promo)) return { ok: false, error: Date.parse(promo.expiresAt) <= Date.now() ? 'expired' : 'unavailable' };
    if (remaining(promo) === 0) return { ok: false, error: 'sold-out' };

    let code = generateCode();
    while (d.codes.some((c) => c.code === code)) code = generateCode();
    const now = Date.now();
    const expires = Math.min(Date.parse(promo.expiresAt), promo.codeValidDays ? now + promo.codeValidDays * DAY : Infinity);
    const row: PromoCode = {
      id: uid(),
      promoId,
      businessId: promo.businessId,
      playerId: me.id,
      code,
      unlockedAt: new Date(now).toISOString(),
      expiresAt: new Date(expires).toISOString(),
      redeemedAt: null,
    };
    d.codes.push(row);
    promo.quantityUnlocked++;
    const awards = awardFor(me.id, 'unlock', promoId);
    save();
    return { ok: true, item: toWallet(row)!, already: false, awards };
  },
  async wallet() {
    const me = currentPlayer();
    if (!me) return [];
    return db()
      .codes.filter((c) => c.playerId === me.id)
      .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
      .map(toWallet)
      .filter((x): x is WalletItem => x !== null);
  },
};

/**
 * Staff signed in with an account that owns businesses may only validate
 * for those. (Demo mode lets anyone else pick any business.)
 */
function mayValidate(businessId: string) {
  const me = currentPlayer();
  const owned = me ? db().businesses.filter((b) => b.ownerId === me.id) : [];
  return owned.length === 0 || owned.some((b) => b.id === businessId);
}

function lookupInternal(businessId: string, input: string): LookupResult & { row?: PromoCode } {
  if (!mayValidate(businessId)) return { ok: false, reason: 'wrong-business' };
  const code = normalizeCode(input);
  const row = db().codes.find((c) => c.code === code);
  if (!row) return { ok: false, reason: 'not-found' };
  const item = toWallet(row) ?? undefined;
  if (row.businessId !== businessId) return { ok: false, reason: 'wrong-business' };
  const state = codeState(row);
  if (state === 'redeemed') return { ok: false, reason: 'already-redeemed', item };
  if (state === 'expired') return { ok: false, reason: 'expired', item };
  const player = db().players.find((p) => p.id === row.playerId);
  return { ok: true, item: item!, playerName: player?.displayName ?? '—', row };
}

export const validationApi: HeapsparkApi['validation'] = {
  async lookup(businessId, code) {
    const { row: _row, ...result } = lookupInternal(businessId, code);
    return result;
  },
  async redeem(businessId, code, method: RedemptionMethod) {
    const res = lookupInternal(businessId, code);
    if (!res.ok || !res.row) return res.ok ? { ok: false, reason: 'not-found' } : res;
    const at = new Date().toISOString();
    res.row.redeemedAt = at;
    db().redemptions.push({ id: uid(), promoCodeId: res.row.id, businessId, redeemedAt: at, method });
    // The player's reward shows up next time they open the game.
    if (res.row.playerId !== 'deleted') awardFor(res.row.playerId, 'redeem', res.row.id);
    save();
    return { ok: true, item: toWallet(res.row)!, playerName: res.playerName };
  },
};
