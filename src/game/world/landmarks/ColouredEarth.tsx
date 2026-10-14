/** Chamarel Seven Coloured Earth: rolling striped dunes. */
import { LandmarkRoot, type LandmarkProps } from './common';

const BANDS = ['#7c2d12', '#b45309', '#c2410c', '#9d174d', '#6d28d9', '#a16207', '#78350f'];
const DUNES: [number, number, number][] = [
  [0, 0, 0.32],
  [0.32, 0.1, 0.22],
  [-0.28, 0.14, 0.24],
  [0.1, -0.26, 0.2],
];

export default function ColouredEarth({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} lift={-0.04}>
      {DUNES.map(([x, z, r], d) =>
        // Each dune is a stack of flattened rings, one per colour band.
        BANDS.map((c, i) => (
          <mesh key={`${d}-${i}`} position={[x, i * 0.018, z]}>
            <cylinderGeometry args={[r * (1 - (i + 1) / 8), r * (1 - i / 8), 0.02, 9]} />
            <meshLambertMaterial color={BANDS[(i + d) % BANDS.length] ?? c} flatShading />
          </mesh>
        )),
      )}
    </LandmarkRoot>
  );
}
