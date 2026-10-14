/**
 * Buses driving the road network. One InstancedMesh for bodies (per-bus
 * colour) and one for windows; positions are updated each frame by walking
 * along the precomputed road paths.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { rng } from '@/lib/geo';
import { getRoadNetwork } from '../world/roadNetwork';

const BUS_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ffffff', '#a855f7'];
const BUSES_PER_ROAD: Record<string, number> = { motorway: 4, main: 2, coastal: 8 };
/** km per second (sped up ~100× so motion is visible from far away). */
const SPEED = 0.35;

interface Bus { road: number; offset: number; dir: 1 | -1; speed: number; color: string }

export function Traffic() {
  const roads = useMemo(getRoadNetwork, []);
  const buses = useMemo<Bus[]>(() => {
    const r = rng(99);
    return roads.flatMap((road, ri) =>
      Array.from({ length: BUSES_PER_ROAD[road.kind] }, () => ({
        road: ri,
        offset: r() * road.length,
        dir: (r() < 0.5 ? 1 : -1) as 1 | -1,
        speed: SPEED * (0.8 + r() * 0.4),
        color: BUS_COLORS[Math.floor(r() * BUS_COLORS.length)],
      })),
    );
  }, [roads]);

  const bodies = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    buses.forEach((b, i) => bodies.current!.setColorAt(i, c.set(b.color)));
    bodies.current!.instanceColor!.needsUpdate = true;
  }, [buses]);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), look: new THREE.Matrix4(), up: new THREE.Vector3(0, 1, 0) }), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { m, p, q, s, look, up } = tmp;
    buses.forEach((b, i) => {
      const road = roads[b.road];
      const pts = road.points;
      const n = pts.length;
      // Distance travelled → position along the path (loop or ping-pong).
      let d = b.offset + t * b.speed;
      let u: number;
      if (road.loop) {
        u = ((d % road.length) / road.length) * n;
        if (b.dir < 0) u = n - u;
      } else {
        d = d % (2 * road.length);
        const forward = d < road.length;
        u = ((forward ? d : 2 * road.length - d) / road.length) * (n - 1);
        if (b.dir < 0) u = n - 1 - u;
      }
      const i0 = Math.floor(u) % n;
      const i1 = road.loop ? (i0 + 1) % n : Math.min(n - 1, i0 + 1);
      const f = u - Math.floor(u);
      p.lerpVectors(pts[i0], pts[i1], f);
      p.y += 0.04;
      // Face the direction of travel.
      const ahead = pts[i1].equals(pts[i0]) ? pts[Math.max(0, i0 - 1)] : pts[i1];
      look.lookAt(ahead, pts[i0], up);
      q.setFromRotationMatrix(look);
      m.compose(p, q, s);
      bodies.current!.setMatrixAt(i, m);
      roofs.current!.setMatrixAt(i, m);
    });
    bodies.current!.instanceMatrix.needsUpdate = true;
    roofs.current!.instanceMatrix.needsUpdate = true;
  });

  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.05, 0.16).translate(0, 0.025, 0), []);
  const windowGeo = useMemo(() => new THREE.BoxGeometry(0.062, 0.016, 0.13).translate(0, 0.035, 0), []);

  return (
    <group name="traffic">
      <instancedMesh ref={bodies} args={[bodyGeo, undefined, buses.length]} frustumCulled={false}>
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[windowGeo, undefined, buses.length]} frustumCulled={false}>
        <meshLambertMaterial color="#1e293b" />
      </instancedMesh>
    </group>
  );
}
