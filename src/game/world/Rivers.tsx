/** Rivers crossing the open district, flowing on to the sea. */
import { useEffect, useMemo } from 'react';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { RIVERS } from '@/data/terrain';
import { project } from '@/lib/geo';
import type { DistrictId } from '@/types/geo';
import { clipRuns } from './roadNetwork';
import { makeGroundPath, ribbonGeometry } from './paths';
import { insideOf } from './districtScene';

export function DistrictRivers({ id }: { id: DistrictId }) {
  const { water, banks } = useMemo(() => {
    // Let rivers run a little past the district edge so they reach the sea.
    const runs = RIVERS.flatMap((r) => clipRuns(r.points.map(project), insideOf(id, -0.6)));
    const paths = runs.map((run) => makeGroundPath(run, { spacing: 0.15, lift: 0.01 }));
    const merge = (geos: THREE.BufferGeometry[]) => (geos.length ? mergeGeometries(geos) : new THREE.BufferGeometry());
    return {
      water: merge(paths.map((p) => ribbonGeometry(p, 0.32, 0.014))),
      banks: merge(paths.map((p) => ribbonGeometry(p, 0.44, 0.01))),
    };
  }, [id]);
  useEffect(() => () => {
    water.dispose();
    banks.dispose();
  }, [water, banks]);
  return (
    <group name="rivers">
      <mesh geometry={banks}>
        <meshLambertMaterial color="#bfe7c0" polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh geometry={water}>
        <meshLambertMaterial color="#5bbfea" polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}
