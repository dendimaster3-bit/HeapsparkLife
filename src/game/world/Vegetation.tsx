/**
 * Scattered trees and beach palms, all instanced (2 meshes each).
 * Forest is denser on high ground; palms line the beaches.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ISLAND_BOUNDS, heightAt, project, rng, signedDistance, valueNoise } from '@/lib/geo';
import { TOWNS } from '@/data/towns';
import { isBuildable } from './placement';

interface Tree { x: number; y: number; z: number; s: number; palm: boolean; tint: number }

const TOWN_POS = TOWNS.map((t) => ({ pos: project(t.at), r: t.kind === 'city' ? 1.6 : t.kind === 'town' ? 1 : 0.6 }));

function generateTrees(): Tree[] {
  const rand = rng(7);
  const { minX, maxX, minZ, maxZ } = ISLAND_BOUNDS;
  const out: Tree[] = [];
  for (let i = 0; i < 26000 && out.length < 2600; i++) {
    const x = minX + rand() * (maxX - minX);
    const z = minZ + rand() * (maxZ - minZ);
    const d = signedDistance(x, z);
    if (d < 0.15) continue;
    const beach = d < 0.6;
    const h = heightAt(x, z);
    // Density: forests on hills, clumps elsewhere, palms along the coast.
    const density = beach ? 0.35 : h > 1.1 ? 0.9 : valueNoise(x * 0.6, z * 0.6) > 0.62 ? 0.5 : 0.04;
    if (rand() > density) continue;
    if (TOWN_POS.some((t) => Math.hypot(x - t.pos[0], z - t.pos[1]) < t.r)) continue;
    if (!isBuildable(x, z, beach ? -0.25 : 0.02)) continue;
    out.push({ x, y: h, z, s: 0.7 + rand() * 0.6, palm: beach, tint: rand() });
  }
  return out;
}

export function Vegetation() {
  const trees = useMemo(generateTrees, []);
  const broad = useMemo(() => trees.filter((t) => !t.palm), [trees]);
  const palms = useMemo(() => trees.filter((t) => t.palm), [trees]);

  const crowns = useRef<THREE.InstancedMesh>(null);
  const palmTrunks = useRef<THREE.InstancedMesh>(null);
  const palmLeaves = useRef<THREE.InstancedMesh>(null);

  // Geometry with the pivot at the base so scaling grows upward.
  const crownGeo = useMemo(() => new THREE.IcosahedronGeometry(0.09, 0).translate(0, 0.1, 0), []);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.008, 0.012, 0.16, 4).translate(0, 0.08, 0), []);
  const leafGeo = useMemo(() => new THREE.ConeGeometry(0.09, 0.04, 5).translate(0, 0.16, 0), []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const dark = new THREE.Color('#1f7a3d');
    const light = new THREE.Color('#58b947');
    broad.forEach((t, i) => {
      m.makeScale(t.s, t.s * (0.9 + t.tint * 0.4), t.s).setPosition(t.x, t.y - 0.01, t.z);
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.copy(dark).lerp(light, t.tint));
    });
    palms.forEach((t, i) => {
      m.makeRotationY(t.tint * 6).scale(new THREE.Vector3(t.s, t.s, t.s)).setPosition(t.x, t.y, t.z);
      palmTrunks.current!.setMatrixAt(i, m);
      palmLeaves.current!.setMatrixAt(i, m);
    });
    for (const im of [crowns.current!, palmTrunks.current!, palmLeaves.current!]) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
    }
  }, [broad, palms]);

  return (
    <group name="vegetation">
      <instancedMesh ref={crowns} args={[crownGeo, undefined, broad.length]}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
      <instancedMesh ref={palmTrunks} args={[trunkGeo, undefined, palms.length]}>
        <meshLambertMaterial color="#8b6b43" />
      </instancedMesh>
      <instancedMesh ref={palmLeaves} args={[leafGeo, undefined, palms.length]}>
        <meshLambertMaterial color="#2e9e4f" flatShading />
      </instancedMesh>
    </group>
  );
}
