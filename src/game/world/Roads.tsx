/** Renders the road network as draped ribbons, merged per road kind. */
import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { RoadKind } from '@/types/geo';
import { ROAD_WIDTH, getRoadNetwork } from './roadNetwork';
import { ribbonGeometry } from './paths';

const ROAD_COLOR: Record<RoadKind, string> = {
  motorway: '#3f4652',
  main: '#5b6370',
  coastal: '#6b7280',
};

export function Roads() {
  const byKind = useMemo(() => {
    const roads = getRoadNetwork();
    return (Object.keys(ROAD_COLOR) as RoadKind[]).map((kind) => {
      const geos = roads.filter((r) => r.kind === kind).map((r) => ribbonGeometry(r, ROAD_WIDTH[kind], 0.05));
      const merged = geos.length ? mergeGeometries(geos) : new THREE.BufferGeometry();
      geos.forEach((g) => g.dispose());
      return { kind, geometry: merged };
    });
  }, []);

  // Dashed centre line on motorways.
  const centreLine = useMemo(() => {
    const geos = getRoadNetwork()
      .filter((r) => r.kind === 'motorway')
      .map((r) => ribbonGeometry(r, 0.03, 0.06));
    return mergeGeometries(geos);
  }, []);

  return (
    <group name="roads">
      {byKind.map(({ kind, geometry }) => (
        <mesh key={kind} geometry={geometry}>
          <meshLambertMaterial color={ROAD_COLOR[kind]} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      <mesh geometry={centreLine}>
        <meshBasicMaterial color="#facc15" polygonOffset polygonOffsetFactor={-4} />
      </mesh>
    </group>
  );
}
