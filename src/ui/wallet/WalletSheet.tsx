/** The player's unlocked codes: active first, then used & expired. */
import { intlLocale, useT } from '@/i18n';
import { useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { codeState, discountBadge } from '@/lib/promo';
import type { WalletItem } from '@/types/promo';
import { Sheet, primaryBtn } from '../common/Sheet';

function Row({ item }: { item: WalletItem }) {
  const t = useT();
  const locale = useUiStore((s) => s.locale);
  const showCode = useSessionStore((s) => s.showCode);
  const state = codeState(item.code);
  const date = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeZone: 'Indian/Mauritius' }).format(
    new Date(state === 'redeemed' ? item.code.redeemedAt! : item.code.expiresAt),
  );
  return (
    <li>
      <button onClick={() => showCode(item)} className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 p-3 text-left ${state === 'active' ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950' : 'border-slate-200 opacity-70 dark:border-slate-700'}`}>
        <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: item.brandColor }}>
          {discountBadge(item.promo)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{item.promo.title}</span>
          <span className="block truncate text-sm text-slate-600 dark:text-slate-300">{item.businessName}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {state === 'active' ? t('code.expires', { date }) : state === 'redeemed' ? t('code.redeemed', { date }) : t('code.expired', { date })}
          </span>
        </span>
        <span className="shrink-0 text-2xl" aria-hidden>{state === 'active' ? '🔳' : state === 'redeemed' ? '✅' : '⌛'}</span>
      </button>
    </li>
  );
}

export function WalletSheet() {
  const t = useT();
  const { walletOpen, setWalletOpen, wallet, session, requireAuth } = useSessionStore();
  if (!walletOpen) return null;
  const active = wallet.filter((w) => codeState(w.code) === 'active');
  const past = wallet.filter((w) => codeState(w.code) !== 'active');
  return (
    <Sheet title={`🎟️ ${t('wallet.title')}`} onClose={() => setWalletOpen(false)}>
      {!session ? (
        <div className="space-y-3 py-2">
          <p>{t('wallet.signIn')}</p>
          <button className={primaryBtn} onClick={() => requireAuth(() => setWalletOpen(true))}>{t('account.signIn')}</button>
        </div>
      ) : wallet.length === 0 ? (
        <p className="py-4 text-slate-600 dark:text-slate-300">{t('wallet.empty')}</p>
      ) : (
        <div className="space-y-4 py-1">
          {active.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('wallet.active')} ({active.length})</h3>
              <ul className="space-y-2">{active.map((w) => <Row key={w.code.id} item={w} />)}</ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('wallet.past')}</h3>
              <ul className="space-y-2">{past.map((w) => <Row key={w.code.id} item={w} />)}</ul>
            </section>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t('legal.pointsNotMoney')}</p>
    </Sheet>
  );
}
