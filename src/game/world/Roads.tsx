/**
 * Roads of the open district: lavender toy-city roads with white dashed
 * centre lines on the bigger ones, merged into a handful of meshes.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { DistrictId, RoadKind } from '@/types/geo';
import { ROAD_WIDTH, districtRoads } from './roadNetwork';
import { ribbonGeometry } from './paths';
import { insideOf } from './districtScene';

const ROAD_COLOR: Record<RoadKind, string> = {
  motorway: '#9d8cf0',
  main: '#ab9cf3',
  coastal: '#b3a6f4',
  street: '#c4baf7',
};

/** Repeating dash texture for centre lines (white dash, clear gap). */
const DASH = (() => {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 4, 18);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 4); // 4 dashes per km
  return t;
})();

const merge = (geos: THREE.BufferGeometry[]) => {
  const m = geos.length ? mergeGeometries(geos) : new THREE.BufferGeometry();
  geos.forEach((g) => g.dispose());
  return m;
};

export function DistrictRoads({ id }: { id: DistrictId }) {
  const { surfaces, edges, lines } = useMemo(() => {
    const roads = districtRoads(id, insideOf(id, -0.05));
    const surfaces = (Object.keys(ROAD_COLOR) as RoadKind[]).map((kind) => ({
      kind,
      geometry: merge(roads.filter((r) => r.kind === kind).map((r) => ribbonGeometry(r, ROAD_WIDTH[kind], 0.012))),
    }));
    // Slightly wider, darker strip under each road = soft kerb outline.
    const edges = merge(roads.map((r) => ribbonGeometry(r, ROAD_WIDTH[r.kind] + 0.05, 0.008)));
    const lines = merge(roads.filter((r) => r.kind !== 'street').map((r) => ribbonGeometry(r, 0.025, 0.016)));
    return { surfaces, edges, lines };
  }, [id]);

  useEffect(() => () => {
    surfaces.forEach((s) => s.geometry.dispose());
    edges.dispose();
    lines.dispose();
  }, [surfaces, edges, lines]);

  return (
    <group name="roads">
      <mesh geometry={edges}>
        <meshLambertMaterial color="#8a7bd8" polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      {surfaces.map(({ kind, geometry }) => (
        <mesh key={kind} geometry={geometry}>
          <meshLambertMaterial color={ROAD_COLOR[kind]} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      <mesh geometry={lines}>
        <meshBasicMaterial map={DASH} transparent alphaTest={0.5} polygonOffset polygonOffsetFactor={-3} />
      </mesh>
    </group>
  );
}
