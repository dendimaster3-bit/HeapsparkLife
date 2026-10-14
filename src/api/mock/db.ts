/**
 * Tiny in-browser "database" for the mock adapter, persisted to
 * localStorage. It stands in for Postgres until the Supabase adapter
 * exists; everything here happens on one device, so it's for demos only.
 */
import { DEMO_PROMOS } from '@/data/demoPromos';
import type { Player } from '@/types/player';
import type { Promo, PromoCode, Redemption } from '@/types/promo';

export interface MockDb {
  version: 1;
  promos: Promo[];
  codes: PromoCode[];
  redemptions: Redemption[];
  players: Player[];
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

export function currentPlayer(): Player | null {
  const d = db();
  return d.players.find((p) => p.id === d.sessionPlayerId) ?? null;
}
