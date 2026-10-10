/**
 * designApi.js
 * 
 * Centralized API client for SketchSpace AI.
 * Handles generation, refinement, and comparison export contracts for FastAPI backend.
 * 
 * Flutter Developer Note:
 * In Flutter, this is analogous to an ApiClient or Repository class using `http` or `dio`.
 * In React, we use the browser's native `fetch()` API with async/await and standard Promises.
 */

import { extractRawBase64 } from '../utils/imageUtils';

// Base API configuration from Vite environment variable
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const FORCE_DEMO_MODE = import.meta.env.VITE_FORCE_DEMO_MODE === 'true';

// Default request timeout: 50 seconds for heavy AI diffusion workflows
const DEFAULT_TIMEOUT_MS = 50000;

/**
 * Helper to execute fetch requests with an AbortController timeout
 * and unified error extraction.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. The AI backend is taking longer than expected.`);
    }
    // Network errors (e.g., connection refused, CORS failure)
    throw new Error(
      `Could not connect to AI backend at ${API_BASE_URL}. Ensure FastAPI is running and CORS is enabled, or switch to Demo Mode.`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks backend health / availability.
 * Useful for the status badge in the UI header.
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/docs`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    return response !== null && response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Generates an initial interior design from a room sketch/photo.
 *
 * Backend Contract:
 * POST /api/generate
 * Request: { image_base64, room_type, style, prompt, preserve_layout }
 * Response: { status: "success", detected_anchors: [], rendered_image_base64: "..." }
 *
 * @param {Object} params
 * @param {string} params.imageBase64 - Input sketch/photo
 * @param {string} params.roomType - e.g. "Living Room", "Bedroom"
 * @param {string} params.style - e.g. "Modern", "Scandinavian"
 * @param {string} [params.prompt] - Optional design instructions
 * @param {boolean} [params.preserveLayout] - Defaults to true
 * @param {boolean} [params.isDemoMode] - Force local mock response
 * @returns {Promise<{ renderedImage: string, detectedAnchors: Array, isMock: boolean }>}
 */
export async function generateDesign({
  imageBase64,
  roomType = 'Living Room',
  style = 'Modern',
  prompt = '',
  preserveLayout = true,
  isDemoMode = false,
}) {
  // If demo mode is active or forced
  if (isDemoMode || FORCE_DEMO_MODE) {
    return simulateDemoGeneration({ roomType, style, prompt });
  }

  const payload = {
    image_base64: extractRawBase64(imageBase64),
    room_type: roomType,
    style: style,
    prompt: prompt || '',
    preserve_layout: Boolean(preserveLayout),
  };

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== 'success') {
    const errorMsg = data.detail || data.message || `Generation failed with status ${response.status}.`;
    throw new Error(errorMsg);
  }

  if (!data.rendered_image_base64) {
    throw new Error('Backend response did not contain a rendered image payload.');
  }

  return {
    renderedImage: data.rendered_image_base64,
    detectedAnchors: data.detected_anchors || [],
    isMock: false,
  };
}

/**
 * Refines the current AI-generated design using natural language instructions.
 *
 * Backend Contract:
 * POST /api/refine
 * Request: { previous_image_base64, instruction }
 * Response: { status: "success", rendered_image_base64: "..." }
 *
 * @param {Object} params
 * @param {string} params.previousImageBase64 - The latest successfully generated design
 * @param {string} params.instruction - Natural language edit
 * @param {boolean} [params.isDemoMode] - Force local mock response
 * @returns {Promise<{ renderedImage: string, isMock: boolean }>}
 */
export async function refineDesign({
  previousImageBase64,
  instruction,
  isDemoMode = false,
}) {
  if (!instruction || !instruction.trim()) {
    throw new Error('Please provide an instruction to refine the design.');
  }

  if (!previousImageBase64) {
    throw new Error('No existing generated design found to refine.');
  }

  // If demo mode is active or forced
  if (isDemoMode || FORCE_DEMO_MODE) {
    return simulateDemoRefinement({ instruction });
  }

  const payload = {
    previous_image_base64: extractRawBase64(previousImageBase64),
    instruction: instruction.trim(),
  };

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/refine`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== 'success') {
    const errorMsg = data.detail || data.message || `Refinement failed with status ${response.status}.`;
    throw new Error(errorMsg);
  }

  if (!data.rendered_image_base64) {
    throw new Error('Backend response did not contain a rendered image payload.');
  }

  return {
    renderedImage: data.rendered_image_base64,
    isMock: false,
  };
}

/**
 * Exports a combined before/after comparison card.
 *
 * Backend Contract:
 * POST /api/export
 * Request: { sketch_image_base64, rendered_image_base64 }
 * Response: { status: "success", export_card_base64: "..." }
 */
export async function exportComparisonCard({
  sketchImageBase64,
  renderedImageBase64,
  isDemoMode = false,
}) {
  if (isDemoMode || FORCE_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      exportCardBase64: renderedImageBase64,
      isMock: true,
    };
  }

  const payload = {
    sketch_image_base64: extractRawBase64(sketchImageBase64),
    rendered_image_base64: extractRawBase64(renderedImageBase64),
  };

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/export`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.detail || data.message || 'Export failed.');
  }

  return {
    exportCardBase64: data.export_card_base64,
    isMock: false,
  };
}

// --------------------------------------------------------------------------
// DEMO / MOCK SIMULATION (For hackathon testing & frontend isolation)
// Explicitly flagged so mock behavior is NEVER mistaken for live API calls.
// --------------------------------------------------------------------------

async function simulateDemoGeneration({ _roomType, _style, _prompt } = {}) {
  // Simulate 1.6s inference latency
  await new Promise((resolve) => setTimeout(resolve, 1600));

  return {
    renderedImage: '/stitch/ai-generated-room.jpg',
    detectedAnchors: [
      { label: 'Sofa', bounds: [120, 200, 350, 400] },
      { label: 'Coffee Table', bounds: [220, 250, 300, 350] },
      { label: 'Window', bounds: [50, 450, 200, 500] },
    ],
    isMock: true,
  };
}

async function simulateDemoRefinement({ _instruction } = {}) {
  // Simulate 1.8s inference latency
  await new Promise((resolve) => setTimeout(resolve, 1800));

  return {
    renderedImage: '/stitch/ai-generated-room.jpg',
    isMock: true,
  };
}
