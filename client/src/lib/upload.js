export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_DIMENSION = 1536; // longest side after downscaling (keeps request bodies small)
const MIN_DIMENSION = 64;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This file is not a valid image.'));
    img.src = src;
  });
}

/**
 * Validate and normalise an uploaded file.
 * - rejects wrong types / >10 MB / undecodable / tiny images (throws Error with a user-friendly message)
 * - downsizes to MAX_DIMENSION; WebP is converted to PNG for backend compatibility
 * @returns {Promise<{dataUrl, mimeType, width, height, name, size}>}
 */
export async function prepareUploadedImage(file) {
  if (!file) throw new Error('No file selected.');
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Unsupported file type. Please use PNG, JPEG or WebP.');
  if (file.size > MAX_FILE_BYTES) throw new Error('File is too large. Maximum size is 10 MB.');
  if (file.size === 0) throw new Error('The file is empty.');

  const original = await readAsDataUrl(file);
  const img = await loadImage(original);
  const { naturalWidth: w0, naturalHeight: h0 } = img;
  if (w0 < MIN_DIMENSION || h0 < MIN_DIMENSION) throw new Error('Image is too small (minimum 64×64 px).');

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w0, h0));
  const needsConversion = file.type === 'image/webp';
  if (scale === 1 && !needsConversion) {
    return { dataUrl: original, mimeType: file.type, width: w0, height: h0, name: file.name, size: file.size };
  }

  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // flatten transparency onto white
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  return { dataUrl: canvas.toDataURL(mimeType, 0.92), mimeType, width, height, name: file.name, size: file.size };
}
