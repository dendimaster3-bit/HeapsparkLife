/**
 * World geometry helpers shared by the map and everything placed on it
 * (roads, houses, labels, buildings). The island is a flat board; districts
 * are traced polygons. Everything is deterministic so the same lat/lon
 * always lands at the same spot.
 *
 * World units: 1 unit ≈ 1 km. +x = east, +z = south (so north is -z).
 */
import { COASTLINE, LAKES } from '@/data/terrain';
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

// ---------------------------------------------------------------------------
// The board: the island is a flat, slightly raised "game board"
// ---------------------------------------------------------------------------

export const LAKES_W = LAKES.map((l) => ({ ...l, pos: project(l.at) }));

/** Height of the sea surface. */
export const SEA_LEVEL = 0;
/** Height of the island's top surface (everything stands on it). */
export const BOARD_TOP = 0.08;
/** Distance (km) from the shore to the barrier reef / lagoon edge. */
export const REEF_DISTANCE = 1.6;

/** Ground height at a position: the board top on land, sea level offshore. */
export function heightAt(x: number, z: number): number {
  return pointInPolygon(x, z, COAST) ? BOARD_TOP : SEA_LEVEL;
}

// ---------------------------------------------------------------------------
// Districts (traced outlines; neighbours share edges)
// ---------------------------------------------------------------------------

export const DISTRICT_POLYS = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.shape.map(project)])) as Record<DistrictId, Vec2[]>;

export interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

function boundsOf(poly: readonly Vec2[]): Bounds {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of poly) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  return { minX, maxX, minZ, maxZ };
}

export const DISTRICT_BOUNDS = Object.fromEntries(
  Object.entries(DISTRICT_POLYS).map(([id, poly]) => [id, boundsOf(poly)]),
) as Record<DistrictId, Bounds>;

/** Which district a ground position is in (nearest one if it's just offshore). */
export function districtAt(x: number, z: number): { id: DistrictId; edge: number } {
  let nearest: DistrictId = DISTRICTS[0].id;
  let best = Infinity;
  for (const d of DISTRICTS) {
    const sd = signedDistance(x, z, DISTRICT_POLYS[d.id]);
    if (sd >= 0) return { id: d.id, edge: Math.max(0, 1 - sd / 0.3) };
    if (-sd < best) {
      best = -sd;
      nearest = d.id;
    }
  }
  return { id: nearest, edge: 1 };
}

/** Is a point inside a district, at least `margin` km from its border? */
export function insideDistrict(x: number, z: number, id: DistrictId, margin = 0): boolean {
  return signedDistance(x, z, DISTRICT_POLYS[id]) >= margin;
}

/** Convenience: lat/lon → 3D position on the ground. */
export function groundPoint(at: LatLon, lift = 0): [number, number, number] {
  const [x, z] = project(at);
  return [x, heightAt(x, z) + lift, z];
}
