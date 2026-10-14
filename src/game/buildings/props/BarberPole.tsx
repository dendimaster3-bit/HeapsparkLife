/** Hair & beauty salon: spinning barber pole by the door, scissors sign on the roof. */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Box, GEO, type KitPartProps } from '../kit';
import { stripeTexture } from '../parts/Stripes';

export default function BarberPole({ spec, mats, open }: KitPartProps) {
  const pole = useRef<THREE.Mesh>(null);
  const scissors = useRef<THREE.Group>(null);
  const poleMat = useMemo(
    () => new THREE.MeshLambertMaterial({ map: stripeTexture(['#dc2626', '#ffffff', '#2563eb', '#ffffff'], true) }),
    [],
  );
  useFrame(({ clock }, dt) => {
    if (open && pole.current) pole.current.rotation.y += dt * 2.5;
    if (scissors.current) scissors.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <>
      <group position={[spec.w / 2 - 0.25, 0, spec.d / 2 + 0.2]}>
        <mesh ref={pole} geometry={GEO.cyl} material={poleMat} position={[0, 0.65, 0]} scale={[0.18, 0.8, 0.18]} />
        <Ball d={0.2} position={[0, 1.1, 0]} material={mats.trim} />
        <Ball d={0.2} position={[0, 0.22, 0]} material={mats.trim} />
      </group>
      {/* Scissors sign */}
      <group ref={scissors} position={[0, spec.top + 0.75, 0]}>
        <Box size={[1.2, 0.09, 0.06]} rotation={[0, 0, 0.5]} material={mats.brand} />
        <Box size={[1.2, 0.09, 0.06]} rotation={[0, 0, -0.5]} material={mats.brand} />
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} geometry={GEO.torus} material={mats.brandDark} position={[x, -0.35, 0]} scale={0.5} />
        ))}
        <Box size={[0.06, 0.55, 0.06]} position={[0, -0.6, 0]} color="#64748b" />
      </group>
    </>
  );
}
