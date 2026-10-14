/**
 * Path helpers: smooth a polyline over the terrain and turn it into a flat
 * ribbon mesh (roads, reef foam). Paths are also reused by ambient traffic.
 */
import * as THREE from 'three';
import { heightAt } from '@/lib/geo';
import type { Vec2 } from '@/types/geo';

export interface GroundPath {
  /** Evenly spaced points, already draped on the terrain. */
  points: THREE.Vector3[];
  /** Total length in km. */
  length: number;
  loop: boolean;
}

/** Catmull-Rom smooth a 2D polyline and sample every `spacing` km. */
export function makeGroundPath(
  pts: readonly Vec2[],
  { loop = false, spacing = 0.25, lift = 0.04, heightFn = heightAt } = {},
): GroundPath {
  const curve = new THREE.CatmullRomCurve3(
    pts.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    loop,
    'centripetal',
  );
  const length = curve.getLength();
  const n = Math.max(2, Math.ceil(length / spacing));
  const points = curve.getSpacedPoints(n);
  if (loop) points.pop(); // last point duplicates the first
  for (const p of points) p.y = heightFn(p.x, p.z) + lift;
  return { points, length, loop };
}

/** Build a flat ribbon of `width` km along a ground path, draped on terrain. */
export function ribbonGeometry(path: GroundPath, width: number, lift = 0.04, heightFn = heightAt) {
  const { points, loop } = path;
  const n = points.length;
  const positions = new Float32Array(n * 2 * 3);
  const uvs = new Float32Array(n * 2 * 2);
  const indices: number[] = [];
  let along = 0;
  for (let i = 0; i < n; i++) {
    const prev = points[loop ? (i - 1 + n) % n : Math.max(0, i - 1)];
    const next = points[loop ? (i + 1) % n : Math.min(n - 1, i + 1)];
    const tx = next.x - prev.x, tz = next.z - prev.z;
    const len = Math.hypot(tx, tz) || 1;
    const nx = (-tz / len) * (width / 2), nz = (tx / len) * (width / 2);
    const p = points[i];
    if (i > 0) along += p.distanceTo(points[i - 1]);
    const lx = p.x + nx, lz = p.z + nz, rx = p.x - nx, rz = p.z - nz;
    positions.set([lx, heightFn(lx, lz) + lift, lz, rx, heightFn(rx, rz) + lift, rz], i * 6);
    uvs.set([0, along, 1, along], i * 4);
    if (i < n - 1 || loop) {
      const a = i * 2, b = ((i + 1) % n) * 2;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
