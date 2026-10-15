/** Sailboats and fishing boats cruising the lagoon. */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COAST, offsetPolygon, rng } from '@/lib/geo';
import { makeGroundPath } from '../world/paths';

const COUNT = 22;

export function Boats() {
  const path = useMemo(
    () => makeGroundPath(offsetPolygon(COAST, 0.9), { loop: true, spacing: 0.3, lift: 0, heightFn: () => 0 }),
    [],
  );
  const boats = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: COUNT }, () => ({
      offset: r(),
      speed: (0.002 + r() * 0.003) * (r() < 0.5 ? 1 : -1),
      sail: r() < 0.6,
    }));
  }, []);

  const hulls = useRef<THREE.InstancedMesh>(null);
  const sails = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), look: new THREE.Matrix4(), up: new THREE.Vector3(0, 1, 0) }), []);

  const hullGeo = useMemo(() => new THREE.BoxGeometry(0.05, 0.025, 0.14).translate(0, 0.012, 0), []);
  const sailGeo = useMemo(() => new THREE.ConeGeometry(0.035, 0.14, 3).translate(0, 0.095, 0), []);

  useFrame(({ clock }) => {
    const n = path.points.length;
    const { m, p, q, s, look, up } = tmp;
    boats.forEach((b, i) => {
      const u = (((b.offset + clock.elapsedTime * b.speed) % 1) + 1) % 1 * n;
      const i0 = Math.floor(u) % n;
      const i1 = (i0 + (b.speed > 0 ? 1 : n - 1)) % n;
      p.lerpVectors(path.points[i0], path.points[(i0 + 1) % n], u - Math.floor(u));
      p.y = Math.sin(clock.elapsedTime * 2 + i) * 0.006; // gentle bobbing
      look.lookAt(path.points[i1], path.points[i0], up);
      q.setFromRotationMatrix(look);
      hulls.current!.setMatrixAt(i, m.compose(p, q, s.set(1, 1, 1)));
      sails.current!.setMatrixAt(i, m.compose(p, q, b.sail ? s.set(1, 1, 1) : s.set(0, 0, 0)));
    });
    hulls.current!.instanceMatrix.needsUpdate = true;
    sails.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="boats">
      <instancedMesh ref={hulls} args={[hullGeo, undefined, COUNT]} frustumCulled={false}>
        <meshLambertMaterial color="#f8fafc" />
      </instancedMesh>
      <instancedMesh ref={sails} args={[sailGeo, undefined, COUNT]} frustumCulled={false}>
        <meshLambertMaterial color="#fef3c7" flatShading />
      </instancedMesh>
    </group>
  );
}
