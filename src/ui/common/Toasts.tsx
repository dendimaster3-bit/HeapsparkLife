/** Renders the toast queue (points, stamps, badges). Announced politely to screen readers. */
import { useToastStore } from '@/store/useToastStore';

export function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(0.5rem,env(safe-area-inset-top))] z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto flex w-full max-w-sm animate-[toast-in_.35s_ease-out] items-center gap-3 rounded-2xl border-l-8 bg-white/95 px-4 py-3 text-left shadow-xl dark:bg-slate-900/95"
          style={{ borderColor: t.color ?? '#facc15' }}
        >
          <span className="text-3xl" aria-hidden>{t.icon}</span>
          <span className="min-w-0">
            <span className="block font-extrabold">{t.title}</span>
            {t.body && <span className="block text-sm text-slate-600 dark:text-slate-300">{t.body}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
