/**
 * UI preferences (theme, language) persisted to localStorage, plus debug
 * toggles. Storage access is wrapped because it can throw in private modes.
 */
import { create } from 'zustand';
import type { Locale } from '@/i18n';

export type ThemePref = 'system' | 'light' | 'dark';

const read = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* ignore */ }
};

const params = new URLSearchParams(location.search);

interface UiState {
  theme: ThemePref;
  locale: Locale;
  /** `?debug` in the URL shows the FPS meter and time controls. */
  debug: boolean;
  /** Debug override of Mauritius hour (null = real time). */
  hourOverride: number | null;
  /** Set once the intro/loading card has been dismissed. */
  introDone: boolean;
  setTheme(t: ThemePref): void;
  setLocale(l: Locale): void;
  setHourOverride(h: number | null): void;
  finishIntro(): void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: (read('hs.theme') as ThemePref) || 'system',
  locale: (read('hs.locale') as Locale) || 'en',
  debug: params.has('debug'),
  hourOverride: params.has('hour') ? Number(params.get('hour')) : null,
  introDone: false,
  setTheme: (theme) => { write('hs.theme', theme); set({ theme }); },
  setLocale: (locale) => { write('hs.locale', locale); set({ locale }); },
  setHourOverride: (hourOverride) => set({ hourOverride }),
  finishIntro: () => set({ introDone: true }),
}));
