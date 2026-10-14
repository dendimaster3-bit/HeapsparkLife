/** Debug helper: measures FPS inside the render loop and publishes it. */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { create } from 'zustand';

export const useFpsStore = create<{ fps: number; drawCalls: number; triangles: number }>(() => ({
  fps: 0,
  drawCalls: 0,
  triangles: 0,
}));

export function FpsProbe() {
  const frames = useRef(0);
  const last = useRef(performance.now());
  useFrame(({ gl }) => {
    frames.current++;
    const now = performance.now();
    if (now - last.current >= 500) {
      useFpsStore.setState({
        fps: Math.round((frames.current * 1000) / (now - last.current)),
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      });
      frames.current = 0;
      last.current = now;
    }
  });
  return null;
}
