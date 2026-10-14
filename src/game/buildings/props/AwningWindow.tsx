/** Retail: a striped awning over a big display window, goods inside, planters. */
import { useMemo } from 'react';
import * as THREE from 'three';
import { Ball, Box, GEO, type KitPartProps } from '../kit';
import { stripeTexture } from '../parts/Stripes';

export default function AwningWindow({ spec, brand, mats }: KitPartProps) {
  const awning = useMemo(
    () => new THREE.MeshLambertMaterial({ map: stripeTexture([brand, '#ffffff', brand, '#ffffff', brand, '#ffffff']), side: THREE.DoubleSide }),
    [brand],
  );
  const z = spec.d / 2;
  const w = spec.w * 0.9;
  return (
    <>
      {/* Display window spanning the front */}
      <Box size={[w, 0.7, 0.04]} position={[0, 0.6, z + 0.03]} material={mats.window} />
      {/* Goods behind the glass */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <Box key={x} size={[0.22, 0.3 + (i % 2) * 0.15, 0.1]} position={[x * (w / 1.6), 0.4, z - 0.02]} material={i % 2 ? mats.brand : mats.brandDark} />
      ))}
      {/* Sloped striped awning */}
      <mesh geometry={GEO.plane} material={awning} position={[0, 1.02, z + 0.3]} rotation={[-Math.PI / 2 + 0.55, 0, 0]} scale={[w + 0.1, 0.7, 1]} />
      {/* Planters by the door */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.05), 0, z + 0.35]}>
          <Box size={[0.25, 0.22, 0.25]} position={[0, 0.11, 0]} color="#78716c" />
          <Ball d={0.32} low position={[0, 0.35, 0]} color="#22a34a" />
        </group>
      ))}
    </>
  );
}
