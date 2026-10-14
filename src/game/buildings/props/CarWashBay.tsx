/** Car wash: open wash bay beside the shop, spinning brushes, rising foam. */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Box, Cyl, type KitPartProps } from '../kit';
import { Car } from '../parts/Car';
import { Puffs } from '../parts/Puffs';

export default function CarWashBay({ spec, mats, open }: KitPartProps) {
  const brushes = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!open || !brushes.current) return;
    for (const b of brushes.current.children) b.rotation.y += dt * 6;
  });
  const x = spec.w / 2 + 1.05;
  return (
    <group position={[x, 0, 0.1]}>
      <Box size={[1.9, 0.06, 2.2]} position={[0, 0.03, 0]} color="#94a3b8" />
      {/* Posts + roof */}
      {[-0.85, 0.85].flatMap((px) =>
        [-1, 1].map((pz) => <Box key={`${px}${pz}`} size={[0.1, 1.4, 0.1]} position={[px, 0.7, pz]} material={mats.trim} />),
      )}
      <Box size={[2, 0.15, 2.3]} position={[0, 1.45, 0]} material={mats.brand} />
      <Car color="#f43f5e" />
      {/* Brushes: blue bristle cylinders either side of the car */}
      <group ref={brushes}>
        {[-0.62, 0.62].map((bx) => (
          <Cyl key={bx} d={0.3} h={1.1} position={[bx, 0.6, 0.15]} color="#38bdf8" />
        ))}
      </group>
      {open && <Puffs position={[0, 0.5, 0.1]} count={12} color="#ffffff" size={0.28} rise={0.9} spread={1} life={2.2} drift={0} />}
    </group>
  );
}
