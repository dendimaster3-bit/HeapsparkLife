/**
 * Compact panel for the tapped building. The full business card (photos,
 * hours, WhatsApp, promos…) replaces this in step (c).
 */
import { useT } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { findBusiness, useWorldStore } from '@/store/useWorldStore';
import { SUBCATEGORIES_BY_ID, CATEGORIES_BY_ID } from '@/data/categories';
import { TOWNS_BY_ID } from '@/data/towns';
import { useIsOpen } from '@/game/buildings/useIsOpen';
import type { MapBusiness } from '@/types/business';

function Peek({ b }: { b: MapBusiness }) {
  const t = useT();
  const goBack = useCameraStore((s) => s.goBack);
  const open = useIsOpen(b.hours);
  const sub = SUBCATEGORIES_BY_ID[b.subcategoryId];
  const cat = sub ? CATEGORIES_BY_ID[sub.categoryId] : undefined;
  return (
    <section
      aria-label={b.name}
      className="pointer-events-auto mx-auto max-w-3xl rounded-3xl border-t-8 bg-white/95 p-4 shadow-xl dark:bg-slate-900/95"
      style={{ borderColor: b.brandColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-extrabold">{b.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {cat?.icon} {sub?.name} · {TOWNS_BY_ID[b.townId]?.name}
          </p>
        </div>
        <button
          onClick={goBack}
          aria-label={t('nav.close')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className={`rounded-full px-3 py-1 ${open ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
          {open ? t('biz.open') : t('biz.closed')}
        </span>
        {b.activePromoCount > 0 && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
            ✨ {t('biz.promos', { n: b.activePromoCount })}
          </span>
        )}
        {b.isFoundingMember && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            ★ {t('biz.founding', { n: b.foundingMemberNo ?? '' })}
          </span>
        )}
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-900 dark:bg-sky-900 dark:text-sky-100">
          {t('biz.level', { n: b.growthLevel })}
        </span>
        {b.isDemo && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t('biz.demo')}</span>
        )}
      </div>
    </section>
  );
}

export function BusinessPeek() {
  const businessId = useCameraStore((s) => s.businessId);
  // Subscribe to district loads so the lookup re-runs when data arrives.
  useWorldStore((s) => s.districts);
  const b = findBusiness(businessId);
  if (!b) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Peek b={b} />
    </div>
  );
}
