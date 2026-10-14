/** App shell: theme, document language and the router. */
import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useApplyTheme } from '@/lib/useTheme';
import { useUiStore } from '@/store/useUiStore';
import { router } from '@/router';

export default function App() {
  useApplyTheme();
  const locale = useUiStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale === 'mfe' ? 'mfe' : locale;
  }, [locale]);
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
