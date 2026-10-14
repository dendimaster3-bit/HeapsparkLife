/**
 * Landmark registry. Each landmark is its own lazy chunk, so the island
 * shows immediately and landmarks stream in right after. Add a landmark
 * by adding a component file here and a row in `data/landmarks.ts`.
 */
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import type { Landmark, LandmarkKind } from '@/types/geo';
import type { LandmarkProps } from './common';

const REGISTRY: Record<LandmarkKind, LazyExoticComponent<ComponentType<LandmarkProps>>> = {
  'le-morne': lazy(() => import('./LeMorne')),
  waterfront: lazy(() => import('./Waterfront')),
  'botanical-garden': lazy(() => import('./BotanicalGarden')),
  'grand-bassin': lazy(() => import('./GrandBassin')),
  'coloured-earth': lazy(() => import('./ColouredEarth')),
  'trou-aux-cerfs': lazy(() => import('./TrouAuxCerfs')),
  'ile-aux-cerfs': lazy(() => import('./IleAuxCerfs')),
  airport: lazy(() => import('./Airport')),
};

export function Landmarks({ landmarks }: { landmarks: Landmark[] }) {
  return (
    <group name="landmarks">
      {landmarks.map((l) => {
        const Component = REGISTRY[l.kind];
        return (
          <Suspense key={l.id} fallback={null}>
            <Component landmark={l} />
          </Suspense>
        );
      })}
    </group>
  );
}
