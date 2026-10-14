/** Grand Bassin: a crater lake with a small white temple and a tall golden statue (generic). */
import { LandmarkRoot, type LandmarkProps } from './common';

export default function GrandBassin({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
        <circleGeometry args={[0.35, 16]} />
        <meshLambertMaterial color="#2a9fd0" />
      </mesh>
      {/* Temple */}
      <group position={[0.45, 0, 0]}>
        <mesh position-y={0.05}>
          <boxGeometry args={[0.12, 0.1, 0.12]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
        <mesh position-y={0.14}>
          <coneGeometry args={[0.06, 0.1, 6]} />
          <meshLambertMaterial color="#fb923c" flatShading />
        </mesh>
      </group>
      {/* Statue */}
      <group position={[-0.45, 0, 0.1]}>
        <mesh position-y={0.04}>
          <cylinderGeometry args={[0.07, 0.08, 0.08, 8]} />
          <meshLambertMaterial color="#e7e5e4" />
        </mesh>
        <mesh position-y={0.28}>
          <cylinderGeometry args={[0.035, 0.05, 0.4, 6]} />
          <meshLambertMaterial color="#eab308" flatShading emissive="#6b4f00" />
        </mesh>
        <mesh position-y={0.52}>
          <icosahedronGeometry args={[0.04, 0]} />
          <meshLambertMaterial color="#eab308" flatShading emissive="#6b4f00" />
        </mesh>
      </group>
    </LandmarkRoot>
  );
}
