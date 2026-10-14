/**
 * Business card for the tapped/selected building. Bottom sheet on phones
 * (collapsed → expand for details), side panel on wider screens.
 * Tracks card opens and call / WhatsApp / website clicks.
 */
import { useEffect, useRef, useState } from 'react';
import { api } from '@/api';
import { useT, type TranslationKey } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { useClockStore } from '@/store/useClockStore';
import { CATEGORIES_BY_ID, SUBCATEGORIES_BY_ID } from '@/data/categories';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS_BY_ID } from '@/data/towns';
import { mauritiusWeekday, openStatus } from '@/lib/hours';
import { prettyUrl, telHref, whatsappHref } from '@/lib/contact';
import type { BusinessDetail } from '@/types/business';
import { useBusinessDetail } from './useBusinessDetail';
import { HoursTable } from './HoursTable';
import { PhotoStrip } from './PhotoStrip';
import { PromoList } from './PromoList';

const action =
  'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold shadow-sm transition active:scale-95';

function StatusLine({ d }: { d: BusinessDetail }) {
  const t = useT();
  const hour = useClockStore((s) => Math.floor(s.hour * 60) / 60);
  const st = openStatus(d.business.hours, mauritiusWeekday(), hour);
  let text: string;
  if (st.open) text = t('card.openUntil', { time: st.closesAt });
  else if (st.opensAt && st.today) text = t('card.opensToday', { time: st.opensAt });
  else if (st.opensAt && st.opensDay) text = t('card.opensOn', { day: t(`day.${st.opensDay}` as TranslationKey), time: st.opensAt });
  else text = t('card.closedForNow');
  return (
    <p className={`flex items-center gap-2 text-sm font-semibold ${st.open ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${st.open ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden />
      {text}
    </p>
  );
}

function CardBody({ d, expanded, onChanged }: { d: BusinessDetail; expanded: boolean; onChanged: () => void }) {
  const t = useT();
  const b = d.business;
  const sub = SUBCATEGORIES_BY_ID[b.subcategoryId];
  const cat = sub ? CATEGORIES_BY_ID[sub.categoryId] : undefined;
  const track = (type: 'call' | 'whatsapp' | 'website') => api.events.track(type, b.id);

  return (
    <>
      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        {b.isFoundingMember && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            ★ {t('biz.founding', { n: b.foundingMemberNo ?? '' })}
          </span>
        )}
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-900 dark:bg-sky-900 dark:text-sky-100">{t('biz.level', { n: b.growthLevel })}</span>
        {b.isDemo && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t('biz.demo')}</span>}
      </div>

      <StatusLine d={d} />

      {/* Primary actions */}
      <div className="flex gap-2">
        {b.phone && (
          <a href={telHref(b.phone)} onClick={() => track('call')} className={`${action} bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100`}>
            <span aria-hidden>📞</span> {t('card.call')}
          </a>
        )}
        {b.whatsapp && (
          <a
            href={whatsappHref(b.whatsapp, b.name)}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('whatsapp')}
            className={`${action} bg-[#25D366] text-[#0b3d1f]`}
          >
            <span aria-hidden>💬</span> {t('card.whatsapp')}
          </a>
        )}
        {b.website && (
          <a href={b.website} target="_blank" rel="noreferrer" onClick={() => track('website')} className={`${action} bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100`} title={prettyUrl(b.website)}>
            <span aria-hidden>🌐</span> {t('card.website')}
          </a>
        )}
      </div>

      {/* Promos */}
      <section aria-labelledby="card-promos">
        <h3 id="card-promos" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t('card.promos')}
        </h3>
        <PromoList promos={d.promos} brand={b.brandColor} onChanged={onChanged} />
      </section>

      {expanded && (
        <>
          {b.description && (
            <section>
              <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('card.about')}</h3>
              <p className="text-sm">{b.description}</p>
            </section>
          )}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('card.photos')}</h3>
            <PhotoStrip photos={b.photos} name={b.name} brand={b.brandColor} icon={sub?.icon ?? cat?.icon ?? '🏪'} isDemo={b.isDemo} />
          </section>
          <section>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('card.hours')}</h3>
            <HoursTable hours={b.hours} />
          </section>
          {b.website && <p className="text-sm text-slate-600 dark:text-slate-300">🌐 {prettyUrl(b.website)}</p>}
          {b.phone && <p className="text-sm text-slate-600 dark:text-slate-300">📞 {b.phone}</p>}
        </>
      )}
    </>
  );
}

export function BusinessCard() {
  const t = useT();
  const businessId = useCameraStore((s) => s.businessId);
  const goBack = useCameraStore((s) => s.goBack);
  const [detail, refresh] = useBusinessDetail(businessId);
  const [expanded, setExpanded] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // One "card open" per business shown; collapse when switching business.
  useEffect(() => {
    if (!businessId) return;
    api.events.track('cardOpen', businessId);
    setExpanded(false);
  }, [businessId]);

  useEffect(() => {
    if (detail) heading.current?.focus();
  }, [detail]);

  // Escape closes the card.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && goBack();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  if (!businessId) return null;
  const b = detail?.business;
  const sub = b ? SUBCATEGORIES_BY_ID[b.subcategoryId] : undefined;
  const cat = sub ? CATEGORIES_BY_ID[sub.categoryId] : undefined;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:inset-y-0 sm:left-auto sm:right-0 sm:items-end sm:p-3 sm:pt-20">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="card-title"
        className={`pointer-events-auto flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-slate-100 sm:h-full sm:max-h-none sm:w-[400px] ${
          expanded ? 'max-h-[85vh]' : 'max-h-[60vh]'
        }`}
      >
        <div className="h-2 shrink-0" style={{ background: b?.brandColor ?? '#94a3b8' }} />
        <header className="flex shrink-0 items-start gap-3 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <h2 id="card-title" ref={heading} tabIndex={-1} className="text-xl font-extrabold leading-tight outline-none">
              {b?.name ?? t('card.loading')}
            </h2>
            {b && (
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                {sub?.icon ?? cat?.icon} {sub?.name} · {t('card.where', { town: TOWNS_BY_ID[b.townId]?.name ?? '', district: DISTRICTS_BY_ID[b.districtId]?.name ?? '' })}
              </p>
            )}
          </div>
          <button onClick={goBack} aria-label={t('nav.close')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800">
            ✕
          </button>
        </header>

        {detail && (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4 pt-3">
            <CardBody d={detail} expanded={expanded} onChanged={refresh} />
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              className="min-h-11 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {expanded ? t('card.less') : t('card.more')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
