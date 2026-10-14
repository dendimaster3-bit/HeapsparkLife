/**
 * Assembles a building from the kit:
 *   base shape + signature prop + signboard + state decorators
 * (open/closed lights, promo beam, growth level, gold founding skin).
 *
 * Purely presentational: it takes visual flags, so the same component
 * renders on the map (`BusinessLayer`) and in the kit gallery (`/kit`).
 * Coordinates are kit units; the caller scales by KIT_SCALE.
 */
import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Detailed } from '@react-three/drei';
import * as THREE from 'three';
import type { BaseShape, BuildingStyleId, GrowthLevel } from '@/types/business';
import { BASES, Box, kitMaterials, lambert } from './kit';
import { BASE_COMPONENTS } from './bases';
import { BUILDING_STYLES } from './registry';
import { Signboard } from './Signboard';
import { PromoBeam } from './decorators/PromoBeam';
import { GrowthExtras } from './decorators/GrowthExtras';
import { FoundingStar } from './decorators/FoundingStar';
import { SearchPin } from './decorators/SearchPin';

export interface BuildingVisual {
  name: string;
  brand: string;
  logoUrl?: string;
  styleId: BuildingStyleId;
  /** Overrides the style's default base. */
  base?: BaseShape;
  open: boolean;
  promo: boolean;
  level: GrowthLevel;
  gold: boolean;
  selected?: boolean;
  /** Highlighted as a search result. */
  pinned?: boolean;
}

/** Growth makes the whole building a little bigger. */
export const GROWTH_SCALE: Record<GrowthLevel, number> = { 1: 1, 2: 1.12, 3: 1.25 };

export function useBuildingSpec(v: Pick<BuildingVisual, 'styleId' | 'base'>) {
  const style = BUILDING_STYLES[v.styleId];
  const baseShape = v.base ?? style.base;
  return { style, baseShape, spec: BASES[baseShape] };
}

/** Full-detail building. */
export function BuildingFull(v: BuildingVisual) {
  const { style, baseShape, spec } = useBuildingSpec(v);
  const mats = useMemo(() => kitMaterials(v.brand, v.open, v.gold), [v.brand, v.open, v.gold]);
  const Base = BASE_COMPONENTS[baseShape];
  const Prop = style.Prop;
  const part = { spec, brand: v.brand, mats, open: v.open };
  return (
    <group scale={GROWTH_SCALE[v.level]}>
      <Base {...part} />
      <Suspense fallback={null}>
        <Prop {...part} />
      </Suspense>
      <Signboard spec={spec} name={v.name} brand={v.brand} logoUrl={v.logoUrl} open={v.open} />
      <GrowthExtras {...part} level={v.level} />
      {v.gold && <FoundingStar y={spec.top + 2.1} />}
    </group>
  );
}

/** Two-box stand-in used when the camera is far away. */
export function BuildingSimple(v: BuildingVisual) {
  const { spec } = useBuildingSpec(v);
  const mats = useMemo(() => kitMaterials(v.brand, v.open, v.gold), [v.brand, v.open, v.gold]);
  const s = GROWTH_SCALE[v.level];
  return (
    <group scale={s}>
      <Box size={[spec.w + 1, spec.h, spec.d + 0.6]} position={[0.5, spec.h / 2 - 0.2, 0]} material={mats.wall} />
      <Box size={[spec.w + 1.1, spec.top - spec.h + 0.3, spec.d + 0.7]} position={[0.5, spec.h + 0.1, 0]} material={mats.roof} />
    </group>
  );
}

const RING_GEO = new THREE.TorusGeometry(0.5, 0.03, 6, 40);

/** Pulsing ring under the selected building. */
function SelectionRing({ brand, radius }: { brand: string; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    ref.current?.scale.setScalar(radius * (1 + Math.sin(clock.elapsedTime * 4) * 0.05));
  });
  return (
    <mesh ref={ref} geometry={RING_GEO} material={lambert(brand, brand, 0.6)} rotation-x={-Math.PI / 2} position-y={0.15} />
  );
}

/**
 * Building with level-of-detail: full kit up close, boxes at mid range,
 * nothing far away. The promo beam stays visible at every range.
 * `lodDistances` are in world units (km).
 */
export function Building({ lodDistances = [0, 9, 30], ...v }: BuildingVisual & { lodDistances?: [number, number, number] }) {
  const { spec } = useBuildingSpec(v);
  const scale = GROWTH_SCALE[v.level];
  return (
    <group>
      <Detailed distances={lodDistances}>
        <BuildingFull {...v} />
        <BuildingSimple {...v} />
        <group />
      </Detailed>
      {v.promo && <PromoBeam from={spec.top * scale + 0.3} />}
      {v.pinned && !v.selected && <SearchPin y={spec.top * scale + 1} color={v.brand} />}
      {v.selected && <SelectionRing brand={v.brand} radius={Math.max(spec.w, spec.d) * 2.4} />}
    </group>
  );
}
