/**
 * Spark Points + district passport: a stamp per district, badges, recent
 * points and how to earn more. Tapping an empty stamp flies there.
 */
import { intlLocale, useT, type TranslationKey } from '@/i18n';
import { useProgressStore } from '@/store/useProgressStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useCameraStore } from '@/store/useCameraStore';
import { useShareStore } from '@/store/useShareStore';
import { useUiStore } from '@/store/useUiStore';
import { DISTRICTS } from '@/data/districts';
import { BADGES, POINTS } from '@/data/rewards';
import { gameUrl } from '@/lib/shareCard';
import { Sheet, primaryBtn } from '../common/Sheet';

const h3 = 'mb-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400';

export function PassportSheet() {
  const t = useT();
  const locale = useUiStore((s) => s.locale);
  const { progress, passportOpen, setPassportOpen } = useProgressStore();
  const requireAuth = useSessionStore((s) => s.requireAuth);
  const goDistrict = useCameraStore((s) => s.goDistrict);
  const openShare = useShareStore((s) => s.open);
  if (!passportOpen || !progress) return null;

  const date = (iso: string) => new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', timeZone: 'Indian/Mauritius' }).format(new Date(iso));
  const stamped = new Map(progress.stamps.map((s) => [s.districtId, s.stampedAt]));
  const n = stamped.size;

  const share = () =>
    openShare({
      card: {
        headline: t('share.passport', { n }),
        sub: t('share.passportSub', { points: progress.points }),
        emoji: n === 9 ? '🏝️' : '🛂',
        accent: '#6366f1',
      },
      text: t('share.passport', { n }),
      url: gameUrl(),
    });

  return (
    <Sheet title={`🛂 ${t('passport.title')}`} onClose={() => setPassportOpen(false)}>
      <div className="space-y-5 py-1">
        {/* Points total */}
        <div className="rounded-3xl bg-gradient-to-br from-yellow-300 to-amber-400 p-4 text-amber-950">
          <p className="text-sm font-bold uppercase tracking-wide opacity-80">{t('points.label')}</p>
          <p className="text-4xl font-black tabular-nums">⚡ {progress.points}</p>
          <p className="mt-1 text-xs font-semibold opacity-80">{t('legal.pointsNotMoney')}</p>
        </div>

        {progress.guest && (
          <div className="space-y-2 rounded-2xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-100">
            <p>{t('passport.guest')}</p>
            <button className="min-h-11 rounded-full bg-sky-600 px-4 font-bold text-white" onClick={() => requireAuth(() => {})}>{t('account.signIn')}</button>
          </div>
        )}

        {/* Stamps */}
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className={h3}>{t('passport.title')}</h3>
            <span className="text-sm font-bold">{t('passport.count', { n, total: DISTRICTS.length })}</span>
          </div>
          <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuemin={0} aria-valuemax={9} aria-valuenow={n}>
            <div className="h-full rounded-full bg-gradient-to-r from-spark-400 to-emerald-500 transition-all" style={{ width: `${(n / DISTRICTS.length) * 100}%` }} />
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {DISTRICTS.map((d, i) => {
              const at = stamped.get(d.id);
              return (
                <li key={d.id}>
                  <button
                    onClick={() => {
                      setPassportOpen(false);
                      goDistrict(d.id);
                    }}
                    aria-label={at ? `${d.name} — ${date(at)}` : `${d.name} — ${t('passport.notVisited')}. ${t('passport.goThere', { name: d.name })}`}
                    className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-amber-50/70 p-1 dark:bg-slate-800/70"
                  >
                    {at ? (
                      <span
                        className="flex aspect-square w-[88%] animate-[stamp-in_.4s_ease-out] flex-col items-center justify-center rounded-full border-4 border-double text-center"
                        style={{ borderColor: d.color, color: d.color, ['--r' as string]: `${(i % 3) * 6 - 6}deg`, transform: `rotate(${(i % 3) * 6 - 6}deg)` }}
                      >
                        <span className="text-[11px] font-black uppercase leading-tight">{d.name}</span>
                        <span className="text-[10px] font-semibold opacity-80">{date(at)}</span>
                      </span>
                    ) : (
                      <span className="flex aspect-square w-[88%] flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-center text-slate-400 dark:border-slate-600">
                        <span className="text-lg">?</span>
                        <span className="text-[11px] font-bold leading-tight">{d.name}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Badges */}
        <section>
          <h3 className={h3}>{t('passport.badges')}</h3>
          <ul className="space-y-2">
            {BADGES.map((b) => {
              const earned = progress.badges.find((x) => x.badgeId === b.id);
              return (
                <li key={b.id} className={`flex items-center gap-3 rounded-2xl p-2 ${earned ? 'bg-amber-50 dark:bg-amber-950' : 'opacity-60'}`}>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${earned ? 'bg-amber-200' : 'bg-slate-200 grayscale dark:bg-slate-700'}`} aria-hidden>{b.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{t(`badge.${b.id}.name` as TranslationKey)}</span>
                    <span className="block text-sm text-slate-600 dark:text-slate-300">{t(`badge.${b.id}.desc` as TranslationKey)}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs font-semibold">
                    {earned ? t('passport.earned', { date: date(earned.earnedAt) }) : `🔒 +${b.bonus}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <button className={primaryBtn} onClick={share}>📤 {t('passport.share')}</button>

        {/* How to earn */}
        <section>
          <h3 className={h3}>{t('points.howTo')}</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {(Object.keys(POINTS) as (keyof typeof POINTS)[]).map((k) => (
              <li key={k} className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <span className="font-black text-amber-600 dark:text-amber-400">+{POINTS[k]}</span> {t(`points.reason.${k}` as TranslationKey)}
              </li>
            ))}
          </ul>
        </section>

        {/* History */}
        <section>
          <h3 className={h3}>{t('points.history')}</h3>
          {progress.ledger.length ? (
            <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {progress.ledger.slice(0, 12).map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <span>
                    {t(`points.reason.${e.reason}` as TranslationKey)}
                    <span className="ml-2 text-xs text-slate-500">{date(e.createdAt)}</span>
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400">+{e.delta}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">{t('points.none')}</p>
          )}
        </section>
      </div>
    </Sheet>
  );
}
