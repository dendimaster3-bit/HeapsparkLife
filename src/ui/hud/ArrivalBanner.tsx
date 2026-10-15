/**
 * The airport arrival banner ad slot as a welcome card right after the
 * intro — the first thing players see when they "land". Shown once per
 * session, auto-hides after a few seconds.
 */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { useT } from '@/i18n';
import { useAdsStore } from '@/store/useAdsStore';
import { AdCreativeView } from '../common/AdCreativeView';

let shownThisSession = false;

export function ArrivalBanner() {
  const t = useT();
  const placement = useAdsStore((s) => s.placements.find((p) => p.slot.type === 'airportBanner'));
  const click = useAdsStore((s) => s.click);
  const [visible, setVisible] = useState(!shownThisSession);

  useEffect(() => {
    if (!placement || !visible) return;
    shownThisSession = true;
    api.ads.trackImpression(placement.slot.id);
    const timer = setTimeout(() => setVisible(false), 6500);
    return () => clearTimeout(timer);
  }, [placement, visible]);

  if (!placement || !visible) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-sm animate-[toast-in_.4s_ease-out] rounded-3xl bg-white/95 p-3 shadow-2xl dark:bg-slate-900/95">
        <div className="mb-2 flex items-start justify-between gap-2 px-1">
          <div>
            <p className="text-lg font-extrabold">{t('ads.arrival')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('ads.arrivalSub')}</p>
          </div>
          <button onClick={() => setVisible(false)} aria-label={t('nav.close')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">✕</button>
        </div>
        <button
          className="block w-full text-left"
          onClick={() => {
            setVisible(false);
            click(placement);
          }}
        >
          <AdCreativeView creative={placement.booking?.creative ?? null} />
        </button>
      </div>
    </div>
  );
}
