/** Street food: a cart with a striped umbrella, stools and steam. */
import { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Cyl, GEO, type KitPartProps } from '../kit';
import { Puffs } from '../parts/Puffs';
import { stripeTexture } from '../parts/Stripes';

export default function FoodCart({ spec, brand, mats, open }: KitPartProps) {
  const umbrella = useMemo(
    () => new THREE.MeshLambertMaterial({ map: stripeTexture([brand, '#ffffff', brand, '#ffffff', brand, '#ffffff', brand, '#ffffff']) }),
    [brand],
  );
  return (
    <group position={[spec.w / 2 + 0.7, 0, spec.d / 2 + 0.2]} rotation-y={-0.3}>
      <Box size={[1, 0.55, 0.55]} position={[0, 0.55, 0]} material={mats.brand} />
      <Box size={[1.05, 0.06, 0.6]} position={[0, 0.85, 0]} material={mats.trim} />
      {/* Glass food case */}
      <Box size={[0.6, 0.25, 0.4]} position={[0.1, 1, 0]} material={mats.window} />
      {[-0.35, 0.35].map((x) => (
        <Cyl key={x} d={0.42} h={0.08} position={[x, 0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]} color="#1f2937" />
      ))}
      <Cyl d={0.04} h={1.4} position={[-0.4, 1.1, 0]} color="#64748b" />
      <mesh geometry={GEO.cone} material={umbrella} position={[-0.4, 1.85, 0]} scale={[1.3, 0.35, 1.3]} />
      {/* Stools */}
      {[-0.3, 0.3].map((x) => (
        <Cyl key={x} d={0.22} h={0.4} position={[x, 0.2, 0.65]} color="#fbbf24" />
      ))}
      {open && <Puffs position={[0.1, 1.15, 0]} count={6} size={0.22} rise={0.9} life={2} />}
    </group>
  );
}
