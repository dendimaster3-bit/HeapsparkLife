/**
 * Bottom sheet for quick navigation: district chips on the island view,
 * town chips (plus the district intro) once inside a district.
 */
import { useT } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { useWorldStore } from '@/store/useWorldStore';

const chip =
  'flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm transition active:scale-95';

export function Navigator() {
  const t = useT();
  const world = useWorldStore((s) => s.data);
  const { level, districtId, townId, goDistrict, goTown } = useCameraStore();
  if (!world) return null;

  const inDistrict = level !== 'island' && districtId;
  const towns = inDistrict ? world.towns.filter((tw) => tw.districtId === districtId) : [];

  return (
    <section className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-3xl bg-white/90 p-3 shadow-xl backdrop-blur dark:bg-slate-900/85">
        <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {inDistrict ? t('nav.towns') : t('nav.districts')}
        </h2>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {inDistrict
            ? towns.map((tw) => (
                <button
                  key={tw.id}
                  className={`${chip} ${
                    tw.id === townId
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                  onClick={() => goTown(tw.id)}
                >
                  {tw.name}
                </button>
              ))
            : world.districts.map((d) => (
                <button
                  key={d.id}
                  className={`${chip} bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100`}
                  onClick={() => goDistrict(d.id)}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </button>
              ))}
        </div>
        {level === 'island' && (
          <p className="hidden px-1 pt-1 text-xs text-slate-500 sm:block dark:text-slate-400">{t('hud.controls')}</p>
        )}
      </div>
    </section>
  );
}
