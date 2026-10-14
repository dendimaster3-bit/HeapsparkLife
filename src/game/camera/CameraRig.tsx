/**
 * Camera controller: map-style controls (drag = pan, pinch/scroll = zoom,
 * two fingers / right-drag = rotate) via camera-controls, plus smooth
 * fly-to transitions whenever the camera store requests a new target.
 */
import { useEffect, useRef } from 'react';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore, type CameraTarget } from '@/store/useCameraStore';
import { useUiStore } from '@/store/useUiStore';
import { ISLAND_BOUNDS, districtAt, project, signedDistance } from '@/lib/geo';
import { TOWNS } from '@/data/towns';

const { ACTION } = CameraControlsImpl;

/** Find the town nearest to a point (within 2.5 km). */
function townNear(x: number, z: number) {
  let best: string | null = null, bestD = 2.5;
  for (const t of TOWNS) {
    const [tx, tz] = project(t.at);
    const d = Math.hypot(x - tx, z - tz);
    if (d < bestD) { bestD = d; best = t.id; }
  }
  return best;
}

export function CameraRig() {
  const controls = useRef<CameraControlsImpl>(null);
  const requestId = useCameraStore((s) => s.requestId);
  const introDone = useUiStore((s) => s.introDone);

  // One-time setup.
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.minDistance = 0.5;
    c.maxDistance = 180;
    c.minPolarAngle = 0.1;
    c.maxPolarAngle = 1.2; // never look from below the horizon
    c.smoothTime = 0.45;
    c.draggingSmoothTime = 0.12;
    c.dollyToCursor = true;
    // SCREEN_PAN = drag slides the map along the ground (like a map app).
    c.mouseButtons.left = ACTION.SCREEN_PAN;
    c.mouseButtons.right = ACTION.ROTATE;
    c.mouseButtons.wheel = ACTION.DOLLY;
    c.touches.one = ACTION.TOUCH_SCREEN_PAN;
    c.touches.two = ACTION.TOUCH_DOLLY_ROTATE;
    c.touches.three = ACTION.TOUCH_ROTATE;
    const { minX, maxX, minZ, maxZ } = ISLAND_BOUNDS;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(minX - 6, -1, minZ - 6), new THREE.Vector3(maxX + 6, 4, maxZ + 6)));
    // Start far out; the intro "fly-in" happens once the player taps Start.
    applyTarget(c, { look: [0, 0, 0], distance: 170, polar: 0.35 }, false);

    // When the camera settles after a manual move, update level/district.
    const onRest = () => {
      const target = c.getTarget(new THREE.Vector3());
      const onLand = signedDistance(target.x, target.z) > 0;
      useCameraStore
        .getState()
        .syncFromControls(c.distance, onLand ? districtAt(target.x, target.z).id : null, townNear(target.x, target.z));
    };
    c.addEventListener('rest', onRest);
    return () => c.removeEventListener('rest', onRest);
  }, []);

  // Fly to the requested target (and do the intro fly-in).
  const getThree = useThree((s) => s.get);
  useEffect(() => {
    const c = controls.current;
    if (!c || !introDone) return;
    const target = useCameraStore.getState().target;
    const { width, height } = getThree().size;
    const aspect = width / height;
    // Pull back on narrow (portrait) screens so the whole area stays in frame.
    const fit = Math.min(1.6, Math.max(1, 1 / (aspect * 1.5)));
    applyTarget(c, { ...target, distance: target.distance * fit }, true);
  }, [requestId, introDone, getThree]);

  return <CameraControls ref={controls} makeDefault />;
}

/** Move to a target keeping the current compass heading (azimuth). */
function applyTarget(c: CameraControlsImpl, t: CameraTarget, animate: boolean) {
  const az = c.azimuthAngle;
  const [lx, ly, lz] = t.look;
  const sinP = Math.sin(t.polar);
  void c.setLookAt(
    lx + t.distance * sinP * Math.sin(az),
    ly + t.distance * Math.cos(t.polar),
    lz + t.distance * sinP * Math.cos(az),
    lx, ly, lz,
    animate,
  );
}
