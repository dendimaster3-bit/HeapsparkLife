/**
 * Turns an ad creative (uploaded image or typed text) into a canvas
 * texture. Empty slots get the "Advertise here" panel. Cached per creative.
 */
import * as THREE from 'three';
import type { AdCreative } from '@/types/ads';

const cache = new Map<string, THREE.CanvasTexture>();

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number, start: number, weight = 800) {
  let size = start;
  do {
    ctx.font = `${weight} ${size}px ui-rounded, system-ui, sans-serif`;
    size -= 2;
  } while (ctx.measureText(text).width > max && size > 12);
}

/** `aspect` = width / height of the panel. */
export function creativeTexture(creative: AdCreative | null, aspect: number, emptyLabel = 'Advertise here', emptySub = 'heapspark.com/advertise'): THREE.CanvasTexture {
  const key = `${JSON.stringify(creative)}|${aspect.toFixed(2)}|${emptyLabel}|${emptySub}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const H = 256;
  const W = Math.round(H * aspect);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const centered = (text: string, y: number, max: number, size: number, weight = 800) => {
    fitText(ctx, text, max, size, weight);
    ctx.fillText(text, W / 2, y);
  };
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!creative) {
    // Empty slot: friendly dashed "Advertise here".
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);
    ctx.setLineDash([22, 14]);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(12, 12, W - 24, H - 24);
    ctx.fillStyle = '#0ea5b7';
    centered(emptyLabel, H * 0.42, W - 80, 84);
    ctx.fillStyle = '#475569';
    centered(emptySub, H * 0.72, W - 80, 40, 700);
  } else if (creative.kind === 'text') {
    ctx.fillStyle = creative.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, H - 34, W, 34);
    ctx.fillStyle = creative.fg ?? '#ffffff';
    centered(creative.headline, creative.sub ? H * 0.38 : H * 0.48, W - 60, 92);
    if (creative.sub) centered(creative.sub, H * 0.7, W - 60, 46, 600);
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText('AD', W - 30, H - 17);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Cover-fit the uploaded image.
      const s = Math.max(W / img.width, H / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      tex.needsUpdate = true;
    };
    img.src = creative.url;
  }
  cache.set(key, tex);
  return tex;
}
