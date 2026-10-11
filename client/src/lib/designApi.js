/**
 * designApi.js
 * 
 * Centralized API client for SketchSpace AI.
 * Handles generation, refinement, and comparison export contracts for FastAPI backend.
 */

import { extractRawBase64 } from '../utils/imageUtils';

// Base API configuration from Vite environment variable
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const FORCE_DEMO_MODE = import.meta.env.VITE_FORCE_DEMO_MODE === 'true';

// Extended to 120 seconds for heavy GPU ControlNet diffusion passes
const DEFAULT_TIMEOUT_MS = 120000;

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
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. The GPU diffusion engine took longer than expected.`);
    }
    throw new Error(
      `Could not connect to AI backend at ${API_BASE_URL}. Ensure FastAPI is running on port 8000 and CORS is enabled.`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Checks backend health / availability.
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);
    if (!response) return false;
    const data = await response.json().catch(() => ({}));
    return response.ok && (data.status === 'ok' || data.status === 'success');
  } catch {
    return false;
  }
}

/**
 * Generates an initial interior design from a room sketch/photo.
 */
export async function generateDesign({
  imageBase64,
  roomType = 'Living Room',
  style = 'Modern',
  prompt = '',
  preserveLayout = true,
  isDemoMode = false,
}) {
  if (isDemoMode || FORCE_DEMO_MODE) {
    console.warn('[designApi] Demo mode enabled; generating mock render.');
    return simulateDemoGeneration({ roomType, style, prompt });
  }

  const rawBase64 = extractRawBase64(imageBase64);
  const payload = {
    image_base64: rawBase64,
    room_type: roomType,
    style: style,
    prompt: prompt || '',
    preserve_layout: Boolean(preserveLayout),
  };

  console.log(`[designApi] Dispatching POST -> ${API_BASE_URL}/api/generate`);
  const startTime = Date.now();

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[designApi] Response received in ${elapsed}s (Status: ${response.status})`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== 'success') {
    const errorMsg = data.detail || data.message || `Generation failed with status ${response.status}.`;
    throw new Error(errorMsg);
  }

  const renderedImage = data.rendered_image_base64 || data.image_url;
  if (!renderedImage) {
    throw new Error('Backend response did not contain a valid rendered image payload.');
  }

  return {
    renderedImage: renderedImage,
    detectedAnchors: data.detected_anchors || [],
    generatorUsed: data.generator_used || 'colab_controlnet',
    isMock: false,
  };
}

/**
 * Refines the current AI-generated design using natural language instructions.
 */
export async function refineDesign({
  previousImageBase64,
  instruction,
  roomType = 'Bedroom',
  style = 'Modern',
  isDemoMode = false,
}) {
  if (!instruction || !instruction.trim()) {
    throw new Error('Please provide an instruction to refine the design.');
  }

  if (!previousImageBase64) {
    throw new Error('No existing generated design found to refine.');
  }

  if (isDemoMode || FORCE_DEMO_MODE) {
    return simulateDemoRefinement({ instruction });
  }

  const payload = {
    previous_image_base64: extractRawBase64(previousImageBase64),
    instruction: instruction.trim(),
    room_type: roomType,
    style: style,
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

  const renderedImage = data.rendered_image_base64 || data.image_url;
  if (!renderedImage) {
    throw new Error('Backend response did not contain a rendered image payload.');
  }

  return {
    renderedImage: renderedImage,
    isMock: data.is_mock || false,
  };
}

/**
 * Exports a combined before/after comparison card.
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
// DEMO / MOCK SIMULATION
// --------------------------------------------------------------------------

async function simulateDemoGeneration({ roomType, style } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    renderedImage: '/stitch/ai-generated-room.jpg',
    detectedAnchors: [
      { label: 'Sofa', bounds: [120, 200, 350, 400] },
      { label: 'Window', bounds: [50, 450, 200, 500] },
    ],
    isMock: true,
  };
}

async function simulateDemoRefinement({ instruction } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    renderedImage: '/stitch/ai-generated-room.jpg',
    isMock: true,
  };
}