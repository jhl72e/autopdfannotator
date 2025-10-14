/**
 * ValidationResult Type Definition
 *
 * This module defines the result structure returned by normalization functions.
 *
 * @module types/ValidationResult
 */

/**
 * Result of annotation normalization
 *
 * Contains successfully normalized annotations, warning messages for issues,
 * informational messages, and skipped annotations with reasons.
 *
 * @typedef {Object} ValidationResult
 * @property {Array<Object>} normalized - Successfully normalized annotations ready for rendering
 * @property {Array<string>} warnings - Warning messages for recoverable issues that were fixed
 * @property {Array<string>} info - Informational messages (e.g., auto-generated IDs)
 * @property {Array<SkippedAnnotation>} skipped - Critically invalid annotations that were skipped
 *
 * @example
 * {
 *   normalized: [{ id: 'hl-1', type: 'highlight', ... }],
 *   warnings: ['[hl-1]: Field "x" out of range, clamped to 1'],
 *   info: ['[anno-123]: Auto-generated ID'],
 *   skipped: [{ index: 2, annotation: {...}, reason: 'Missing type field' }]
 * }
 */

/**
 * Skipped annotation entry
 *
 * @typedef {Object} SkippedAnnotation
 * @property {number} index - Index in original array where annotation was located
 * @property {Object} annotation - Original annotation object that was skipped
 * @property {string} reason - Human-readable reason why annotation was skipped
 */

// Export empty object for type definition file
export default {};
