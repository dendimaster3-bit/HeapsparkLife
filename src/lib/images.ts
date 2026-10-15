/**
 * Resize an uploaded image in the browser before storing it (keeps uploads
 * small for mobile data and, in demo mode, for localStorage).
 */
export async function resizeImage(file: File, maxSize: number, type: 'image/png' | 'image/jpeg' = 'image/jpeg', quality = 0.75): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not-an-image');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('bad-image'));
      i.src = url;
    });
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const ctx = c.getContext('2d')!;
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(type, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
