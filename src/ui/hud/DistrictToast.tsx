/**
 * District "loading card": a short welcome when the player enters a
 * district. In step (f) it also shows the District Founding Partner.
 */
import { useEffect, useState } from 'react';
import { useT } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { DISTRICTS_BY_ID } from '@/data/districts';
import type { TranslationKey } from '@/i18n';

export function DistrictToast() {
  const t = useT();
  const districtId = useCameraStore((s) => s.districtId);
  const [shown, setShown] = useState<typeof districtId>(null);

  useEffect(() => {
    if (!districtId) return;
    setShown(districtId);
    const timer = setTimeout(() => setShown(null), 4000);
    return () => clearTimeout(timer);
  }, [districtId]);

  if (!shown) return null;
  const d = DISTRICTS_BY_ID[shown];
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
      </div>
    </div>
  );
}
