/**
 * A small plane looping around the island and over the airport. In step (f)
 * it will tow the "plane banner" ad slot.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RX = 34, RZ = 40, ALT = 4.5, PERIOD = 90; // seconds per lap

export function Plane() {
  const ref = useRef<THREE.Group>(null);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const at = (a: number, v: THREE.Vector3) => v.set(Math.cos(a) * RX, ALT + Math.sin(a * 3) * 0.4, Math.sin(a) * RZ);
  useFrame(({ clock }) => {
    const a = (clock.elapsedTime / PERIOD) * Math.PI * 2;
    const g = ref.current!;
    at(a, g.position);
    // Nose (+z) points along the path; slight bank into the turn.
    g.lookAt(at(a + 0.02, ahead));
    g.rotateZ(-0.25);
  });
  return (
    <group ref={ref} name="plane">
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.08, 0.6, 2, 6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh>
        <boxGeometry args={[0.9, 0.02, 0.16]} />
        <meshLambertMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.12, -0.32]}>
        <boxGeometry args={[0.02, 0.2, 0.12]} />
        <meshLambertMaterial color="#0ea5b7" />
      </mesh>
    </group>
  );
}
