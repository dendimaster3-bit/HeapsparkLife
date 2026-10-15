/** Anonymous interaction events, kept in localStorage (capped) in demo mode. */
import type { AnalyticsEvent } from '@/types/business';

const EVENTS_KEY = 'hs.events';
const MAX_EVENTS = 5000;

export function readEvents(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export function writeEvent(e: AnalyticsEvent) {
  try {
    const events = readEvents();
    events.push(e);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* storage unavailable: tracking is best-effort */
  }
}
