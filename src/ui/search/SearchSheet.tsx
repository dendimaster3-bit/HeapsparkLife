/**
 * Search + filters (category → subcategory, district, open now, has
 * promo). Tapping a result flies to the building; "Show on map" pins all
 * results and frames them.
 */
import { useEffect, useRef } from 'react';
import { useT } from '@/i18n';
import { hasActiveSearch, useSearchStore } from '@/store/useSearchStore';
import { useWorldStore } from '@/store/useWorldStore';
import { useClockStore } from '@/store/useClockStore';
import { CATEGORIES_BY_ID, SUBCATEGORIES_BY_ID } from '@/data/categories';
import { TOWNS_BY_ID } from '@/data/towns';
import { isOpenAt, mauritiusWeekday } from '@/lib/hours';
import { flyToBusiness, frameResults } from '@/lib/navigation';
import type { MapBusiness } from '@/types/business';

const chip = (active: boolean) =>
  `flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95 ${
    active ? 'bg-spark-500 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
  }`;

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">{children}</div>
    </div>
  );
}

function ResultRow({ b, onPick }: { b: MapBusiness; onPick: () => void }) {
  const t = useT();
  const hour = useClockStore((s) => Math.floor(s.hour * 60) / 60);
  const sub = SUBCATEGORIES_BY_ID[b.subcategoryId];
  const cat = sub ? CATEGORIES_BY_ID[sub.categoryId] : undefined;
  const open = isOpenAt(b.hours, mauritiusWeekday(), hour);
  return (
    <li>
      <button onClick={onPick} className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: `${b.brandColor}33` }} aria-hidden>
          {sub?.icon ?? cat?.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">
            {b.name} {b.isFoundingMember && <span className="text-amber-500" title={t('biz.founding', { n: b.foundingMemberNo ?? '' })}>★</span>}
          </span>
          <span className="block truncate text-sm text-slate-600 dark:text-slate-300">
            {sub?.name} · {TOWNS_BY_ID[b.townId]?.name}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1 text-xs font-semibold">
          <span className={open ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>{open ? t('biz.open') : t('biz.closed')}</span>
          {b.activePromoCount > 0 && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">✨ {b.activePromoCount}</span>}
        </span>
      </button>
    </li>
  );
}

export function SearchSheet() {
  const t = useT();
  const { open, params, results, setOpen, setParams, reset, setHighlight } = useSearchStore();
  const world = useWorldStore((s) => s.data);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open || !world) return null;
  const subs = params.categoryId ? world.subcategories.filter((s) => s.categoryId === params.categoryId) : [];
  const active = hasActiveSearch(params);

  const pick = (b: MapBusiness) => {
    setOpen(false);
    setHighlight([]);
    void flyToBusiness(b.id);
  };
  const showOnMap = () => {
    setOpen(false);
    setHighlight(results.map((r) => r.id));
    void frameResults(results);
  };

  return (
    <div className="absolute inset-0 z-40 flex justify-center bg-slate-900/40 backdrop-blur-sm sm:p-6" onClick={() => setOpen(false)}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl flex-col bg-white text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100 sm:h-auto sm:max-h-full sm:rounded-3xl"
      >
        <header className="flex items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h2 id="search-title" className="sr-only">{t('search.title')}</h2>
          <label className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl bg-slate-100 px-4 dark:bg-slate-800">
            <span aria-hidden>🔍</span>
            <input
              ref={input}
              type="search"
              value={params.query ?? ''}
              onChange={(e) => setParams({ query: e.target.value })}
              placeholder={t('search.placeholder')}
              aria-label={t('search.title')}
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
            />
          </label>
          <button onClick={() => setOpen(false)} aria-label={t('nav.close')} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800">
            ✕
          </button>
        </header>

        <div className="space-y-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <ChipRow label={t('search.category')}>
            <button className={chip(!params.categoryId)} onClick={() => setParams({ categoryId: undefined })}>{t('search.all')}</button>
            {world.categories.map((c) => (
              <button key={c.id} className={chip(params.categoryId === c.id)} aria-pressed={params.categoryId === c.id} onClick={() => setParams({ categoryId: params.categoryId === c.id ? undefined : c.id })}>
                <span aria-hidden>{c.icon}</span> {c.name}
              </button>
            ))}
          </ChipRow>
          {subs.length > 0 && (
            <ChipRow label={t('search.subcategory')}>
              <button className={chip(!params.subcategoryId)} onClick={() => setParams({ subcategoryId: undefined })}>{t('search.all')}</button>
              {subs.map((s) => (
                <button key={s.id} className={chip(params.subcategoryId === s.id)} aria-pressed={params.subcategoryId === s.id} onClick={() => setParams({ subcategoryId: params.subcategoryId === s.id ? undefined : s.id })}>
                  {s.name}
                </button>
              ))}
            </ChipRow>
          )}
          <ChipRow label={t('search.district')}>
            <button className={chip(!params.districtId)} onClick={() => setParams({ districtId: undefined })}>{t('search.all')}</button>
            {world.districts.map((d) => (
              <button key={d.id} className={chip(params.districtId === d.id)} aria-pressed={params.districtId === d.id} onClick={() => setParams({ districtId: params.districtId === d.id ? undefined : d.id })}>
                <span className="h-3 w-3 rounded-full" style={{ background: d.color }} aria-hidden /> {d.name}
              </button>
            ))}
          </ChipRow>
          <div className="flex gap-2 px-4">
            <button className={chip(!!params.openNow)} aria-pressed={!!params.openNow} onClick={() => setParams({ openNow: !params.openNow })}>🟢 {t('search.openNow')}</button>
            <button className={chip(!!params.hasPromo)} aria-pressed={!!params.hasPromo} onClick={() => setParams({ hasPromo: !params.hasPromo })}>✨ {t('search.hasPromo')}</button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 text-sm">
          <p className="flex-1 font-semibold text-slate-600 dark:text-slate-300" aria-live="polite">{t('search.results', { n: results.length })}</p>
          {active && <button onClick={reset} className="min-h-11 px-2 font-semibold text-spark-600 underline dark:text-spark-400">{t('search.clear')}</button>}
          {results.length > 0 && (
            <button onClick={showOnMap} className="min-h-11 rounded-full bg-spark-500 px-4 font-bold text-white shadow active:scale-95">
              🗺️ {t('search.showOnMap')}
            </button>
          )}
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] dark:divide-slate-800">
          {results.map((b) => (
            <ResultRow key={b.id} b={b} onPick={() => pick(b)} />
          ))}
          {results.length === 0 && <li className="p-6 text-center text-slate-500 dark:text-slate-400">{t('search.noResults')}</li>}
        </ul>
      </section>
    </div>
  );
}

