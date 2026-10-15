/**
 * District "loading card": a short welcome when the player enters a
 * district. In step (f) it also shows the District Founding Partner.
 */
import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { DISTRICTS_BY_ID } from '@/data/districts';
import type { TranslationKey } from '@/i18n';
import { useAdsStore } from '@/store/useAdsStore';
import { flyToBusiness } from '@/lib/navigation';
import { ADVERTISE_URL } from '@/types/ads';

export function DistrictToast() {
  const t = useT();
  const districtId = useCameraStore((s) => s.districtId);
  const [shown, setShown] = useState<typeof districtId>(null);
  const partners = useAdsStore((s) => s.partners);

  useEffect(() => {
    if (!districtId) return;
    setShown(districtId);
    const timer = setTimeout(() => setShown(null), 5500);
    return () => clearTimeout(timer);
  }, [districtId]);

  if (!shown) return null;
  const d = DISTRICTS_BY_ID[shown];
  const partner = partners.find((p) => p.type === 'districtFounding' && p.districtId === shown);
  return (
    <div
      role="status"
      className="pointer-events-none absolute inset-x-0 bottom-36 z-20 flex justify-center px-4"
    >
      <div
        className="max-w-sm rounded-2xl border-l-8 bg-white/95 px-4 py-3 shadow-xl dark:bg-slate-900/95"
        style={{ borderColor: d.color }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bienvini dan</p>
        <p className="text-xl font-extrabold">{d.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t(d.blurbKey as TranslationKey)}</p>
        {partner ? (
          <button
            className="pointer-events-auto mt-2 flex min-h-10 items-center gap-2 rounded-full bg-amber-100 px-3 text-sm font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-100"
            onClick={() => void flyToBusiness(partner.businessId)}
          >
            ★ {t('partner.founder', { name: partner.businessName })}
          </button>
        ) : (
          <a className="pointer-events-auto mt-2 inline-block text-xs font-semibold text-spark-600 underline dark:text-spark-400" href={ADVERTISE_URL} target="_blank" rel="noreferrer">
            {t('partner.becomeOne')}
          </a>
        )}
      </div>
    </div>
  );
}
