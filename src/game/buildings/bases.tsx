/**
 * The 4 base building shapes. Each one is centred on the plot, front face
 * towards +z, and dressed with the materials from `kitMaterials`.
 */
import type { ComponentType } from 'react';
import type { BaseShape } from '@/types/business';
import { Box, GEO, type KitPartProps } from './kit';

/** Foundation that sinks into sloped terrain so nothing floats. */
function Foundation({ w, d }: { w: number; d: number }) {
  return <Box size={[w + 0.3, 0.8, d + 0.3]} position={[0, -0.35, 0]} color="#cbd5e1" />;
}

/** A row of windows along the front face at height y. */
function FrontWindows({ spec, mats, y, count, skipCentre = false }: KitPartProps & { y: number; count: number; skipCentre?: boolean }) {
  const gap = spec.w / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        if (skipCentre && i === Math.floor(count / 2)) return null;
        return (
          <Box
            key={i}
            size={[gap * 0.55, 0.38, 0.04]}
            position={[-spec.w / 2 + gap * (i + 0.5), y, spec.d / 2 + 0.01]}
            material={mats.window}
          />
        );
      })}
    </>
  );
}

function Door({ spec, mats, wide = false }: KitPartProps & { wide?: boolean }) {
  const w = wide ? 1.2 : 0.42;
  const h = wide ? 1.3 : 0.75;
  return <Box size={[w, h, 0.05]} position={[0, h / 2, spec.d / 2 + 0.02]} material={mats.brandDark} />;
}

/** Small hut with an overhanging canopy roof. */
export function KioskBase(p: KitPartProps) {
  const { spec, mats } = p;
  return (
    <group>
      <Foundation w={spec.w} d={spec.d} />
      <Box size={[spec.w, spec.h, spec.d]} position={[0, spec.h / 2, 0]} material={mats.wall} />
      {/* Serving hatch */}
      <Box size={[spec.w * 0.7, 0.4, 0.04]} position={[0, 0.75, spec.d / 2 + 0.01]} material={mats.window} />
      <Box size={[spec.w * 0.8, 0.06, 0.3]} position={[0, 0.52, spec.d / 2 + 0.15]} material={mats.trim} />
      {/* Canopy */}
      <mesh geometry={GEO.pyramid} material={mats.roof} position={[0, spec.h + 0.2, 0]} scale={[spec.w + 0.5, 0.4, spec.d + 0.5]} />
    </group>
  );
}

/** Single-storey shop with flat roof and parapet. */
export function ShopBase(p: KitPartProps) {
  const { spec, mats } = p;
  return (
    <group>
      <Foundation w={spec.w} d={spec.d} />
      <Box size={[spec.w, spec.h, spec.d]} position={[0, spec.h / 2, 0]} material={mats.wall} />
      <FrontWindows {...p} y={0.55} count={3} skipCentre />
      <Door {...p} />
      {/* Parapet + roof slab */}
      <Box size={[spec.w + 0.1, 0.2, spec.d + 0.1]} position={[0, spec.h + 0.1, 0]} material={mats.trim} />
      <Box size={[spec.w - 0.1, 0.05, spec.d - 0.1]} position={[0, spec.h + 0.2, 0]} material={mats.roof} />
    </group>
  );
}

/** Two storeys with a balcony line and a pitched roof. */
export function TwoStoreyBase(p: KitPartProps) {
  const { spec, mats } = p;
  return (
    <group>
      <Foundation w={spec.w} d={spec.d} />
      <Box size={[spec.w, spec.h, spec.d]} position={[0, spec.h / 2, 0]} material={mats.wall} />
      <FrontWindows {...p} y={0.55} count={3} skipCentre />
      <FrontWindows {...p} y={1.95} count={3} />
      <Door {...p} />
      {/* Balcony */}
      <Box size={[spec.w + 0.1, 0.08, 0.35]} position={[0, 1.6, spec.d / 2 + 0.17]} material={mats.trim} />
      <Box size={[spec.w + 0.1, 0.25, 0.04]} position={[0, 1.75, spec.d / 2 + 0.34]} material={mats.trim} />
      {/* Roof */}
      <mesh geometry={GEO.gable} material={mats.roof} position={[0, spec.h, 0]} scale={[spec.w + 0.3, spec.top - spec.h, spec.d + 0.3]} />
    </group>
  );
}

/** Big shed: wide roller door, shallow gable roof. */
export function LargeVenueBase(p: KitPartProps) {
  const { spec, mats } = p;
  return (
    <group>
      <Foundation w={spec.w} d={spec.d} />
      <Box size={[spec.w, spec.h, spec.d]} position={[0, spec.h / 2, 0]} material={mats.wall} />
      <Door {...p} wide />
      {/* Side windows */}
      <Box size={[0.5, 0.35, 0.04]} position={[-spec.w / 2 + 0.45, 0.75, spec.d / 2 + 0.01]} material={mats.window} />
      <Box size={[0.5, 0.35, 0.04]} position={[spec.w / 2 - 0.45, 0.75, spec.d / 2 + 0.01]} material={mats.window} />
      {/* Brand stripe */}
      <Box size={[spec.w + 0.02, 0.15, spec.d + 0.02]} position={[0, spec.h - 0.1, 0]} material={mats.brand} />
      <mesh geometry={GEO.gable} material={mats.roof} position={[0, spec.h, 0]} scale={[spec.w + 0.2, spec.top - spec.h, spec.d + 0.2]} />
    </group>
  );
}

export const BASE_COMPONENTS: Record<BaseShape, ComponentType<KitPartProps>> = {
  kiosk: KioskBase,
  shop: ShopBase,
  twoStorey: TwoStoreyBase,
  largeVenue: LargeVenueBase,
};
