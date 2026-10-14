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

export const WEEK: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** "08:30–17:30, 19:00–22:00" or null when closed all day. */
export function formatDay(hours: WeeklyHours, day: Weekday): string | null {
  const iv = hours[day];
  if (!iv?.length) return null;
  return iv.map(([o, c]) => `${o}–${c}`).join(', ');
}

export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; opensDay: Weekday | null; opensAt: string | null; today: boolean };

/** Open now? If so until when; if not, when it next opens (within a week). */
export function openStatus(hours: WeeklyHours, day: Weekday, hour: number): OpenStatus {
  const minute = Math.floor(hour * 60);
  if (isOpenAt(hours, day, hour)) {
    // Find the interval we're in (today's, or yesterday's spilling over).
    const prev = DAYS[(DAYS.indexOf(day) + 6) % 7];
    for (const [o, c] of hours[day] ?? []) {
      const om = toMinutes(o), cm = toMinutes(c);
      if (cm > om ? minute >= om && minute < cm : minute >= om) return { open: true, closesAt: c };
    }
    for (const [o, c] of hours[prev] ?? []) {
      if (toMinutes(c) <= toMinutes(o) && minute < toMinutes(c)) return { open: true, closesAt: c };
    }
  }
  const start = DAYS.indexOf(day);
  for (let i = 0; i < 8; i++) {
    const d = DAYS[(start + i) % 7];
    const opens = (hours[d] ?? [])
      .map(([o]) => o)
      .filter((o) => i > 0 || toMinutes(o) > minute)
      .sort();
    if (opens.length) return { open: false, opensDay: d, opensAt: opens[0], today: i === 0 };
  }
  return { open: false, opensDay: null, opensAt: null, today: false };
}
