/**
 * `?debug` only: exposes `window.__hsProject(name)` → screen [x, y] of a
 * named scene object and `window.__hsFocus(name)` to frame it, so automated
 * browser tests can tap buildings and ads.
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '@/store/useCameraStore';

declare global {
  interface Window {
    __hsProject?: (name: string) => [number, number] | null;
    __hsFocus?: (name: string, distance?: number) => boolean;
    __hsWorld?: (name: string) => [number, number, number] | null;
  }
}

export function DebugHooks() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    window.__hsProject = (name) => {
      const { scene, camera, size } = get();
      const obj = scene.getObjectByName(name);
      if (!obj) return null;
      const v = obj.getWorldPosition(new THREE.Vector3()).project(camera);
      return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
    };
    window.__hsWorld = (name) => {
      const obj = get().scene.getObjectByName(name);
      return obj ? (obj.getWorldPosition(new THREE.Vector3()).toArray() as [number, number, number]) : null;
    };
    // Fly the camera to a named object (keeps the current zoom level).
    window.__hsFocus = (name, distance = 1.2) => {
      const obj = get().scene.getObjectByName(name);
      if (!obj) return false;
      const p = obj.getWorldPosition(new THREE.Vector3());
      useCameraStore.setState((s) => ({ target: { look: [p.x, p.y + 0.2, p.z], distance, polar: 1.1 }, requestId: s.requestId + 1 }));
      return true;
    };
    return () => {
      delete window.__hsProject;
      delete window.__hsFocus;
      delete window.__hsWorld;
    };
  }, [get]);
  return null;
}
