/**
 * Building-kit primitives: shared geometries, a material cache and small
 * helper components. Every building is assembled from these, so the whole
 * town shares a handful of geometries and materials (cheap on mobile).
 *
 * Kit units: buildings are modelled in "kit units" (a shop is ~2 wide) and
 * scaled into the world by KIT_SCALE (km per kit unit).
 */
import { forwardRef } from 'react';
import * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';
import type { BaseShape } from '@/types/business';

export const KIT_SCALE = 0.085;

// ---------------------------------------------------------------------------
// Shared geometries (unit-sized; scale them per mesh)
// ---------------------------------------------------------------------------

export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  /** Unit cylinder: diameter 1, height 1. */
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
  cyl6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  /** 4-sided pyramid aligned with box edges. */
  pyramid: new THREE.ConeGeometry(0.71, 1, 4, 1).rotateY(Math.PI / 4),
  /** Triangular prism for gable roofs (ridge along x). */
  gable: (() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0);
    shape.lineTo(0.5, 0);
    shape.lineTo(0, 1);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
    g.translate(0, 0, -0.5);
    g.rotateY(Math.PI / 2);
    return g;
  })(),
  sphere: new THREE.IcosahedronGeometry(0.5, 1),
  ico: new THREE.IcosahedronGeometry(0.5, 0),
  torus: new THREE.TorusGeometry(0.35, 0.15, 6, 12),
  plane: new THREE.PlaneGeometry(1, 1),
};

// ---------------------------------------------------------------------------
// Material cache
// ---------------------------------------------------------------------------

const lamberts = new Map<string, THREE.MeshLambertMaterial>();

/** Shared Lambert material for a colour (+ optional emissive). */
export function lambert(color: string, emissive?: string, emissiveIntensity = 1): THREE.MeshLambertMaterial {
  const key = `${color}|${emissive ?? ''}|${emissiveIntensity}`;
  let m = lamberts.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, flatShading: true });
    if (emissive) {
      m.emissive.set(emissive);
      m.emissiveIntensity = emissiveIntensity;
    }
    lamberts.set(key, m);
  }
  return m;
}

/** Gold skin for Founding Members and Category Founding Partners. */
export const GOLD = new THREE.MeshLambertMaterial({ color: '#f5c542', emissive: '#7a5200', emissiveIntensity: 0.35, flatShading: true });

/**
 * Window materials shared by all buildings. `BusinessLayer` brightens the
 * "open" one after dark; closed buildings use the dark one.
 */
export const WINDOW_OPEN = new THREE.MeshLambertMaterial({ color: '#fff3c4', emissive: '#ffb84d', emissiveIntensity: 0.25 });
export const WINDOW_CLOSED = new THREE.MeshLambertMaterial({ color: '#3b4a5e' });

/** Lighten (amount > 0) or darken (amount < 0) a hex colour. */
export function shade(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  const target = amount > 0 ? new THREE.Color('#ffffff') : new THREE.Color('#000000');
  return `#${c.lerp(target, Math.abs(amount)).getHexString()}`;
}

// ---------------------------------------------------------------------------
// Tiny mesh helpers
// ---------------------------------------------------------------------------

type MeshProps = Omit<ThreeElements['mesh'], 'material' | 'geometry'> & {
  material?: THREE.Material;
  color?: string;
};

function mat(p: { material?: THREE.Material; color?: string }) {
  return p.material ?? lambert(p.color ?? '#cccccc');
}

/** Box of `size` [w, h, d]; `position` is its centre. */
export const Box = forwardRef<THREE.Mesh, MeshProps & { size: [number, number, number] }>(
  ({ size, material, color, ...rest }, ref) => (
    <mesh ref={ref} geometry={GEO.box} material={mat({ material, color })} scale={size} {...rest} />
  ),
);

/** Cylinder with diameter `d` and height `h`. */
export const Cyl = forwardRef<THREE.Mesh, MeshProps & { d: number; h: number; hex?: boolean }>(
  ({ d, h, hex, material, color, ...rest }, ref) => (
    <mesh ref={ref} geometry={hex ? GEO.cyl6 : GEO.cyl} material={mat({ material, color })} scale={[d, h, d]} {...rest} />
  ),
);

export const Cone = forwardRef<THREE.Mesh, MeshProps & { d: number; h: number }>(
  ({ d, h, material, color, ...rest }, ref) => (
    <mesh ref={ref} geometry={GEO.cone} material={mat({ material, color })} scale={[d, h, d]} {...rest} />
  ),
);

export const Ball = forwardRef<THREE.Mesh, MeshProps & { d: number; low?: boolean }>(
  ({ d, low, material, color, ...rest }, ref) => (
    <mesh ref={ref} geometry={low ? GEO.ico : GEO.sphere} material={mat({ material, color })} scale={d} {...rest} />
  ),
);

// ---------------------------------------------------------------------------
// Base shapes: dimensions + anchor points props attach to
// ---------------------------------------------------------------------------

export interface BaseSpec {
  w: number;
  d: number;
  /** Wall height. */
  h: number;
  /** Highest point of the roof. */
  top: number;
  /** Signboard centre height and width (on the front face, +z). */
  signY: number;
  signW: number;
  /** How far the sign stands proud of the front wall. */
  signOut: number;
}

export const BASES: Record<BaseShape, BaseSpec> = {
  kiosk: { w: 1.4, d: 1.2, h: 1.15, top: 1.55, signY: 1.4, signW: 1.5, signOut: 0.32 },
  shop: { w: 2.2, d: 1.6, h: 1.4, top: 1.6, signY: 1.18, signW: 1.9, signOut: 0.03 },
  twoStorey: { w: 2.2, d: 1.8, h: 2.5, top: 3.25, signY: 1.32, signW: 1.9, signOut: 0.03 },
  largeVenue: { w: 3.2, d: 2.4, h: 1.9, top: 2.5, signY: 1.58, signW: 2.6, signOut: 0.03 },
};

/** Materials a building is dressed with (brand-tinted or gold). */
export interface KitMaterials {
  wall: THREE.Material;
  brand: THREE.Material;
  brandDark: THREE.Material;
  /** Roof + trim: brand colour, or gold for founding members. */
  roof: THREE.Material;
  trim: THREE.Material;
  window: THREE.Material;
}

export function kitMaterials(brand: string, open: boolean, gold: boolean): KitMaterials {
  return {
    wall: lambert(shade(brand, 0.85)),
    brand: lambert(brand),
    brandDark: lambert(shade(brand, -0.35)),
    roof: gold ? GOLD : lambert(shade(brand, -0.15)),
    trim: gold ? GOLD : lambert('#f8fafc'),
    window: open ? WINDOW_OPEN : WINDOW_CLOSED,
  };
}

/** Props passed to base shapes and signature props. */
export interface KitPartProps {
  spec: BaseSpec;
  brand: string;
  mats: KitMaterials;
  open: boolean;
}
