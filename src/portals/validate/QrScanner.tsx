/**
 * Camera QR scanner for the validation page (uses @zxing/browser, which is
 * only downloaded when staff tap "Scan QR"). Needs HTTPS (or localhost).
 */
import { useEffect, useRef } from 'react';

export default function QrScanner({ onResult, onError }: { onResult: (text: string) => void; onError: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (cancelled || !video.current) return;
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          video.current,
          (result) => {
            if (result) {
              controls.stop();
              onResult(result.getText());
            }
          },
        );
        stop = () => controls.stop();
        if (cancelled) stop();
      } catch {
        if (!cancelled) onError();
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [onResult, onError]);
  return <video ref={video} className="aspect-square w-full rounded-2xl bg-black object-cover" muted playsInline />;
}
