/**
 * The business details form used to claim a plot and to edit later:
 * basics, contact, hours and the building's look (with a live 3D preview).
 */
import { lazy, Suspense, useState, type ReactNode } from 'react';
import { CATEGORIES, SUBCATEGORIES, SUBCATEGORIES_BY_ID } from '@/data/categories';
import { BUILDING_STYLES } from '@/game/buildings/registry';
import { resizeImage } from '@/lib/images';
import type { BaseShape, BusinessInput, CategoryId } from '@/types/business';
import { HoursEditor } from './HoursEditor';
import { Card, Field, btn, input } from '../ui';

const BuildingPreview = lazy(() => import('./BuildingPreview'));

export type BusinessDraft = Omit<BusinessInput, 'plotId'>;

export const EMPTY_DRAFT: BusinessDraft = {
  name: '',
  subcategoryId: '',
  brandColor: '#0ea5b7',
  photos: [],
  hours: { mon: [['08:30', '17:00']], tue: [['08:30', '17:00']], wed: [['08:30', '17:00']], thu: [['08:30', '17:00']], fri: [['08:30', '17:00']], sat: [['08:30', '12:00']] },
};

const SWATCHES = ['#dc2626', '#f97316', '#eab308', '#16a34a', '#0d9488', '#0ea5b7', '#2563eb', '#7c3aed', '#db2777', '#475569'];
const BASES: { id: BaseShape; label: string }[] = [
  { id: 'kiosk', label: 'Kiosk' },
  { id: 'shop', label: 'Shop' },
  { id: 'twoStorey', label: 'Two-storey' },
  { id: 'largeVenue', label: 'Large venue' },
];
const MAX_PHOTOS = 3;

/** Problems that block saving (shown inline). */
export function draftErrors(d: BusinessDraft): string[] {
  const e: string[] = [];
  if (d.name.trim().length < 2) e.push('Enter the business name.');
  if (!d.subcategoryId) e.push('Choose a category and type.');
  if (!d.phone?.trim() && !d.whatsapp?.trim()) e.push('Add a phone or WhatsApp number so customers can reach you.');
  if (d.website && !/^https?:\/\/\S+\.\S+/.test(d.website)) e.push('The website must start with http:// or https://');
  return e;
}

export function BusinessForm({ value, onChange, sections = ['basics', 'contact', 'hours', 'look'] }: { value: BusinessDraft; onChange: (d: BusinessDraft) => void; sections?: ('basics' | 'contact' | 'hours' | 'look')[] }) {
  const [category, setCategory] = useState<CategoryId | ''>(SUBCATEGORIES_BY_ID[value.subcategoryId]?.categoryId ?? '');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const set = (patch: Partial<BusinessDraft>) => onChange({ ...value, ...patch });
  const sub = SUBCATEGORIES_BY_ID[value.subcategoryId];
  const style = sub ? BUILDING_STYLES[sub.styleId] : undefined;

  const upload = async (files: FileList | null, kind: 'logo' | 'photo') => {
    setUploadError(null);
    const list = [...(files ?? [])];
    try {
      if (kind === 'logo' && list[0]) set({ logoUrl: await resizeImage(list[0], 256, 'image/png') });
      if (kind === 'photo') {
        const room = MAX_PHOTOS - value.photos.length;
        const urls = await Promise.all(list.slice(0, room).map((f) => resizeImage(f, 720)));
        set({ photos: [...value.photos, ...urls] });
      }
    } catch {
      setUploadError('That file is not an image we can read.');
    }
  };

  const block = (id: string, node: ReactNode) => (sections.includes(id as never) ? node : null);

  return (
    <div className="space-y-4">
      {block(
        'basics',
        <Card title="About the business">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Business name">
              <input className={input} value={value.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Category">
              <select className={input} value={category} onChange={(e) => { setCategory(e.target.value as CategoryId); set({ subcategoryId: '' }); }}>
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className={input} value={value.subcategoryId} disabled={!category} onChange={(e) => set({ subcategoryId: e.target.value })}>
                <option value="">Choose…</option>
                {SUBCATEGORIES.filter((s) => s.categoryId === category).map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </Field>
            <Field label="Short description" hint="Shown on your card. Max 200 characters.">
              <textarea className={`${input} min-h-20 py-2`} maxLength={200} value={value.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
            </Field>
          </div>
        </Card>,
      )}
      {block(
        'contact',
        <Card title="Contact">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Phone"><input className={input} type="tel" value={value.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} placeholder="+230 5xxx xxxx" /></Field>
            <Field label="WhatsApp"><input className={input} type="tel" value={value.whatsapp ?? ''} onChange={(e) => set({ whatsapp: e.target.value })} placeholder="+230 5xxx xxxx" /></Field>
            <Field label="Website (optional)"><input className={input} type="url" value={value.website ?? ''} onChange={(e) => set({ website: e.target.value })} placeholder="https://…" /></Field>
          </div>
        </Card>,
      )}
      {block('hours', <Card title="Opening hours"><HoursEditor value={value.hours} onChange={(hours) => set({ hours })} /></Card>)}
      {block(
        'look',
        <Card title="Your building">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Building style" hint={style ? `Default for ${sub?.name}: ${BASES.find((b) => b.id === (sub?.base ?? style.base))?.label}, with the ${style.label.toLowerCase()} prop.` : 'Choose a type first.'}>
                <div className="grid grid-cols-2 gap-2">
                  {BASES.map((b) => {
                    const active = (value.baseOverride ?? sub?.base ?? style?.base) === b.id;
                    return (
                      <button type="button" key={b.id} aria-pressed={active} disabled={!style} onClick={() => set({ baseOverride: b.id })} className={`min-h-11 rounded-xl text-sm font-bold ${active ? 'bg-spark-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Brand colour">
                <div className="flex flex-wrap items-center gap-2">
                  {SWATCHES.map((c) => (
                    <button type="button" key={c} aria-label={`Colour ${c}`} aria-pressed={value.brandColor === c} onClick={() => set({ brandColor: c })} className={`h-10 w-10 rounded-full ring-offset-2 ${value.brandColor === c ? 'ring-4 ring-slate-900 dark:ring-white' : ''}`} style={{ background: c }} />
                  ))}
                  <input type="color" aria-label="Custom colour" className="h-10 w-14 rounded-lg" value={value.brandColor} onChange={(e) => set({ brandColor: e.target.value })} />
                </div>
              </Field>
              <Field label="Logo (optional)" hint="Only upload a logo you own. It's shown on your signboard.">
                <div className="flex items-center gap-3">
                  {value.logoUrl && <img src={value.logoUrl} alt="Logo" className="h-14 w-14 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200" />}
                  <input type="file" accept="image/*" onChange={(e) => void upload(e.target.files, 'logo')} className="text-sm" />
                  {value.logoUrl && <button type="button" className={btn.small} onClick={() => set({ logoUrl: undefined })}>Remove</button>}
                </div>
              </Field>
              <Field label={`Photos (${value.photos.length}/${MAX_PHOTOS})`}>
                <div className="flex flex-wrap gap-2">
                  {value.photos.map((p, i) => (
                    <span key={i} className="relative">
                      <img src={p} alt={`Photo ${i + 1}`} className="h-20 w-24 rounded-xl object-cover" />
                      <button type="button" aria-label={`Remove photo ${i + 1}`} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow dark:bg-slate-800" onClick={() => set({ photos: value.photos.filter((_, j) => j !== i) })}>✕</button>
                    </span>
                  ))}
                  {value.photos.length < MAX_PHOTOS && <input type="file" accept="image/*" multiple onChange={(e) => void upload(e.target.files, 'photo')} className="text-sm" />}
                </div>
              </Field>
              {uploadError && <p role="alert" className="text-sm font-semibold text-red-600">{uploadError}</p>}
            </div>
            <div>
              {sub ? (
                <Suspense fallback={<div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />}>
                  <BuildingPreview name={value.name || 'Your business'} brand={value.brandColor} logoUrl={value.logoUrl} styleId={sub.styleId} base={value.baseOverride ?? sub.base} open promo={false} level={1} gold={false} />
                </Suspense>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 p-4 text-center text-slate-500 dark:bg-slate-800">Choose a category and type to preview your building.</div>
              )}
              <p className="mt-2 text-xs text-slate-500">Drag to look around. Your building grows as customers redeem your deals.</p>
            </div>
          </div>
        </Card>,
      )}
    </div>
  );
}
