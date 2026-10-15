/**
 * Tiny in-browser "database" for the mock adapter, persisted to
 * localStorage. It stands in for Postgres until the Supabase adapter
 * exists; everything here happens on one device, so it's for demos only.
 */
import { DEMO_PROMOS } from '@/data/demoPromos';
import type { EarnedBadge, PassportStamp, Player, PointsEntry } from '@/types/player';
import type { Promo, PromoCode, Redemption } from '@/types/promo';

export interface MockDb {
  version: 1;
  promos: Promo[];
  codes: PromoCode[];
  redemptions: Redemption[];
  players: Player[];
  ledger: PointsEntry[];
  stamps: PassportStamp[];
  badges: EarnedBadge[];
  sessionPlayerId: string | null;
  /** Pending one-time sign-in code (simulated SMS/email OTP). */
  otp: { contact: string; code: string; expiresAt: number } | null;
}

const KEY = 'hs.db';

function seed(): MockDb {
  return {
    version: 1,
    promos: structuredClone(DEMO_PROMOS),
    codes: [],
    redemptions: [],
    players: [],
    ledger: [],
    stamps: [],
    badges: [],
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
    // Add promos introduced by newer seed data.
    for (const p of DEMO_PROMOS) if (!memory.promos.some((x) => x.id === p.id)) memory.promos.push(structuredClone(p));
  } catch {
    memory = seed();
  }
  return memory;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db()));
  } catch {
    /* storage unavailable: keep working in memory */
  }
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
