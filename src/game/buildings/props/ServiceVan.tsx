/** Home services: a branded van with a roof ladder parked alongside. */
import { Box, Cyl, type KitPartProps } from '../kit';

export default function ServiceVan({ spec, mats }: KitPartProps) {
  return (
    <group position={[spec.w / 2 + 0.75, 0, 0.3]}>
      <Box size={[0.8, 0.85, 1.5]} position={[0, 0.6, -0.15]} material={mats.brand} />
      <Box size={[0.8, 0.6, 0.5]} position={[0, 0.48, 0.82]} material={mats.brand} />
      <Box size={[0.72, 0.28, 0.05]} position={[0, 0.62, 1.08]} color="#bfdbfe" />
      {/* Logo stripe */}
      <Box size={[0.82, 0.18, 1]} position={[0, 0.55, -0.15]} material={mats.trim} />
      {[-0.42, 0.42].flatMap((x) =>
        [-0.5, 0.75].map((z) => (
          <Cyl key={`${x}${z}`} d={0.32} h={0.12} position={[x, 0.16, z]} rotation={[0, 0, Math.PI / 2]} color="#111827" />
        )),
      )}
      {/* Ladder */}
      {[-0.18, 0.18].map((x) => (
        <Box key={x} size={[0.04, 0.04, 1.4]} position={[x, 1.08, -0.15]} color="#cbd5e1" />
      ))}
      {[-0.7, -0.35, 0, 0.35].map((z) => (
        <Box key={z} size={[0.36, 0.03, 0.03]} position={[0, 1.08, z - 0.15]} color="#cbd5e1" />
      ))}
    </group>
  );
}
