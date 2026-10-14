/**
 * Active-promo marker: a tall soft light beam with sparkles spiralling up.
 * Big enough to spot from the district view.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GEO } from '../kit';

const BEAM = new THREE.MeshBasicMaterial({
  color: '#fde047',
  transparent: true,
  opacity: 0.28,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const SPARK = new THREE.MeshBasicMaterial({ color: '#fff7ae', toneMapped: false });
const BEAM_GEO = new THREE.CylinderGeometry(0.35, 0.6, 1, 12, 1, true).translate(0, 0.5, 0);

export function PromoBeam({ from, height = 14 }: { from: number; height?: number }) {
  const sparks = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: 6 }, (_, i) => i / 6), []);
  useFrame(({ clock }) => {
    const g = sparks.current;
    if (!g) return;
    g.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.25 + seeds[i]) % 1;
      const a = t * Math.PI * 4 + i;
      c.position.set(Math.cos(a) * 0.55, from + t * height * 0.6, Math.sin(a) * 0.55);
      c.rotation.y = a;
      c.scale.setScalar(0.25 * Math.sin(Math.PI * t) + 0.05);
    });
    BEAM.opacity = 0.22 + Math.sin(clock.elapsedTime * 2) * 0.06;
  });
  return (
    <group>
      <mesh geometry={BEAM_GEO} material={BEAM} position-y={from} scale={[1, height, 1]} renderOrder={3} />
      <group ref={sparks}>
        {seeds.map((s) => (
          <mesh key={s} geometry={GEO.ico} material={SPARK} />
        ))}
      </group>
    </group>
  );
}
