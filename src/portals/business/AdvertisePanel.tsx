/** Request an ad slot: pick a slot, write a simple text ad (or upload an image), choose dates. */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { resizeImage } from '@/lib/images';
import type { AdBooking, AdCreative, AdPlacement } from '@/types/ads';
import type { Business } from '@/types/business';
import { AdCreativeView } from '@/ui/common/AdCreativeView';
import { Card, Field, StatusBadge, btn, input } from '../ui';

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

export function AdvertisePanel({ business }: { business: Business }) {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [mine, setMine] = useState<AdBooking[]>([]);
  const [slotId, setSlotId] = useState('');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [headline, setHeadline] = useState(business.name);
  const [sub, setSub] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(plusDays(30));
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const load = () => {
      void api.ads.list().then(setPlacements);
      void api.business.bookings(business.id).then(setMine, () => setMine([]));
    };
    load();
    return api.subscribe(load);
  }, [business.id]);

  const creative: AdCreative = mode === 'image' && image ? { kind: 'image', url: image, alt: business.name } : { kind: 'text', headline, sub: sub || undefined, bg: business.brandColor };
  const slot = placements.find((p) => p.slot.id === slotId);

  const send = async () => {
    await api.business.requestAd({ businessId: business.id, slotId, creative, startDate: start, endDate: end });
    setSent(true);
  };

  return (
    <>
      <Card title="Advertise on the map">
        {sent ? (
          <p className="font-semibold">Request sent! Our team will confirm the price and dates with you before it goes live.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ad slot">
              <select className={input} value={slotId} onChange={(e) => setSlotId(e.target.value)}>
                <option value="">Choose…</option>
                {placements.map((p) => (
                  <option key={p.slot.id} value={p.slot.id}>
                    {p.slot.name} — Rs {p.slot.pricePerMonthRs.toLocaleString()}/month{p.booking ? ' (booked now)' : ' (available)'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ad type">
              <div className="flex gap-2">
                <button type="button" aria-pressed={mode === 'text'} className={mode === 'text' ? btn.primary : btn.secondary} onClick={() => setMode('text')}>Text</button>
                <button type="button" aria-pressed={mode === 'image'} className={mode === 'image' ? btn.primary : btn.secondary} onClick={() => setMode('image')}>Image</button>
              </div>
            </Field>
            {mode === 'text' ? (
              <>
                <Field label="Headline"><input className={input} maxLength={36} value={headline} onChange={(e) => setHeadline(e.target.value)} /></Field>
                <Field label="Second line (optional)"><input className={input} maxLength={48} value={sub} onChange={(e) => setSub(e.target.value)} /></Field>
              </>
            ) : (
              <Field label="Image" hint="Wide images work best (about 2:1). Only use images you own.">
                <input type="file" accept="image/*" onChange={async (e) => e.target.files?.[0] && setImage(await resizeImage(e.target.files[0], 900))} />
              </Field>
            )}
            <Field label="From"><input className={input} type="date" value={start} min={today()} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="To"><input className={input} type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <p className="mb-1 text-sm font-semibold">Preview</p>
              <AdCreativeView creative={creative} className="max-w-md" />
              {slot?.booking && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">This slot is booked right now; choose dates after the current booking ends ({slot.booking.endDate}).</p>}
            </div>
            <button className={btn.primary} disabled={!slotId || !headline.trim() || end < start || (mode === 'image' && !image)} onClick={() => void send()}>Request this slot</button>
          </div>
        )}
      </Card>
      {mine.length > 0 && (
        <Card title="Your ad bookings">
          <ul className="space-y-2">
            {mine.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={b.status} />
                <span className="font-semibold">{placements.find((p) => p.slot.id === b.slotId)?.slot.name ?? b.slotId}</span>
                <span className="text-slate-500">{b.startDate} → {b.endDate} · {b.impressions} views · {b.clicks} clicks</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
