/** Opening-hours logic, always evaluated in Mauritius time (UTC+4). */
import type { Weekday, WeeklyHours } from '@/types/business';
import { MAURITIUS_UTC_OFFSET_HOURS } from './time';

const DAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Weekday in Mauritius for an instant. */
export function mauritiusWeekday(date: Date = new Date()): Weekday {
  const shifted = new Date(date.getTime() + MAURITIUS_UTC_OFFSET_HOURS * 3600_000);
  return DAYS[shifted.getUTCDay()];
}

/**
 * Is the business open at `hour` (fractional, Mauritius) on `day`?
 * Supports intervals past midnight, e.g. ["18:00", "02:00"].
 */
export function isOpenAt(hours: WeeklyHours, day: Weekday, hour: number): boolean {
  const minute = Math.floor(hour * 60);
  const prevDay = DAYS[(DAYS.indexOf(day) + 6) % 7];
  for (const [open, close] of hours[day] ?? []) {
    const o = toMinutes(open), c = toMinutes(close);
    if (c > o ? minute >= o && minute < c : minute >= o) return true;
  }
  // Yesterday's late-night interval spilling into today.
  for (const [open, close] of hours[prevDay] ?? []) {
    const o = toMinutes(open), c = toMinutes(close);
    if (c <= o && minute < c) return true;
  }
  return false;
}
