/**
 * The island terrain: one low-poly mesh with per-vertex colours.
 * Colour layers (in order): sand near the coast → district-tinted land with
 * sugar-cane patches → rock/forest on high ground, plus darker lines on
 * district borders. Triangles far out at sea are dropped to save fill-rate.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { ISLAND_BOUNDS, REEF_DISTANCE, districtAt, heightAt, signedDistance, valueNoise } from '@/lib/geo';

/** Grid spacing in km. 0.45 → ~20k vertices: smooth enough, cheap on mobile. */
const STEP = 0.45;
const MARGIN = 3.5;

const SAND = new THREE.Color('#f1dfa6');
const SEABED = new THREE.Color('#7fe3d4');
const DEEP = new THREE.Color('#0d4f80');
const GRASS = new THREE.Color('#6cc04a');
const CANE = new THREE.Color('#b5d65a');
const FOREST = new THREE.Color('#2f8f4e');
const ROCK = new THREE.Color('#8a8f7a');
const BORDER = new THREE.Color('#ffffff');

function buildTerrain() {
  const { minX, maxX, minZ, maxZ } = ISLAND_BOUNDS;
  const x0 = minX - MARGIN, z0 = minZ - MARGIN;
  const cols = Math.ceil((maxX - minX + 2 * MARGIN) / STEP) + 1;
  const rows = Math.ceil((maxZ - minZ + 2 * MARGIN) / STEP) + 1;

  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dist = new Float32Array(count);

  const c = new THREE.Color();
  const tint = new THREE.Color();

  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      // Slight jitter of interior vertices gives a hand-made low-poly feel.
      const jx = (valueNoise(col * 1.7, r * 1.3) - 0.5) * STEP * 0.5;
      const jz = (valueNoise(r * 1.9, col * 1.1) - 0.5) * STEP * 0.5;
      const x = x0 + col * STEP + jx;
      const z = z0 + r * STEP + jz;
      const d = signedDistance(x, z);
      const h = heightAt(x, z);
      dist[i] = d;
      positions.set([x, h, z], i * 3);

      if (d < 0) {
        // Bright sandy lagoon floor fading to deep blue past the reef.
        c.copy(SEABED).lerp(SAND, Math.max(0, 1 + d * 1.5));
        if (d < -REEF_DISTANCE) c.lerp(DEEP, Math.min(1, (-d - REEF_DISTANCE) / 0.8));
      } else if (d < 0.35) {
        c.copy(SAND);
      } else {
        const { id, edge } = districtAt(x, z);
        // Base land: grass with patches of sugar cane.
        const cane = valueNoise(x * 0.9 + 40, z * 0.9 - 12);
        c.copy(GRASS).lerp(CANE, cane > 0.55 ? 0.85 : 0);
        // High ground goes to forest then rock.
        if (h > 1.1) c.lerp(FOREST, Math.min(1, (h - 1.1) / 0.6));
        if (h > 2.2) c.lerp(ROCK, Math.min(1, (h - 2.2) / 0.8));
        // District accent tint (subtle so the island still reads as green).
        tint.set(DISTRICTS_BY_ID[id].color);
        c.lerp(tint, 0.13);
        // Soft white lines along district borders.
        if (edge > 0) c.lerp(BORDER, edge * 0.6);
      }
      colors.set([c.r, c.g, c.b], i * 3);
    }
  }

  // Only keep cells that touch land or shallow water.
  const indices: number[] = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let col = 0; col < cols - 1; col++) {
      const a = r * cols + col, b = a + 1, cI = a + cols, dI = cI + 1;
      const maxD = Math.max(dist[a], dist[b], dist[cI], dist[dI]);
      if (maxD < -3.2) continue;
      indices.push(a, cI, b, b, cI, dI);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  // Non-indexed + per-face normals = crisp low-poly facets.
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  geo.dispose();
  return flat;
}

export function Island() {
  const geometry = useMemo(buildTerrain, []);
  return (
    <mesh geometry={geometry} name="terrain">
      <meshLambertMaterial vertexColors flatShading />
    </mesh>
  );
}
