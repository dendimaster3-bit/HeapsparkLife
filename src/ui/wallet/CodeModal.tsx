/** Full-screen code + QR to show at the counter. */
import { intlLocale, useT } from '@/i18n';
import { useSessionStore } from '@/store/useSessionStore';
import { useUiStore } from '@/store/useUiStore';
import { codeState, validationUrl } from '@/lib/promo';
import { Sheet } from '../common/Sheet';
import { QrCode } from './QrCode';

export function CodeModal() {
  const t = useT();
  const locale = useUiStore((s) => s.locale);
  const item = useSessionStore((s) => s.shownCode);
  const justUnlocked = useSessionStore((s) => s.shownCode && Date.now() - Date.parse(s.shownCode.code.unlockedAt) < 15_000);
  const showCode = useSessionStore((s) => s.showCode);
  const setWalletOpen = useSessionStore((s) => s.setWalletOpen);
  if (!item) return null;
  const { code, promo, businessName, brandColor } = item;
  const state = codeState(code);
  const date = (iso: string) => new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeZone: 'Indian/Mauritius' }).format(new Date(iso));

  return (
    <Sheet title={justUnlocked ? t('code.unlocked') : t('code.title')} onClose={() => showCode(null)} z="z-[70]">
      <div className="space-y-3 text-center">
        <div className="rounded-2xl p-3 text-white" style={{ background: brandColor }}>
          <p className="text-sm font-semibold opacity-90">{businessName}</p>
          <p className="text-lg font-extrabold">{promo.title}</p>
        </div>
        <div className={state === 'active' ? '' : 'opacity-30 grayscale'}>
          <QrCode value={validationUrl(code.code)} label={`${t('code.title')}: ${code.code}`} />
        </div>
        <p className="font-mono text-3xl font-black tracking-widest" aria-label={code.code.split('').join(' ')}>{code.code}</p>
        <p className={`text-sm font-semibold ${state === 'active' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
          {state === 'active' && t('code.expires', { date: date(code.expiresAt) })}
          {state === 'redeemed' && t('code.redeemed', { date: date(code.redeemedAt!) })}
          {state === 'expired' && t('code.expired', { date: date(code.expiresAt) })}
        </p>
        {state === 'active' && (
          <>
            <p className="text-base font-bold">{t('code.show')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('code.single')} · {t('code.brightness')}</p>
          </>
        )}
        <button
          className="min-h-12 w-full rounded-full bg-slate-100 font-bold dark:bg-slate-800"
          onClick={() => {
            showCode(null);
            setWalletOpen(true);
          }}
        >
          🎟️ {t('wallet.title')}
        </button>
      </div>
    </Sheet>
  );
}
