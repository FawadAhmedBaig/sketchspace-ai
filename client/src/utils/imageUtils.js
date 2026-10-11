/**
 * imageUtils.js
 * 
 * Image handling utilities for SketchSpace AI.
 * Normalizes Base64 formats, manages Blob URLs, and handles client-side PNG downloads.
 */

/**
 * Ensures an image string is formatted as a valid Data URL for <img> tags.
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
 * Converts any image source into a guaranteed PNG Blob using an off-screen HTML5 Canvas
 * or direct Base64 byte array decoding.
 *
 * @param {string} imageSource
 * @returns {Promise<Blob>} Guaranteed PNG Blob
 */
export async function convertImageToPngBlob(imageSource) {
  const src = normalizeImageDataUrl(imageSource);
  if (!src) {
    throw new Error('No valid image data provided for conversion.');
  }

  // Fast path: if already a base64 PNG data URL, decode directly
  if (src.startsWith('data:image/png;base64,')) {
    try {
      const rawBase64 = src.split(',')[1];
      const binaryString = atob(rawBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'image/png' });
    } catch {
      // Fallback to canvas conversion below
    }
  }

  // Universal canvas-based converter to guarantee PNG mime-type & headers
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Only set crossOrigin if loading from external domain
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 1024;
        const height = img.naturalHeight || img.height || 768;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not acquire 2D canvas context.'));
          return;
        }

        // Render onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas buffer to genuine PNG blob
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
      // Fallback: try fetching as blob if Image constructor failed
      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          // Re-draw blob via createImageBitmap
          createImageBitmap(blob)
            .then((bitmap) => {
              const canvas = document.createElement('canvas');
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(bitmap, 0, 0);
              canvas.toBlob(
                (pngBlob) => {
                  if (pngBlob) resolve(pngBlob);
                  else reject(new Error('Canvas blob export failed.'));
                },
                'image/png',
                1.0
              );
            })
            .catch(() => resolve(blob)); // Fallback to raw blob
        })
        .catch((fetchErr) => reject(fetchErr));
    };

    img.src = src;
  });
}

/**
 * Downloads the current AI-generated design as a genuine PNG file.
 * Automatically initiates native browser download and cleans up memory.
 *
 * @param {string} imageSource - The rendered image data (Data URL, raw base64, or URL)
 * @param {string} [filename] - Desired filename ending in .png
 * @returns {Promise<boolean>} Resolves to true when download triggered
 */
export async function downloadDesignAsPng(imageSource, filename = 'sketchspace-ai-redesign.png') {
  if (!imageSource) {
    throw new Error('No design image available to download.');
  }

  // Ensure filename has .png extension
  const safeFilename = filename.toLowerCase().endsWith('.png') ? filename : `${filename}.png`;

  let objectUrl = null;

  try {
    // 1. Convert to true PNG Blob
    const pngBlob = await convertImageToPngBlob(imageSource);

    // 2. Create Object URL
    objectUrl = URL.createObjectURL(pngBlob);

    // 3. Trigger native browser file download
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);

    return true;
  } catch {
    // Ultimate fallback: direct link download
    const link = document.createElement('a');
    link.href = normalizeImageDataUrl(imageSource);
    link.download = safeFilename;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
    return true;
  } finally {
    if (objectUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 3000);
    }
  }
}
