/** Port Louis waterfront: a quay, colourful low-rise blocks, port cranes. */
import { LandmarkRoot, type LandmarkProps } from './common';

const BLOCKS: [number, number, number, string][] = [
  [-0.3, 0.12, 0.05, '#fca5a5'],
  [-0.1, 0.18, 0.05, '#fde68a'],
  [0.1, 0.14, 0.05, '#a5f3fc'],
  [0.3, 0.22, 0.05, '#ffffff'],
];

export default function Waterfront({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} y={0}>
      {/* Quay */}
      <mesh position={[0, 0.03, 0.12]}>
        <boxGeometry args={[1, 0.08, 0.3]} />
        <meshLambertMaterial color="#d6d3d1" />
      </mesh>
      {BLOCKS.map(([x, h, z, c]) => (
        <mesh key={x} position={[x, 0.07 + h / 2, z]}>
          <boxGeometry args={[0.16, h, 0.14]} />
          <meshLambertMaterial color={c} />
        </mesh>
      ))}
      {/* Port cranes */}
      {[-0.55, -0.75].map((x) => (
        <group key={x} position={[x, 0, 0.25]}>
          <mesh position-y={0.2}>
            <boxGeometry args={[0.03, 0.4, 0.03]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
          <mesh position={[0, 0.4, 0.1]}>
            <boxGeometry args={[0.03, 0.03, 0.32]} />
            <meshLambertMaterial color="#f97316" />
          </mesh>
        </group>
      ))}
    </LandmarkRoot>
  );
}
