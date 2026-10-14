/** Spinning gold star badge above Founding Member buildings. */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { GEO, GOLD } from '../kit';

export function FoundingStar({ y }: { y: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 1.5;
    ref.current.position.y = y + Math.sin(clock.elapsedTime * 2) * 0.08;
  });
  return <mesh ref={ref} geometry={GEO.ico} material={GOLD} scale={[0.45, 0.6, 0.45]} position-y={y} />;
}
