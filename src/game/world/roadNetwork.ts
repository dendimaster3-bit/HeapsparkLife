/**
 * The road network, computed once: inland roads from `data/roads.ts`, a
 * coastal ring road just inside the coastline, and a few streets in every
 * town (a ring + two cross streets) so towns read as little cities.
 */
import { ROADS } from '@/data/roads';
import { TOWNS } from '@/data/towns';
import { COAST, hashString, offsetPolygon, project, rng, signedDistance } from '@/lib/geo';
import type { DistrictId, RoadKind, TownKind, Vec2 } from '@/types/geo';
import { makeGroundPath, type GroundPath } from './paths';

export interface RoadPath extends GroundPath {
  id: string;
  name: string;
  kind: RoadKind;
}

/** Road widths in km (exaggerated: it's a toy city). */
export const ROAD_WIDTH: Record<RoadKind, number> = { motorway: 0.34, main: 0.26, coastal: 0.24, street: 0.18 };

/** Town "radius" (km) used for streets, plots and filler buildings. */
export const TOWN_RADIUS: Record<TownKind, number> = { city: 2.3, town: 1.6, village: 1.05 };

/** Split a polyline into the runs where `keep` holds (e.g. on land, in a district). */
export function clipRuns(points: readonly Vec2[], keep: (p: Vec2) => boolean, loop = false): Vec2[][] {
  const pts = loop ? [...points, points[0]] : points;
  const runs: Vec2[][] = [];
  let cur: Vec2[] = [];
  for (const p of pts) {
    if (keep(p)) cur.push(p);
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);
  // A loop that was cut: join the last run onto the first.
  if (loop && runs.length > 1 && keep(pts[0])) runs[0] = [...runs.pop()!.slice(0, -1), ...runs[0]];
  return runs.filter((r) => r.length >= 2);
}

const onLand = (margin: number) => (p: Vec2) => signedDistance(p[0], p[1]) > margin;

function townStreets(): { id: string; points: Vec2[]; loop: boolean }[] {
  const out: { id: string; points: Vec2[]; loop: boolean }[] = [];
  for (const t of TOWNS) {
    const [cx, cz] = project(t.at);
    const r = TOWN_RADIUS[t.kind] * 0.5;
    const rand = rng(hashString(`streets:${t.id}`));
    const a0 = rand() * Math.PI;
    const ring: Vec2[] = Array.from({ length: 14 }, (_, i) => {
      const a = a0 + (i / 14) * Math.PI * 2;
      const wobble = 1 + (rand() - 0.5) * 0.12;
      return [cx + Math.cos(a) * r * wobble, cz + Math.sin(a) * r * wobble];
    });
    // A full ring if it fits on land, else the on-land pieces.
    const ringRuns = clipRuns(ring, onLand(0.35), true);
    ringRuns.forEach((run, i) => out.push({ id: `${t.id}-ring-${i}`, points: run, loop: ringRuns.length === 1 && run.length === ring.length }));
    // Two cross streets through the centre.
    for (const k of [0, 1]) {
      const a = a0 + k * (Math.PI / 2);
      const len = r * 1.8;
      const line: Vec2[] = Array.from({ length: 7 }, (_, i) => {
        const s = -len + (i / 6) * 2 * len;
        return [cx + Math.cos(a) * s, cz + Math.sin(a) * s];
      });
      clipRuns(line, onLand(0.35)).forEach((run, i) => out.push({ id: `${t.id}-x${k}-${i}`, points: run, loop: false }));
    }
  }
  return out;
}

let cache: RoadPath[] | null = null;

export function getRoadNetwork(): RoadPath[] {
  if (cache) return cache;
  const coastal: RoadPath = {
    id: 'coastal',
    name: 'Coastal Road',
    kind: 'coastal',
    ...makeGroundPath(offsetPolygon(COAST, -0.7), { loop: true, spacing: 0.3 }),
  };
  const inland = ROADS.flatMap<RoadPath>((r) =>
    clipRuns(r.points.map(project), onLand(0.3)).map((run, i) => ({
      id: i ? `${r.id}-${i}` : r.id,
      name: r.name,
      kind: r.kind,
      ...makeGroundPath(run),
    })),
  );
  const streets = townStreets().map<RoadPath>((s) => ({
    id: s.id,
    name: 'Street',
    kind: 'street',
    ...makeGroundPath(s.points, { loop: s.loop, spacing: 0.2 }),
  }));
  cache = [coastal, ...inland, ...streets];
  return cache;
}

const perDistrict = new Map<DistrictId, RoadPath[]>();

/** The parts of every road inside one district (for its scene and traffic). */
export function districtRoads(id: DistrictId, inside: (p: Vec2) => boolean): RoadPath[] {
  const hit = perDistrict.get(id);
  if (hit) return hit;
  const out: RoadPath[] = [];
  for (const road of getRoadNetwork()) {
    const pts = road.points.map((p) => [p.x, p.z] as Vec2);
    clipRuns(pts, inside, road.loop).forEach((run, i) => {
      const loop = road.loop && run.length === pts.length;
      out.push({ id: `${road.id}@${id}-${i}`, name: road.name, kind: road.kind, ...makeGroundPath(run, { loop, spacing: 0.2 }) });
    });
  }
  perDistrict.set(id, out);
  return out;
}
