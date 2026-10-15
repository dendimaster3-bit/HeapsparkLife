/**
 * A small plane looping around the island over the beaches, towing the
 * "plane banner" ad slot.
 */
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useAdsStore } from '@/store/useAdsStore';
import { useUiStore } from '@/store/useUiStore';
import { translate } from '@/i18n';
import { creativeTexture } from '../ads/creativeTexture';

const BANNER_W = 3, BANNER_H = 0.6;
/** Tilt the banner towards the sky so it reads from the usual top-down view. */
const BANNER_TILT = 1.1;

/** The "plane banner over the beach" ad slot, towed behind the plane. */
function TowedBanner() {
  const placement = useAdsStore((s) => s.placements.find((p) => p.slot.type === 'planeBanner'));
  const click = useAdsStore((s) => s.click);
  const locale = useUiStore((s) => s.locale);
  const tex = creativeTexture(placement?.booking?.creative ?? null, BANNER_W / BANNER_H, translate(locale, 'ads.here'), 'heapspark.com/advertise');
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, toneMapped: false }), [tex]);
  if (!placement) return null;
  const tap = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    e.stopPropagation();
    click(placement);
  };
  return (
    <group>
      {/* Tow rope */}
      <mesh position={[0, 0, -0.75]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.006, 0.006, 0.9, 4]} />
        <meshBasicMaterial color="#334155" />
      </mesh>
      {/* Banner trails along the flight path, tilted up for readability. */}
      <group position={[0, -0.05, -1.2 - BANNER_W / 2]} rotation-z={BANNER_TILT}>
        <mesh material={mat} rotation-y={-Math.PI / 2} onClick={tap}>
          <planeGeometry args={[BANNER_W, BANNER_H]} />
        </mesh>
      </group>
    </group>
  );
}

const RX = 27, RZ = 33, ALT = 3.5, PERIOD = 110; // seconds per lap

export function Plane() {
  const ref = useRef<THREE.Group>(null);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const at = (a: number, v: THREE.Vector3) => v.set(Math.cos(a) * RX, ALT + Math.sin(a * 3) * 0.4, Math.sin(a) * RZ);
  useFrame(({ clock }) => {
    const a = (clock.elapsedTime / PERIOD) * Math.PI * 2;
    const g = ref.current!;
    at(a, g.position);
    // Nose (+z) points along the path; slight bank into the turn.
    g.lookAt(at(a + 0.02, ahead));
    g.rotateZ(-0.12);
  });
  return (
    <group ref={ref} name="plane">
      <TowedBanner />
      <mesh rotation-x={Math.PI / 2}>
        <capsuleGeometry args={[0.08, 0.6, 2, 6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      <mesh>
        <boxGeometry args={[0.9, 0.02, 0.16]} />
        <meshLambertMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.12, -0.32]}>
        <boxGeometry args={[0.02, 0.2, 0.12]} />
        <meshLambertMaterial color="#0ea5b7" />
      </mesh>
    </group>
  );
}
