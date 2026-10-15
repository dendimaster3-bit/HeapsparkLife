/** Approve, reject, suspend and moderate businesses; toggle Founding Member. */
import { useState } from 'react';
import { api } from '@/api';
import { SUBCATEGORIES_BY_ID } from '@/data/categories';
import { TOWNS_BY_ID } from '@/data/towns';
import type { ApprovalStatus, Business } from '@/types/business';
import { Card, StatusBadge, Tab, btn } from '../ui';
import { useAdminData } from './AdminPage';

const load = () => api.admin.businesses();
const FILTERS: (ApprovalStatus | 'all')[] = ['pending', 'approved', 'rejected', 'suspended', 'all'];

function Row({ b }: { b: Business }) {
  const [open, setOpen] = useState(b.status === 'pending');
  const [error, setError] = useState<string | null>(null);
  const act = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error && e.message === 'plot-taken' ? 'Another approved business already uses this plot.' : e instanceof Error && e.message === 'founding-full' ? 'All 100 Founding Member places are used.' : 'Action failed.');
    }
  };
  const withNote = (status: ApprovalStatus) => {
    const note = prompt(`Reason shown to the owner (${status}):`) ?? undefined;
    void act(() => api.admin.setBusinessStatus(b.id, status, note));
  };
  return (
    <li className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
      <button className="flex w-full flex-wrap items-center gap-2 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="h-4 w-4 rounded-full" style={{ background: b.brandColor }} aria-hidden />
        <span className="font-bold">{b.name}</span>
        <span className="text-sm text-slate-500">{SUBCATEGORIES_BY_ID[b.subcategoryId]?.name} · {TOWNS_BY_ID[b.townId]?.name}</span>
        {b.isDemo && <span className="text-xs text-slate-500">(demo)</span>}
        {b.isFoundingMember && <span className="text-xs font-bold text-amber-600">★ FM #{b.foundingMemberNo}</span>}
        <span className="flex-1" />
        <StatusBadge status={b.status} />
      </button>
      {open && (
        <div className="mt-3 space-y-3 text-sm">
          {b.description && <p>{b.description}</p>}
          <p className="text-slate-600 dark:text-slate-300">
            {[b.phone && `📞 ${b.phone}`, b.whatsapp && `💬 ${b.whatsapp}`, b.website && `🌐 ${b.website}`].filter(Boolean).join(' · ')} · plot {b.plotId} · created {b.createdAt.slice(0, 10)}
          </p>
          {(b.logoUrl || b.photos.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {b.logoUrl && <img src={b.logoUrl} alt="Logo" className="h-20 w-20 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200" />}
              {b.photos.map((p, i) => (
                <span key={i} className="relative">
                  <img src={p} alt={`Photo ${i + 1}`} className="h-20 w-28 rounded-xl object-cover" />
                  <button className="absolute -right-2 -top-2 rounded-full bg-white px-2 text-xs font-bold text-red-700 shadow" onClick={() => void act(() => api.admin.removePhoto(b.id, i))} aria-label={`Remove photo ${i + 1}`}>Remove</button>
                </span>
              ))}
            </div>
          )}
          {b.moderationNote && <p className="text-amber-700 dark:text-amber-300">Note: {b.moderationNote}</p>}
          <div className="flex flex-wrap gap-2">
            {b.status !== 'approved' && <button className={btn.good} onClick={() => void act(() => api.admin.setBusinessStatus(b.id, 'approved'))}>✓ Approve</button>}
            {b.status === 'pending' && <button className={btn.danger} onClick={() => withNote('rejected')}>✕ Reject</button>}
            {b.status === 'approved' && <button className={btn.danger} onClick={() => withNote('suspended')}>⛔ Suspend</button>}
            <button className={btn.small} onClick={() => void act(() => api.admin.setFoundingMember(b.id, !b.isFoundingMember))}>
              {b.isFoundingMember ? 'Remove Founding Member' : 'Make Founding Member'}
            </button>
          </div>
          {error && <p role="alert" className="font-semibold text-red-600">{error}</p>}
        </div>
      )}
    </li>
  );
}

export function BusinessesTab() {
  const all = useAdminData(load);
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('pending');
  if (!all) return <p>Loading…</p>;
  const list = all.filter((b) => filter === 'all' || b.status === filter);
  return (
    <Card title="Businesses">
      <div className="no-scrollbar mb-3 flex gap-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <Tab key={f} active={filter === f} onClick={() => setFilter(f)}>
            <span className="capitalize">{f}</span> ({f === 'all' ? all.length : all.filter((b) => b.status === f).length})
          </Tab>
        ))}
      </div>
      {list.length ? <ul className="space-y-2">{list.map((b) => <Row key={b.id} b={b} />)}</ul> : <p className="text-slate-500">Nothing here.</p>}
    </Card>
  );
}
