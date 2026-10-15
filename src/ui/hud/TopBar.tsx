/** Top HUD: breadcrumb navigation, Mauritius clock and settings. */
import { useState } from 'react';
import { useT } from '@/i18n';
import { useCameraStore } from '@/store/useCameraStore';
import { useClockStore } from '@/store/useClockStore';
import { DISTRICTS_BY_ID } from '@/data/districts';
import { TOWNS_BY_ID } from '@/data/towns';
import { formatHour } from '@/lib/time';
import { SettingsMenu } from './SettingsMenu';
import { HighlightChip } from './HighlightChip';
import { useSearchStore } from '@/store/useSearchStore';
import { useSessionStore } from '@/store/useSessionStore';
import { codeState } from '@/lib/promo';
import { useProgressStore } from '@/store/useProgressStore';

const base = 'flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold shadow-md backdrop-blur';
const chip = `${base} bg-white/90 text-slate-800 dark:bg-slate-900/85 dark:text-slate-100`;

export function TopBar() {
  const t = useT();
  const { level, districtId, townId, goIsland, goDistrict, goBack } = useCameraStore();
  const hour = useClockStore((s) => s.hour);
  const daylight = useClockStore((s) => s.daylight);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSearch = useSearchStore((s) => s.setOpen);
  const setWalletOpen = useSessionStore((s) => s.setWalletOpen);
  const points = useProgressStore((s) => s.progress?.points ?? 0);
  const stamps = useProgressStore((s) => s.progress?.stamps.length ?? 0);
  const setPassportOpen = useProgressStore((s) => s.setPassportOpen);
  const activeCodes = useSessionStore((s) => s.wallet.filter((w) => codeState(w.code) === 'active').length);

  const district = districtId ? DISTRICTS_BY_ID[districtId] : null;
  const town = townId ? TOWNS_BY_ID[townId] : null;

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <nav className="pointer-events-auto flex min-w-0 flex-wrap items-center gap-2" aria-label="Breadcrumb">
        {level !== 'island' && (
          <button className={`${chip} w-11 justify-center px-0`} onClick={goBack} aria-label={t('nav.back')}>
            <span aria-hidden className="text-lg">←</span>
          </button>
        )}
        <button className={chip} onClick={goIsland}>
          <span aria-hidden>🏝️</span>
          <span className={level === 'island' ? '' : 'hidden sm:inline'}>{t('nav.island')}</span>
        </button>
        {district && (
          <button className={chip} onClick={() => goDistrict(district.id)}>
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: district.color }} />
            <span className="truncate">{district.name}</span>
          </button>
        )}
        {town && (level === 'town' || level === 'business') && (
          <span className={`${base} bg-sky-600 text-white`}>{town.name}</span>
        )}
      </nav>

      <div className="pointer-events-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button className={`${chip} w-11 justify-center px-0`} onClick={() => openSearch(true)} aria-label={t('search.open')}>
          <span aria-hidden className="text-lg">🔍</span>
        </button>
        <button
          className={`${chip} bg-yellow-300/95 text-amber-950 dark:bg-yellow-400/90 dark:text-amber-950`}
          onClick={() => setPassportOpen(true)}
          aria-label={`${t('points.open')}: ${points} ${t('points.label')}, ${t('passport.count', { n: stamps, total: 9 })}`}
        >
          <span aria-hidden>⚡</span>
          <span className="tabular-nums">{points}</span>
          <span aria-hidden className="hidden text-xs opacity-75 sm:inline">· 🛂 {stamps}/9</span>
        </button>
        <button className={`${chip} relative w-11 justify-center px-0`} onClick={() => setWalletOpen(true)} aria-label={`${t('wallet.open')}${activeCodes ? ` (${activeCodes})` : ''}`}>
          <span aria-hidden className="text-lg">🎟️</span>
          {activeCodes > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-black text-yellow-950" aria-hidden>
              {activeCodes}
            </span>
          )}
        </button>
        <span className={chip} title={t('hud.timeLabel')} aria-label={`${t('hud.timeLabel')} ${formatHour(hour)}`}>
          <span aria-hidden>{daylight > 0.5 ? '☀️' : '🌙'}</span>
          <span className="tabular-nums">{formatHour(hour)}</span>
        </span>
        <button
          className={`${chip} w-11 justify-center px-0`}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label={t('settings.title')}
          aria-expanded={settingsOpen}
        >
          <span aria-hidden className="text-lg">⚙️</span>
        </button>
        {settingsOpen && <SettingsMenu onClose={() => setSettingsOpen(false)} />}
        <div className="basis-full" />
        <HighlightChip />
      </div>
    </header>
  );
}
