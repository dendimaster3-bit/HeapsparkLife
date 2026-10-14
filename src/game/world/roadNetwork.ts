/**
 * The road network, computed once: inland roads from `data/roads.ts` plus a
 * coastal ring road generated just inside the coastline.
 */
import { ROADS } from '@/data/roads';
import { COAST, offsetPolygon, project } from '@/lib/geo';
import type { RoadKind } from '@/types/geo';
import { makeGroundPath, type GroundPath } from './paths';

export interface RoadPath extends GroundPath {
  id: string;
  name: string;
  kind: RoadKind;
}

/** Road widths in km (exaggerated so they read from far away). */
export const ROAD_WIDTH: Record<RoadKind, number> = { motorway: 0.32, main: 0.2, coastal: 0.18 };

let cache: RoadPath[] | null = null;

export function getRoadNetwork(): RoadPath[] {
  if (cache) return cache;
  const coastal: RoadPath = {
    id: 'coastal',
    name: 'Coastal Road',
    kind: 'coastal',
    ...makeGroundPath(offsetPolygon(COAST, -0.55), { loop: true, spacing: 0.3 }),
  };
  const inland = ROADS.map<RoadPath>((r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    ...makeGroundPath(r.points.map(project), { loop: r.loop }),
  }));
  cache = [coastal, ...inland];
  return cache;
}
