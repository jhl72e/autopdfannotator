/**
 * Coordinate Utility Functions
 *
 * This module provides utility functions for coordinate transformations
 * between normalized (0-1) coordinates and absolute pixel coordinates.
 * Used by annotation layers to position elements on the PDF canvas.
 */

/**
 * Convert normalized rectangle to absolute pixel coordinates
 *
 * Transforms a rectangle with normalized coordinates (0-1 range) to
 * absolute pixel coordinates based on viewport dimensions.
 *
 * @param {{x: number, y: number, w: number, h: number}} rect - Normalized rectangle (0-1)
 * @param {{width: number, height: number}} viewport - Viewport dimensions in pixels
 * @returns {{left: number, top: number, width: number, height: number}} Absolute coordinates in pixels
 *
 * @example
 * const rect = { x: 0.1, y: 0.2, w: 0.5, h: 0.3 };
 * const viewport = { width: 1000, height: 1400 };
 * const absolute = rectNormToAbs(rect, viewport);
 * // Returns: { left: 100, top: 280, width: 500, height: 420 }
 */
export const rectNormToAbs = (r, vp) => ({
  left: r.x * vp.width,
  top: r.y * vp.height,
  width: (r.w ?? 0) * vp.width,
  height: (r.h ?? 0) * vp.height,
});

/**
 * Convert normalized size to pixel dimensions (Legacy)
 *
 * @deprecated Use rectNormToAbs instead. This function is kept for backward compatibility.
 *
 * Transforms normalized rectangle coordinates to absolute pixel coordinates.
 * This is an alias for rectNormToAbs maintained for backward compatibility.
 *
 * @param {{x: number, y: number, w: number, h: number}} r - Normalized rectangle (0-1)
 * @param {{width: number, height: number}} vp - Viewport dimensions in pixels
 * @returns {{left: number, top: number, width: number, height: number}} Absolute coordinates in pixels
 */
export const NormSizeToPixel = (r, vp) => ({
  left: r.x * vp.width,
  top: r.y * vp.height,
  width: (r.w ?? 0) * vp.width,
  height: (r.h ?? 0) * vp.height,
});

/**
 * Convert normalized point to absolute pixel coordinates
 *
 * Transforms a point with normalized coordinates (0-1 range) to
 * absolute pixel coordinates based on viewport dimensions.
 *
 * @param {{x: number, y: number}} point - Normalized point (0-1)
 * @param {{width: number, height: number}} viewport - Viewport dimensions in pixels
 * @returns {{x: number, y: number}} Absolute coordinates in pixels
 *
 * @example
 * const point = { x: 0.5, y: 0.5 };
 * const viewport = { width: 1000, height: 1400 };
 * const absolute = pointNormToAbs(point, viewport);
 * // Returns: { x: 500, y: 700 }
 */
export function pointNormToAbs(point, viewport) {
  return {
    x: point.x * viewport.width,
    y: point.y * viewport.height
  };
}
