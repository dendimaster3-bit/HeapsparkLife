/** Theme + language settings popover. */
import { LOCALES, useT } from '@/i18n';
import { useUiStore, type ThemePref } from '@/store/useUiStore';
import { useSessionStore } from '@/store/useSessionStore';
import { Link } from 'react-router-dom';

const THEMES: ThemePref[] = ['system', 'light', 'dark'];

export function SettingsMenu({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { theme, setTheme, locale, setLocale } = useUiStore();
  const { session, requireAuth, signOut, deleteAccount } = useSessionStore();
  const seg = (active: boolean) =>
    `min-h-11 flex-1 rounded-xl px-3 text-sm font-semibold transition ${
      active ? 'bg-spark-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
    }`;

  return (
    <>
      <button className="fixed inset-0 z-30 cursor-default" aria-label={t('nav.close')} onClick={onClose} />
      <div
        role="dialog"
        aria-label={t('settings.title')}
        className="absolute right-3 top-16 z-40 w-72 rounded-2xl bg-white p-4 text-slate-800 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
      >
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide opacity-70">{t('settings.theme')}</h2>
        <div className="flex gap-2">
          {THEMES.map((th) => (
            <button key={th} className={seg(theme === th)} onClick={() => setTheme(th)}>
              {t(`settings.theme.${th}`)}
            </button>
          ))}
        </div>
        <h2 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide opacity-70">{t('settings.language')}</h2>
        <div className="flex flex-col gap-2">
          {LOCALES.map((l) => (
            <button key={l.id} className={seg(locale === l.id)} onClick={() => setLocale(l.id)} lang={l.id}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
          {session ? (
            <>
              <p className="mb-2 text-sm font-semibold">{t('account.signedInAs', { name: session.player.displayName })}</p>
              <div className="flex gap-2">
                <button className={seg(false)} onClick={() => void signOut()}>{t('account.signOut')}</button>
                <button
                  className="min-h-11 flex-1 rounded-xl bg-red-50 px-3 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                  onClick={() => {
                    if (confirm(t('account.deleteConfirm'))) void deleteAccount();
                  }}
                >
                  {t('account.delete')}
                </button>
              </div>
            </>
          ) : (
            <button className={seg(true) + ' w-full'} onClick={() => { onClose(); requireAuth(() => {}); }}>{t('account.signIn')}</button>
          )}
          <p className="mt-3 flex gap-4 text-sm font-semibold text-spark-600 dark:text-spark-400">
            <Link to="/privacy" className="underline">{t('account.privacy')}</Link>
            <Link to="/terms" className="underline">{t('account.terms')}</Link>
          </p>
          <Link to="/business" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold dark:bg-slate-800">🏪 {t('account.forBusiness')}</Link>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('legal.pointsNotMoney')}</p>
      </div>
    </>
  );
}
