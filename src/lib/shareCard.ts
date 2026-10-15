/**
 * Draws a square share card (1080×1080 PNG) on a canvas: brand-coloured
 * background, a little island, a big emoji and the headline. No external
 * images or fonts, so it works offline and never leaks anything personal.
 */

export interface ShareCardInput {
  headline: string;
  sub: string;
  emoji: string;
  accent: string;
  footer?: string;
}

import { COAST, ISLAND_BOUNDS, offsetPolygon } from './geo';

const S = 1080;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderShareCard({ headline, sub, emoji, accent, footer = 'Heapspark Life · heapspark.com' }: ShareCardInput): Promise<Blob> {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d')!;

  // Background: accent → lagoon teal.
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, accent);
  bg.addColorStop(1, '#0ea5b7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // The island itself, drawn from the game's coastline data (lower right).
  const { minX, maxX, minZ, maxZ } = ISLAND_BOUNDS;
  const k = 380 / (maxZ - minZ);
  const ox = S - 70 - (maxX - minX) * k, oy = S - 60 - (maxZ - minZ) * k;
  const island = (grow: number) => {
    const pts = offsetPolygon(COAST, grow);
    ctx.beginPath();
    pts.forEach(([x, z], i) => (i ? ctx.lineTo(ox + (x - minX) * k, oy + (z - minZ) * k) : ctx.moveTo(ox + (x - minX) * k, oy + (z - minZ) * k)));
    ctx.closePath();
  };
  ctx.lineJoin = 'round';
  island(2.2);
  ctx.fillStyle = 'rgba(167,243,208,0.45)'; // lagoon
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; // reef
  ctx.lineWidth = 4;
  ctx.stroke();
  island(0);
  ctx.fillStyle = '#6cc04a';
  ctx.fill();
  ctx.strokeStyle = '#f1dfa6'; // beaches
  ctx.lineWidth = 8;
  ctx.stroke();

  // Sun
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(S * 0.86, S * 0.14, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = '160px system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(emoji, 80, 90);

  ctx.font = '800 76px ui-rounded, system-ui, sans-serif';
  let y = 300;
  for (const line of wrap(ctx, headline, S - 160).slice(0, 5)) {
    ctx.fillText(line, 80, y);
    y += 92;
  }
  ctx.font = '600 44px ui-rounded, system-ui, sans-serif';
  ctx.globalAlpha = 0.92;
  for (const line of wrap(ctx, sub, S * 0.5).slice(0, 3)) {
    y += 8;
    ctx.fillText(line, 80, y + 20);
    y += 54;
  }
  ctx.globalAlpha = 1;

  // Footer pill
  ctx.font = '700 40px ui-rounded, system-ui, sans-serif';
  const fw = ctx.measureText(footer).width + 60;
  ctx.fillStyle = 'rgba(15,23,42,0.75)';
  ctx.beginPath();
  ctx.roundRect(80, S - 150, fw, 76, 38);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(footer, 110, S - 132);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas'))), 'image/png'));
}

/** Public link into the game (optionally focused on a business). */
export function gameUrl(businessId?: string) {
  const base = `${location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/`;
  return businessId ? `${base}?b=${encodeURIComponent(businessId)}` : base;
}
