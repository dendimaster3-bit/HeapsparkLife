/**
 * Loading / welcome screen. Includes the loading-screen sponsor slot
 * (empty for now → "Advertise here"; wired to ad bookings in step f).
 */
import { useT } from '@/i18n';
import { useUiStore } from '@/store/useUiStore';
import { useAdsStore } from '@/store/useAdsStore';
import { useEffect } from 'react';
import { api } from '@/api';
import { AdCreativeView } from './AdCreativeView';

export function IntroOverlay({ ready, error }: { ready: boolean; error: string | null }) {
  const t = useT();
  const finishIntro = useUiStore((s) => s.finishIntro);
  const sponsor = useAdsStore((s) => s.placements.find((p) => p.slot.type === 'loadingScreen'));
  const click = useAdsStore((s) => s.click);
  useEffect(() => {
    if (sponsor) api.ads.trackImpression(sponsor.slot.id);
  }, [sponsor]);

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
      <div className="mb-2 w-full max-w-xs">
        <p className="mb-1 text-xs uppercase tracking-wide opacity-70">{t('intro.sponsorLabel')}</p>
        <button
          className="block w-full"
          onClick={() => {
            // A booked sponsor opens its business on the map, so start the game first.
            if (sponsor?.booking?.advertiserBusinessId) finishIntro();
            if (sponsor) click(sponsor);
          }}
        >
          <AdCreativeView creative={sponsor?.booking?.creative ?? null} />
        </button>
      </div>
    </div>
  );
}
