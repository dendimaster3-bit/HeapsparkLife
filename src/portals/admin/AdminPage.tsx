/**
 * /admin — approvals, moderation, founding partners, ad inventory and
 * basic stats. Requires the admin role (demo mode can grant it).
 */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { useSessionStore } from '@/store/useSessionStore';
import { Card, PortalShell, SignInPrompt, Tab, btn } from '../ui';
import { OverviewTab } from './OverviewTab';
import { BusinessesTab } from './BusinessesTab';
import { PromosTab } from './PromosTab';
import { PartnersTab } from './PartnersTab';
import { AdsTab } from './AdsTab';

type TabId = 'overview' | 'businesses' | 'promos' | 'partners' | 'ads';
const TABS: [TabId, string][] = [
  ['overview', 'Overview'],
  ['businesses', 'Businesses'],
  ['promos', 'Promos'],
  ['partners', 'Founding partners'],
  ['ads', 'Ads'],
];

export default function AdminPage() {
  const session = useSessionStore((s) => s.session);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabId>('overview');

  useEffect(() => {
    const check = () => void api.admin.isAdmin().then(setIsAdmin, () => setIsAdmin(false));
    check();
    return api.subscribe(check);
  }, [session]);

  if (!session) return <PortalShell title="Admin"><SignInPrompt text="Sign in with an admin account." /></PortalShell>;
  if (isAdmin === null) return <PortalShell title="Admin"><p>Loading…</p></PortalShell>;
  if (!isAdmin) {
    return (
      <PortalShell title="Admin">
        <Card title="Admins only">
          <p className="mb-3">This account doesn't have admin access.</p>
          {api.admin.becomeDemoAdmin && (
            <>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">Demo mode: you can give this account admin rights to try the panel. With the real backend, admin is a role set on the server.</p>
              <button className={btn.primary} onClick={() => void api.admin.becomeDemoAdmin!()}>Make me a demo admin</button>
            </>
          )}
        </Card>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Admin" nav={TABS.map(([id, label]) => <Tab key={id} active={tab === id} onClick={() => setTab(id)}>{label}</Tab>)}>
      {tab === 'overview' && <OverviewTab onGo={setTab} />}
      {tab === 'businesses' && <BusinessesTab />}
      {tab === 'promos' && <PromosTab />}
      {tab === 'partners' && <PartnersTab />}
      {tab === 'ads' && <AdsTab />}
    </PortalShell>
  );
}

/** Small hook: load admin data and reload on any change. */
export function useAdminData<T>(load: () => Promise<T>): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    // Signing out (or losing the role) mid-session must not crash the page.
    const run = () => void load().then(setData, () => setData(null));
    run();
    return api.subscribe(run);
    // `load` is a stable module-level function in every caller.
  }, [load]);
  return data;
}
