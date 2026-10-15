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
import { DISTRICT_BOUNDS, ISLAND_BOUNDS, districtAt, project, signedDistance } from '@/lib/geo';
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
    c.minDistance = 0.8;
    c.maxDistance = 150;
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
    setIslandBoundary(c);
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

  // Panning stays inside the open district (or around the island on the map).
  const districtId = useCameraStore((s) => s.districtId);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (!districtId) return setIslandBoundary(c);
    const b = DISTRICT_BOUNDS[districtId];
    c.setBoundary(new THREE.Box3(new THREE.Vector3(b.minX - 1, -1, b.minZ - 1), new THREE.Vector3(b.maxX + 1, 4, b.maxZ + 1)));
  }, [districtId]);

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
    const distance = target.distance * fit;
    applyTarget(c, { ...target, distance }, true);

    // Keep a selected building visible beside/above the business card:
    // shift the view so it sits in the part of the screen the card leaves free.
    // (Signs verified in a browser: +x moves the target left, +y moves it up.)
    if (useCameraStore.getState().level === 'business') {
      const visibleH = 2 * distance * Math.tan(THREE.MathUtils.degToRad(45 / 2));
      const visibleW = visibleH * aspect;
      if (width >= 640) void c.setFocalOffset((210 / width) * visibleW, 0, 0, true); // side panel ~420px
      else void c.setFocalOffset(0, 0.22 * visibleH, 0, true); // bottom sheet
    } else {
      void c.setFocalOffset(0, 0, 0, true);
    }
  }, [requestId, introDone, getThree]);

  return <CameraControls ref={controls} makeDefault />;
}

function setIslandBoundary(c: CameraControlsImpl) {
  const { minX, maxX, minZ, maxZ } = ISLAND_BOUNDS;
  c.setBoundary(new THREE.Box3(new THREE.Vector3(minX - 6, -1, minZ - 6), new THREE.Vector3(maxX + 6, 4, maxZ + 6)));
}

/** Move to a target keeping the current compass heading (azimuth). */
function applyTarget(c: CameraControlsImpl, t: CameraTarget, animate: boolean) {
  // Take the shortest way round to a requested heading.
  let az = c.azimuthAngle;
  if (t.azimuth !== undefined) {
    const delta = Math.atan2(Math.sin(t.azimuth - az), Math.cos(t.azimuth - az));
    az += delta;
  }
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
