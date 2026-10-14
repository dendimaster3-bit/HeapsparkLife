/** Bakery: a brick chimney puffing smoke and a big baguette sign. */
import { Box, Cyl, lambert, type KitPartProps } from '../kit';
import { Puffs } from '../parts/Puffs';

const CRUST = lambert('#d4a056');

export default function BakeryChimney({ spec, open }: KitPartProps) {
  const cx = spec.w / 2 - 0.35;
  return (
    <>
      <Box size={[0.35, 0.9, 0.35]} position={[cx, spec.top + 0.2, -spec.d / 4]} color="#b45309" />
      {open && <Puffs position={[cx, spec.top + 0.7, -spec.d / 4]} count={7} color="#e2e8f0" size={0.4} rise={1.8} life={3.5} drift={0.5} />}
      {/* Baguette sign on a post */}
      <group position={[-spec.w / 2 - 0.35, 0, spec.d / 2 + 0.25]}>
        <Cyl d={0.07} h={1.6} position={[0, 0.8, 0]} color="#64748b" />
        <group position={[0, 1.65, 0]} rotation={[0, 0, 0.25]}>
          <Cyl d={0.26} h={1.1} rotation={[0, 0, Math.PI / 2]} material={CRUST} />
          {[-0.3, 0, 0.3].map((x) => (
            <Box key={x} size={[0.05, 0.03, 0.2]} position={[x, 0.12, 0]} rotation={[0, 0.5, 0]} color="#f5deb3" />
          ))}
        </group>
      </group>
    </>
  );
}
