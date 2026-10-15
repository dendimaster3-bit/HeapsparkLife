/**
 * Share card preview + share targets: the phone's native share sheet (with
 * the image when supported), WhatsApp, Facebook, save image, copy link.
 */
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { useT } from '@/i18n';
import { renderShareCard } from '@/lib/shareCard';
import { useShareStore } from '@/store/useShareStore';
import { Sheet } from '../common/Sheet';

const btn = 'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold shadow-sm active:scale-95';

export function ShareSheet() {
  const t = useT();
  const { payload, close } = useShareStore();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!payload) return;
    let objectUrl: string | null = null;
    setBlob(null);
    setCopied(false);
    void renderShareCard(payload.card).then((b) => {
      objectUrl = URL.createObjectURL(b);
      setBlob(b);
      setUrl(objectUrl);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [payload]);

  if (!payload) return null;
  const track = () => payload.businessId && api.events.track('share', payload.businessId);
  const file = blob ? new File([blob], 'heapspark-life.png', { type: 'image/png' }) : null;
  const canNative = typeof navigator.share === 'function';
  const canFiles = !!file && !!navigator.canShare?.({ files: [file] });

  const nativeShare = async () => {
    try {
      await navigator.share(canFiles ? { files: [file!], text: payload.text, url: payload.url } : { text: payload.text, url: payload.url });
      track();
    } catch {
      /* cancelled */
    }
  };

  return (
    <Sheet title={t('share.title')} onClose={close} z="z-[75]">
      <div className="space-y-3">
        {url ? (
          <img src={url} alt={payload.card.headline} className="mx-auto aspect-square w-full max-w-xs rounded-2xl shadow" />
        ) : (
          <div className="mx-auto aspect-square w-full max-w-xs animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        )}
        <p className="text-center text-sm">{payload.text}</p>
        {canNative && (
          <button className={`${btn} w-full bg-spark-500 text-white`} onClick={() => void nativeShare()}>📤 {t('share.native')}</button>
        )}
        <div className="flex gap-2">
          <a className={`${btn} bg-[#25D366] text-[#0b3d1f]`} href={`https://wa.me/?text=${encodeURIComponent(`${payload.text} ${payload.url}`)}`} target="_blank" rel="noreferrer" onClick={track}>
            💬 {t('share.whatsapp')}
          </a>
          <a className={`${btn} bg-[#1877F2] text-white`} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payload.url)}`} target="_blank" rel="noreferrer" onClick={track}>
            f {t('share.facebook')}
          </a>
        </div>
        <div className="flex gap-2">
          {url && (
            <a className={`${btn} bg-slate-100 dark:bg-slate-800`} href={url} download="heapspark-life.png" onClick={track}>⬇️ {t('share.download')}</a>
          )}
          <button
            className={`${btn} bg-slate-100 dark:bg-slate-800`}
            onClick={() => {
              void navigator.clipboard?.writeText(payload.url).then(() => setCopied(true));
              track();
            }}
          >
            🔗 {copied ? t('share.copied') : t('share.copy')}
          </button>
        </div>
        {payload.businessId && <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t('share.note')}</p>}
      </div>
    </Sheet>
  );
}
