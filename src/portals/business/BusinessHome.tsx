/** /business — the owner's businesses, a claim button and (demo) a way to try a demo business. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api';
import { SUBCATEGORIES_BY_ID } from '@/data/categories';
import { TOWNS_BY_ID } from '@/data/towns';
import { useSessionStore } from '@/store/useSessionStore';
import type { Business, MapBusiness } from '@/types/business';
import { Card, PortalShell, SignInPrompt, StatusBadge, btn, input } from '../ui';

export default function BusinessHome() {
  const session = useSessionStore((s) => s.session);
  const [mine, setMine] = useState<Business[] | null>(null);
  const [demos, setDemos] = useState<MapBusiness[]>([]);
  const [pick, setPick] = useState('');

  useEffect(() => {
    if (!session) return;
    const load = () => void api.business.mine().then(setMine);
    load();
    void api.directory.search({}).then((all) => setDemos(all.filter((b) => b.isDemo)));
    return api.subscribe(load);
  }, [session]);

  if (!session) {
    return (
      <PortalShell title="For businesses">
        <Card title="Put your business on the map 🏝️">
          <ul className="mb-4 list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
            <li>Claim a spot in your town and get a 3D building in your colours.</li>
            <li>Publish promo codes that players unlock and redeem in your shop.</li>
            <li>See views, calls, WhatsApp taps and redemptions.</li>
          </ul>
        </Card>
        <SignInPrompt text="Sign in or create an account to get started." />
      </PortalShell>
    );
  }

  return (
    <PortalShell title="My businesses">
      <div className="flex flex-wrap gap-2">
        <Link to="/business/claim" className={`${btn.primary} inline-flex items-center`}>＋ Claim a spot</Link>
        <Link to="/validate" className={`${btn.secondary} inline-flex items-center`}>✅ Validate a code</Link>
      </div>
      {mine === null ? (
        <p>Loading…</p>
      ) : mine.length === 0 ? (
        <Card><p>You haven't listed a business yet. Claim a spot to get started!</p></Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {mine.map((b) => (
            <li key={b.id}>
              <Link to={`/business/${b.id}`} className="flex min-h-20 items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 hover:ring-spark-500 dark:bg-slate-900 dark:ring-slate-800">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: `${b.brandColor}33` }} aria-hidden>{SUBCATEGORIES_BY_ID[b.subcategoryId]?.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{b.name}</span>
                  <span className="block text-sm text-slate-500">{SUBCATEGORIES_BY_ID[b.subcategoryId]?.name} · {TOWNS_BY_ID[b.townId]?.name}</span>
                </span>
                <StatusBadge status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {api.business.demoTakeOver && (
        <Card title="Demo: manage a demo business">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">To try the dashboard with existing data, take over one of the demo businesses. (Demo mode only.)</p>
          <div className="flex flex-wrap gap-2">
            <select className={`${input} max-w-xs`} value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">Choose a demo business…</option>
              {demos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button className={btn.secondary} disabled={!pick} onClick={() => void api.business.demoTakeOver!(pick)}>Manage it</button>
          </div>
        </Card>
      )}
    </PortalShell>
  );
}
