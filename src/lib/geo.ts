/**
 * World geometry helpers shared by the terrain mesh and everything placed
 * on it (roads, houses, labels, buildings). Everything is deterministic so
 * the same lat/lon always lands at the same spot and height.
 *
 * World units: 1 unit ≈ 1 km. +x = east, +z = south (so north is -z).
 */
import { COASTLINE, FLAT_ZONES, LAKES, PEAKS } from '@/data/terrain';
import { DISTRICTS } from '@/data/districts';
import type { DistrictId, LatLon, Vec2 } from '@/types/geo';

const ORIGIN_LAT = -20.25;
const ORIGIN_LON = 57.55;
const KM_PER_DEG_LAT = 111;
const KM_PER_DEG_LON = 104.4; // cos(20.25°) * 111.3

/** Project lat/lon into world ground coordinates [x, z]. */
export function project([lat, lon]: LatLon): Vec2 {
  return [(lon - ORIGIN_LON) * KM_PER_DEG_LON, -(lat - ORIGIN_LAT) * KM_PER_DEG_LAT];
}

/** Inverse of `project` — handy for debugging/adding localities. */
export function unproject([x, z]: Vec2): LatLon {
  return [ORIGIN_LAT - z / KM_PER_DEG_LAT, ORIGIN_LON + x / KM_PER_DEG_LON];
}

// ---------------------------------------------------------------------------
// Coastline
// ---------------------------------------------------------------------------

export const COAST: Vec2[] = COASTLINE.map(project);

export const ISLAND_BOUNDS = (() => {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of COAST) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  return { minX, maxX, minZ, maxZ };
})();

function pointInPolygon(x: number, z: number, poly: readonly Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
  const cx = ax + t * dx - px, cz = az + t * dz - pz;
  return Math.sqrt(cx * cx + cz * cz);
}

/** Signed distance (km) to a closed polygon: positive inside, negative outside. */
export function signedDistance(x: number, z: number, poly: readonly Vec2[] = COAST): number {
  let min = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    min = Math.min(min, distToSegment(x, z, poly[j][0], poly[j][1], poly[i][0], poly[i][1]));
  }
  return pointInPolygon(x, z, poly) ? min : -min;
}

/**
 * Push every vertex of a closed polygon along its averaged normal.
 * Positive = outward (for a clockwise-on-screen polygon). Used for the
 * lagoon, the reef line and the inland coastal road.
 */
export function offsetPolygon(poly: readonly Vec2[], distance: number): Vec2[] {
  const n = poly.length;
  // Determine winding so "outward" is consistent regardless of data order.
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % n];
    area += x1 * z2 - x2 * z1;
  }
  const sign = area > 0 ? 1 : -1;
  return poly.map((p, i) => {
    const prev = poly[(i - 1 + n) % n];
    const next = poly[(i + 1) % n];
    const tx = next[0] - prev[0];
    const tz = next[1] - prev[1];
    const len = Math.hypot(tx, tz) || 1;
    // Right-hand normal of the tangent, flipped by winding.
    const nx = (-tz / len) * sign;
    const nz = (tx / len) * sign;
    return [p[0] - nx * distance, p[1] - nz * distance] as Vec2;
  });
}

// ---------------------------------------------------------------------------
// Noise + RNG
// ---------------------------------------------------------------------------

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable numeric hash for strings (to seed per-town randomness). */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function hash2(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Smooth 2D value noise in [0, 1]. */
export function valueNoise(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi);
  const c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Terrain height
// ---------------------------------------------------------------------------

const PEAKS_W = PEAKS.map((p) => ({ ...p, pos: project(p.at) }));
export const LAKES_W = LAKES.map((l) => ({ ...l, pos: project(l.at) }));

/** Height of the sea surface. */
export const SEA_LEVEL = 0;
/** Distance (km) from the shore to the barrier reef / lagoon edge. */
export const REEF_DISTANCE = 2.2;

/** Terrain height (world units) at a ground position. */
export function heightAt(x: number, z: number): number {
  let h = rawHeight(x, z);
  for (const f of FLAT_W) {
    const r = Math.hypot(x - f.pos[0], z - f.pos[1]);
    if (r < f.radius) h = f.h + (h - f.h) * smoothstep(f.radius * 0.7, f.radius, r);
  }
  return h;
}

function rawHeight(x: number, z: number): number {
  const d = signedDistance(x, z);
  if (d < 0) {
    // Shallow lagoon shelf out to the reef, then a drop-off to deep water.
    if (d > -REEF_DISTANCE) return -0.08 + d * 0.12;
    return Math.max(-3, -0.08 - REEF_DISTANCE * 0.12 + (d + REEF_DISTANCE) * 1.5);
  }

  const inland = smoothstep(0, 1.5, d);
  let h = 0.04 + inland * 0.2;
  h += (valueNoise(x * 0.35, z * 0.35) - 0.5) * 0.5 * inland;
  for (const p of PEAKS_W) {
    const dx = x - p.pos[0], dz = z - p.pos[1];
    const s = p.radius * 0.5;
    h += p.height * Math.exp(-(dx * dx + dz * dz) / (2 * s * s)) * inland;
  }
  // Flatten lakes into shallow basins.
  for (const l of LAKES_W) {
    const r = Math.hypot(x - l.pos[0], z - l.pos[1]);
    if (r < l.radius * 1.6) {
      const t = smoothstep(l.radius * 0.6, l.radius * 1.6, r);
      h = h * t + (h - 0.25) * (1 - t);
    }
  }
  return Math.max(0.03, h);
}

const FLAT_W = FLAT_ZONES.map((f) => {
  const pos = project(f.at);
  return { ...f, pos, h: rawHeight(pos[0], pos[1]) };
});

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------

const SEEDS_W = DISTRICTS.flatMap((d) =>
  d.seeds.map((s) => ({ id: d.id, pos: project(s.at), weight: s.weight ?? 1 })),
);

/**
 * Which district owns a ground position, plus a 0..1 "edge" factor that
 * is 1 right on a border (used to draw soft boundary lines).
 */
export function districtAt(x: number, z: number): { id: DistrictId; edge: number } {
  let best = Infinity, second = Infinity;
  let bestId: DistrictId = SEEDS_W[0].id;
  for (const s of SEEDS_W) {
    const dist = Math.hypot(x - s.pos[0], z - s.pos[1]) / s.weight;
    if (dist < best) {
      if (s.id !== bestId) second = best;
      best = dist;
      bestId = s.id;
    } else if (dist < second && s.id !== bestId) {
      second = dist;
    }
  }
  const edge = 1 - smoothstep(0, 0.6, second - best);
  return { id: bestId, edge };
}

/** Convenience: lat/lon → 3D position on the ground. */
export function groundPoint(at: LatLon, lift = 0): [number, number, number] {
  const [x, z] = project(at);
  return [x, heightAt(x, z) + lift, z];
}
