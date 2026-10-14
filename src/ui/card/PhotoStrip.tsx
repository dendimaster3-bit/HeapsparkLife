/**
 * Business photos (uploaded by the business). Demo businesses get simple
 * illustrated tiles so the card isn't empty; real businesses without
 * photos show an empty state.
 */
import { useT } from '@/i18n';

export function PhotoStrip({ photos, name, brand, icon, isDemo }: { photos: string[]; name: string; brand: string; icon: string; isDemo: boolean }) {
  const t = useT();
  if (photos.length) {
    return (
      <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4">
        {photos.map((src, i) => (
          <img key={src} src={src} alt={`${name} — ${i + 1}`} loading="lazy" className="h-32 w-44 shrink-0 snap-start rounded-2xl object-cover" />
        ))}
      </div>
    );
  }
  if (!isDemo) return <p className="text-sm text-slate-500 dark:text-slate-400">{t('card.noPhotos')}</p>;
  return (
    <>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex h-28 w-40 shrink-0 items-center justify-center rounded-2xl text-5xl"
            style={{ background: `linear-gradient(${120 + i * 50}deg, ${brand}, ${brand}55)` }}
          >
            {icon}
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('card.demoPhotos')}</p>
    </>
  );
}
