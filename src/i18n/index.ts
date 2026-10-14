/**
 * Tiny i18n: `t(key, vars)` with English fallback. No library needed —
 * locales are plain objects so they tree-shake and type-check.
 */
import { en, type TranslationKey } from './locales/en';
import { fr } from './locales/fr';
import { mfe } from './locales/mfe';
import { useUiStore } from '@/store/useUiStore';

export type Locale = 'en' | 'fr' | 'mfe';
export type { TranslationKey };

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
  { id: 'mfe', label: 'Kreol Morisien' },
];

const TABLES: Record<Locale, Partial<Record<TranslationKey, string>>> = { en, fr, mfe };

export function translate(locale: Locale, key: TranslationKey, vars?: Record<string, string | number>) {
  let s = TABLES[locale]?.[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

/** React hook returning a `t` bound to the current locale. */
export function useT() {
  const locale = useUiStore((s) => s.locale);
  return (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
}
