/**
 * The island as a district map: one raised, rounded "tile" per district
 * (outlines traced from the reference map), separated by soft grooves.
 * Tap a tile to open the district. When a district is open its tile turns
 * into the green ground of the city scene and the others fade back.
 */
import { useEffect, useMemo, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { DISTRICTS } from '@/data/districts';
import { BOARD_TOP, DISTRICT_POLYS } from '@/lib/geo';
import { useCameraStore } from '@/store/useCameraStore';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeGroundPath, ribbonGeometry } from './paths';
import type { District, DistrictId } from '@/types/geo';

/** Ground colour of an opened district (the city scene stands on it). */
export const CITY_GROUND = '#bfe49a';
const SIDE = '#efd9a6';
const FADED = '#e9e5da';

function tileGeometry(id: DistrictId) {
  const shape = new THREE.Shape(DISTRICT_POLYS[id].map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: BOARD_TOP,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.08,
    // Keep the outer edge on the outline so neighbours meet in a soft groove.
    bevelOffset: -0.08,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.03, 0);
  return geo;
}

/** Pastel version of the district's accent for the map. */
function pastel(hex: string) {
  return new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), 0.28);
}

/** Crisp white border lines along every district outline (like a paper map). */
function Borders({ dim }: { dim: boolean }) {
  const geometry = useMemo(() => {
    const geos = DISTRICTS.map((d) => ribbonGeometry(makeGroundPath(DISTRICT_POLYS[d.id], { loop: true, spacing: 0.25, lift: BOARD_TOP + 0.01, heightFn: () => 0 }), 0.42, BOARD_TOP + 0.01, () => 0));
    const merged = mergeGeometries(geos);
    geos.forEach((g) => g.dispose());
    return merged;
  }, []);
  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshBasicMaterial color="#ffffff" transparent opacity={dim ? 0.35 : 0.95} depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  );
}

function Tile({ district, active, faded }: { district: District; active: boolean; faded: boolean }) {
  const geometry = useMemo(() => tileGeometry(district.id), [district.id]);
  const goDistrict = useCameraStore((s) => s.goDistrict);
  const [hover, setHover] = useState(false);
  const top = useMemo(() => new THREE.MeshLambertMaterial({ color: pastel(district.color) }), [district.color]);
  const side = useMemo(() => new THREE.MeshLambertMaterial({ color: SIDE }), []);
  const base = useMemo(() => pastel(district.color), [district.color]);
  const target = useMemo(() => new THREE.Color(), []);

  // Ease colours/height towards the current state.
  useFrame((_, dt) => {
    target.copy(active ? new THREE.Color(CITY_GROUND) : faded ? new THREE.Color(FADED) : base);
    if (hover && !active) target.lerp(new THREE.Color('#ffffff'), 0.25);
    top.color.lerp(target, Math.min(1, dt * 6));
  });

  useEffect(() => () => {
    geometry.dispose();
    top.dispose();
  }, [geometry, top]);

  const tap = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8 || active) return;
    e.stopPropagation();
    goDistrict(district.id);
  };

  return (
    <mesh
      geometry={geometry}
      material={[top, side]}
      position-y={hover && !active ? 0.12 : 0}
      onClick={tap}
      onPointerOver={(e) => {
        if (active) return;
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
      }}
      name={`tile-${district.id}`}
    />
  );
}

export function DistrictMap() {
  const districtId = useCameraStore((s) => s.districtId);
  const level = useCameraStore((s) => s.level);
  const open = level !== 'island' ? districtId : null;
  return (
    <group name="district-map">
      {DISTRICTS.map((d) => (
        <Tile key={d.id} district={d} active={open === d.id} faded={!!open && open !== d.id} />
      ))}
      <Borders dim={!!open} />
    </group>
  );
}
