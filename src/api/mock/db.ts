/**
 * Tiny in-browser "database" for the mock adapter, persisted to
 * localStorage. It stands in for Postgres until the Supabase adapter
 * exists; everything here happens on one device, so it's for demos only.
 */
import { DEMO_PROMOS } from '@/data/demoPromos';
import { DEMO_BOOKINGS, DEMO_PARTNERS } from '@/data/demoAds';
import type { AdBooking, AdSlot, Partner } from '@/types/ads';
import type { Business } from '@/types/business';
import { DEMO_BUSINESSES } from '@/data/demoBusinesses';
import { AD_SLOTS } from '@/data/adSlots';
import type { EarnedBadge, PassportStamp, Player, PointsEntry } from '@/types/player';
import type { Promo, PromoCode, Redemption } from '@/types/promo';

export interface MockDb {
  version: 1;
  businesses: Business[];
  /** Slot list (prices are editable by admin). */
  slots: AdSlot[];
  promos: Promo[];
  codes: PromoCode[];
  redemptions: Redemption[];
  players: Player[];
  ledger: PointsEntry[];
  stamps: PassportStamp[];
  badges: EarnedBadge[];
  bookings: AdBooking[];
  partners: Partner[];
  /** Impressions/clicks per slot, including empty slots (shows demand). */
  slotStats: Record<string, { impressions: number; clicks: number }>;
  sessionPlayerId: string | null;
  /** Pending one-time sign-in code (simulated SMS/email OTP). */
  otp: { contact: string; code: string; expiresAt: number } | null;
}

const KEY = 'hs.db';

function seed(): MockDb {
  return {
    version: 1,
    businesses: structuredClone(DEMO_BUSINESSES),
    slots: structuredClone(AD_SLOTS),
    promos: structuredClone(DEMO_PROMOS),
    codes: [],
    redemptions: [],
    players: [],
    ledger: [],
    stamps: [],
    badges: [],
    bookings: structuredClone(DEMO_BOOKINGS),
    partners: structuredClone(DEMO_PARTNERS),
    slotStats: {},
    sessionPlayerId: null,
    otp: null,
  };
}

let memory: MockDb | null = null;

export function db(): MockDb {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? (JSON.parse(raw) as MockDb) : seed();
    // Migrate older saves: add tables introduced in later steps.
    memory.ledger ??= [];
    memory.stamps ??= [];
    memory.badges ??= [];
    memory.bookings ??= structuredClone(DEMO_BOOKINGS);
    memory.partners ??= structuredClone(DEMO_PARTNERS);
    memory.slotStats ??= {};
    memory.businesses ??= structuredClone(DEMO_BUSINESSES);
    memory.slots ??= structuredClone(AD_SLOTS);
    for (const sl of AD_SLOTS) if (!memory.slots.some((x) => x.id === sl.id)) memory.slots.push(structuredClone(sl));
    // Add promos introduced by newer seed data.
    for (const p of DEMO_PROMOS) if (!memory.promos.some((x) => x.id === p.id)) memory.promos.push(structuredClone(p));
  } catch {
    memory = seed();
  }
  return memory;
}

const listeners = new Set<() => void>();

/** Subscribe to data changes (the Supabase adapter will use realtime). */
export function onDbChange(cb: () => void) {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

/**
 * Persist and notify. Returns false if the browser's storage is full
 * (uploaded images live here in demo mode), true otherwise.
 */
export function save(): boolean {
  let ok = true;
  try {
    localStorage.setItem(KEY, JSON.stringify(db()));
  } catch (e) {
    ok = !(e instanceof DOMException && e.name === 'QuotaExceededError');
  }
  listeners.forEach((cb) => cb());
  return ok;
}

// Other tabs (e.g. /validate or /admin open next to the game) see changes too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    memory = null;
    listeners.forEach((cb) => cb());
  });
}

/** Random id (works on plain-http LAN testing where randomUUID is unavailable). */
export const uid = () =>
  [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');

const GUEST_KEY = 'hs.guest';
let guestId: string | null = null;

/** Stable local id for a guest's progress before they sign in. */
export function guestOwnerId(): string {
  if (guestId) return guestId;
  try {
    guestId = localStorage.getItem(GUEST_KEY);
    if (!guestId) {
      guestId = `guest:${uid()}`;
      localStorage.setItem(GUEST_KEY, guestId);
    }
  } catch {
    guestId = `guest:${uid()}`;
  }
  return guestId;
}

/** Whose progress actions count towards: the player, else the guest. */
export function ownerId(): string {
  return db().sessionPlayerId ?? guestOwnerId();
}

export function currentPlayer(): Player | null {
  const d = db();
  return d.players.find((p) => p.id === d.sessionPlayerId) ?? null;
}
