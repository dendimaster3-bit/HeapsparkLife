/**
 * Growth levels: level 2 adds planters and a brand flag, level 3 adds a
 * rooftop neon strip and a bigger flag. (Scale is applied by Building.)
 */
import { Ball, Box, Cyl, type KitPartProps } from '../kit';
import type { GrowthLevel } from '@/types/business';

export function GrowthExtras({ spec, mats, open, level }: KitPartProps & { level: GrowthLevel }) {
  if (level < 2) return null;
  const z = spec.d / 2 + 0.3;
  return (
    <>
      {/* Planters along the front */}
      {[-spec.w / 2 - 0.15, -spec.w / 2 + 0.35].map((x) => (
        <group key={x} position={[x, 0, z]}>
          <Box size={[0.22, 0.2, 0.22]} position={[0, 0.1, 0]} color="#a8a29e" />
          <Ball d={0.3} low position={[0, 0.32, 0]} color="#16a34a" />
        </group>
      ))}
      {/* Flag pole */}
      <group position={[-spec.w / 2 - 0.45, 0, -spec.d / 2 + 0.2]}>
        <Cyl d={0.05} h={level === 3 ? 3.4 : 2.4} position={[0, level === 3 ? 1.7 : 1.2, 0]} color="#e2e8f0" />
        <Box size={[0.65, 0.4, 0.02]} position={[0.34, level === 3 ? 3.15 : 2.15, 0]} material={mats.brand} />
      </group>
      {level === 3 && (
        // Neon trim around the roof edge, lit when open.
        <Box
          size={[spec.w + 0.14, 0.07, spec.d + 0.14]}
          position={[0, spec.h + 0.02, 0]}
          material={open ? mats.window : mats.brandDark}
        />
      )}
    </>
  );
}
