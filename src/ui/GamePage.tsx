/** The player-facing game: 3D canvas underneath, React/Tailwind HUD on top. */
import { lazy, Suspense, useEffect, useState } from 'react';
import { useWorldStore } from '@/store/useWorldStore';
import { useUiStore } from '@/store/useUiStore';
import { IntroOverlay } from './common/IntroOverlay';
import { TopBar } from './hud/TopBar';
import { Navigator } from './hud/Navigator';
import { DistrictToast } from './hud/DistrictToast';
import { DebugPanel } from './hud/DebugPanel';
import { BusinessPeek } from './hud/BusinessPeek';
import { useCameraStore } from '@/store/useCameraStore';

// The 3D engine is its own chunk so the intro paints instantly.
const GameCanvas = lazy(() => import('@/game/GameCanvas'));

export default function GamePage() {
  const world = useWorldStore((s) => s.data);
  const error = useWorldStore((s) => s.error);
  const load = useWorldStore((s) => s.load);
  const introDone = useUiStore((s) => s.introDone);
  const debug = useUiStore((s) => s.debug);
  const [sceneReady, setSceneReady] = useState(false);
  const level = useCameraStore((s) => s.level);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {world && (
        <Suspense fallback={null}>
          <GameCanvas world={world} onReady={() => setSceneReady(true)} />
        </Suspense>
      )}
      {introDone && (
        <>
          <TopBar />
          {level === 'business' ? <BusinessPeek /> : <Navigator />}
          <DistrictToast />
        </>
      )}
      {debug && <DebugPanel />}
      {!introDone && <IntroOverlay ready={sceneReady} error={error} />}
    </div>
  );
}
