/** Shared bits for landmark components. */
import type { ReactNode } from 'react';
import { groundPoint } from '@/lib/geo';
import type { Landmark } from '@/types/geo';

export interface LandmarkProps {
  landmark: Landmark;
}

/** Places children on the ground at the landmark's position and rotation. */
export function LandmarkRoot({ landmark, lift = 0, y, children }: LandmarkProps & { lift?: number; y?: number; children: ReactNode }) {
  const [x, gy, z] = groundPoint(landmark.at, lift);
  return (
    <group position={[x, y ?? gy, z]} rotation-y={((landmark.rotation ?? 0) * Math.PI) / 180} name={landmark.id}>
      {children}
    </group>
  );
}
