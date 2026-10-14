/**
 * Accessible modal sheet: full-screen-ish bottom sheet on phones, centred
 * card on larger screens. Closes on Escape or backdrop tap.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { useT } from '@/i18n';

export function Sheet({ title, onClose, children, z = 'z-50' }: { title: string; onClose: () => void; children: ReactNode; z?: string }) {
  const t = useT();
  const panel = useRef<HTMLElement>(null);
  // Keep the latest onClose without re-running the focus effect.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, []);

  return (
    <div className={`fixed inset-0 ${z} flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-6`} onClick={onClose}>
      <section
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white text-slate-900 shadow-2xl outline-none dark:bg-slate-900 dark:text-slate-100 sm:rounded-3xl"
      >
        <header className="flex items-center gap-3 px-5 pb-2 pt-4">
          <h2 className="flex-1 text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label={t('nav.close')} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800">
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </section>
    </div>
  );
}

export const inputCls =
  'min-h-12 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-base outline-none focus:border-spark-500 dark:border-slate-700 dark:bg-slate-800';
export const primaryBtn =
  'min-h-12 w-full rounded-full bg-spark-500 px-6 text-base font-bold text-white shadow-lg transition hover:bg-spark-600 active:scale-[0.98] disabled:opacity-50';
