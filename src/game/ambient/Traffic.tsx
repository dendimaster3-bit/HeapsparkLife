/**
 * Little cars and buses driving the open district's roads. Two instanced
 * meshes (bodies with per-car colours + cabins); positions are walked along
 * the road paths every frame.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { rng } from '@/lib/geo';
import type { DistrictId } from '@/types/geo';
import { districtRoads } from '../world/roadNetwork';
import { insideOf } from '../world/districtScene';

const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#ffffff', '#a855f7', '#ec4899', '#06b6d4'];
const MAX = 46;
/** km per second (sped up so it reads as lively). */
const SPEED = 0.28;

interface Car { road: number; offset: number; dir: 1 | -1; speed: number; color: string; lane: number }

export function Traffic({ id }: { id: DistrictId }) {
  const roads = useMemo(() => districtRoads(id, insideOf(id, -0.05)), [id]);
  const cars = useMemo<Car[]>(() => {
    const r = rng(17);
    const out: Car[] = [];
    roads.forEach((road, ri) => {
      const n = road.kind === 'street' ? (road.length > 1.2 ? 1 : 0) : Math.max(1, Math.round(road.length / 2.5));
      for (let i = 0; i < n && out.length < MAX; i++) {
        const dir = (r() < 0.5 ? 1 : -1) as 1 | -1;
        out.push({ road: ri, offset: r() * road.length, dir, speed: SPEED * (0.75 + r() * 0.5), color: COLORS[Math.floor(r() * COLORS.length)], lane: dir * 0.05 });
      }
    });
    return out;
  }, [roads]);

  const bodies = useRef<THREE.InstancedMesh>(null);
  const cabins = useRef<THREE.InstancedMesh>(null);
  const bodyGeo = useMemo(() => new THREE.BoxGeometry(0.08, 0.04, 0.15).translate(0, 0.03, 0), []);
  const cabinGeo = useMemo(() => new THREE.BoxGeometry(0.07, 0.035, 0.08).translate(0, 0.065, -0.01), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), look: new THREE.Matrix4(), up: new THREE.Vector3(0, 1, 0), side: new THREE.Vector3() }), []);

  useLayoutEffect(() => {
    if (!bodies.current) return;
    const c = new THREE.Color();
    cars.forEach((car, i) => bodies.current!.setColorAt(i, c.set(car.color)));
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true;
  }, [cars]);

  useFrame(({ clock }) => {
    if (!bodies.current || !cabins.current) return;
    const t = clock.elapsedTime;
    const { m, p, q, s, look, up, side } = tmp;
    cars.forEach((car, i) => {
      const road = roads[car.road];
      const pts = road.points;
      const n = pts.length;
      let d = car.offset + t * car.speed;
      let u: number;
      let forward = true;
      if (road.loop) {
        u = ((d % road.length) / road.length) * n;
      } else {
        // Drive to the end, turn around, come back.
        d %= 2 * road.length;
        forward = d < road.length;
        u = ((forward ? d : 2 * road.length - d) / road.length) * (n - 1);
      }
      if (car.dir < 0) u = (road.loop ? n : n - 1) - u;
      const i0 = Math.min(n - 1, Math.max(0, Math.floor(u))) % n;
      const i1 = road.loop ? (i0 + 1) % n : Math.min(n - 1, i0 + 1);
      p.lerpVectors(pts[i0], pts[i1], u - Math.floor(u));
      const goingUp = (car.dir > 0) === forward;
      const a = goingUp ? pts[i0] : pts[i1], b = goingUp ? pts[i1] : pts[i0];
      look.lookAt(b, a, up);
      q.setFromRotationMatrix(look);
      // Keep to the left (Mauritius drives on the left).
      side.set(1, 0, 0).applyQuaternion(q).multiplyScalar(0.05);
      p.add(side);
      p.y += 0.012;
      m.compose(p, q, s);
      bodies.current!.setMatrixAt(i, m);
      cabins.current!.setMatrixAt(i, m);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    cabins.current.instanceMatrix.needsUpdate = true;
  });

  if (!cars.length) return null;
  return (
    <group name="traffic">
      <instancedMesh ref={bodies} args={[bodyGeo, undefined, cars.length]} frustumCulled={false}>
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={cabins} args={[cabinGeo, undefined, cars.length]} frustumCulled={false}>
        <meshLambertMaterial color="#cfe8ff" />
      </instancedMesh>
    </group>
  );
}
