/** Construction: a small tower crane slowly slewing, plus a pile of materials. */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { Box, Cyl, type KitPartProps } from '../kit';

const YELLOW = '#facc15';

export default function MiniCrane({ spec, mats, open }: KitPartProps) {
  const jib = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (jib.current && open) jib.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 1.2;
  });
  return (
    <group position={[spec.w / 2 + 0.7, 0, -spec.d / 2 + 0.2]}>
      <Box size={[0.6, 0.15, 0.6]} position={[0, 0.07, 0]} color="#64748b" />
      <Box size={[0.22, 3.6, 0.22]} position={[0, 1.8, 0]} color={YELLOW} />
      <group ref={jib} position={[0, 3.6, 0]}>
        <Box size={[0.4, 0.3, 0.4]} position={[0, 0.1, 0]} material={mats.brand} />
        <Box size={[3, 0.14, 0.16]} position={[0.9, 0.3, 0]} color={YELLOW} />
        <Box size={[0.4, 0.3, 0.3]} position={[-0.75, 0.2, 0]} color="#475569" />
        <Cyl d={0.02} h={1.5} position={[2, -0.45, 0]} color="#334155" />
        <Box size={[0.18, 0.14, 0.18]} position={[2, -1.25, 0]} color="#dc2626" />
      </group>
      {/* Materials: bricks + pipes */}
      <Box size={[0.7, 0.35, 0.5]} position={[-0.2, 0.18, 1.1]} color="#c2410c" />
      {[0, 0.15, 0.3].map((y, i) => (
        <Cyl key={i} d={0.13} h={1} position={[0.55, 0.08 + y * 0.6, 1.1]} rotation={[Math.PI / 2, 0, 0]} color="#94a3b8" />
      ))}
    </group>
  );
}
