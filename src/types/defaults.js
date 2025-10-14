/**
 * Default Values for Annotation Normalization
 *
 * This module defines default values used when annotation fields are missing
 * or invalid. These defaults ensure annotations render visibly and safely.
 *
 * @module types/defaults
 */

/**
 * Default values for base annotation fields (common to all types)
 *
 * @constant {Object}
 * @property {number} page - Default page number (first page)
 * @property {number} start - Default start time (display immediately)
 * @property {number} end - Default end time (static display, no animation)
 */
export const BASE_DEFAULTS = {
  page: 1,
  start: 0,
  end: 0
};

/**
 * Default values for highlight annotations
 *
 * Creates a visible yellow highlight near the top of the page.
 *
 * @constant {Object}
 * @property {string} mode - Highlight mode (only 'quads' supported)
 * @property {Array<Object>} quads - Default rectangular regions
 * @property {Object} style - Default styling
 */
export const HIGHLIGHT_DEFAULTS = {
  mode: 'quads',
  quads: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.05 }],
  style: { color: 'rgba(255, 255, 0, 0.3)' }
};

/**
 * Default values for text annotations
 *
 * Creates a visible text box in the top-left with placeholder content.
 *
 * @constant {Object}
 * @property {string} content - Placeholder text
 * @property {number} x - Normalized x position (10% from left)
 * @property {number} y - Normalized y position (10% from top)
 * @property {number} w - Normalized width (30% of page width)
 * @property {number} h - Normalized height (10% of page height)
 * @property {Object} style - Default styling with white background and black text
 */
export const TEXT_DEFAULTS = {
  content: '[No content]',
  x: 0.1,
  y: 0.1,
  w: 0.3,
  h: 0.1,
  style: {
    bg: 'rgba(255, 255, 255, 0.9)',
    color: '#000000'
  }
};

/**
 * Default values for ink annotations
 *
 * Creates a visible diagonal line in dark gray.
 *
 * @constant {Object}
 * @property {Array<Object>} strokes - Default stroke with two points
 */
export const INK_DEFAULTS = {
  strokes: [{
    color: '#1f2937',
    size: 3,
    points: [
      { t: 0, x: 0.1, y: 0.1 },
      { t: 1, x: 0.2, y: 0.2 }
    ]
  }]
};
