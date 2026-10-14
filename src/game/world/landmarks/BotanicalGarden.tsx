/** Pamplemousses garden: lily pond with giant pads, framed by palms. */
import { useMemo } from 'react';
import { rng } from '@/lib/geo';
import { LandmarkRoot, type LandmarkProps } from './common';

export default function BotanicalGarden({ landmark }: LandmarkProps) {
  const pads = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 14 }, () => [(r() - 0.5) * 0.36, (r() - 0.5) * 0.2, 0.025 + r() * 0.02] as const);
  }, []);
  return (
    <LandmarkRoot landmark={landmark}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshLambertMaterial color="#2b9fc9" />
      </mesh>
      {pads.map(([x, z, r], i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[x, 0.03, z]}>
          <circleGeometry args={[r, 8]} />
          <meshLambertMaterial color="#3fa34d" />
        </mesh>
      ))}
      {[-0.3, 0.3].flatMap((x) =>
        [-0.2, 0.2].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh position-y={0.1}>
              <cylinderGeometry args={[0.01, 0.014, 0.2, 4]} />
              <meshLambertMaterial color="#8b6b43" />
            </mesh>
            <mesh position-y={0.2}>
              <coneGeometry args={[0.1, 0.05, 6]} />
              <meshLambertMaterial color="#2e9e4f" flatShading />
            </mesh>
          </group>
        )),
      )}
    </LandmarkRoot>
  );
}
