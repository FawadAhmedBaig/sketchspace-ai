/**
 * persistence.js
 *
 * LocalStorage persistence helpers for SketchSpace AI.
 * Keeps canvas sketches, latest AI renders, design metadata, and refinement history
 * persistent across navigation between Canvas (/) and Refinement (/refine) views.
 */

export const STORAGE_KEYS = {
  CANVAS_SKETCH: 'sketchspace_canvas_sketch',
  LATEST_RENDER: 'sketchspace_latest_render',
  DESIGN_META: 'sketchspace_design_meta',
  REFINEMENT_HISTORY: 'sketchspace_refinement_history',
};

/**
 * Save the current sketch canvas as a base64 / dataURL.
 * @param {string|null} dataUrl
 */
export function saveCanvasSketch(dataUrl) {
  try {
    if (dataUrl) {
      localStorage.setItem(STORAGE_KEYS.CANVAS_SKETCH, dataUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CANVAS_SKETCH);
    }
  } catch (err) {
    console.warn('[persistence] Could not save canvas sketch:', err);
  }
}

/**
 * Retrieve the saved canvas sketch dataURL.
 * @returns {string|null}
 */
export function getCanvasSketch() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CANVAS_SKETCH) || null;
  } catch {
    return null;
  }
}

/**
 * Save the latest rendered AI image (dataURL or base64).
 * @param {string|null} imageBase64
 */
export function saveLatestRender(imageBase64) {
  try {
    if (imageBase64) {
      localStorage.setItem(STORAGE_KEYS.LATEST_RENDER, imageBase64);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LATEST_RENDER);
    }
  } catch (err) {
    console.warn('[persistence] Could not save latest render:', err);
  }
}

/**
 * Retrieve the latest rendered AI image.
 * @returns {string|null}
 */
export function getLatestRender() {
  try {
    return localStorage.getItem(STORAGE_KEYS.LATEST_RENDER) || null;
  } catch {
    return null;
  }
}

/**
 * Save design metadata (roomType, style, prompt, preserveLayout, anchors).
 * @param {object|null} meta
 */
export function saveDesignMeta(meta) {
  try {
    if (meta) {
      localStorage.setItem(STORAGE_KEYS.DESIGN_META, JSON.stringify(meta));
    } else {
      localStorage.removeItem(STORAGE_KEYS.DESIGN_META);
    }
  } catch (err) {
    console.warn('[persistence] Could not save design metadata:', err);
  }
}

/**
 * Retrieve saved design metadata.
 * @returns {object|null}
 */
export function getDesignMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DESIGN_META);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save the refinement history list.
 * @param {Array|null} history
 */
export function saveRefinementHistory(history) {
  try {
    if (history) {
      localStorage.setItem(STORAGE_KEYS.REFINEMENT_HISTORY, JSON.stringify(history));
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFINEMENT_HISTORY);
    }
  } catch (err) {
    console.warn('[persistence] Could not save refinement history:', err);
  }
}

/**
 * Retrieve the refinement history list.
 * @returns {Array}
 */
export function getRefinementHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFINEMENT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Append a step to the refinement history.
 * @param {{ type: string, instruction: string, image: string, timestamp?: number }} item
 */
export function addRefinementHistoryItem(item) {
  try {
    const history = getRefinementHistory();
    history.push({
      timestamp: Date.now(),
      ...item,
    });
    saveRefinementHistory(history);
  } catch (err) {
    console.warn('[persistence] Could not append to refinement history:', err);
  }
}

/**
 * Clear all SketchSpace cache keys from localStorage.
 * Triggered only when the user explicitly clicks "Clear", "Reset Canvas", or "New Project".
 */
export function clearSketchSpaceStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CANVAS_SKETCH);
    localStorage.removeItem(STORAGE_KEYS.LATEST_RENDER);
    localStorage.removeItem(STORAGE_KEYS.DESIGN_META);
    localStorage.removeItem(STORAGE_KEYS.REFINEMENT_HISTORY);
    console.log('[persistence] SketchSpace persistent state cleared.');
  } catch (err) {
    console.warn('[persistence] Could not clear SketchSpace storage:', err);
  }
}
