/**
 * Routes. Only the game is in the main bundle; the business portal,
 * validation page, admin and kit gallery are separate lazy chunks.
 */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import GamePage from '@/ui/GamePage';

const ComingSoon = lazy(() => import('@/portals/ComingSoon'));
const KitGallery = lazy(() => import('@/portals/KitGallery'));
const ValidatePage = lazy(() => import('@/portals/validate/ValidatePage'));
const LegalPage = lazy(() => import('@/ui/legal/LegalPage'));

export const router = createBrowserRouter(
  [
    { path: '/', element: <GamePage /> },
    { path: '/kit', element: <KitGallery /> },
    { path: '/business/*', element: <ComingSoon title="Business portal" step="g" /> },
    { path: '/validate', element: <ValidatePage /> },
    { path: '/privacy', element: <LegalPage doc="privacy" /> },
    { path: '/terms', element: <LegalPage doc="terms" /> },
    { path: '/admin/*', element: <ComingSoon title="Admin panel" step="g" /> },
    { path: '*', element: <GamePage /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
