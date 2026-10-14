/** Restaurant: a terrace with parasol tables, steam from the kitchen vent. */
import { Box, Cone, Cyl, type KitPartProps } from '../kit';
import { Puffs } from '../parts/Puffs';

const TABLES: [number, number][] = [[-0.45, -0.35], [0.45, -0.35], [0, 0.45]];

export default function Terrace({ spec, mats, open }: KitPartProps) {
  return (
    <>
      <group position={[spec.w / 2 + 0.9, 0, 0.2]}>
        <Box size={[1.7, 0.1, 1.8]} position={[0, 0.05, 0]} color="#b08158" />
        {TABLES.map(([x, z]) => (
          <group key={`${x}${z}`} position={[x, 0.1, z]}>
            <Cyl d={0.45} h={0.05} position={[0, 0.38, 0]} color="#f8fafc" />
            <Cyl d={0.05} h={1} position={[0, 0.5, 0]} color="#64748b" />
            <Cone d={0.85} h={0.28} position={[0, 1.05, 0]} material={mats.brand} />
          </group>
        ))}
      </group>
      {/* Kitchen vent on the roof */}
      <Box size={[0.25, 0.4, 0.25]} position={[-spec.w / 2 + 0.4, spec.top + 0.1, -spec.d / 4]} color="#94a3b8" />
      {open && <Puffs position={[-spec.w / 2 + 0.4, spec.top + 0.35, -spec.d / 4]} count={6} size={0.35} rise={1.4} />}
    </>
  );
}
