/**
 * Greenery for the open district: round "lollipop" trees, striped sugar
 * cane fields (very Mauritian) and low-poly mountains. All instanced.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PEAKS } from '@/data/terrain';
import { BOARD_TOP, DISTRICT_BOUNDS, hashString, insideDistrict, project, rng } from '@/lib/geo';
import type { DistrictId } from '@/types/geo';
import { isBuildable } from './placement';
import { PLOT_RADIUS, getAllPlots } from './plots';
import { fillersOf } from './Neighbourhoods';

interface Tree { x: number; z: number; s: number; tint: number }
interface Field { x: number; z: number; w: number; d: number; rot: number }

function generate(id: DistrictId) {
  const b = DISTRICT_BOUNDS[id];
  const area = (b.maxX - b.minX) * (b.maxZ - b.minZ);
  const rand = rng(hashString(`nature:${id}`));
  const plots = getAllPlots().filter((p) => p.districtId === id);
  const fillers = fillersOf(id);
  const clear = (x: number, z: number, r: number) =>
    insideDistrict(x, z, id, 0.1) &&
    isBuildable(x, z, r) &&
    !plots.some((p) => Math.hypot(p.position[0] - x, p.position[1] - z) < PLOT_RADIUS + r + 0.1) &&
    !fillers.some((f) => Math.hypot(f.x - x, f.z - z) < f.size / 2 + r + 0.05);
  const rnd = () => [b.minX + rand() * (b.maxX - b.minX), b.minZ + rand() * (b.maxZ - b.minZ)] as const;

  const fields: Field[] = [];
  for (let i = 0; i < 400 && fields.length < Math.min(14, area / 12); i++) {
    const [x, z] = rnd();
    const w = 0.7 + rand() * 0.6, d = 0.45 + rand() * 0.35;
    if (!clear(x, z, Math.max(w, d) / 2)) continue;
    if (fields.some((f) => Math.hypot(f.x - x, f.z - z) < 1.3)) continue;
    fields.push({ x, z, w, d, rot: rand() * Math.PI });
  }
  const trees: Tree[] = [];
  const want = Math.min(520, area * 2.2);
  for (let i = 0; i < want * 8 && trees.length < want; i++) {
    const [x, z] = rnd();
    // Trees cluster: keep some, thin others by a noise-ish rule.
    if (Math.sin(x * 0.9) * Math.cos(z * 0.8) < -0.3 && rand() < 0.7) continue;
    if (!clear(x, z, 0.07)) continue;
    if (fields.some((f) => Math.hypot(f.x - x, f.z - z) < Math.max(f.w, f.d) / 2 + 0.05)) continue;
    trees.push({ x, z, s: 0.75 + rand() * 0.55, tint: rand() });
  }
  return { trees, fields };
}

const CANE = (() => {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const g = c.getContext('2d')!;
  g.fillStyle = '#a8d672';
  g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#8cc35c';
  g.fillRect(0, 0, 16, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 10);
  return t;
})();

export function Nature({ id }: { id: DistrictId }) {
  const { trees, fields } = useMemo(() => generate(id), [id]);
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const fieldMesh = useRef<THREE.InstancedMesh>(null);
  const geos = useMemo(
    () => ({
      crown: new THREE.IcosahedronGeometry(0.075, 1).translate(0, 0.13, 0),
      trunk: new THREE.CylinderGeometry(0.01, 0.014, 0.08, 5).translate(0, 0.04, 0),
      field: new THREE.BoxGeometry(1, 0.025, 1).translate(0, 0.012, 0),
    }),
    [],
  );

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const dark = new THREE.Color('#2fa55a'), light = new THREE.Color('#7fd36b');
    if (!crowns.current || !trunks.current || !fieldMesh.current) return;
    trees.forEach((t, i) => {
      m.makeScale(t.s, t.s, t.s).setPosition(t.x, BOARD_TOP, t.z);
      crowns.current!.setMatrixAt(i, m);
      trunks.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.copy(dark).lerp(light, t.tint));
    });
    const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    fields.forEach((f, i) => {
      fieldMesh.current!.setMatrixAt(i, m.compose(new THREE.Vector3(f.x, BOARD_TOP, f.z), q.setFromAxisAngle(up, f.rot), new THREE.Vector3(f.w, 1, f.d)));
    });
    for (const im of [crowns.current, trunks.current, fieldMesh.current]) {
      if (!im) continue;
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
    }
  }, [trees, fields]);

  const peaks = PEAKS.filter((p) => {
    const [x, z] = project(p.at);
    return insideDistrict(x, z, id, -0.3);
  });

  return (
    <group name="nature">
      <instancedMesh ref={crowns} args={[geos.crown, undefined, Math.max(1, trees.length)]} count={trees.length}>
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[geos.trunk, undefined, Math.max(1, trees.length)]} count={trees.length}>
        <meshLambertMaterial color="#9a7048" />
      </instancedMesh>
      <instancedMesh ref={fieldMesh} args={[geos.field, undefined, Math.max(1, fields.length)]} count={fields.length}>
        <meshLambertMaterial map={CANE} />
      </instancedMesh>
      {peaks.map((p) => {
        const [x, z] = project(p.at);
        return (
          <group key={p.name} position={[x, BOARD_TOP, z]} name={`peak-${p.name}`}>
            <mesh position-y={p.height * 0.42} scale={[p.radius, p.height * 0.85, p.radius]}>
              <coneGeometry args={[1, 1, 7, 2]} />
              <meshLambertMaterial color="#6fbf5f" flatShading />
            </mesh>
            <mesh position-y={p.height * 0.82} scale={[p.radius * 0.32, p.height * 0.24, p.radius * 0.32]}>
              <coneGeometry args={[1, 1, 7]} />
              <meshLambertMaterial color="#8a8f7a" flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
