/**
 * /kit — a showroom of every building style with toggles for each state.
 * Handy for designing new props and for business owners picking a look.
 */
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { BUILDING_STYLES } from '@/game/buildings/registry';
import { BuildingFull, GROWTH_SCALE } from '@/game/buildings/Building';
import { BASES, WINDOW_OPEN } from '@/game/buildings/kit';
import { PromoBeam } from '@/game/buildings/decorators/PromoBeam';
import type { BuildingStyleId, GrowthLevel } from '@/types/business';

const COLORS = ['#dc2626', '#0284c7', '#f59e0b', '#db2777', '#475569', '#16a34a', '#b45309', '#2563eb', '#d97706', '#7c3aed', '#0891b2'];
const COLS = 4;
const GAP = 8;

export default function KitGallery() {
  const [open, setOpen] = useState(true);
  const [promo, setPromo] = useState(false);
  const [gold, setGold] = useState(false);
  const [night, setNight] = useState(false);
  const [level, setLevel] = useState<GrowthLevel>(1);
  const styles = Object.entries(BUILDING_STYLES) as [BuildingStyleId, (typeof BUILDING_STYLES)[BuildingStyleId]][];
  const rows = Math.ceil(styles.length / COLS);

  useEffect(() => {
    WINDOW_OPEN.emissiveIntensity = night ? 1.3 : 0.25;
  }, [night]);

  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => (
    <button
      onClick={() => set(!value)}
      aria-pressed={value}
      className={`min-h-11 rounded-full px-4 text-sm font-semibold ${value ? 'bg-spark-500 text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 14, 20], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={[night ? '#0b1733' : '#bfe9fb']} />
        <hemisphereLight args={['#ffffff', '#64748b', night ? 0.5 : 1.4]} />
        <directionalLight position={[10, 20, 8]} intensity={night ? 0.3 : 2} />
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <planeGeometry args={[COLS * GAP + 10, rows * GAP + 10]} />
          <meshLambertMaterial color={night ? '#1e3a2f' : '#86c96b'} />
        </mesh>
        {styles.map(([id, style], i) => {
          const x = ((i % COLS) - (COLS - 1) / 2) * GAP;
          const z = (Math.floor(i / COLS) - (rows - 1) / 2) * GAP;
          const spec = BASES[style.base];
          return (
            <group key={id} position={[x, 0, z]}>
              <BuildingFull name={style.label} brand={COLORS[i % COLORS.length]} styleId={id} open={open} promo={promo} level={level} gold={gold} />
              {promo && <PromoBeam from={spec.top * GROWTH_SCALE[level] + 0.3} height={8} />}
              <Html position={[0, -0.2, spec.d / 2 + 2]} center>
                <span className="whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-800 shadow">
                  {style.label} · {style.base}
                </span>
              </Html>
            </group>
          );
        })}
        <OrbitControls makeDefault maxPolarAngle={1.45} target={[0, 0, 0]} />
      </Canvas>

      <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-2 p-3">
        <Link to="/" className="min-h-11 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow">
          ← Island
        </Link>
        <h1 className="mr-2 rounded-full bg-white/90 px-4 py-2 text-lg font-extrabold text-slate-900 shadow">Building kit</h1>
        {toggle('Open', open, setOpen)}
        {toggle('Promo', promo, setPromo)}
        {toggle('Founding gold', gold, setGold)}
        {toggle('Night', night, setNight)}
        {([1, 2, 3] as GrowthLevel[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            aria-pressed={level === l}
            className={`min-h-11 min-w-11 rounded-full text-sm font-semibold ${level === l ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'}`}
          >
            L{l}
          </button>
        ))}
      </div>
    </div>
  );
}
