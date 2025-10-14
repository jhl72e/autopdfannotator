/**
 * Viewport Utility Functions
 *
 * This module provides utility functions for PDF viewport calculations
 * and transformations. These functions are used by the PDF viewer to
 * calculate viewport dimensions and manage scaling.
 */

/**
 * Calculate viewport from PDF page
 *
 * Creates a viewport object from a PDF.js page with the specified scale.
 * The viewport contains dimensions and transformation matrix for rendering.
 *
 * @param {Object} page - PDF.js page object
 * @param {number} scale - Scale factor for rendering
 * @returns {Object} Viewport object with width, height, and transform matrix
 *
 * @example
 * const viewport = calculateViewport(pdfPage, 1.5);
 * // Returns: { width: 1200, height: 1600, scale: 1.5, ... }
 */
export function calculateViewport(page, scale) {
  if (!page) {
    throw new Error('Page object is required');
  }

  return page.getViewport({ scale });
}

/**
 * Get viewport dimensions
 *
 * Extracts width and height from a viewport object.
 * Useful for coordinate transformations and layout calculations.
 *
 * @param {Object} viewport - Viewport object from PDF.js
 * @returns {{width: number, height: number}} Dimensions object
 *
 * @example
 * const { width, height } = getViewportDimensions(viewport);
 * // Returns: { width: 1200, height: 1600 }
 */
export function getViewportDimensions(viewport) {
  if (!viewport) {
    return { width: 0, height: 0 };
  }

  return {
    width: viewport.width,
    height: viewport.height
  };
}

/**
 * Calculate scaled dimensions
 *
 * Calculates dimensions for a given scale factor.
 * Used when zoom level changes to determine new canvas size.
 *
 * @param {number} baseWidth - Original width
 * @param {number} baseHeight - Original height
 * @param {number} scale - Scale factor
 * @returns {{width: number, height: number}} Scaled dimensions
 *
 * @example
 * const scaled = calculateScaledDimensions(800, 1000, 1.5);
 * // Returns: { width: 1200, height: 1500 }
 */
export function calculateScaledDimensions(baseWidth, baseHeight, scale) {
  return {
    width: baseWidth * scale,
    height: baseHeight * scale
  };
}
