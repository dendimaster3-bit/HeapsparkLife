/**
 * Everything inside the open district: roads, rivers, neighbourhoods,
 * nature, traffic, landmarks, businesses and ads. Only one district is
 * detailed at a time (keeps phones fast). When a district opens, its scene
 * "grows" up out of the board.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { useCameraStore } from '@/store/useCameraStore';
import type { WorldData } from '@/api';
import type { DistrictId } from '@/types/geo';
import { DistrictRoads } from './Roads';
import { DistrictRivers } from './Rivers';
import { Neighbourhoods } from './Neighbourhoods';
import { Nature } from './Nature';
import { Landmarks } from './landmarks';
import { Traffic } from '../ambient/Traffic';
import { BusinessLayer } from '../buildings/BusinessLayer';
import { AdLayer } from '../ads/AdLayer';

const GROW_SECONDS = 0.9;
/** Ease-out with a little overshoot ("pop"). */
const easeOutBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

function Scene({ id, world }: { id: DistrictId; world: WorldData }) {
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    start.current ??= clock.elapsedTime;
    const t = Math.min(1, (clock.elapsedTime - start.current) / GROW_SECONDS);
    g.scale.y = Math.max(0.001, easeOutBack(t));
  });
  return (
    <group ref={group} name={`district-${id}`}>
      <DistrictRoads id={id} />
      <DistrictRivers id={id} />
      <Neighbourhoods id={id} />
      <Nature id={id} />
      <Landmarks landmarks={world.landmarks.filter((l) => l.districtId === id)} />
      <BusinessLayer districtId={id} />
      <AdLayer />
      <Traffic id={id} />
    </group>
  );
}

export function DistrictScene({ world }: { world: WorldData }) {
  const districtId = useCameraStore((s) => s.districtId);
  const level = useCameraStore((s) => s.level);
  if (level === 'island' || !districtId) return null;
  // Keyed by district so switching districts replays the "opening".
  return <Scene key={districtId} id={districtId} world={world} />;
}
