/** Simple stats: a KPI row, codes unlocked vs redeemed, and a per-promo table. */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { BusinessStats } from '@/types/business';
import { Card, Meter, StatTile } from '../ui';

export function StatsPanel({ businessId }: { businessId: string }) {
  const [s, setS] = useState<BusinessStats | null>(null);
  useEffect(() => {
    const load = () => void api.business.stats(businessId).then(setS, () => setS(null));
    load();
    return api.subscribe(load);
  }, [businessId]);
  if (!s) return <p>Loading…</p>;
  const e = s.events;
  return (
    <>
      <Card title="Visibility">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Building views" value={e.view} />
          <StatTile label="Card opens" value={e.cardOpen} />
          <StatTile label="Shares" value={e.share} />
          <StatTile label="Ad clicks" value={s.adClicks} sub={`${s.adImpressions} ad views`} />
        </div>
      </Card>
      <Card title="Contacts">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="📞 Calls" value={e.call} />
          <StatTile label="💬 WhatsApp" value={e.whatsapp} />
          <StatTile label="🌐 Website" value={e.website} />
        </div>
      </Card>
      <Card title="Promo codes">
        <Meter label="Redeemed of unlocked" value={s.codesRedeemed} max={s.codesUnlocked} />
        {s.perPromo.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-2">Promo</th>
                  <th className="py-2 pr-2 text-right">Unlocked</th>
                  <th className="py-2 pr-2 text-right">Redeemed</th>
                  <th className="py-2 text-right">Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {s.perPromo.map((p) => (
                  <tr key={p.promoId}>
                    <td className="py-2 pr-2 font-semibold">{p.title} <span className="text-xs font-normal text-slate-500">({p.status})</span></td>
                    <td className="py-2 pr-2 text-right tabular-nums">{p.unlocked}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">{p.redeemed}</td>
                    <td className="py-2 text-right tabular-nums">{p.limit ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="text-xs text-slate-500">Views count once per player session when your town is on screen. In demo mode stats are stored in this browser only.</p>
    </>
  );
}
