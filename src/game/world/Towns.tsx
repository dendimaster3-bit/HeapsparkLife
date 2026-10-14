/**
 * Filler houses around every town, generated from `data/towns.ts` with a
 * per-town seed (so layouts are stable). Everything is drawn with three
 * InstancedMeshes (walls, roofs, night windows) — a few draw calls total.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { hashString, heightAt, project, rng } from '@/lib/geo';
import type { Town, TownKind } from '@/types/geo';
import { nightFactor } from '@/store/useClockStore';
import { isBuildable } from './placement';

const HOUSES: Record<TownKind, { count: number; radius: number }> = {
  city: { count: 90, radius: 1.5 },
  town: { count: 45, radius: 0.95 },
  village: { count: 18, radius: 0.55 },
};

// Pastel Creole-house wall colours.
const WALLS = ['#fde2e4', '#fff1c1', '#d7f0ff', '#e3f8d8', '#ffffff', '#ffd6a5', '#e9d5ff'];
const ROOF_NEUTRAL = ['#b45309', '#9ca3af', '#7c2d12'];

interface House {
  x: number; y: number; z: number;
  w: number; d: number; h: number; rot: number;
  wall: string; roof: string;
}

function generateHouses(towns: Town[]): House[] {
  const out: House[] = [];
  for (const town of towns) {
    const { count, radius } = HOUSES[town.kind];
    const rand = rng(hashString(town.id));
    const [cx, cz] = project(town.at);
    const accent = DISTRICTS_BY_ID[town.districtId].color;
    let placed = 0;
    for (let tries = 0; placed < count && tries < count * 6; tries++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * radius;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (!isBuildable(x, z)) continue;
      // Bigger, taller buildings towards the centre of cities.
      const core = town.kind === 'city' ? 1 - r / radius : 0;
      out.push({
        x, z, y: heightAt(x, z),
        w: 0.07 + rand() * 0.06,
        d: 0.07 + rand() * 0.05,
        h: 0.05 + rand() * 0.04 + core * core * 0.25 * rand(),
        rot: rand() * Math.PI,
        wall: WALLS[Math.floor(rand() * WALLS.length)],
        roof: rand() < 0.45 ? accent : ROOF_NEUTRAL[Math.floor(rand() * ROOF_NEUTRAL.length)],
      });
      placed++;
    }
  }
  return out;
}

export function Towns({ towns }: { towns: Town[] }) {
  const houses = useMemo(() => generateHouses(towns), [towns]);
  // 4-sided cone turned 45° so the pyramid's edges line up with the walls.
  const roofGeo = useMemo(() => new THREE.ConeGeometry(0.71, 1, 4, 1).rotateY(Math.PI / 4), []);
  const walls = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  const windows = useRef<THREE.InstancedMesh>(null);
  const windowMat = useRef<THREE.MeshBasicMaterial>(null);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    const up = new THREE.Vector3(0, 1, 0);
    houses.forEach((hs, i) => {
      q.setFromAxisAngle(up, hs.rot);
      // Walls: unit box scaled; sunk a little so slopes don't show gaps.
      p.set(hs.x, hs.y + hs.h / 2 - 0.02, hs.z);
      s.set(hs.w, hs.h + 0.04, hs.d);
      walls.current!.setMatrixAt(i, m.compose(p, q, s));
      walls.current!.setColorAt(i, c.set(hs.wall));
      // Roof: 4-sided pyramid.
      p.set(hs.x, hs.y + hs.h + 0.02, hs.z);
      s.set(hs.w * 0.78, 0.045, hs.d * 0.78);
      roofs.current!.setMatrixAt(i, m.compose(p, q, s));
      roofs.current!.setColorAt(i, c.set(hs.roof));
      // Window strip, slightly proud of the front face.
      const off = new THREE.Vector3(0, 0, hs.d / 2 + 0.002).applyQuaternion(q);
      p.set(hs.x + off.x, hs.y + hs.h * 0.55, hs.z + off.z);
      s.set(hs.w * 0.6, Math.min(0.03, hs.h * 0.4), 0.004);
      windows.current!.setMatrixAt(i, m.compose(p, q, s));
    });
    for (const im of [walls.current!, roofs.current!, windows.current!]) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
    }
  }, [houses]);

  // Windows glow after dark.
  useFrame(() => {
    const night = nightFactor();
    if (windows.current) windows.current.visible = night > 0.05;
    if (windowMat.current) windowMat.current.opacity = night;
  });

  return (
    <group name="towns">
      <instancedMesh ref={walls} args={[undefined, undefined, houses.length]}>
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[roofGeo, undefined, houses.length]}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, houses.length]}>
        <boxGeometry />
        <meshBasicMaterial ref={windowMat} color="#ffd36b" transparent />
      </instancedMesh>
    </group>
  );
}
