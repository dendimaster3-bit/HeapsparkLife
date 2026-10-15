/** Approve / reject / pause promos. */
import { api } from '@/api';
import { discountBadge } from '@/lib/promo';
import { Card, StatusBadge, btn } from '../ui';
import { useAdminData } from './AdminPage';

const load = () => api.admin.promos();

export function PromosTab() {
  const promos = useAdminData(load);
  if (!promos) return <p>Loading…</p>;
  const sorted = [...promos].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));
  return (
    <Card title="Promos">
      <ul className="space-y-2">
        {sorted.map((p) => {
          const expired = Date.parse(p.expiresAt) <= Date.now();
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
              <span className="rounded-lg bg-slate-900 px-2 py-1 text-sm font-black text-white dark:bg-white dark:text-slate-900">{discountBadge(p)}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{p.title}</span>
                <span className="block text-xs text-slate-500">
                  {p.businessName} · until {p.expiresAt.slice(0, 10)} · {p.quantityUnlocked}/{p.quantityLimit ?? '∞'} unlocked
                  {p.rules.firstVisitOnly && ' · first visit'}
                  {p.rules.minSpendRs && ` · min Rs ${p.rules.minSpendRs}`}
                  {p.isDemo && ' · demo'}
                </span>
              </span>
              <StatusBadge status={expired ? 'expired' : p.status} />
              {p.status === 'pending' && (
                <>
                  <button className={btn.good} onClick={() => void api.admin.setPromoStatus(p.id, 'active')}>✓ Approve</button>
                  <button className={btn.danger} onClick={() => void api.admin.setPromoStatus(p.id, 'expired')}>✕ Reject</button>
                </>
              )}
              {p.status === 'active' && <button className={btn.small} onClick={() => void api.admin.setPromoStatus(p.id, 'paused')}>Pause</button>}
              {p.status === 'paused' && <button className={btn.small} onClick={() => void api.admin.setPromoStatus(p.id, 'active')}>Resume</button>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
