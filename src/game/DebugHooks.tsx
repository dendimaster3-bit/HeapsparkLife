/**
 * `?debug` only: exposes `window.__hsProject(name)` → screen [x, y] of a
 * named scene object, so automated browser tests can tap buildings.
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

declare global {
  interface Window {
    __hsProject?: (name: string) => [number, number] | null;
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
    return () => {
      delete window.__hsProject;
    };
  }, [get]);
  return null;
}
