/** Small canvas textures for stripes (barber pole, awnings). Cached per colour set. */
import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

export function stripeTexture(colors: string[], diagonal = false): THREE.CanvasTexture {
  const key = `${colors.join(',')}|${diagonal}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const band = 64 / colors.length;
  if (diagonal) {
    // Diagonal bands that tile vertically (for a spinning barber pole).
    for (let i = -colors.length; i < colors.length * 2; i++) {
      g.fillStyle = colors[((i % colors.length) + colors.length) % colors.length];
      g.beginPath();
      g.moveTo(i * band, 0);
      g.lineTo(i * band + band, 0);
      g.lineTo(i * band + band + 64, 64);
      g.lineTo(i * band + 64, 64);
      g.fill();
    }
  } else {
    colors.forEach((col, i) => {
      g.fillStyle = col;
      g.fillRect(i * band, 0, band, 64);
    });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  cache.set(key, tex);
  return tex;
}
