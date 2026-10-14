/**
 * Routes. Only the game is in the main bundle; the business portal,
 * validation page and admin are separate lazy chunks.
 */
import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useApplyTheme } from '@/lib/useTheme';
import { useUiStore } from '@/store/useUiStore';
import GamePage from '@/ui/GamePage';

const ComingSoon = lazy(() => import('@/portals/ComingSoon'));

const router = createBrowserRouter(
  [
    { path: '/', element: <GamePage /> },
    { path: '/business/*', element: <ComingSoon title="Business portal" step="b–g" /> },
    { path: '/validate', element: <ComingSoon title="Validate a promo code" step="d" /> },
    { path: '/admin/*', element: <ComingSoon title="Admin panel" step="g" /> },
    { path: '*', element: <GamePage /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);

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
