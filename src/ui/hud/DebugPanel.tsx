/** `?debug` panel: FPS, draw calls, triangles and a time-of-day slider. */
import { useT } from '@/i18n';
import { useFpsStore } from '@/game/FpsProbe';
import { useUiStore } from '@/store/useUiStore';
import { useClockStore } from '@/store/useClockStore';
import { formatHour } from '@/lib/time';

export function DebugPanel() {
  const t = useT();
  const { fps, drawCalls, triangles } = useFpsStore();
  const hour = useClockStore((s) => s.hour);
  const { hourOverride, setHourOverride } = useUiStore();
  return (
    <div className="absolute bottom-36 left-3 z-40 w-56 rounded-xl bg-black/75 p-3 font-mono text-xs text-white">
      <div className={fps >= 30 ? 'text-emerald-300' : 'text-red-300'}>{fps} FPS</div>
      <div>{drawCalls} draw calls</div>
      <div>{(triangles / 1000).toFixed(1)}k triangles</div>
      <label className="mt-2 block">
        {formatHour(hour)}
        <input
          type="range"
          min={0}
          max={23.9}
          step={0.1}
          value={hourOverride ?? hour}
          onChange={(e) => setHourOverride(Number(e.target.value))}
          className="w-full"
        />
      </label>
      <button className="mt-1 underline" onClick={() => setHourOverride(null)}>
        {t('debug.realTime')}
      </button>
    </div>
  );
}
