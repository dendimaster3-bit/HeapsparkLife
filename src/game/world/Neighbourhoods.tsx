/**
 * Filler city for the open district: pastel apartment towers in town
 * centres, blocks around them and little houses at the edges — all
 * instanced (one draw call per building class). Windows light up at night.
 * Placement avoids roads, rivers, business plots and each other.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS } from '@/data/towns';
import { BOARD_TOP, hashString, insideDistrict, project, rng } from '@/lib/geo';
import { nightFactor } from '@/store/useClockStore';
import type { DistrictId } from '@/types/geo';
import { isBuildable } from './placement';
import { PLOT_RADIUS, getAllPlots } from './plots';
import { TOWN_RADIUS } from './roadNetwork';

const FLOOR = 0.075;
const COUNT = { city: 40, town: 20, village: 9 } as const;
const PASTELS = ['#ffd6e0', '#ffe8b3', '#cdeafe', '#d8f5d0', '#fff4d6', '#e6dcff', '#ffdcc2', '#ffffff'];

type ClassId = 'tower9' | 'tower6' | 'block4' | 'block3' | 'house';
const CLASSES: Record<ClassId, { floors: number; round: boolean; roof: 'garden' | 'pitched' }> = {
  tower9: { floors: 9, round: true, roof: 'garden' },
  tower6: { floors: 6, round: false, roof: 'garden' },
  block4: { floors: 4, round: false, roof: 'garden' },
  block3: { floors: 3, round: true, roof: 'garden' },
  house: { floors: 1, round: false, roof: 'pitched' },
};

interface Filler { cls: ClassId; x: number; z: number; size: number; rot: number; color: string }

/** One floor = white wall band + a row of windows. `glow` draws only the windows (night). */
function floorTexture(floors: number, glow: boolean) {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d')!;
  g.fillStyle = glow ? '#000000' : '#ffffff';
  g.fillRect(0, 0, 32, 32);
  g.fillStyle = glow ? '#ffffff' : '#a9c4d9';
  for (let i = 0; i < 4; i++) g.fillRect(2 + i * 8, 10, 5, 14);
  if (!glow) {
    g.fillStyle = 'rgba(0,0,0,0.08)';
    g.fillRect(0, 29, 32, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = glow ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, floors);
  return t;
}

function generate(id: DistrictId): Filler[] {
  const plots = getAllPlots().filter((p) => p.districtId === id);
  const out: Filler[] = [];
  for (const town of TOWNS.filter((t) => t.districtId === id)) {
    const [cx, cz] = project(town.at);
    const R = TOWN_RADIUS[town.kind];
    const rand = rng(hashString(`fill:${town.id}`));
    let placed = 0;
    for (let tries = 0; placed < COUNT[town.kind] && tries < COUNT[town.kind] * 25; tries++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * R;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      const core = r / R;
      const cls: ClassId =
        town.kind === 'city' ? (core < 0.35 ? (rand() < 0.5 ? 'tower9' : 'tower6') : core < 0.7 ? (rand() < 0.5 ? 'block4' : 'block3') : 'house')
        : town.kind === 'town' ? (core < 0.4 ? 'block4' : core < 0.7 ? 'block3' : 'house')
        : 'house';
      const size = cls === 'house' ? 0.17 + rand() * 0.05 : 0.22 + rand() * 0.08;
      if (!isBuildable(x, z, size / 2 + 0.04, 0.15 + size / 2)) continue;
      if (!insideDistrict(x, z, id, 0.15)) continue;
      if (plots.some((p) => Math.hypot(p.position[0] - x, p.position[1] - z) < PLOT_RADIUS + size / 2 + 0.15)) continue;
      if (out.some((o) => Math.hypot(o.x - x, o.z - z) < (o.size + size) / 2 + 0.05)) continue;
      out.push({ cls, x, z, size, rot: rand() * Math.PI, color: PASTELS[Math.floor(rand() * PASTELS.length)] });
      placed++;
    }
  }
  return out;
}

const ROOF_GARDEN = new THREE.MeshLambertMaterial({ color: '#8fd16f' });
const ROOF_TILE = new THREE.MeshLambertMaterial({ color: '#e07a5f', flatShading: true });

function ClassMesh({ cls, items, accent }: { cls: ClassId; items: Filler[]; accent: string }) {
  const spec = CLASSES[cls];
  const walls = useRef<THREE.InstancedMesh>(null);
  const roofs = useRef<THREE.InstancedMesh>(null);
  const { wallGeo, roofGeo, mat } = useMemo(() => {
    const wallGeo = spec.round ? new THREE.CylinderGeometry(0.5, 0.5, 1, 14).translate(0, 0.5, 0) : new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const roofGeo =
      spec.roof === 'pitched'
        ? new THREE.ConeGeometry(0.75, 0.55, 4).rotateY(Math.PI / 4).translate(0, 0.27, 0)
        : spec.round
          ? new THREE.CylinderGeometry(0.52, 0.52, 0.12, 14).translate(0, 0.06, 0)
          : new THREE.BoxGeometry(1.04, 0.12, 1.04).translate(0, 0.06, 0);
    const mat = new THREE.MeshLambertMaterial({ map: floorTexture(spec.floors, false), emissiveMap: floorTexture(spec.floors, true), emissive: new THREE.Color('#ffc66b') });
    return { wallGeo, roofGeo, mat };
  }, [spec]);

  useLayoutEffect(() => {
    if (!walls.current || !roofs.current) return; // no buildings of this class here
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color();
    const up = new THREE.Vector3(0, 1, 0);
    const h = spec.floors * FLOOR;
    items.forEach((it, i) => {
      q.setFromAxisAngle(up, it.rot);
      walls.current!.setMatrixAt(i, m.compose(p.set(it.x, BOARD_TOP, it.z), q, s.set(it.size, h, it.size)));
      // Houses get the district accent on some walls for local colour.
      walls.current!.setColorAt(i, c.set(cls === 'house' && i % 3 === 0 ? new THREE.Color(accent).lerp(new THREE.Color('#ffffff'), 0.6).getStyle() : it.color));
      roofs.current!.setMatrixAt(i, m.compose(p.set(it.x, BOARD_TOP + h, it.z), q, s.set(it.size, it.size, it.size)));
    });
    for (const im of [walls.current!, roofs.current!]) {
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
    }
  }, [items, spec, cls, accent]);

  useFrame(() => {
    mat.emissiveIntensity = nightFactor() * 0.9;
  });

  if (!items.length) return null;
  return (
    <group>
      <instancedMesh ref={walls} args={[wallGeo, mat, items.length]} />
      <instancedMesh ref={roofs} args={[roofGeo, spec.roof === 'pitched' ? ROOF_TILE : ROOF_GARDEN, items.length]} />
    </group>
  );
}

/** Soft round shadow texture (shared by every blob shadow). */
export const SHADOW_TEXTURE = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grad.addColorStop(0, 'rgba(40,60,40,0.45)');
  grad.addColorStop(1, 'rgba(40,60,40,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
export const SHADOW_MATERIAL = new THREE.MeshBasicMaterial({ map: SHADOW_TEXTURE, transparent: true, depthWrite: false });
const SHADOW_GEO = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/** Cheap contact shadows: one soft blob under each building (one draw call). */
function BlobShadows({ items }: { items: Filler[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    items.forEach((it, i) => {
      const s = it.size * (1.6 + CLASSES[it.cls].floors * 0.08);
      // Offset away from the sun (north-west light) for a bit of depth.
      m.makeScale(s, 1, s).setPosition(it.x + it.size * 0.25, BOARD_TOP + 0.004, it.z + it.size * 0.3);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[SHADOW_GEO, SHADOW_MATERIAL, Math.max(1, items.length)]} count={items.length} renderOrder={1} />;
}

export function Neighbourhoods({ id }: { id: DistrictId }) {
  const items = useMemo(() => fillersOf(id), [id]);
  const accent = DISTRICTS_BY_ID[id].color;
  return (
    <group name="neighbourhoods">
      <BlobShadows items={items} />
      {(Object.keys(CLASSES) as ClassId[]).map((cls) => (
        <ClassMesh key={cls} cls={cls} items={items.filter((i) => i.cls === cls)} accent={accent} />
      ))}
    </group>
  );
}

/** Filler positions, so trees can keep clear of them. */
export const fillersOf = (() => {
  const cache = new Map<DistrictId, Filler[]>();
  return (id: DistrictId) => {
    if (!cache.has(id)) cache.set(id, generate(id));
    return cache.get(id)!;
  };
})();
