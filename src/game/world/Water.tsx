/**
 * Sea, lagoon and reef. The lagoon is not a separate mesh: the island's
 * shallow sandy seabed shows through a semi-transparent sea surface, which
 * gives the turquoise-lagoon look for free. A foam ribbon marks the reef.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COAST, LAKES_W, REEF_DISTANCE, heightAt, offsetPolygon } from '@/lib/geo';
import { makeGroundPath, ribbonGeometry } from './paths';

const SEA_RADIUS = 400;

export function Water() {
  const foam = useRef<THREE.MeshBasicMaterial>(null);

  const reef = useMemo(() => {
    const flat = () => 0;
    const path = makeGroundPath(offsetPolygon(COAST, REEF_DISTANCE), {
      loop: true,
      spacing: 0.4,
      lift: 0.02,
      heightFn: flat,
    });
    return ribbonGeometry(path, 0.22, 0.02, flat);
  }, []);

  useFrame(({ clock }) => {
    if (foam.current) foam.current.opacity = 0.55 + Math.sin(clock.elapsedTime * 1.4) * 0.2;
  });

  return (
    <group name="water">
      {/* Deep ocean floor, far below the surface. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-3.05}>
        <circleGeometry args={[SEA_RADIUS, 48]} />
        <meshBasicMaterial color="#0a3f6e" />
      </mesh>
      {/* Sea surface. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0} renderOrder={1}>
        <circleGeometry args={[SEA_RADIUS, 64]} />
        <meshLambertMaterial color="#1593c4" transparent opacity={0.62} depthWrite={false} />
      </mesh>
      {/* Reef foam line. */}
      <mesh geometry={reef} renderOrder={2}>
        <meshBasicMaterial ref={foam} color="#ffffff" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* Inland lakes. */}
      {LAKES_W.map((l) => (
        <mesh
          key={l.name}
          rotation-x={-Math.PI / 2}
          position={[l.pos[0], heightAt(l.pos[0], l.pos[1]) + 0.12, l.pos[1]]}
        >
          <circleGeometry args={[l.radius, 20]} />
          <meshLambertMaterial color="#2aa7d6" />
        </mesh>
      ))}
    </group>
  );
}
