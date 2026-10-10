/**
 * Image export helpers — the ONLY place that knows what format the backend wants.
 *
 * CONFIRMED from server/main.py (branch feat/ai-core-pipeline): clean_base64() strips anything up to the
 * first comma, so POST /api/generate accepts BOTH the full data URL and raw Base64.
 * We send the full data URL. If the backend ever changes, flip this single constant.
 * (Not verified against the live Render deployment, which we could not reach from the build sandbox.)
 */
export const BACKEND_IMAGE_FORMAT = 'data_url'; // 'data_url' | 'raw_base64'

const DATA_URL_HEADER = /^data:(image\/(?:png|jpeg|webp));base64,/;

/** Split a data URL into { mimeType, base64 }. Returns null if it is not a valid image data URL. */
export function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = DATA_URL_HEADER.exec(dataUrl.slice(0, 64));
  if (!match) return null;
  const base64 = dataUrl.slice(match[0].length);
  if (base64.length < 100) return null; // an empty/near-empty image
  return { mimeType: match[1], base64 };
}

/** Convert a data URL into whatever the backend expects (see BACKEND_IMAGE_FORMAT). */
export function formatImageForBackend(dataUrl, format = BACKEND_IMAGE_FORMAT) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('Invalid image data.');
  return format === 'raw_base64' ? parsed.base64 : dataUrl;
}

/**
 * Build the body for POST /api/generate.
 * @param {object} image  result of workspaceRef.current.getImage() (must have ok === true)
 * @param {object} fields { room_type, style, prompt, preserve_layout } from the parent's form
 */
export function buildGeneratePayload(image, { room_type, style, prompt = '', preserve_layout = true }) {
  if (!image?.ok) throw new Error(image?.error || 'No image available.');
  return {
    image_base64: image.imageForBackend,
    room_type,
    style,
    prompt,
    preserve_layout,
  };
}
