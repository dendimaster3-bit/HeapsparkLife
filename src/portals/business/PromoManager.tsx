/**
 * Create and manage promos. New or edited promos go to admin approval;
 * active ones can be paused. Codes stay unique per player and single-use.
 */
import { useEffect, useState } from 'react';
import { api, type PromoInput } from '@/api';
import { discountBadge } from '@/lib/promo';
import type { Promo } from '@/types/promo';
import { Card, Field, Meter, StatusBadge, btn, input } from '../ui';

const blank = (businessId: string): PromoInput => ({
  businessId,
  title: '',
  discountType: 'percent',
  discountValue: 10,
  quantityLimit: 50,
  expiresAt: new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10),
  rules: {},
});

function PromoEditor({ initial, onDone }: { initial: PromoInput; onDone: () => void }) {
  const [p, setP] = useState<PromoInput>({ ...initial, expiresAt: initial.expiresAt.slice(0, 10) });
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<PromoInput>) => setP({ ...p, ...patch });
  const valid = p.title.trim().length >= 4 && (p.discountType === 'freebie' || (p.discountValue ?? 0) > 0) && p.expiresAt > new Date().toISOString().slice(0, 10);

  const save = async () => {
    try {
      // Valid until the end of the chosen day, Mauritius time.
      await api.business.savePromo({ ...p, expiresAt: `${p.expiresAt}T23:59:00+04:00` });
      onDone();
    } catch {
      setError('Could not save the promo.');
    }
  };

  return (
    <Card title={initial.id ? 'Edit promo' : 'New promo'}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" hint='e.g. "15% off your first meal"'>
          <input className={input} maxLength={60} value={p.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Discount">
          <div className="flex gap-2">
            <select className={input} value={p.discountType} onChange={(e) => set({ discountType: e.target.value as Promo['discountType'] })}>
              <option value="percent">% off</option>
              <option value="amount">Rs off</option>
              <option value="freebie">Free item / gift</option>
            </select>
            {p.discountType !== 'freebie' && (
              <input className={`${input} w-28`} type="number" min={1} max={p.discountType === 'percent' ? 100 : 100000} value={p.discountValue ?? ''} onChange={(e) => set({ discountValue: Number(e.target.value) })} aria-label="Discount value" />
            )}
          </div>
        </Field>
        <Field label="How many codes?" hint="Leave empty for unlimited.">
          <input className={input} type="number" min={1} value={p.quantityLimit ?? ''} onChange={(e) => set({ quantityLimit: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Valid until">
          <input className={input} type="date" value={p.expiresAt} onChange={(e) => set({ expiresAt: e.target.value })} />
        </Field>
        <Field label="Each code expires after (days)" hint="Optional, e.g. 14 — encourages a quick visit.">
          <input className={input} type="number" min={1} value={p.codeValidDays ?? ''} onChange={(e) => set({ codeValidDays: e.target.value ? Number(e.target.value) : undefined })} />
        </Field>
        <Field label="Minimum spend (Rs)" hint="Optional.">
          <input className={input} type="number" min={0} value={p.rules.minSpendRs ?? ''} onChange={(e) => set({ rules: { ...p.rules, minSpendRs: e.target.value ? Number(e.target.value) : undefined } })} />
        </Field>
        <label className="flex min-h-11 items-center gap-3 font-semibold sm:col-span-2">
          <input type="checkbox" className="h-5 w-5 accent-spark-500" checked={!!p.rules.firstVisitOnly} onChange={(e) => set({ rules: { ...p.rules, firstVisitOnly: e.target.checked } })} />
          First visit only (your staff check this at the counter)
        </label>
        <Field label="Details (optional)">
          <textarea className={`${input} min-h-16 py-2`} maxLength={200} value={p.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
        </Field>
      </div>
      <p className="mt-3 text-xs text-slate-500">Every player gets their own single-use code. Promos are checked by our team before going live.</p>
      {error && <p role="alert" className="font-semibold text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button className={btn.primary} disabled={!valid} onClick={() => void save()}>Save & send for approval</button>
        <button className={btn.secondary} onClick={onDone}>Cancel</button>
      </div>
    </Card>
  );
}

export function PromoManager({ businessId }: { businessId: string }) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [editing, setEditing] = useState<PromoInput | null>(null);
  const load = () => void api.business.promos(businessId).then(setPromos, () => setPromos([]));
  useEffect(() => {
    load();
    return api.subscribe(load);
  }, [businessId]);

  if (editing) return <PromoEditor initial={editing} onDone={() => { setEditing(null); load(); }} />;

  return (
    <Card title="Promos" actions={<button className={btn.primary} onClick={() => setEditing(blank(businessId))}>＋ New promo</button>}>
      {promos.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-300">No promos yet. A promo puts a ✨ light beam over your building and brings players in.</p>
      ) : (
        <ul className="space-y-3">
          {promos.map((p) => {
            const expired = Date.parse(p.expiresAt) <= Date.now();
            return (
              <li key={p.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-900 px-2 py-1 text-sm font-black text-white dark:bg-white dark:text-slate-900">{discountBadge(p)}</span>
                  <span className="flex-1 font-bold">{p.title}</span>
                  <StatusBadge status={expired ? 'expired' : p.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Until {new Date(p.expiresAt).toLocaleDateString('en-GB', { timeZone: 'Indian/Mauritius' })}
                  {p.rules.firstVisitOnly && ' · first visit only'}
                  {p.rules.minSpendRs && ` · min. Rs ${p.rules.minSpendRs}`}
                  {p.codeValidDays && ` · codes valid ${p.codeValidDays} days`}
                </p>
                {p.quantityLimit !== null && <div className="mt-2"><Meter label="Codes unlocked" value={p.quantityUnlocked} max={p.quantityLimit} /></div>}
                {p.quantityLimit === null && <p className="mt-2 text-sm">{p.quantityUnlocked} codes unlocked (no limit)</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className={btn.small} onClick={() => setEditing({ ...p, businessId })}>Edit</button>
                  {(p.status === 'active' || p.status === 'paused') && !expired && (
                    <button className={btn.small} onClick={() => void api.business.setPromoPaused(p.id, p.status === 'active').then(load)}>{p.status === 'active' ? 'Pause' : 'Resume'}</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
