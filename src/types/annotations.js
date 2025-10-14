/**
 * Annotation Type Definitions
 *
 * This file defines the data structures for all annotation types used in the
 * PDF annotation renderer library. These types establish the public API contract
 * for consumers of the library.
 *
 * All coordinates use normalized values (0-1 range) for position-independence
 * across different screen sizes and zoom levels.
 */

/**
 * Base annotation fields common to all annotation types
 *
 * @typedef {Object} BaseAnnotation
 * @property {string} id - Unique identifier for the annotation
 * @property {string} type - Annotation type ('highlight', 'text', or 'ink')
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Timeline start time in seconds
 * @property {number} end - Timeline end time in seconds
 */

/**
 * Highlight annotation with rectangular regions
 *
 * Renders rectangular highlight regions over PDF content with progressive
 * reveal animation from left to right.
 *
 * @typedef {Object} HighlightAnnotation
 * @property {string} id - Unique identifier
 * @property {'highlight'} type - Must be 'highlight'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {'quads'} mode - Must be 'quads' for rectangular regions
 * @property {Array<{x: number, y: number, w: number, h: number}>} quads - Array of rectangles (normalized 0-1)
 * @property {{color: string}} style - Style object with color in rgba format
 *
 * @example
 * {
 *   id: "hl-1",
 *   type: "highlight",
 *   page: 1,
 *   start: 0,
 *   end: 2,
 *   mode: "quads",
 *   quads: [
 *     { x: 0.1, y: 0.2, w: 0.8, h: 0.05 }
 *   ],
 *   style: { color: "rgba(255, 255, 0, 0.3)" }
 * }
 */

/**
 * Text box annotation
 *
 * Displays text boxes positioned absolutely over PDF content with progressive
 * text reveal animation word by word.
 *
 * @typedef {Object} TextAnnotation
 * @property {string} id - Unique identifier
 * @property {'text'} type - Must be 'text'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {string} content - Text content to display
 * @property {number} x - Normalized x position (0-1)
 * @property {number} y - Normalized y position (0-1)
 * @property {number} w - Normalized width (0-1)
 * @property {number} h - Normalized height (0-1)
 * @property {{bg: string, color: string}} style - Background and text colors
 *
 * @example
 * {
 *   id: "txt-1",
 *   type: "text",
 *   page: 1,
 *   start: 0,
 *   end: 3,
 *   content: "This is an important note",
 *   x: 0.1,
 *   y: 0.5,
 *   w: 0.3,
 *   h: 0.1,
 *   style: {
 *     bg: "rgba(255, 255, 255, 0.9)",
 *     color: "#000000"
 *   }
 * }
 */

/**
 * Ink/drawing annotation with strokes
 *
 * Renders freehand drawings and strokes on a canvas layer with progressive
 * drawing animation based on point time offsets.
 *
 * @typedef {Object} InkAnnotation
 * @property {string} id - Unique identifier
 * @property {'ink'} type - Must be 'ink'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {Array<InkStroke>} strokes - Array of stroke objects
 *
 * @example
 * {
 *   id: "ink-1",
 *   type: "ink",
 *   page: 1,
 *   start: 0,
 *   end: 5,
 *   strokes: [
 *     {
 *       color: "#FF0000",
 *       size: 2,
 *       points: [
 *         { t: 0, x: 0.1, y: 0.1 },
 *         { t: 0.5, x: 0.2, y: 0.2 },
 *         { t: 1, x: 0.3, y: 0.1 }
 *       ]
 *     }
 *   ]
 * }
 */

/**
 * Individual stroke within an ink annotation
 *
 * @typedef {Object} InkStroke
 * @property {string} color - Stroke color (hex or rgba)
 * @property {number} size - Stroke width in pixels
 * @property {Array<InkPoint>} points - Array of points defining the stroke path
 */

/**
 * Point within an ink stroke
 *
 * @typedef {Object} InkPoint
 * @property {number} t - Time offset within stroke duration (0-1)
 * @property {number} x - Normalized x position (0-1)
 * @property {number} y - Normalized y position (0-1)
 */

/**
 * Union type for all annotation types
 *
 * @typedef {HighlightAnnotation|TextAnnotation|InkAnnotation} Annotation
 */

/**
 * Viewport dimensions for coordinate transformations
 *
 * @typedef {Object} Viewport
 * @property {number} width - Viewport width in pixels
 * @property {number} height - Viewport height in pixels
 * @property {number} [scale] - Optional scale factor
 */

// Export type definitions (for documentation purposes)
export default {};
