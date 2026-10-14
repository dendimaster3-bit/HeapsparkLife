/** The airport: runway, terminal, control tower and a parked plane. */
import { LandmarkRoot, type LandmarkProps } from './common';

export default function Airport({ landmark }: LandmarkProps) {
  return (
    <LandmarkRoot landmark={landmark} lift={0.02}>
      {/* Runway with centre markings */}
      <mesh position-y={0.01}>
        <boxGeometry args={[3, 0.04, 0.16]} />
        <meshLambertMaterial color="#374151" />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-1.35 + i * 0.3, 0.035, 0]}>
          <boxGeometry args={[0.12, 0.01, 0.015]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Apron + terminal */}
      <mesh position={[0.2, 0.01, 0.35]}>
        <boxGeometry args={[0.9, 0.03, 0.35]} />
        <meshLambertMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0.2, 0.08, 0.6]}>
        <boxGeometry args={[0.8, 0.14, 0.18]} />
        <meshLambertMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[0.2, 0.16, 0.6]}>
        <boxGeometry args={[0.84, 0.02, 0.22]} />
        <meshLambertMaterial color="#0ea5b7" />
      </mesh>
      {/* Control tower */}
      <mesh position={[0.75, 0.2, 0.55]}>
        <cylinderGeometry args={[0.025, 0.035, 0.4, 6]} />
        <meshLambertMaterial color="#f5f5f4" />
      </mesh>
      <mesh position={[0.75, 0.42, 0.55]}>
        <cylinderGeometry args={[0.06, 0.04, 0.06, 6]} />
        <meshLambertMaterial color="#38bdf8" emissive="#0c4a6e" />
      </mesh>
      {/* Parked plane */}
      <group position={[0, 0.05, 0.36]} rotation-y={Math.PI / 2}>
        <mesh rotation-z={Math.PI / 2}>
          <capsuleGeometry args={[0.018, 0.16, 2, 6]} />
          <meshLambertMaterial color="#ffffff" />
        </mesh>
        <mesh>
          <boxGeometry args={[0.04, 0.006, 0.2]} />
          <meshLambertMaterial color="#e5e7eb" />
        </mesh>
      </group>
    </LandmarkRoot>
  );
}
