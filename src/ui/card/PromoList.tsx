/**
 * Active promos on the business card with their rules, stock and an
 * Unlock button. Unlocking needs an account; each player gets one unique,
 * single-use code per promo (unlocking again just shows the same code).
 */
import { useState } from 'react';
import { api } from '@/api';
import { intlLocale, useT, type TranslationKey } from '@/i18n';
import { useSessionStore } from '@/store/useSessionStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useUiStore } from '@/store/useUiStore';
import { discountBadge, remaining } from '@/lib/promo';
import type { Promo } from '@/types/promo';

export function PromoList({ promos, brand, onChanged }: { promos: Promo[]; brand: string; onChanged: () => void }) {
  const t = useT();
  const locale = useUiStore((s) => s.locale);
  const { wallet, requireAuth, showCode, refreshWallet } = useSessionStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const date = (iso: string) => new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeZone: 'Indian/Mauritius' }).format(new Date(iso));

  if (!promos.length) return <p className="text-sm text-slate-500 dark:text-slate-400">{t('card.noPromos')}</p>;

  const unlock = (p: Promo) =>
    requireAuth(async () => {
      setBusy(p.id);
      setError(null);
      const res = await api.promos.unlock(p.id);
      setBusy(null);
      if (!res.ok) {
        setError(t(`promo.err.${res.error === 'sign-in-required' ? 'unavailable' : res.error}` as TranslationKey));
        return;
      }
      await refreshWallet();
      showCode(res.item);
      void useProgressStore.getState().handleAwards(res.awards);
      if (!res.already) onChanged();
    });

  return (
    <ul className="space-y-2">
      {promos.map((p) => {
        const mine = wallet.find((w) => w.promo.id === p.id);
        const left = remaining(p);
        const soldOut = left === 0 && !mine;
        return (
          <li key={p.id} className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-950">
            <div className="flex items-center gap-3">
              <span className="flex h-12 min-w-14 shrink-0 items-center justify-center rounded-xl px-1 text-sm font-black text-white" style={{ background: brand }}>
                {discountBadge(p)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-snug text-slate-900 dark:text-yellow-50">{p.title}</p>
                <p className="text-xs text-slate-600 dark:text-yellow-200">{t('card.validUntil', { date: date(p.expiresAt) })}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold text-slate-700 dark:text-yellow-100">
              {p.rules.firstVisitOnly && <span className="rounded-full bg-white/80 px-2 py-0.5 dark:bg-black/30">👋 {t('promo.firstVisit')}</span>}
              {p.rules.minSpendRs && <span className="rounded-full bg-white/80 px-2 py-0.5 dark:bg-black/30">🧾 {t('promo.minSpend', { n: p.rules.minSpendRs })}</span>}
              {left !== null && left <= 20 && left > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-800 dark:bg-orange-900 dark:text-orange-100">🔥 {t('promo.left', { n: left })}</span>}
              {p.codeValidDays && <span className="rounded-full bg-white/80 px-2 py-0.5 dark:bg-black/30">⏳ {t('promo.validDays', { n: p.codeValidDays })}</span>}
            </div>
            <button
              onClick={() => (mine ? showCode(mine) : unlock(p))}
              disabled={soldOut || busy === p.id}
              className={`mt-3 min-h-12 w-full rounded-full text-base font-bold shadow transition active:scale-[0.98] disabled:opacity-50 ${mine ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white' : 'bg-yellow-400 text-yellow-950'}`}
            >
              {mine ? `🔳 ${t('promo.viewCode')}` : soldOut ? t('promo.soldOut') : `✨ ${t('promo.unlock')}`}
            </button>
          </li>
        );
      })}
      {error && <li role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</li>}
    </ul>
  );
}
