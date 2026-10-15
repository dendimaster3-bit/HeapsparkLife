/** Ad inventory: prices, bookings (approve / end), new bookings with creatives. */
import { useState } from 'react';
import { api } from '@/api';
import { resizeImage } from '@/lib/images';
import type { AdBooking, AdCreative } from '@/types/ads';
import { AdCreativeView } from '@/ui/common/AdCreativeView';
import { Card, Field, StatusBadge, btn, input } from '../ui';
import { useAdminData } from './AdminPage';

const load = async () => {
  const [slots, businesses] = await Promise.all([api.admin.slots(), api.admin.businesses()]);
  return { slots, businesses: businesses.filter((b) => b.status === 'approved') };
};
const today = () => new Date().toISOString().slice(0, 10);

function NewBooking({ slotId, businesses, onDone }: { slotId: string; businesses: { id: string; name: string; brandColor: string }[]; onDone: () => void }) {
  const [advertiser, setAdvertiser] = useState('');
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [headline, setHeadline] = useState('');
  const [sub, setSub] = useState('');
  const [bg, setBg] = useState('#0ea5b7');
  const [image, setImage] = useState<string | null>(null);
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10));
  const biz = businesses.find((b) => b.id === advertiser);
  const creative: AdCreative = image ? { kind: 'image', url: image, alt: biz?.name ?? name } : { kind: 'text', headline: headline || biz?.name || name, sub: sub || undefined, bg: biz && bg === '#0ea5b7' ? biz.brandColor : bg };
  const save = async () => {
    await api.admin.saveBooking({ slotId, advertiserBusinessId: advertiser || undefined, advertiserName: biz?.name ?? name, linkUrl: advertiser ? undefined : link || undefined, creative, startDate: start, endDate: end, status: 'active' });
    onDone();
  };
  return (
    <div className="mt-3 grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200 sm:grid-cols-2 dark:bg-slate-900 dark:ring-slate-700">
      <Field label="Advertiser on the map">
        <select className={input} value={advertiser} onChange={(e) => setAdvertiser(e.target.value)}>
          <option value="">External advertiser…</option>
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </Field>
      {!advertiser && (
        <>
          <Field label="Advertiser name"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Link (https://…)"><input className={input} type="url" value={link} onChange={(e) => setLink(e.target.value)} /></Field>
        </>
      )}
      <Field label="Headline"><input className={input} maxLength={36} value={headline} onChange={(e) => setHeadline(e.target.value)} /></Field>
      <Field label="Second line"><input className={input} maxLength={48} value={sub} onChange={(e) => setSub(e.target.value)} /></Field>
      <Field label="Background colour"><input type="color" className="h-12 w-20 rounded-lg" value={bg} onChange={(e) => setBg(e.target.value)} /></Field>
      <Field label="…or upload an image creative"><input type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setImage(await resizeImage(e.target.files[0], 900))} /></Field>
      <Field label="From"><input className={input} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
      <Field label="To"><input className={input} type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></Field>
      <div className="sm:col-span-2"><AdCreativeView creative={creative} className="max-w-md" /></div>
      <div className="flex gap-2">
        <button className={btn.primary} disabled={!(advertiser || name.trim()) || end < start} onClick={() => void save()}>Book it</button>
        <button className={btn.secondary} onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

function BookingRow({ b }: { b: AdBooking }) {
  const live = b.status === 'active' && b.startDate <= today() && b.endDate >= today();
  return (
    <li className="flex flex-wrap items-center gap-2 text-sm">
      <StatusBadge status={live ? 'active' : b.status === 'active' ? (b.endDate < today() ? 'ended' : 'pending') : b.status} />
      <span className="font-semibold">{b.advertiserName}</span>
      <span className="text-slate-500">{b.startDate} → {b.endDate} · {b.impressions} views · {b.clicks} clicks{b.isDemo ? ' · demo' : ''}</span>
      {b.status === 'pending' && (
        <>
          <button className={btn.good} onClick={() => void api.admin.setBookingStatus(b.id, 'active')}>✓ Approve</button>
          <button className={btn.danger} onClick={() => void api.admin.setBookingStatus(b.id, 'rejected')}>✕ Reject</button>
        </>
      )}
      {b.status === 'active' && <button className={btn.small} onClick={() => void api.admin.setBookingStatus(b.id, 'ended')}>End now</button>}
    </li>
  );
}

export function AdsTab() {
  const data = useAdminData(load);
  const [adding, setAdding] = useState<string | null>(null);
  if (!data) return <p>Loading…</p>;
  return (
    <Card title="Ad slots">
      <ul className="space-y-3">
        {data.slots.map((s) => (
          <li key={s.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{s.name}</span>
              <span className="text-xs text-slate-500">{s.type} · {s.impressions} views · {s.clicks} taps</span>
              <span className="flex-1" />
              <label className="flex items-center gap-1 text-sm">
                Rs
                <input
                  className={`${input} min-h-10 w-28`}
                  type="number"
                  min={0}
                  defaultValue={s.pricePerMonthRs}
                  aria-label={`${s.name} monthly price`}
                  onBlur={(e) => Number(e.target.value) !== s.pricePerMonthRs && void api.admin.setSlotPrice(s.id, Number(e.target.value))}
                />
                /month
              </label>
              <button className={btn.small} onClick={() => setAdding(adding === s.id ? null : s.id)}>＋ Booking</button>
            </div>
            {s.bookings.length > 0 ? (
              <ul className="mt-2 space-y-1">{s.bookings.map((b) => <BookingRow key={b.id} b={b} />)}</ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Empty — shows "Advertise here".</p>
            )}
            {adding === s.id && <NewBooking slotId={s.id} businesses={data.businesses} onDone={() => setAdding(null)} />}
          </li>
        ))}
      </ul>
    </Card>
  );
}
