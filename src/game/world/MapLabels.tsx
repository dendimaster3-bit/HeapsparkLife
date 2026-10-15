/**
 * Tappable map labels rendered as DOM (crisp text, real buttons, no font
 * download). Which labels show depends on the zoom level so the map never
 * gets cluttered:
 *   island   → the 9 district names
 *   district → towns + landmarks of that district (businesses label themselves)
 *   town     → towns + landmarks of that district
 */
import { Html } from '@react-three/drei';
import { useCameraStore } from '@/store/useCameraStore';
import { useUiStore } from '@/store/useUiStore';
import { groundPoint } from '@/lib/geo';
import type { WorldData } from '@/api';

const pill =
  'pointer-events-auto select-none whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold shadow-md transition active:scale-95';

export function MapLabels({ world }: { world: WorldData }) {
  const level = useCameraStore((s) => s.level);
  const districtId = useCameraStore((s) => s.districtId);
  const townId = useCameraStore((s) => s.townId);
  const goDistrict = useCameraStore((s) => s.goDistrict);
  const goTown = useCameraStore((s) => s.goTown);
  const introDone = useUiStore((s) => s.introDone);

  if (!introDone) return null;

  if (level === 'island') {
    return (
      <>
        {world.districts.map((d) => (
          <Html key={d.id} position={groundPoint(d.center, 0.6)} center zIndexRange={[20, 0]}>
            <button
              className={`${pill} flex min-h-11 items-center gap-2 bg-white/90 text-slate-800 hover:bg-white dark:bg-slate-900/90 dark:text-slate-100`}
              onClick={() => goDistrict(d.id)}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
              {d.name}
            </button>
          </Html>
        ))}
      </>
    );
  }

  // In town view the business chips take over; keep only the other towns' names.
  const towns = world.towns.filter((t) => t.districtId === districtId && !(level !== 'district' && t.id === townId));
  const landmarks = world.landmarks.filter((l) => l.districtId === districtId);

  return (
    <>
      {towns.map((t) => (
        <Html key={t.id} position={groundPoint(t.at, 1.4)} center zIndexRange={[20, 0]}>
          <button
            className={`${pill} min-h-10 ${
              t.id === townId
                ? 'bg-sky-600 text-white'
                : 'bg-white/90 text-slate-800 hover:bg-white dark:bg-slate-900/90 dark:text-slate-100'
            }`}
            onClick={() => goTown(t.id)}
          >
            {t.name}
          </button>
        </Html>
      ))}
      {landmarks.map((l) => (
        <Html key={l.id} position={groundPoint(l.at, l.kind === 'le-morne' ? 2.6 : 0.9)} center zIndexRange={[19, 0]}>
          <span className="pointer-events-none select-none whitespace-nowrap rounded-md bg-amber-100/90 px-2 py-0.5 text-xs font-medium text-amber-900 shadow dark:bg-amber-900/80 dark:text-amber-50">
            ★ {l.name}
          </span>
        </Html>
      ))}
    </>
  );
}
