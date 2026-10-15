import { api } from '@/api';
import { Card, Meter, StatTile, btn } from '../ui';
import { useAdminData } from './AdminPage';

const load = () => api.admin.overview();

export function OverviewTab({ onGo }: { onGo: (t: 'businesses' | 'promos') => void }) {
  const o = useAdminData(load);
  if (!o) return <p>Loading…</p>;
  return (
    <>
      {(o.businesses.pending > 0 || o.promos.pending > 0) && (
        <Card title="Waiting for you">
          <div className="flex flex-wrap gap-2">
            {o.businesses.pending > 0 && <button className={btn.primary} onClick={() => onGo('businesses')}>⏳ {o.businesses.pending} business{o.businesses.pending > 1 ? 'es' : ''} to review</button>}
            {o.promos.pending > 0 && <button className={btn.primary} onClick={() => onGo('promos')}>⏳ {o.promos.pending} promo{o.promos.pending > 1 ? 's' : ''} to review</button>}
          </div>
        </Card>
      )}
      <Card title="Directory">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Live businesses" value={o.businesses.approved} />
          <StatTile label="Pending" value={o.businesses.pending} />
          <StatTile label="Rejected / suspended" value={o.businesses.rejected + o.businesses.suspended} />
          <StatTile label="Players" value={o.players} />
        </div>
        <div className="mt-4">
          <Meter label="Founding Member places used" value={o.foundingMembers} max={100} />
        </div>
      </Card>
      <Card title="Promos">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Active promos" value={o.promos.active} />
          <StatTile label="Codes unlocked" value={o.codes.unlocked} />
          <StatTile label="Codes redeemed" value={o.codes.redeemed} />
          <StatTile label="Card opens" value={o.events.cardOpen} />
        </div>
      </Card>
      <Card title="Engagement & ads">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Building views" value={o.events.view} />
          <StatTile label="Calls + WhatsApp" value={o.events.call + o.events.whatsapp} />
          <StatTile label="Ad views" value={o.ads.impressions} />
          <StatTile label="Ad clicks" value={o.ads.clicks} />
        </div>
        <div className="mt-4">
          <Meter label="Ad slots booked today" value={o.ads.booked} max={o.ads.slots} />
        </div>
      </Card>
      <p className="text-xs text-slate-500">Demo mode: numbers come from this browser's local data.</p>
    </>
  );
}
