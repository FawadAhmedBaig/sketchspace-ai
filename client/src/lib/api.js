/**
 * Backend client for SketchSpace AI (FastAPI, see server/main.py on feat/ai-core-pipeline).
 *
 *   GET  /api/health   -> { status: "ok", service: "..." }
 *   GET  /api/presets   -> List of available presets
 *   POST /api/generate -> { status: "success", detected_anchors: string[], rendered_image_base64: "data:image/jpeg;base64,..." }
 *   POST /api/refine   -> { status: "success", rendered_image_base64: "..." }
 *   Errors             -> { detail: string } (400/500) or { detail: [{ loc, msg, type }] } (422)
 *
 * The base URL comes from VITE_API_URL (client/.env). Nothing else hardcodes it.
 */
import { parseDataUrl } from './exportImage';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
// ControlNet diffusion via Colab can take 20-35s; allow up to 120s total.
export const GENERATE_TIMEOUT_MS = 120_000;
export const HEALTH_TIMEOUT_MS = 60_000;

/** kind: 'config' | 'network' | 'timeout' | 'aborted' | 'http' | 'invalid' | 'validation' */
export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

function extractDetail(data) {
  const d = data?.detail;
  if (typeof d === 'string') return d.slice(0, 200);
  if (Array.isArray(d)) {
    return d
      .map((e) => `${(e.loc || []).filter((p) => p !== 'body').join('.') || 'request'}: ${e.msg}`)
      .join('; ')
      .slice(0, 200);
  }
  return '';
}

function httpMessage(status, detail) {
  if (status === 413) return 'The image is too large for the server. Try a smaller image.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status === 502 || status === 503 || status === 504)
    return 'The server is temporarily unavailable or still waking up. Wait about a minute and try again.';
  if (status === 422) return `The server could not read the request${detail ? ` (${detail})` : ''}.`;
  if (status === 400) return detail || 'The server rejected the request.';
  if (status >= 500) return `The AI service hit an error${detail ? `: ${detail}` : ''}. Please try again.`;
  return `Request failed (HTTP ${status}).`;
}

async function request(path, { method = 'GET', body, signal, timeoutMs }) {
  if (!API_URL) {
    throw new ApiError('config', 'The backend URL is not configured. Set VITE_API_URL in client/.env and restart the dev server.');
  }
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* non-JSON body, e.g. an HTML error page from the host */
    }
    if (!res.ok) throw new ApiError('http', httpMessage(res.status, extractDetail(data)), res.status);
    if (data === null || typeof data !== 'object') {
      throw new ApiError('invalid', 'The server sent a response the app could not read.', res.status);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (timedOut) throw new ApiError('timeout', 'The server took too long to respond. It may be waking up, so try again in a minute.');
    if (signal?.aborted) throw new ApiError('aborted', 'Request cancelled.');
    throw new ApiError('network', 'Could not reach the server. Check your internet connection, or the backend may be offline.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

/** GET /api/health. Resolves true when the backend reports status "ok". */
export async function checkHealth({ signal } = {}) {
  const data = await request('/api/health', { signal, timeoutMs: HEALTH_TIMEOUT_MS });
  return data.status === 'ok';
}

/** GET /api/presets. Returns list of available presets. */
export async function listPresets({ signal } = {}) {
  try {
    const data = await request('/api/presets', { signal, timeoutMs: HEALTH_TIMEOUT_MS });
    return Array.isArray(data) ? data : (data.presets || []);
  } catch {
    return [];
  }
}

/**
 * POST /api/generate
 * @param payload  from buildGeneratePayload(): { image_base64, room_type, style, prompt, preserve_layout }
 * @returns {{ anchors: string[], imageDataUrl: string }}
 */
export async function generateDesign(payload, { signal } = {}) {
  const data = await request('/api/generate', { method: 'POST', body: payload, signal, timeoutMs: GENERATE_TIMEOUT_MS });

  let imageDataUrl = data.rendered_image_base64;
  if (data.status !== 'success' || typeof imageDataUrl !== 'string' || !imageDataUrl) {
    throw new ApiError('invalid', 'The server did not return a generated image.');
  }
  // Documented format is a full data URL. Accept raw Base64 defensively (assumed JPEG).
  if (!imageDataUrl.startsWith('data:')) imageDataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
  if (!parseDataUrl(imageDataUrl)) throw new ApiError('invalid', 'The generated image was empty or in an unsupported format.');

  const anchors = Array.isArray(data.detected_anchors) ? data.detected_anchors.filter((a) => typeof a === 'string') : [];
  return { anchors, imageDataUrl };
}

/**
 * POST /api/refine
 * @param payload  { previous_image_base64, instruction }
 * @returns {{ imageDataUrl: string }}
 */
export async function refineDesign(payload, { signal } = {}) {
  const data = await request('/api/refine', { method: 'POST', body: payload, signal, timeoutMs: GENERATE_TIMEOUT_MS });

  let imageDataUrl = data.rendered_image_base64;
  if (data.status !== 'success' || typeof imageDataUrl !== 'string' || !imageDataUrl) {
    throw new ApiError('invalid', 'The server did not return a refined image.');
  }
  if (!imageDataUrl.startsWith('data:')) imageDataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
  if (!parseDataUrl(imageDataUrl)) throw new ApiError('invalid', 'The refined image was empty or in an unsupported format.');

  return { imageDataUrl };
}
