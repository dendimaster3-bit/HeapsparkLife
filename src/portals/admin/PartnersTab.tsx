/** Assign District and Category Founding Partners (one per district / subcategory). */
import { api } from '@/api';
import { DISTRICTS } from '@/data/districts';
import { SUBCATEGORIES } from '@/data/categories';
import { Card, input } from '../ui';
import { useAdminData } from './AdminPage';

const load = async () => {
  const [businesses, partners] = await Promise.all([api.admin.businesses(), api.partners.list()]);
  return { businesses: businesses.filter((b) => b.status === 'approved'), partners };
};

export function PartnersTab() {
  const data = useAdminData(load);
  if (!data) return <p>Loading…</p>;
  const { businesses, partners } = data;
  const current = (type: 'districtFounding' | 'categoryFounding', key: string) =>
    partners.find((p) => p.type === type && (type === 'districtFounding' ? p.districtId === key : p.subcategoryId === key))?.businessId ?? '';

  return (
    <>
      <Card title="District Founding Partners">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">One per district: name on the district gateway, landmark-style gold building, mention on the district welcome card.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DISTRICTS.map((d) => (
            <label key={d.id} className="flex items-center gap-2">
              <span className="w-40 shrink-0 font-semibold"><span className="mr-1 inline-block h-3 w-3 rounded-full" style={{ background: d.color }} />{d.name}</span>
              <select className={input} value={current('districtFounding', d.id)} onChange={(e) => void api.admin.assignPartner('districtFounding', d.id, e.target.value || null)}>
                <option value="">— Available —</option>
                {businesses.filter((b) => b.districtId === d.id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          ))}
        </div>
      </Card>
      <Card title="Category Founding Partners">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">One per type: always first in search for its category, with a 🏆 badge and a gold building.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SUBCATEGORIES.map((s) => {
            const options = businesses.filter((b) => b.subcategoryId === s.id);
            return (
              <label key={s.id} className="flex items-center gap-2">
                <span className="w-40 shrink-0 font-semibold">{s.icon} {s.name}</span>
                <select className={input} value={current('categoryFounding', s.id)} disabled={!options.length && !current('categoryFounding', s.id)} onChange={(e) => void api.admin.assignPartner('categoryFounding', s.id, e.target.value || null)}>
                  <option value="">{options.length ? '— Available —' : '— No businesses yet —'}</option>
                  {options.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
            );
          })}
        </div>
      </Card>
    </>
  );
}
