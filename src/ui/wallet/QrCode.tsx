/** Renders a QR code as inline SVG (the `qrcode` lib is loaded on demand). */
import { useEffect, useState } from 'react';

export function QrCode({ value, size = 240, label }: { value: string; size?: number; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void import('qrcode').then((QR) =>
      QR.toString(value, { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }).then((s) => {
        if (alive) setSvg(s);
      }),
    );
    return () => {
      alive = false;
    };
  }, [value]);
  return (
    <div
      role="img"
      aria-label={label}
      className="mx-auto rounded-2xl bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      // SVG markup generated locally by the qrcode library from our own URL.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
