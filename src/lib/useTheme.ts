/** Applies the light/dark theme to <html>, following the OS when set to "system". */
import { useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';

export function useApplyTheme() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
