/**
 * Map pin above a highlighted search result. It grows with camera distance
 * so results stay findable from the district or island view.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GEO, lambert } from '../kit';

const WHITE = lambert('#ffffff', '#ffffff', 0.5);

export function SearchPin({ y, color }: { y: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const mat = useMemo(() => lambert(color, color, 0.45), [color]);
  useFrame(({ camera, clock }) => {
    const g = ref.current;
    if (!g) return;
    const dist = camera.position.distanceTo(g.getWorldPosition(v));
    // Parent is scaled by KIT_SCALE (km per unit): 0.33 units per km of distance ≈ constant on-screen size.
    g.scale.setScalar(THREE.MathUtils.clamp(dist * 0.33, 1.5, 24));
    g.position.y = y + Math.sin(clock.elapsedTime * 3) * 0.3 + g.scale.y * 1.1;
  });
  return (
    <group ref={ref}>
      <mesh geometry={GEO.cone} material={mat} rotation-x={Math.PI} scale={[0.9, 1.4, 0.9]} />
      <mesh geometry={GEO.sphere} material={mat} position-y={0.95} scale={1.2} />
      <mesh geometry={GEO.sphere} material={WHITE} position={[0, 0.95, 0.35]} scale={0.55} />
    </group>
  );
}
