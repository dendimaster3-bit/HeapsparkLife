/**
 * Mauritius time helpers. Mauritius is UTC+4 all year (no DST), so we
 * compute it from UTC rather than relying on the device's timezone.
 */
export const MAURITIUS_UTC_OFFSET_HOURS = 4;

/** Fractional hour of day (0–24) in Mauritius for a given instant. */
export function mauritiusHour(date: Date = new Date()): number {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return (h + MAURITIUS_UTC_OFFSET_HOURS) % 24;
}

/** "HH:MM" for a fractional hour. */
export function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Approximate sunrise/sunset (Mauritius varies ~05:45–07:00 / 17:45–18:50). */
export const SUNRISE = 6;
export const SUNSET = 18.5;

/**
 * Daylight factor 0 (night) → 1 (full day), with ~1h soft twilight on each
 * side so the scene fades instead of snapping.
 */
export function daylight(hour: number): number {
  const fade = 0.75;
  if (hour < SUNRISE - fade || hour > SUNSET + fade) return 0;
  if (hour < SUNRISE + fade) return (hour - (SUNRISE - fade)) / (2 * fade);
  if (hour > SUNSET - fade) return 1 - (hour - (SUNSET - fade)) / (2 * fade);
  return 1;
}
