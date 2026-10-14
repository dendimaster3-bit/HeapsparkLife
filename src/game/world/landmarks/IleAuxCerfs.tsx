/** Île aux Cerfs: a small sandy island in the eastern lagoon. */
import { LandmarkRoot, type LandmarkProps } from './common';

const PALMS: [number, number][] = [[-0.2, 0], [0.1, 0.15], [0.25, -0.1], [-0.05, -0.2], [0.35, 0.12]];

export default function IleAuxCerfs({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} y={0}>
      <mesh scale={[1, 0.12, 0.6]}>
        <sphereGeometry args={[0.7, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#f1dfa6" flatShading />
      </mesh>
      <mesh scale={[1, 0.18, 0.6]} position-y={0.01}>
        <sphereGeometry args={[0.45, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color="#5cb85c" flatShading />
      </mesh>
      {PALMS.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.06, z]}>
          <mesh position-y={0.08}>
            <cylinderGeometry args={[0.008, 0.012, 0.16, 4]} />
            <meshLambertMaterial color="#8b6b43" />
          </mesh>
          <mesh position-y={0.16}>
            <coneGeometry args={[0.09, 0.04, 5]} />
            <meshLambertMaterial color="#2e9e4f" flatShading />
          </mesh>
        </group>
      ))}
    </LandmarkRoot>
  );
}
