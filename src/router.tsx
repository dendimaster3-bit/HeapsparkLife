/**
 * Routes. Only the game is in the main bundle; the business portal,
 * validation page, admin and kit gallery are separate lazy chunks.
 */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import GamePage from '@/ui/GamePage';

const ComingSoon = lazy(() => import('@/portals/ComingSoon'));
const KitGallery = lazy(() => import('@/portals/KitGallery'));

export const router = createBrowserRouter(
  [
    { path: '/', element: <GamePage /> },
    { path: '/kit', element: <KitGallery /> },
    { path: '/business/*', element: <ComingSoon title="Business portal" step="g" /> },
    { path: '/validate', element: <ComingSoon title="Validate a promo code" step="d" /> },
    { path: '/admin/*', element: <ComingSoon title="Admin panel" step="g" /> },
    { path: '*', element: <GamePage /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
