/**
 * Business plots: buildable spots in every town, generated deterministically
 * along the streets (front facing the road), most central first. Plot ids
 * are `<townId>-<n>`, so seed data and the future database can reference
 * them. Later the admin/claim flow can add hand-placed plots too.
 */
import { TOWNS } from '@/data/towns';
import { insideDistrict, project, rng, hashString } from '@/lib/geo';
import type { Plot } from '@/types/business';
import type { TownKind } from '@/types/geo';
import { TOWN_RADIUS } from './roadNetwork';
import { getRoadNetwork } from './roadNetwork';
import { isBuildable } from './placement';

export const PLOTS_PER_TOWN: Record<TownKind, number> = { city: 6, town: 5, village: 3 };
/** Distance from road centre-line to plot centre (km). */
const SETBACK = 0.5;
/** Minimum distance between plots (km). */
const SPACING = 1.1;
/** Clearance radius a plot needs. */
export const PLOT_RADIUS = 0.38;

type Unplaced = Omit<Plot, 'businessId'>;
let cache: Unplaced[] | null = null;

export function getAllPlots(): Unplaced[] {
  if (cache) return cache;
  const roads = getRoadNetwork();
  const out: Unplaced[] = [];

  for (const town of TOWNS) {
    const [cx, cz] = project(town.at);
    const want = PLOTS_PER_TOWN[town.kind];
    const radius = TOWN_RADIUS[town.kind];
    const placed: Unplaced[] = [];
    // `relax` loosens spacing for crowded places (small Port Louis, coastal towns).
    const ok = (x: number, z: number, relax = 1) =>
      isBuildable(x, z, PLOT_RADIUS * relax, (SETBACK - 0.06) * relax) &&
      insideDistrict(x, z, town.districtId, (PLOT_RADIUS + 0.1) * relax) &&
      placed.every((p) => Math.hypot(p.position[0] - x, p.position[1] - z) >= SPACING * relax) &&
      out.every((p) => Math.hypot(p.position[0] - x, p.position[1] - z) >= SPACING * relax);
    const add = (x: number, z: number, rotation: number) =>
      placed.push({ id: `${town.id}-${placed.length}`, townId: town.id, districtId: town.districtId, position: [x, z], rotation });

    // 1) Street frontage: walk road samples near the centre, try both sides.
    const samples: { x: number; z: number; nx: number; nz: number; d: number }[] = [];
    for (const road of roads) {
      const pts = road.points;
      for (let i = 0; i < pts.length; i += 2) {
        const d = Math.hypot(pts[i].x - cx, pts[i].z - cz);
        if (d > radius) continue;
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const tl = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        samples.push({ x: pts[i].x, z: pts[i].z, nx: -(b.z - a.z) / tl, nz: (b.x - a.x) / tl, d });
      }
    }
    samples.sort((a, b) => a.d - b.d);
    for (const s of samples) {
      for (const side of [1, -1]) {
        if (placed.length >= want) break;
        const x = s.x + s.nx * SETBACK * side, z = s.z + s.nz * SETBACK * side;
        // Face the road: local +z points from the plot towards the road.
        if (ok(x, z)) add(x, z, Math.atan2(-s.nx * side, -s.nz * side));
      }
    }

    // 2) Fallback for towns off the main roads: spots facing the centre,
    //    first at normal spacing, then a little tighter if still short.
    const rand = rng(hashString(`plots:${town.id}`));
    for (const [relax, reach] of [[1, 1.3], [0.85, 1.5]] as const) {
      for (let tries = 0; placed.length < want && tries < 500; tries++) {
        const a = rand() * Math.PI * 2;
        const r = (0.2 + rand() * (reach - 0.2)) * radius;
        const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (ok(x, z, relax)) add(x, z, Math.atan2(cx - x, cz - z));
      }
    }
    out.push(...placed);
  }
  cache = out;
  return out;
}
