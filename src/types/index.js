/**
 * Types Module - Public API
 *
 * Exports type validators and default values for external use.
 *
 * @module types
 */

// Main normalization function
export { normalizeAnnotationArray } from './validators.js';

// Type-specific normalizers (for advanced use)
export {
  normalizeAnnotation,
  normalizeHighlight,
  normalizeText,
  normalizeInk,
  normalizeBaseFields
} from './validators.js';

// Default values (for reference)
export {
  BASE_DEFAULTS,
  HIGHLIGHT_DEFAULTS,
  TEXT_DEFAULTS,
  INK_DEFAULTS
} from './defaults.js';

// Field-level normalizers (for custom validation)
export {
  normalizeCoordinate,
  normalizeColor,
  normalizePositiveNumber
} from './validators.js';
