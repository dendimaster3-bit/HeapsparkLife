/**
 * Loading / welcome screen. Includes the loading-screen sponsor slot
 * (empty for now → "Advertise here"; wired to ad bookings in step f).
 */
import { useT } from '@/i18n';
import { useUiStore } from '@/store/useUiStore';

export function IntroOverlay({ ready, error }: { ready: boolean; error: string | null }) {
  const t = useT();
  const finishIntro = useUiStore((s) => s.finishIntro);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-sky-300/95 via-cyan-200/90 to-emerald-200/95 p-6 text-center text-slate-900 dark:from-slate-950/95 dark:via-sky-950/90 dark:to-emerald-950/95 dark:text-slate-50">
      <div />
      <div className="max-w-md">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-5xl shadow-lg dark:bg-slate-900/80" aria-hidden>
          🏝️
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('intro.welcome')}</h1>
        <p className="mt-3 text-lg text-slate-700 dark:text-slate-300">{t('intro.tagline')}</p>
        {error ? (
          <p className="mt-6 rounded-xl bg-red-100 p-3 text-red-800">{error}</p>
        ) : (
          <button
            className="mt-8 min-h-14 w-full max-w-xs rounded-full bg-spark-500 px-8 text-lg font-bold text-white shadow-xl transition hover:bg-spark-600 active:scale-95 disabled:opacity-60"
            disabled={!ready}
            onClick={finishIntro}
          >
            {ready ? t('intro.start') : t('intro.loading')}
          </button>
        )}
      </div>
      {/* Loading-screen sponsor slot */}
      <a
        href="https://heapspark.com/advertise"
        target="_blank"
        rel="noreferrer"
        className="mb-2 rounded-xl border-2 border-dashed border-slate-500/40 px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
      >
        <span className="block text-xs uppercase tracking-wide opacity-70">{t('intro.sponsorLabel')}</span>
        {t('intro.sponsor')}
      </a>
    </div>
  );
}
