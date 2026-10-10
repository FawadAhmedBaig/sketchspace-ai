/**
 * imageUtils.js
 * 
 * Image handling utilities for SketchSpace AI.
 * Normalizes Base64 formats, manages Blob URLs, and handles client-side PNG downloads.
 * 
 * Flutter Developer Note:
 * In Flutter, you would use Image.memory(base64Decode(str)) or ImageProvider.
 * In React/Web, images in the DOM require standard URL strings — either:
 * 1) A Data URL: `data:image/png;base64,iVBORw...`
 * 2) An Object URL: `blob:http://...`
 * 3) A standard remote HTTP URL: `https://...`
 */

/**
 * Ensures an image string is formatted as a valid Data URL for <img> tags.
 * Handles:
 * - Already prefixed Data URLs (e.g. data:image/png;base64,...)
 * - Raw Base64 payloads (prepends data:image/png;base64,)
 * - Relative or absolute URLs (e.g. /demo/sketch.png)
 *
 * @param {string|null} imageSource
 * @returns {string|null} Valid image URL or null
 */
export function normalizeImageDataUrl(imageSource) {
  if (!imageSource || typeof imageSource !== 'string') {
    return null;
  }

  const trimmed = imageSource.trim();

  // If already a data URL, blob URL, or regular web path/URL
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./')
  ) {
    return trimmed;
  }

  // Raw base64 string returned from backend: assume PNG
  return `data:image/png;base64,${trimmed}`;
}

/**
 * Strips the Data URL prefix to return raw Base64 if needed by the backend.
 * 
 * @param {string|null} dataUrl
 * @returns {string} Raw Base64 string
 */
export function extractRawBase64(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex !== -1 && dataUrl.startsWith('data:')) {
    return dataUrl.slice(commaIndex + 1);
  }
  return dataUrl;
}

/**
 * Converts any image source (URL, Data URL, WebP, JPEG, etc.) into a true PNG Blob
 * using an off-screen HTML5 Canvas.
 * 
 * Why this is critical:
 * Simply renaming a WebP or JPEG download to ".png" corrupts headers.
 * Rendering onto an HTML5 canvas and using `canvas.toBlob(..., 'image/png')`
 * guarantees genuine PNG encoding across all browsers.
 *
 * @param {string} imageSource
 * @returns {Promise<Blob>} PNG Blob
 */
export function convertImageToPngBlob(imageSource) {
  return new Promise((resolve, reject) => {
    const src = normalizeImageDataUrl(imageSource);
    if (!src) {
      reject(new Error('No valid image data provided for conversion.'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (width === 0 || height === 0) {
          reject(new Error('Invalid image dimensions.'));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not acquire 2D canvas context.'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to a true PNG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas PNG export returned null blob.'));
            }
          },
          'image/png',
          1.0
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for PNG export.'));
    };

    img.src = src;
  });
}

/**
 * Downloads the current AI-generated design as a genuine PNG file.
 * Automatically cleans up temporary Blob URLs to prevent memory leaks.
 *
 * @param {string} imageSource - The rendered image data (Data URL, raw base64, or URL)
 * @param {string} [filename] - Desired filename
 * @returns {Promise<boolean>} Resolves to true when download triggered
 */
export async function downloadDesignAsPng(imageSource, filename = 'sketchspace-design.png') {
  if (!imageSource) {
    throw new Error('No design image available to download.');
  }

  // Ensure filename ends with .png
  const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;

  let objectUrl = null;

  try {
    // Convert to a true PNG Blob via HTML5 Canvas
    const pngBlob = await convertImageToPngBlob(imageSource);

    // Create temporary browser Object URL
    objectUrl = URL.createObjectURL(pngBlob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } finally {
    // Release the Object URL to free browser memory
    if (objectUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  }
}
