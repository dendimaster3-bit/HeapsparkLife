/** /business/:id — one business: details, promos, stats, advertising, validation. */
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '@/api';
import { useSessionStore } from '@/store/useSessionStore';
import type { Business } from '@/types/business';
import { BusinessForm, draftErrors, type BusinessDraft } from './BusinessForm';
import { PromoManager } from './PromoManager';
import { StatsPanel } from './StatsPanel';
import { AdvertisePanel } from './AdvertisePanel';
import { Card, PortalShell, SignInPrompt, StatusBadge, Tab, btn } from '../ui';

type TabId = 'details' | 'promos' | 'stats' | 'ads';

export default function ManageBusiness() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const session = useSessionStore((s) => s.session);
  const [business, setBusiness] = useState<Business | null | undefined>(undefined);
  const [draft, setDraft] = useState<BusinessDraft | null>(null);
  const [tab, setTab] = useState<TabId>('details');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => void api.business.get(id).then((b) => setBusiness(b && b.ownerId === session?.player.id ? b : null));
    load();
    return api.subscribe(load);
  }, [id, session]);

  useEffect(() => {
    if (business && !draft) {
      const { name, subcategoryId, brandColor, baseOverride, logoUrl, photos, description, phone, whatsapp, website, hours } = business;
      setDraft({ name, subcategoryId, brandColor, baseOverride, logoUrl, photos, description, phone, whatsapp, website, hours });
    }
  }, [business, draft]);

  if (!session) return <PortalShell title="Manage business"><SignInPrompt text="Sign in to manage your business." /></PortalShell>;
  if (business === undefined) return <PortalShell title="Manage business"><p>Loading…</p></PortalShell>;
  if (business === null) return <PortalShell title="Manage business"><Card><p>This business isn't linked to your account. <Link className="underline" to="/business">Back</Link></p></Card></PortalShell>;

  const save = async () => {
    if (!draft) return;
    setError(null);
    try {
      await api.business.update(business.id, draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error && e.message === 'storage-full' ? 'Browser storage is full (demo mode) — try smaller photos.' : 'Could not save.');
    }
  };

  const nav = (
    <>
      <Tab active={tab === 'details'} onClick={() => setTab('details')}>Details</Tab>
      <Tab active={tab === 'promos'} onClick={() => setTab('promos')}>Promos</Tab>
      <Tab active={tab === 'stats'} onClick={() => setTab('stats')}>Stats</Tab>
      <Tab active={tab === 'ads'} onClick={() => setTab('ads')}>Advertise</Tab>
    </>
  );

  return (
    <PortalShell title={business.name} nav={nav}>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={business.status} />
          {business.isFoundingMember && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">★ Founding Member #{business.foundingMemberNo}</span>}
          <span className="flex-1 text-sm text-slate-600 dark:text-slate-300">
            {business.status === 'pending' && (params.get('new') ? '🎉 Submitted! We\'ll review your listing shortly.' : 'Waiting for approval by the Heapspark team.')}
            {business.status === 'approved' && 'Live on the map.'}
            {(business.status === 'rejected' || business.status === 'suspended') && `Not visible on the map${business.moderationNote ? `: ${business.moderationNote}` : '.'}`}
          </span>
          {business.status === 'approved' && <Link className={btn.small + ' inline-flex items-center'} to={`/?b=${business.id}`}>🗺️ See it on the map</Link>}
          <Link className={btn.small + ' inline-flex items-center'} to="/validate">✅ Validate codes</Link>
        </div>
      </Card>

      {tab === 'details' && draft && (
        <>
          <BusinessForm value={draft} onChange={setDraft} />
          <div className="sticky bottom-3 flex items-center gap-3 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur dark:bg-slate-900/90">
            <button className={btn.primary} disabled={draftErrors(draft).length > 0} onClick={() => void save()}>Save changes</button>
            <span className="text-sm" role="status">{saved ? '✓ Saved' : draftErrors(draft)[0] ?? ''}</span>
            {error && <span role="alert" className="text-sm font-semibold text-red-600">{error}</span>}
          </div>
        </>
      )}
      {tab === 'promos' && <PromoManager businessId={business.id} />}
      {tab === 'stats' && <StatsPanel businessId={business.id} />}
      {tab === 'ads' && <AdvertisePanel business={business} />}
    </PortalShell>
  );
}
