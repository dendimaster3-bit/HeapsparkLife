/**
 * Rising, growing, fading puffs — used for steam, chimney smoke and car-wash
 * foam. One InstancedMesh per emitter; puffs "fade" by shrinking so we can
 * share a plain material (no per-instance opacity shader needed).
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GEO, lambert } from '../kit';

interface PuffsProps {
  position?: [number, number, number];
  count?: number;
  color?: string;
  /** Max puff diameter. */
  size?: number;
  /** How high puffs rise before vanishing. */
  rise?: number;
  /** Horizontal spread at spawn. */
  spread?: number;
  /** Seconds for one puff's life. */
  life?: number;
  /** Sideways drift (wind) over a lifetime. */
  drift?: number;
}

export function Puffs({
  position = [0, 0, 0],
  count = 8,
  color = '#f1f5f9',
  size = 0.35,
  rise = 1.4,
  spread = 0.1,
  life = 3,
  drift = 0.3,
}: PuffsProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({ phase: i / count, x: (Math.random() - 0.5) * spread, z: (Math.random() - 0.5) * spread })), [count, spread]);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    const im = ref.current;
    if (!im) return;
    seeds.forEach((s, i) => {
      const t = (clock.elapsedTime / life + s.phase) % 1;
      // Grow quickly, then shrink away near the end of life.
      const sc = size * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (0.6 + t * 0.6);
      m.makeScale(sc, sc, sc).setPosition(s.x + t * drift, t * rise, s.z);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[GEO.ico, lambert(color), count]} position={position} frustumCulled={false} />
  );
}
