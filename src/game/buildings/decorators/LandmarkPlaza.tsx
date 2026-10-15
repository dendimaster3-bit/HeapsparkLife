/**
 * District Founding Partner: the building becomes a landmark — a round
 * plaza with gold bollards and tall flags in the brand colour.
 */
import { Cyl, GOLD, lambert, type BaseSpec } from '../kit';

export function LandmarkPlaza({ spec, brand }: { spec: BaseSpec; brand: string }) {
  const r = Math.max(spec.w, spec.d) * 1.15;
  const flag = lambert(brand);
  return (
    <group>
      <Cyl d={r * 2} h={0.1} position-y={0.02} color="#e7e5e4" />
      <Cyl d={r * 2 - 0.25} h={0.1} position-y={0.04} color="#f5f5f4" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <Cyl key={i} d={0.12} h={0.35} position={[Math.cos(a) * r * 0.97, 0.2, Math.sin(a) * r * 0.97]} material={GOLD} />;
      })}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (spec.w / 2 + 0.9), 0, spec.d / 2 + 0.6]}>
          <Cyl d={0.07} h={4.2} position-y={2.1} material={GOLD} />
          <mesh position={[0.45 * -s, 3.85, 0]} scale={[0.9, 0.55, 0.03]} material={flag}>
            <boxGeometry />
          </mesh>
        </group>
      ))}
    </group>
  );
}
