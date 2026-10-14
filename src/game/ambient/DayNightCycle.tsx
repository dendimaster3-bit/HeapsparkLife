/**
 * Sun, sky and fog driven by the real Mauritius time (or `?hour=` /
 * the debug slider). Lights are mutated in useFrame — no re-renders.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useClockStore } from '@/store/useClockStore';
import { useUiStore } from '@/store/useUiStore';
import { SUNRISE, SUNSET, mauritiusHour } from '@/lib/time';

const SKY_DAY = new THREE.Color('#8fd8f5');
const SKY_DUSK = new THREE.Color('#f6a46b');
const SKY_NIGHT = new THREE.Color('#0b1733');
const SUN_DAY = new THREE.Color('#fff4d6');
const SUN_DUSK = new THREE.Color('#ffb070');

export function DayNightCycle() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const stars = useRef<THREE.Points>(null);
  const scene = useThree((s) => s.scene);
  const lastTick = useRef(0);

  useEffect(() => {
    scene.background = SKY_DAY.clone();
    scene.fog = new THREE.Fog(SKY_DAY.clone(), 140, 320);
  }, [scene]);

  useFrame(({ clock }) => {
    // Update the clock store ~4×/s (cheap, and enough for a smooth HUD).
    if (clock.elapsedTime - lastTick.current > 0.25) {
      lastTick.current = clock.elapsedTime;
      const override = useUiStore.getState().hourOverride;
      useClockStore.getState().tick(override ?? mauritiusHour());
    }
    const { hour, daylight } = useClockStore.getState();

    // Sun travels east → west across the northern sky (southern hemisphere).
    const t = (hour - SUNRISE) / (SUNSET - SUNRISE); // 0 at sunrise, 1 at sunset
    const angle = Math.PI * Math.min(1.1, Math.max(-0.1, t));
    const elevation = Math.sin(angle);
    if (sun.current) {
      sun.current.position.set(Math.cos(angle) * 80, Math.max(8, elevation * 90), -35);
      sun.current.intensity = 0.25 + daylight * 2.2;
      // Warm colour near the horizon, moonlight-blue at night.
      sun.current.color.copy(SUN_DUSK).lerp(SUN_DAY, Math.min(1, elevation * 2.5));
      if (daylight < 0.05) sun.current.color.set('#9fb4ff');
    }
    if (hemi.current) hemi.current.intensity = 0.55 + daylight * 0.9;

    // Sky: night → dusk → day, with an orange glow around sunrise/sunset.
    const sky = scene.background as THREE.Color;
    const dusk = Math.max(0, 1 - Math.abs(daylight - 0.5) * 2);
    sky.copy(SKY_NIGHT).lerp(SKY_DAY, daylight).lerp(SKY_DUSK, dusk * 0.6);
    (scene.fog as THREE.Fog | null)?.color.copy(sky);

    if (stars.current) stars.current.visible = daylight < 0.35;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#dff3ff', '#3d5a3a', 1]} />
      <directionalLight ref={sun} position={[40, 80, -35]} intensity={2} />
      <Stars ref={stars} radius={220} depth={40} count={1500} factor={6} fade speed={0.5} />
    </>
  );
}
