/**
 * Sea, lagoon, beaches and reef around the board. The lagoon is a lighter
 * turquoise ring out to the reef, with a sand ring hugging the coast.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BOARD_TOP, COAST, LAKES_W, REEF_DISTANCE, offsetPolygon } from '@/lib/geo';
import type { Vec2 } from '@/types/geo';
import { makeGroundPath, ribbonGeometry } from './paths';

const SEA_RADIUS = 400;

function flatShape(poly: Vec2[], y: number) {
  const geo = new THREE.ShapeGeometry(new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z))));
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  return geo;
}

export function Water() {
  const foam = useRef<THREE.MeshBasicMaterial>(null);
  const lagoon = useMemo(() => flatShape(offsetPolygon(COAST, REEF_DISTANCE), 0.01), []);
  const sand = useMemo(() => flatShape(offsetPolygon(COAST, 0.35), 0.05), []);
  const reef = useMemo(() => {
    const flat = () => 0;
    const path = makeGroundPath(offsetPolygon(COAST, REEF_DISTANCE), { loop: true, spacing: 0.4, lift: 0.03, heightFn: flat });
    return ribbonGeometry(path, 0.2, 0.03, flat);
  }, []);

  useFrame(({ clock }) => {
    if (foam.current) foam.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 1.4) * 0.2;
  });

  return (
    <group name="water">
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <circleGeometry args={[SEA_RADIUS, 64]} />
        <meshLambertMaterial color="#3aa6d8" />
      </mesh>
      <mesh geometry={lagoon}>
        <meshLambertMaterial color="#79dbe0" />
      </mesh>
      <mesh geometry={sand}>
        <meshLambertMaterial color="#f6e3b0" />
      </mesh>
      <mesh geometry={reef} renderOrder={2}>
        <meshBasicMaterial ref={foam} color="#ffffff" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      {LAKES_W.map((l) => (
        <mesh key={l.name} rotation-x={-Math.PI / 2} position={[l.pos[0], BOARD_TOP + 0.02, l.pos[1]]}>
          <circleGeometry args={[l.radius, 24]} />
          <meshLambertMaterial color="#6cc7ee" />
        </mesh>
      ))}
    </group>
  );
}
