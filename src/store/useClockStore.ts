/**
 * Mauritius clock (UTC+4). Updated a few times per second by
 * `DayNightCycle`; 3D components read it inside useFrame via getState()
 * so the clock never triggers React re-renders of the scene.
 */
import { create } from 'zustand';
import { daylight, mauritiusHour } from '@/lib/time';

interface ClockState {
  hour: number;
  /** 0 = night … 1 = day. */
  daylight: number;
  tick(hour: number): void;
}

const h0 = mauritiusHour();
export const useClockStore = create<ClockState>((set) => ({
  hour: h0,
  daylight: daylight(h0),
  tick: (hour) => set({ hour, daylight: daylight(hour) }),
}));

/** 0 = day … 1 = night (handy for lights that switch on after dark). */
export const nightFactor = () => 1 - useClockStore.getState().daylight;
