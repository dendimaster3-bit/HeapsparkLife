/**
 * The 3D scene. Mobile-first settings: capped pixel ratio (auto-lowered if
 * FPS drops), no shadows, cheap Lambert materials, instancing everywhere.
 */
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import type { WorldData } from '@/api';
import { useUiStore } from '@/store/useUiStore';
import { CameraRig } from './camera/CameraRig';
import { Island } from './world/Island';
import { Water } from './world/Water';
import { Roads } from './world/Roads';
import { Towns } from './world/Towns';
import { Vegetation } from './world/Vegetation';
import { Landmarks } from './world/landmarks';
import { MapLabels } from './world/MapLabels';
import { DayNightCycle } from './ambient/DayNightCycle';
import { Traffic } from './ambient/Traffic';
import { Boats } from './ambient/Boats';
import { Plane } from './ambient/Plane';
import { FpsProbe } from './FpsProbe';
import { DebugHooks } from './DebugHooks';
import { BusinessLayer } from './buildings/BusinessLayer';
import { AdLayer } from './ads/AdLayer';

export default function GameCanvas({ world, onReady }: { world: WorldData; onReady?: () => void }) {
  const [dpr, setDpr] = useState(Math.min(1.5, window.devicePixelRatio));
  const debug = useUiStore((s) => s.debug);

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 45, near: 0.1, far: 600, position: [0, 120, 120] }}
      gl={{ antialias: dpr < 1.5, powerPreference: 'high-performance' }}
      onCreated={() => onReady?.()}
      className="!absolute inset-0 touch-none"
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(Math.min(1.5, window.devicePixelRatio), d + 0.25))}
      />
      <DayNightCycle />
      <CameraRig />
      <Water />
      <Island />
      <Roads />
      <Towns towns={world.towns} />
      <Vegetation />
      <Suspense fallback={null}>
        <Landmarks landmarks={world.landmarks} />
      </Suspense>
      <Traffic />
      <Boats />
      <Plane />
      <BusinessLayer />
      <AdLayer />
      <MapLabels world={world} />
      {debug && (
        <>
          <FpsProbe />
          <DebugHooks />
        </>
      )}
    </Canvas>
  );
}
