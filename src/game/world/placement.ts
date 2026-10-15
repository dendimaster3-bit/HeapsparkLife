/**
 * Placement helpers for scattering props (houses, trees) without dropping
 * them on roads, in the sea or inside landmarks.
 */
import { LANDMARKS } from '@/data/landmarks';
import { LAKES_W, project, signedDistance } from '@/lib/geo';
import { PEAKS, RIVERS } from '@/data/terrain';
import type { Vec2 } from '@/types/geo';
import { makeGroundPath } from './paths';
import { getRoadNetwork } from './roadNetwork';

const CELL = 0.5;
let roadGrid: Map<string, [number, number][]> | null = null;

function grid() {
  if (roadGrid) return roadGrid;
  roadGrid = new Map();
  for (const road of getRoadNetwork()) {
    for (const p of road.points) {
      const key = `${Math.floor(p.x / CELL)},${Math.floor(p.z / CELL)}`;
      const list = roadGrid.get(key) ?? [];
      list.push([p.x, p.z]);
      roadGrid.set(key, list);
    }
  }
  return roadGrid;
}

/** Distance (km) to the nearest road sample, capped at ~1 km. */
export function distanceToRoad(x: number, z: number): number {
  const g = grid();
  const cx = Math.floor(x / CELL), cz = Math.floor(z / CELL);
  let best = 1;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (const [px, pz] of g.get(`${cx + i},${cz + j}`) ?? []) {
        best = Math.min(best, Math.hypot(x - px, z - pz));
      }
    }
  }
  return best;
}

const LANDMARK_W = LANDMARKS.map((l) => ({ pos: project(l.at), r: l.kind === 'airport' ? 2.4 : l.kind === 'le-morne' ? 1.6 : 1 }));
const PEAKS_W = PEAKS.map((p) => ({ pos: project(p.at), r: p.radius }));

/** River centre-line samples (every ~150 m). */
const RIVER_PTS: Vec2[] = RIVERS.flatMap((r) => makeGroundPath(r.points.map(project), { spacing: 0.15 }).points.map((p) => [p.x, p.z] as Vec2));

/**
 * True if something of `radius` km can stand here: on land, off roads and
 * rivers, clear of lakes, mountains and landmarks. `roadClearance`
 * overrides the distance kept from road centre-lines (plots face a road).
 */
export function isBuildable(x: number, z: number, radius = 0.06, roadClearance = 0.16 + radius): boolean {
  if (signedDistance(x, z) < 0.3 + radius) return false;
  if (distanceToRoad(x, z) < roadClearance) return false;
  for (const p of RIVER_PTS) if (Math.abs(p[0] - x) < 1 && Math.hypot(x - p[0], z - p[1]) < 0.25 + radius) return false;
  for (const l of LAKES_W) if (Math.hypot(x - l.pos[0], z - l.pos[1]) < l.radius + 0.2 + radius) return false;
  for (const l of LANDMARK_W) if (Math.hypot(x - l.pos[0], z - l.pos[1]) < l.r + radius) return false;
  for (const m of PEAKS_W) if (Math.hypot(x - m.pos[0], z - m.pos[1]) < m.r + radius) return false;
  return true;
}
