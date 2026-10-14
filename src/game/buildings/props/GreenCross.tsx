/** Pharmacy / clinic: a glowing, gently pulsing green cross. */
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, type KitPartProps } from '../kit';

export default function GreenCross({ spec, open }: KitPartProps) {
  const glow = useMemo(() => new THREE.MeshLambertMaterial({ color: '#22c55e', emissive: '#16a34a' }), []);
  useFrame(({ clock }) => {
    glow.emissiveIntensity = open ? 0.9 + Math.sin(clock.elapsedTime * 3) * 0.35 : 0.05;
  });
  return (
    <group position={[0, spec.top + 0.75, spec.d / 2 - 0.2]}>
      <Box size={[0.08, 0.6, 0.08]} position={[0, -0.45, 0]} color="#64748b" />
      <Box size={[0.75, 0.25, 0.12]} material={glow} />
      <Box size={[0.25, 0.75, 0.12]} material={glow} />
    </group>
  );
}
