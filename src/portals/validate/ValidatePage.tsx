/**
 * /validate — counter staff check a customer's code (typed or scanned),
 * see what it's for, then confirm to mark it used. Codes are single-use and
 * only valid at the business that issued them.
 *
 * Demo mode: staff pick their business from a list. With the real backend
 * this page requires a business login and the server enforces ownership.
 */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api';
import { intlLocale, useT, type TranslationKey } from '@/i18n';
import { useUiStore } from '@/store/useUiStore';
import { discountBadge, normalizeCode } from '@/lib/promo';
import { useApplyTheme } from '@/lib/useTheme';
import type { MapBusiness } from '@/types/business';
import type { LookupResult, RedemptionMethod } from '@/types/promo';
import { inputCls, primaryBtn } from '@/ui/common/Sheet';

const QrScanner = lazy(() => import('./QrScanner'));
const BUSINESS_KEY = 'hs.validate.business';

export default function ValidatePage() {
  useApplyTheme();
  const t = useT();
  const locale = useUiStore((s) => s.locale);
  const [params] = useSearchParams();
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [businessId, setBusinessId] = useState(() => {
    try {
      return localStorage.getItem(BUSINESS_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [code, setCode] = useState(params.get('code') ?? '');
  const [method, setMethod] = useState<RedemptionMethod>(params.get('code') ? 'qr' : 'typed');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.directory.search({}).then((list) => setBusinesses(list.sort((a, b) => b.activePromoCount - a.activePromoCount || a.name.localeCompare(b.name))));
  }, []);

  const pickBusiness = (id: string) => {
    setBusinessId(id);
    setResult(null);
    try {
      localStorage.setItem(BUSINESS_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const check = useCallback(
    async (value: string, how: RedemptionMethod) => {
      if (!businessId || !value.trim()) return;
      setBusy(true);
      setRedeemed(false);
      setMethod(how);
      setCode(normalizeCode(value));
      setResult(await api.validation.lookup(businessId, value));
      setBusy(false);
    },
    [businessId],
  );

  // Arriving from a scanned QR link: check straight away once a business is chosen.
  useEffect(() => {
    const fromLink = params.get('code');
    if (fromLink && businessId) void check(fromLink, 'qr');
  }, [params, businessId, check]);

  const confirm = async () => {
    setBusy(true);
    const r = await api.validation.redeem(businessId, code, method);
    setResult(r);
    setRedeemed(r.ok);
    setBusy(false);
  };

  const reset = () => {
    setCode('');
    setResult(null);
    setRedeemed(false);
  };

  const onScan = useCallback((text: string) => {
    setScanning(false);
    void check(text, 'qr');
  }, [check]);
  const onCameraError = useCallback(() => {
    setScanning(false);
    setCameraError(true);
  }, []);

  const date = (iso: string) => new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Indian/Mauritius' }).format(new Date(iso));

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center gap-3">
          <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow dark:bg-slate-800" aria-label={t('validate.back')}>←</Link>
          <h1 className="text-2xl font-extrabold">{t('validate.title')}</h1>
        </header>

        <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{t('validate.demoNote')}</p>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t('validate.business')}</span>
          <select className={inputCls} value={businessId} onChange={(e) => pickBusiness(e.target.value)}>
            <option value="">—</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.activePromoCount ? ` ✨${b.activePromoCount}` : ''}
              </option>
            ))}
          </select>
        </label>

        {businessId && !redeemed && (
          <form
            className="space-y-3 rounded-3xl bg-white p-4 shadow dark:bg-slate-900"
            onSubmit={(e) => {
              e.preventDefault();
              void check(code, 'typed');
            }}
          >
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">{t('validate.codeLabel')}</span>
              <input
                className={`${inputCls} text-center font-mono text-2xl uppercase tracking-widest`}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setResult(null);
                }}
                placeholder="HS-XXXX-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <div className="flex gap-2">
              <button className={primaryBtn} disabled={busy || !code.trim()}>{t('validate.check')}</button>
              <button
                type="button"
                onClick={() => {
                  setCameraError(false);
                  setScanning((s) => !s);
                }}
                className="min-h-12 shrink-0 rounded-full bg-slate-100 px-5 font-bold dark:bg-slate-800"
              >
                {scanning ? t('validate.stopScan') : `📷 ${t('validate.scan')}`}
              </button>
            </div>
            {scanning && (
              <div className="space-y-2">
                <Suspense fallback={<div className="aspect-square w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />}>
                  <QrScanner onResult={onScan} onError={onCameraError} />
                </Suspense>
                <p className="text-center text-sm text-slate-600 dark:text-slate-300">{t('validate.scanHelp')}</p>
              </div>
            )}
            {cameraError && <p role="alert" className="text-sm font-semibold text-red-600">{t('validate.cameraError')}</p>}
          </form>
        )}

        {result && (
          <section
            role="status"
            className={`space-y-3 rounded-3xl border-4 p-4 ${result.ok ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950' : 'border-red-400 bg-red-50 dark:bg-red-950'}`}
          >
            {result.ok ? (
              <>
                <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{redeemed ? t('validate.redeemed') : t('validate.valid')}</p>
                <div className="flex items-center gap-3">
                  <span className="flex h-14 min-w-16 items-center justify-center rounded-xl px-2 font-black text-white" style={{ background: result.item.brandColor }}>
                    {discountBadge(result.item.promo)}
                  </span>
                  <div>
                    <p className="text-lg font-bold">{result.item.promo.title}</p>
                    <p className="text-sm">{t('validate.for', { name: result.playerName })} · <span className="font-mono">{result.item.code.code}</span></p>
                  </div>
                </div>
                {(result.item.promo.rules.firstVisitOnly || result.item.promo.rules.minSpendRs) && (
                  <div className="rounded-2xl bg-white/70 p-3 text-sm dark:bg-black/30">
                    <p className="font-bold">{t('validate.checkRules')}</p>
                    <ul className="list-inside list-disc">
                      {result.item.promo.rules.firstVisitOnly && <li>{t('promo.firstVisit')}</li>}
                      {result.item.promo.rules.minSpendRs && <li>{t('promo.minSpend', { n: result.item.promo.rules.minSpendRs })}</li>}
                    </ul>
                  </div>
                )}
                {!redeemed && (
                  <button className={primaryBtn.replace('bg-spark-500', 'bg-emerald-600').replace('hover:bg-spark-600', 'hover:bg-emerald-700')} disabled={busy} onClick={() => void confirm()}>
                    ✅ {t('validate.confirm')}
                  </button>
                )}
              </>
            ) : (
              <p className="text-lg font-bold text-red-800 dark:text-red-200">
                ⛔ {t(`validate.err.${result.reason}` as TranslationKey, { date: result.item?.code.redeemedAt ? date(result.item.code.redeemedAt) : '' })}
              </p>
            )}
            {(redeemed || !result.ok) && (
              <button className="min-h-12 w-full rounded-full bg-white font-bold shadow dark:bg-slate-800" onClick={reset}>
                {t('validate.another')}
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
