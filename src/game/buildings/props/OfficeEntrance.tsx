/** Professional services: glass entrance canopy, brand flag and a rooftop antenna. */
import { Box, Cyl, type KitPartProps } from '../kit';

export default function OfficeEntrance({ spec, mats }: KitPartProps) {
  const z = spec.d / 2;
  return (
    <>
      {/* Glass curtain band */}
      <Box size={[spec.w * 0.3, spec.h * 0.8, 0.05]} position={[-spec.w * 0.3, spec.h * 0.5, z + 0.02]} material={mats.window} />
      {/* Entrance canopy */}
      <Box size={[0.9, 0.06, 0.6]} position={[0, 0.95, z + 0.3]} material={mats.trim} />
      {[-0.4, 0.4].map((x) => (
        <Cyl key={x} d={0.05} h={0.95} position={[x, 0.47, z + 0.55]} color="#94a3b8" />
      ))}
      {/* Flag */}
      <group position={[spec.w / 2 + 0.3, 0, z + 0.3]}>
        <Cyl d={0.05} h={2.2} position={[0, 1.1, 0]} color="#cbd5e1" />
        <Box size={[0.6, 0.38, 0.02]} position={[0.32, 1.95, 0]} material={mats.brand} />
      </group>
      {/* Antenna */}
      <Cyl d={0.04} h={1} position={[spec.w / 2 - 0.4, spec.top + 0.5, -spec.d / 4]} color="#94a3b8" />
      <Box size={[0.3, 0.3, 0.05]} position={[spec.w / 2 - 0.4, spec.top + 0.2, -spec.d / 4 + 0.15]} color="#e2e8f0" />
    </>
  );
}
