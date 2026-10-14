/** Trou aux Cerfs: a dormant volcanic crater rim with a small lake. */
import { LandmarkRoot, type LandmarkProps } from './common';

export default function TrouAuxCerfs({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} lift={-0.03}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.06}>
        <torusGeometry args={[0.32, 0.11, 5, 14]} />
        <meshLambertMaterial color="#2f8f4e" flatShading />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <circleGeometry args={[0.24, 14]} />
        <meshLambertMaterial color="#1f6b3a" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
        <circleGeometry args={[0.08, 10]} />
        <meshLambertMaterial color="#2a9fd0" />
      </mesh>
    </LandmarkRoot>
  );
}
