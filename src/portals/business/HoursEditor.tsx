/** Weekly opening hours: per day open/closed + one or two time ranges. */
import type { Weekday, WeeklyHours } from '@/types/business';
import { WEEK } from '@/lib/hours';
import { btn, input } from '../ui';

const LABEL: Record<Weekday, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

export function HoursEditor({ value, onChange }: { value: WeeklyHours; onChange: (h: WeeklyHours) => void }) {
  const set = (day: Weekday, ranges: [string, string][] | undefined) => {
    const next = { ...value };
    if (ranges?.length) next[day] = ranges;
    else delete next[day];
    onChange(next);
  };
  const copyMonday = () => {
    const mon = value.mon;
    if (!mon) return;
    const next: WeeklyHours = { ...value };
    for (const d of WEEK) if (d !== 'sun') next[d] = mon.map((r) => [...r] as [string, string]);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {WEEK.map((d) => {
        const ranges = value[d];
        return (
          <div key={d} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2 dark:bg-slate-800/60">
            <label className="flex min-h-11 w-32 items-center gap-2 font-semibold">
              <input type="checkbox" className="h-5 w-5 accent-spark-500" checked={!!ranges} onChange={(e) => set(d, e.target.checked ? [['08:30', '17:00']] : undefined)} />
              {LABEL[d]}
            </label>
            {ranges ? (
              ranges.map(([o, c], i) => (
                <span key={i} className="flex items-center gap-1">
                  <input type="time" aria-label={`${LABEL[d]} opens`} className={`${input} w-28`} value={o} onChange={(e) => set(d, ranges.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} />
                  <span aria-hidden>–</span>
                  <input type="time" aria-label={`${LABEL[d]} closes`} className={`${input} w-28`} value={c} onChange={(e) => set(d, ranges.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} />
                  {i === 1 && <button type="button" className={btn.small} onClick={() => set(d, [ranges[0]])} aria-label="Remove second time range">✕</button>}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">Closed</span>
            )}
            {ranges && ranges.length === 1 && (
              <button type="button" className={btn.small} onClick={() => set(d, [...ranges, ['18:00', '22:00']])}>+ evening</button>
            )}
          </div>
        );
      })}
      <button type="button" className={btn.small} onClick={copyMonday} disabled={!value.mon}>Copy Monday to Mon–Sat</button>
      <p className="text-xs text-slate-500">Times are Mauritius time. A closing time earlier than the opening time means "past midnight".</p>
    </div>
  );
}
