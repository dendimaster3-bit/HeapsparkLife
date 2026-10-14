/** Mechanic: a car on a hydraulic lift and stacks of tyres. */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Box, GEO, lambert, type KitPartProps } from '../kit';
import { Car } from '../parts/Car';

const TYRE = lambert('#1f2937');

function TyreStack({ n, position }: { n: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} geometry={GEO.torus} material={TYRE} position-y={0.1 + i * 0.17} rotation-x={Math.PI / 2} scale={[0.6, 0.6, 0.9]} />
      ))}
    </group>
  );
}

export default function CarLift({ spec, mats, open }: KitPartProps) {
  const lift = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (lift.current) lift.current.position.y = open ? 0.55 + Math.sin(clock.elapsedTime * 0.6) * 0.25 : 0.1;
  });
  return (
    <group position={[spec.w / 2 + 1, 0, 0.2]}>
      <Box size={[1.6, 0.05, 2]} position={[0, 0.03, 0]} color="#94a3b8" />
      {[-0.55, 0.55].map((x) => (
        <Box key={x} size={[0.12, 1.5, 0.12]} position={[x, 0.75, 0]} material={mats.brand} />
      ))}
      <group ref={lift}>
        <Box size={[1.2, 0.06, 1.6]} position={[0, 0, 0]} color="#475569" />
        <Car color="#2563eb" position={[0, 0.03, 0]} />
      </group>
      <TyreStack n={4} position={[0.4, 0, 1.25]} />
      <TyreStack n={3} position={[-0.1, 0, 1.3]} />
    </group>
  );
}
