/**
 * Shared building blocks for the business portal and admin panel: page
 * shell (with sign-in), cards, form fields, buttons, stat tiles, meters.
 * Plain Tailwind; works in light and dark mode with large tap targets.
 */
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useApplyTheme } from '@/lib/useTheme';
import { useSessionStore } from '@/store/useSessionStore';
import { AuthSheet } from '@/ui/auth/AuthSheet';

export const input =
  'min-h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-base outline-none focus:border-spark-500 dark:border-slate-700 dark:bg-slate-800';
export const btn = {
  primary: 'min-h-12 rounded-full bg-spark-500 px-5 font-bold text-white shadow hover:bg-spark-600 active:scale-[0.98] disabled:opacity-50',
  secondary: 'min-h-12 rounded-full bg-slate-100 px-5 font-bold text-slate-800 hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100',
  danger: 'min-h-11 rounded-full bg-red-50 px-4 font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950 dark:text-red-300',
  good: 'min-h-11 rounded-full bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50',
  small: 'min-h-10 rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100',
};

export function Card({ title, children, actions }: { title?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 dark:bg-slate-900 dark:ring-slate-800">
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg font-extrabold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  );
}

const STATUS_STYLE: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100',
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100',
  paused: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  ended: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  expired: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  rejected: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
  suspended: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
};
const STATUS_ICON: Record<string, string> = { approved: '✓', active: '✓', pending: '⏳', paused: '⏸', ended: '■', expired: '⌛', rejected: '✕', suspended: '⛔' };

/** Status pill: icon + word, never colour alone. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[status] ?? STATUS_STYLE.paused}`}>
      <span aria-hidden>{STATUS_ICON[status] ?? '•'}</span>
      {status}
    </span>
  );
}

/** Stat tile: one headline number with a label (text in ink colours). */
export function StatTile({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black tabular-nums text-slate-900 dark:text-slate-50">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

/** Meter: share of a total on a same-hue track, with the numbers spelled out. */
export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-slate-600 dark:text-slate-300">
          {value} / {max} {max > 0 && `(${Math.round(pct)}%)`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-sky-100 dark:bg-sky-950" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className="h-full rounded-full bg-sky-600 dark:bg-sky-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Page frame with header, sign-in sheet and session bootstrapping. */
export function PortalShell({ title, children, nav }: { title: string; children: ReactNode; nav?: ReactNode }) {
  useApplyTheme();
  const { session, ready, init, requireAuth, signOut } = useSessionStore();
  useEffect(() => {
    if (!ready) void init();
  }, [ready, init]);
  return (
    <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-h-11 items-center gap-2 font-extrabold" aria-label="Back to the island">
            <span className="text-2xl" aria-hidden>🏝️</span>
            <span className="hidden sm:inline">Heapspark Life</span>
          </Link>
          <h1 className="flex-1 text-lg font-extrabold">{title}</h1>
          {session ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden font-semibold sm:inline">{session.player.displayName}</span>
              <button className={btn.small} onClick={() => void signOut()}>Sign out</button>
            </div>
          ) : (
            ready && <button className={btn.small} onClick={() => requireAuth(() => {})}>Sign in</button>
          )}
        </div>
        {nav && <nav className="no-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">{nav}</nav>}
      </header>
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-5">{children}</main>
      <AuthSheet />
    </div>
  );
}

export function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold ${active ? 'bg-spark-500 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
    >
      {children}
    </button>
  );
}

/** Gentle empty state / sign-in prompt. */
export function SignInPrompt({ text }: { text: string }) {
  const requireAuth = useSessionStore((s) => s.requireAuth);
  return (
    <Card>
      <p className="mb-3">{text}</p>
      <button className={btn.primary} onClick={() => requireAuth(() => {})}>Sign in with email or phone</button>
    </Card>
  );
}
