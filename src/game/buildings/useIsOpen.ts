/** Re-evaluates opening hours once per (Mauritius) minute. */
import { useClockStore } from '@/store/useClockStore';
import { isOpenAt, mauritiusWeekday } from '@/lib/hours';
import type { WeeklyHours } from '@/types/business';

export function useIsOpen(hours: WeeklyHours): boolean {
  // Selecting the minute (not the raw hour) keeps re-renders to 1/min.
  const minute = useClockStore((s) => Math.floor(s.hour * 60));
  return isOpenAt(hours, mauritiusWeekday(), minute / 60);
}
