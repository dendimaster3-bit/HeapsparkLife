/** DOM rendering of an ad creative (loading screen, arrival banner). */
import { useT } from '@/i18n';
import type { AdCreative } from '@/types/ads';

export function AdCreativeView({ creative, className = '' }: { creative: AdCreative | null; className?: string }) {
  const t = useT();
  if (!creative) {
    return (
      <div className={`rounded-xl border-2 border-dashed border-slate-500/40 px-4 py-2 text-center ${className}`}>
        <span className="block font-bold">{t('ads.here')}</span>
        <span className="block text-xs opacity-75">heapspark.com/advertise</span>
      </div>
    );
  }
  if (creative.kind === 'image') return <img src={creative.url} alt={creative.alt} className={`rounded-xl object-cover ${className}`} />;
  return (
    <div className={`relative rounded-xl px-4 py-3 text-center shadow ${className}`} style={{ background: creative.bg, color: creative.fg ?? '#fff' }}>
      <span className="block text-lg font-extrabold leading-tight">{creative.headline}</span>
      {creative.sub && <span className="block text-sm opacity-90">{creative.sub}</span>}
      <span className="absolute bottom-1 right-2 text-[10px] font-bold opacity-70">{t('ads.label')}</span>
    </div>
  );
}
