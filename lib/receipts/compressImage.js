// Client-side receipt photo compression (spec §2.1): "Client compresses
// image before upload (max ~1600px long edge, JPEG ~0.8) -- receipts are
// long; keep payloads sane." Canvas-based, no dependency.

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;

/**
 * @param {File} file
 * @returns {Promise<File>} a JPEG File, resized if it exceeded MAX_EDGE on its long edge
 */
export async function compressReceiptImage(file) {
  if (typeof window === 'undefined' || !file.type?.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) return file;

  return new File([blob], (file.name || 'receipt').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
