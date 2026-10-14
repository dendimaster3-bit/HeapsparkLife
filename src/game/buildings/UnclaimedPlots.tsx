/**
 * Unclaimed plots: a grey pad with a floating "+" marker, all instanced.
 * In the current town a "Claim this spot" label links to the claim flow
 * (business portal, step g). Uses the router singleton because drei's
 * <Html> renders outside the router's React context.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useCameraStore } from '@/store/useCameraStore';
import { useT } from '@/i18n';
import { router } from '@/router';
import { heightAt } from '@/lib/geo';
import type { Plot } from '@/types/business';
import { KIT_SCALE, lambert } from './kit';

const PAD = lambert('#cbd5e1');
const MARKER = lambert('#94a3b8', '#64748b', 0.4);
const PAD_GEO = new THREE.CylinderGeometry(1.6, 1.7, 0.12, 8);
const PLUS_GEO = (() => {
  const a = new THREE.BoxGeometry(0.9, 0.25, 0.25);
  const b = new THREE.BoxGeometry(0.25, 0.9, 0.25);
  const g = new THREE.BufferGeometry();
  // Merge the two bars of the "+" by hand (avoids another import).
  const pos = [...a.toNonIndexed().attributes.position.array, ...b.toNonIndexed().attributes.position.array];
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
})();

export function UnclaimedPlots({ plots }: { plots: Plot[] }) {
  const pads = useRef<THREE.InstancedMesh>(null);
  const plus = useRef<THREE.InstancedMesh>(null);
  const level = useCameraStore((s) => s.level);
  const townId = useCameraStore((s) => s.townId);
  const t = useT();

  const placed = useMemo(
    () => plots.map((p) => ({ ...p, y: heightAt(p.position[0], p.position[1]) })),
    [plots],
  );

  useLayoutEffect(() => {
    if (!pads.current || !plus.current) return;
    const m = new THREE.Matrix4();
    const s = KIT_SCALE;
    placed.forEach((p, i) => {
      m.makeScale(s, s, s).setPosition(p.position[0], p.y + 0.004, p.position[1]);
      pads.current!.setMatrixAt(i, m);
      m.makeScale(s, s, s).setPosition(p.position[0], p.y + s * 1.6, p.position[1]);
      plus.current!.setMatrixAt(i, m);
    });
    for (const im of [pads.current, plus.current]) {
      im.count = placed.length;
      im.instanceMatrix.needsUpdate = true;
      im.computeBoundingSphere();
    }
  }, [placed]);

  const labelled = level === 'town' ? placed.filter((p) => p.townId === townId) : [];
  const max = Math.max(1, placed.length);

  return (
    <group name="unclaimed-plots">
      <instancedMesh key={`pads-${max}`} ref={pads} args={[PAD_GEO, PAD, max]} />
      <instancedMesh key={`plus-${max}`} ref={plus} args={[PLUS_GEO, MARKER, max]} />
      {labelled.map((p) => (
        <Html key={p.id} position={[p.position[0], p.y + KIT_SCALE * 3, p.position[1]]} center zIndexRange={[15, 0]}>
          <button
            className="pointer-events-auto min-h-9 whitespace-nowrap rounded-full border-2 border-dashed border-slate-400 bg-white/85 px-3 text-xs font-semibold text-slate-700 shadow active:scale-95 dark:bg-slate-900/85 dark:text-slate-200"
            onClick={() => void router.navigate(`/business/claim?plot=${encodeURIComponent(p.id)}`)}
          >
            ＋ {t('plot.claim')}
          </button>
        </Html>
      ))}
    </group>
  );
}
