/**
 * Routes. Only the game is in the main bundle; the business portal,
 * validation page, admin and kit gallery are separate lazy chunks.
 */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import GamePage from '@/ui/GamePage';
import ErrorScreen from '@/ui/common/ErrorScreen';

const KitGallery = lazy(() => import('@/portals/KitGallery'));
const BusinessHome = lazy(() => import('@/portals/business/BusinessHome'));
const ClaimWizard = lazy(() => import('@/portals/business/ClaimWizard'));
const ManageBusiness = lazy(() => import('@/portals/business/ManageBusiness'));
const AdminPage = lazy(() => import('@/portals/admin/AdminPage'));
const ValidatePage = lazy(() => import('@/portals/validate/ValidatePage'));
const LegalPage = lazy(() => import('@/ui/legal/LegalPage'));

export const router = createBrowserRouter(
  [
    {
      errorElement: <ErrorScreen />,
      children: [
    { path: '/', element: <GamePage /> },
    { path: '/kit', element: <KitGallery /> },
    { path: '/business', element: <BusinessHome /> },
    { path: '/business/claim', element: <ClaimWizard /> },
    { path: '/business/:id', element: <ManageBusiness /> },
    { path: '/validate', element: <ValidatePage /> },
    { path: '/privacy', element: <LegalPage doc="privacy" /> },
    { path: '/terms', element: <LegalPage doc="terms" /> },
    { path: '/admin', element: <AdminPage /> },
    { path: '*', element: <GamePage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);
