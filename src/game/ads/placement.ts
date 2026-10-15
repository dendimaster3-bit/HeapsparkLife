/**
 * Resolves ad-slot placement specs into world positions, and finds the
 * road entrance of each district (for District Founding Partner gates).
 */
import { TOWNS_BY_ID } from '@/data/towns';
import { DISTRICTS } from '@/data/districts';
import { districtAt, heightAt, project } from '@/lib/geo';
import type { AdPlacementSpec } from '@/types/ads';
import type { DistrictId } from '@/types/geo';
import { getRoadNetwork } from '../world/roadNetwork';
import { getAllPlots } from '../world/plots';

/** Minimum distance (km) between an ad and any business plot. */
const PLOT_CLEARANCE = 0.85;

const clearOfPlots = (s: Spot) =>
  getAllPlots().every((p) => Math.hypot(p.position[0] - s.position[0], p.position[1] - s.position[2]) > PLOT_CLEARANCE);

/** Walk outwards along the road from sample i until the spot doesn't crowd a business plot. */
function clearSpot(points: { x: number; z: number }[], i: number, side: number, offset: number): Spot {
  for (let step = 0; step < 40; step++) {
    for (const j of step ? [i + step, i - step] : [i]) {
      if (j < 0 || j >= points.length) continue;
      const s = roadSpot(points, j, side, offset);
      if (clearOfPlots(s)) return s;
    }
  }
  return roadSpot(points, i, side, offset);
}

export interface Spot {
  position: [number, number, number];
  /** Rotation (radians) so the panel's front faces the road. */
  rotation: number;
  /** Road direction at the spot (unit x/z), for gates spanning the road. */
  tangent: [number, number];
}

function roadSpot(points: { x: number; z: number }[], i: number, side: number, offset: number): Spot {
  const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
  const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const tx = (b.x - a.x) / len, tz = (b.z - a.z) / len;
  const nx = -tz * side, nz = tx * side;
  const x = points[i].x + nx * offset, z = points[i].z + nz * offset;
  return { position: [x, heightAt(x, z), z], rotation: Math.atan2(-nx, -nz), tangent: [tx, tz] };
}

const ENTRANCE_RADIUS = { city: 1.6, town: 1.05, village: 0.7 } as const;

/** Where a slot goes. `inset` (0–1) pulls town spots towards the centre (bus stops). */
export function resolveSpot(spec: AdPlacementSpec, inset = 1, offset = 0.32): Spot | null {
  if (spec.kind === 'screen') return null;
  if (spec.kind === 'point') {
    const [x, z] = project(spec.at);
    return { position: [x, heightAt(x, z), z], rotation: ((spec.rotation ?? 0) * Math.PI) / 180, tangent: [1, 0] };
  }
  const roads = getRoadNetwork();
  if (spec.kind === 'road') {
    const road = roads.find((r) => r.id === spec.roadId);
    if (!road) return null;
    return clearSpot(road.points, Math.round(spec.t * (road.points.length - 1)), spec.side, offset);
  }
  // Town: the road sample closest to the town's edge (or nearer for bus stops).
  const town = TOWNS_BY_ID[spec.townId];
  if (!town) return null;
  const [cx, cz] = project(town.at);
  const want = ENTRANCE_RADIUS[town.kind] * inset;
  let best: { road: number; i: number; err: number } | null = null;
  roads.forEach((r, ri) =>
    r.points.forEach((p, i) => {
      const err = Math.abs(Math.hypot(p.x - cx, p.z - cz) - want);
      if (!best || err < best.err) best = { road: ri, i, err };
    }),
  );
  if (!best) return null;
  const { road, i } = best;
  return clearSpot(roads[road].points, i, 1, offset);
}

let entrances: Partial<Record<DistrictId, Spot>> | null = null;

/**
 * For each district, the point where a main road crosses into it, closest
 * to the district centre (motorways/main roads preferred over the coast road).
 */
export function districtEntrances(): Partial<Record<DistrictId, Spot>> {
  if (entrances) return entrances;
  const found: Partial<Record<DistrictId, { spot: Spot; score: number }>> = {};
  for (const road of getRoadNetwork()) {
    const pts = road.points;
    let prev = districtAt(pts[0].x, pts[0].z).id;
    for (let i = 1; i < pts.length; i++) {
      const cur = districtAt(pts[i].x, pts[i].z).id;
      if (cur !== prev) {
        // Step a little into the new district.
        const j = Math.min(pts.length - 1, i + 2);
        const d = DISTRICTS.find((x) => x.id === cur)!;
        const [cx, cz] = project(d.center);
        const score = Math.hypot(pts[j].x - cx, pts[j].z - cz) + (road.kind === 'coastal' ? 6 : 0);
        if (!found[cur] || score < found[cur]!.score) found[cur] = { spot: roadSpot(pts, j, 1, 0), score };
      }
      prev = cur;
    }
  }
  entrances = Object.fromEntries(Object.entries(found).map(([k, v]) => [k, v!.spot])) as Partial<Record<DistrictId, Spot>>;
  return entrances;
}
