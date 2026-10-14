/** Weekly opening hours, today highlighted. */
import { useT, type TranslationKey } from '@/i18n';
import { WEEK, formatDay, mauritiusWeekday } from '@/lib/hours';
import type { WeeklyHours } from '@/types/business';

export function HoursTable({ hours }: { hours: WeeklyHours }) {
  const t = useT();
  const today = mauritiusWeekday();
  return (
    <table className="w-full text-sm">
      <tbody>
        {WEEK.map((d) => {
          const text = formatDay(hours, d);
          const isToday = d === today;
          return (
            <tr key={d} className={isToday ? 'font-bold' : ''}>
              <th scope="row" className="py-1 pr-3 text-left font-medium">
                {t(`day.${d}` as TranslationKey)}
                {isToday && <span className="ml-1 text-xs font-semibold text-spark-600 dark:text-spark-400">({t('card.today')})</span>}
              </th>
              <td className={`py-1 text-right tabular-nums ${text ? '' : 'text-slate-500 dark:text-slate-400'}`}>
                {text ?? t('card.closedDay')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
