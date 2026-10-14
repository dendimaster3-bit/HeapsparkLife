/** Le Morne Brabant: a steep, flat-topped basalt monolith. */
import { LandmarkRoot, type LandmarkProps } from './common';

export default function LeMorne({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} lift={-0.1}>
      <mesh position-y={1.05} rotation-y={0.4} scale={[1, 1, 0.75]}>
        <cylinderGeometry args={[0.55, 1.5, 2.2, 7, 2]} />
        <meshLambertMaterial color="#4f7a44" flatShading />
      </mesh>
      {/* Bare cliff face. */}
      <mesh position={[0.2, 1.25, -0.35]} rotation-y={0.4} scale={[1, 1, 0.5]}>
        <cylinderGeometry args={[0.5, 1.05, 1.8, 6, 1]} />
        <meshLambertMaterial color="#7d7a68" flatShading />
      </mesh>
    </LandmarkRoot>
  );
}
