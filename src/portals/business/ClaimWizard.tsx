/**
 * Claim a plot in 4 steps: location → details → look → review. The new
 * business waits for admin approval before it appears on the map.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/api';
import { DISTRICTS, DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS, TOWNS_BY_ID } from '@/data/towns';
import { SUBCATEGORIES_BY_ID } from '@/data/categories';
import { useSessionStore } from '@/store/useSessionStore';
import type { Plot } from '@/types/business';
import type { DistrictId } from '@/types/geo';
import { BusinessForm, EMPTY_DRAFT, draftErrors, type BusinessDraft } from './BusinessForm';
import { Card, Field, PortalShell, SignInPrompt, btn, input } from '../ui';

const STEPS = ['Location', 'Details', 'Look', 'Review'] as const;

/** "curepipe-2" → "curepipe" */
const townOfPlot = (plotId: string) => plotId.replace(/-\d+$/, '');

export default function ClaimWizard() {
  const session = useSessionStore((s) => s.session);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preset = params.get('plot');
  const [step, setStep] = useState(0);
  const [townId, setTownId] = useState(preset ? townOfPlot(preset) : '');
  const [districtId, setDistrictId] = useState<DistrictId | ''>(preset ? TOWNS_BY_ID[townOfPlot(preset)]?.districtId ?? '' : '');
  const [plotId, setPlotId] = useState(preset ?? '');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [draft, setDraft] = useState<BusinessDraft>(EMPTY_DRAFT);
  const [agree, setAgree] = useState({ terms: false, logo: false });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!districtId) return setPlots([]);
    void Promise.all([api.map.getDistrict(districtId), api.business.takenPlotIds()]).then(([d, t]) => {
      setPlots(d.plots);
      setTaken(t);
    });
  }, [districtId]);

  const free = useMemo(() => plots.filter((p) => p.townId === townId && !taken.includes(p.id)), [plots, townId, taken]);
  const errors = draftErrors(draft);
  const canNext = [!!plotId && free.some((p) => p.id === plotId), errors.length === 0, true, agree.terms && (!draft.logoUrl || agree.logo)][step];

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const b = await api.business.claim({ ...draft, plotId });
      navigate(`/business/${b.id}?new=1`);
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      setError(m === 'plot-taken' ? 'Sorry, someone just claimed that spot. Please pick another.' : m === 'storage-full' ? 'Your browser storage is full (demo mode). Try smaller or fewer photos.' : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!session) return <PortalShell title="Claim a spot"><SignInPrompt text="Sign in to claim a spot for your business. It's free during the founding period." /></PortalShell>;

  return (
    <PortalShell title="Claim a spot">
      <ol className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? 'step' : undefined} className={`rounded-full px-3 py-1.5 ${i === step ? 'bg-spark-500 text-white' : i < step ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
            {i < step ? '✓' : i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <Card title="Where is your business?">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="District">
              <select className={input} value={districtId} onChange={(e) => { setDistrictId(e.target.value as DistrictId); setTownId(''); setPlotId(''); }}>
                <option value="">Choose…</option>
                {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Town or village" hint="Missing your locality? Pick the nearest one and tell us when we contact you.">
              <select className={input} value={townId} disabled={!districtId} onChange={(e) => { setTownId(e.target.value); setPlotId(''); }}>
                <option value="">Choose…</option>
                {TOWNS.filter((t) => t.districtId === districtId).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
          </div>
          {townId && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Available spots in {TOWNS_BY_ID[townId]?.name}</p>
              {free.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {free.map((p) => (
                    <button key={p.id} aria-pressed={plotId === p.id} onClick={() => setPlotId(p.id)} className={`min-h-14 rounded-2xl border-2 text-sm font-bold ${plotId === p.id ? 'border-spark-500 bg-spark-50 text-spark-600 dark:bg-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700'}`}>
                      ＋ Spot {Number(p.id.split('-').pop()) + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">All spots here are taken. Try a nearby town — more spots are coming.</p>
              )}
              <p className="mt-2 text-xs text-slate-500">Spot 1 is the most central. You can also tap "Claim this spot" on the map.</p>
            </div>
          )}
        </Card>
      )}
      {step === 1 && <BusinessForm value={draft} onChange={setDraft} sections={['basics', 'contact', 'hours']} />}
      {step === 2 && <BusinessForm value={draft} onChange={setDraft} sections={['look']} />}
      {step === 3 && (
        <Card title="Check and submit">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-500">Name</dt><dd className="font-bold">{draft.name}</dd></div>
            <div><dt className="font-semibold text-slate-500">Type</dt><dd>{SUBCATEGORIES_BY_ID[draft.subcategoryId]?.name}</dd></div>
            <div><dt className="font-semibold text-slate-500">Location</dt><dd>Spot {Number(plotId.split('-').pop()) + 1}, {TOWNS_BY_ID[townId]?.name}, {districtId && DISTRICTS_BY_ID[districtId].name}</dd></div>
            <div><dt className="font-semibold text-slate-500">Contact</dt><dd>{[draft.phone, draft.whatsapp && `WhatsApp ${draft.whatsapp}`, draft.website].filter(Boolean).join(' · ')}</dd></div>
          </dl>
          <div className="mt-4 space-y-2 text-sm">
            <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-spark-500" checked={agree.terms} onChange={(e) => setAgree({ ...agree, terms: e.target.checked })} /><span>I run this business (or have permission to list it) and agree to the <Link className="font-semibold underline" to="/terms" target="_blank">terms</Link>. Promos I publish will be honoured in my shop.</span></label>
            {draft.logoUrl && <label className="flex items-start gap-3"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-spark-500" checked={agree.logo} onChange={(e) => setAgree({ ...agree, logo: e.target.checked })} /><span>I own the logo or have the right to use it.</span></label>}
          </div>
          <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-100">Our team checks every listing. You'll appear on the map once approved — the first 100 approved businesses become <strong>Founding Members</strong> with a permanent gold building.</p>
          {error && <p role="alert" className="mt-2 font-semibold text-red-600">{error}</p>}
        </Card>
      )}

      {step > 0 && step < 3 && errors.length > 0 && step === 1 && (
        <ul className="list-inside list-disc text-sm text-amber-700 dark:text-amber-300">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
      )}
      <div className="flex justify-between gap-2">
        <button className={btn.secondary} onClick={() => (step ? setStep(step - 1) : navigate('/business'))}>{step ? '← Back' : 'Cancel'}</button>
        {step < 3 ? (
          <button className={btn.primary} disabled={!canNext} onClick={() => setStep(step + 1)}>Next →</button>
        ) : (
          <button className={btn.primary} disabled={!canNext || busy} onClick={() => void submit()}>Submit for approval</button>
        )}
      </div>
    </PortalShell>
  );
}
