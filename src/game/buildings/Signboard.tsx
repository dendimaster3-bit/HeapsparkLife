/**
 * Signboard with the business name in its brand colour, drawn to a small
 * canvas texture (no font download). If the business uploaded a logo it is
 * drawn on the left. Dims when the business is closed.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { GEO, type BaseSpec } from './kit';

const W = 512, H = 128;

function draw(ctx: CanvasRenderingContext2D, name: string, brand: string, logo?: HTMLImageElement) {
  ctx.fillStyle = brand;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  let x = 24;
  if (logo) {
    const s = H - 32;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 16, s, s);
    ctx.drawImage(logo, 20, 20, s - 8, s - 8);
    x = s + 32;
  }
  // Pick a readable text colour for the brand background.
  const c = new THREE.Color(brand);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  ctx.fillStyle = lum > 0.55 ? '#111827' : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = logo ? 'left' : 'center';
  let size = 64;
  const maxW = W - x - 24;
  do {
    ctx.font = `800 ${size}px ui-rounded, system-ui, sans-serif`;
    size -= 2;
  } while (ctx.measureText(name).width > maxW && size > 18);
  ctx.fillText(name, logo ? x : W / 2, H / 2 + 2);
}

export function Signboard({ spec, name, brand, logoUrl, open }: { spec: BaseSpec; name: string; brand: string; logoUrl?: string; open: boolean }) {
  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    draw(ctx, name, brand);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return { texture, ctx };
  }, [name, brand]);

  // Load the uploaded logo (if any) and redraw.
  useEffect(() => {
    if (!logoUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      draw(ctx, name, brand, img);
      texture.needsUpdate = true;
    };
    img.src = logoUrl;
  }, [logoUrl, ctx, name, brand, texture]);

  useEffect(() => () => texture.dispose(), [texture]);

  const h = Math.min(0.42, spec.signW / 4);
  return (
    <mesh geometry={GEO.plane} position={[0, spec.signY, spec.d / 2 + spec.signOut]} scale={[spec.signW, h, 1]}>
      <meshBasicMaterial map={texture} color={open ? '#ffffff' : '#8b8b8b'} toneMapped={false} />
    </mesh>
  );
}
