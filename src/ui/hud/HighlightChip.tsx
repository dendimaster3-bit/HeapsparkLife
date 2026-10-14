/** Shows how many search results are pinned on the map, with a clear button. */
import { useT } from '@/i18n';
import { useSearchStore } from '@/store/useSearchStore';

export function HighlightChip() {
  const t = useT();
  const n = useSearchStore((s) => s.highlight.length);
  const setHighlight = useSearchStore((s) => s.setHighlight);
  const setOpen = useSearchStore((s) => s.setOpen);
  if (!n) return null;
  return (
    <div className="pointer-events-auto flex items-center overflow-hidden rounded-full bg-spark-500 text-sm font-bold text-white shadow-lg">
      <button className="min-h-11 px-4" onClick={() => setOpen(true)}>📍 {t('search.showing', { n })}</button>
      <button className="min-h-11 border-l border-white/30 px-3" onClick={() => setHighlight([])} aria-label={t('search.clearMap')}>✕</button>
    </div>
  );
}
