/**
 * designApi.js
 *
 * Service layer for SketchSpace AI Design & Refine workflow.
 * Wraps the backend API calls:
 *   - GET  /api/health   → Health check
 *   - GET  /api/presets   → List available presets
 *   - POST /api/generate  → Generate initial design
 *   - POST /api/refine    → Refine existing design
 *
 * Used by useDesignWorkflow.js for the DesignAndRefineScreen page.
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
const TIMEOUT_MS = 120_000;

/**
 * Check if the backend is reachable.
 * GET /api/health
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  if (!API_URL) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`${API_URL}/api/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * List available presets from the backend.
 * GET /api/presets
 * @returns {Promise<Array>}
 */
export async function listPresets() {
  if (!API_URL) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(`${API_URL}/api/presets`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.presets || []);
  } catch {
    return [];
  }
}

/**
 * Generate an initial AI design from the original sketch/image.
 * POST /api/generate
 *
 * In demo mode, simulates a 1.5s delay and returns a placeholder.
 *
 * @param {{ imageBase64: string, roomType: string, style: string, prompt?: string, preserveLayout?: boolean, isDemoMode?: boolean }} params
 * @returns {Promise<{ renderedImage: string, isMock: boolean }>}
 */
export async function generateDesign({
  imageBase64,
  roomType,
  style,
  prompt = '',
  preserveLayout = true,
  isDemoMode = false,
}) {
  if (isDemoMode) {
    await sleep(1500);
    return {
      renderedImage: '/stitch/ai-generated-room.jpg',
      isMock: true,
    };
  }

  const body = {
    image_base64: imageBase64,
    room_type: roomType,
    style,
    prompt,
    preserve_layout: preserveLayout,
  };

  const data = await apiRequest('/api/generate', body);

  let renderedImage = data.rendered_image_base64 || data.image_url;
  if (!renderedImage) {
    throw new Error('The server did not return a generated image.');
  }
  if (!renderedImage.startsWith('data:')) {
    renderedImage = `data:image/jpeg;base64,${renderedImage}`;
  }

  return { renderedImage, isMock: false };
}

/**
 * Refine an existing AI-generated design with a text instruction.
 * POST /api/refine
 *
 * In demo mode, simulates a 2s delay and returns the same placeholder.
 *
 * @param {{ previousImageBase64: string, instruction: string, roomType?: string, style?: string, isDemoMode?: boolean }} params
 * @returns {Promise<{ renderedImage: string, isMock: boolean }>}
 */
export async function refineDesign({
  previousImageBase64,
  instruction,
  roomType = 'Bedroom',
  style = 'Modern',
  isDemoMode = false,
}) {
  if (isDemoMode) {
    await sleep(2000);
    return {
      renderedImage: '/stitch/ai-generated-room.jpg',
      isMock: true,
    };
  }

  const body = {
    previous_image_base64: previousImageBase64,
    instruction,
    room_type: roomType,
    style,
  };

  const data = await apiRequest('/api/refine', body);

  let renderedImage = data.rendered_image_base64 || data.image_url;
  if (!renderedImage) {
    throw new Error('The server did not return a refined image.');
  }
  if (!renderedImage.startsWith('data:')) {
    renderedImage = `data:image/jpeg;base64,${renderedImage}`;
  }

  return { renderedImage, isMock: data.is_mock || false };
}

// ─── Helpers ───────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(path, body) {
  if (!API_URL) {
    throw new Error('Backend URL is not configured. Set VITE_API_URL in client/.env.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('The server returned an unreadable response.');
    }

    if (!res.ok) {
      const detail =
        typeof data?.detail === 'string'
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map((e) => e.msg).join('; ')
            : `Request failed (HTTP ${res.status}).`;
      throw new Error(detail);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. The server may be waking up — try again in a minute.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
