/**
 * Annotation Data Normalization Utilities
 *
 * This module provides defensive normalization functions that validate and fix
 * annotation data. Invalid values are replaced with safe defaults and warnings
 * are collected for user feedback.
 *
 * @module types/validators
 */

import {
  BASE_DEFAULTS,
  HIGHLIGHT_DEFAULTS,
  TEXT_DEFAULTS,
  INK_DEFAULTS
} from './defaults.js';

// ============================================================================
// FIELD-LEVEL NORMALIZERS
// ============================================================================

/**
 * Normalize coordinate value to 0-1 range
 *
 * Validates that a value is a number in the 0-1 range. Out-of-range values
 * are clamped. Invalid values use the provided default.
 *
 * @param {*} value - Value to normalize
 * @param {number} defaultValue - Fallback value if invalid
 * @param {string} id - Annotation ID for warning messages
 * @param {string} fieldName - Field name for warning messages
 * @param {Array<string>} warnings - Array to collect warning messages
 * @returns {number} Normalized coordinate value in range [0, 1]
 *
 * @example
 * normalizeCoordinate(0.5, 0.1, 'txt-1', 'x', warnings)  // Returns: 0.5
 * normalizeCoordinate(5, 0.1, 'txt-1', 'x', warnings)    // Returns: 1, adds warning
 * normalizeCoordinate('abc', 0.1, 'txt-1', 'x', warnings) // Returns: 0.1, adds warning
 */
export function normalizeCoordinate(value, defaultValue, id, fieldName, warnings) {
  // Type coercion: parse string to number if needed
  let numValue = value;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue === value) {
      // Successfully parsed - no warning needed
    }
  }

  // Validate is valid number
  if (typeof numValue !== 'number' || isNaN(numValue)) {
    warnings.push(
      `[${id}]: Field "${fieldName}" invalid value "${value}", using default ${defaultValue}`
    );
    return defaultValue;
  }

  // Range check: clamp to [0, 1]
  if (numValue < 0) {
    warnings.push(
      `[${id}]: Field "${fieldName}" value ${numValue} below range [0,1], clamping to 0`
    );
    return 0;
  }

  if (numValue > 1) {
    warnings.push(
      `[${id}]: Field "${fieldName}" value ${numValue} exceeds range [0,1], clamping to 1`
    );
    return 1;
  }

  // Valid value
  return numValue;
}

/**
 * Normalize color string
 *
 * Validates that a value is a valid color string. Supports hex, rgb/rgba,
 * and named colors. Invalid colors use the provided default.
 *
 * @param {*} value - Color value to normalize
 * @param {string} defaultValue - Fallback color if invalid
 * @param {string} id - Annotation ID for warning messages
 * @param {Array<string>} warnings - Array to collect warning messages
 * @returns {string} Valid color string
 *
 * @example
 * normalizeColor('#fff', '#000', 'txt-1', warnings)           // Returns: '#fff'
 * normalizeColor('rgba(255,0,0,0.5)', '#000', 'txt-1', warnings) // Returns: 'rgba(255,0,0,0.5)'
 * normalizeColor('notacolor', '#000', 'txt-1', warnings)      // Returns: '#000', adds warning
 */
export function normalizeColor(value, defaultValue, id, warnings) {
  // Type check: must be non-empty string
  if (typeof value !== 'string' || value.trim().length === 0) {
    warnings.push(
      `[${id}]: Invalid color format "${value}", using default ${defaultValue}`
    );
    return defaultValue;
  }

  const trimmed = value.trim();

  // Regex patterns for color validation (cached at module level)
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;

  // Named colors (basic set)
  const namedColors = [
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'gray',
    'grey', 'orange', 'purple', 'pink', 'brown', 'transparent'
  ];

  // Validate format
  const isHex = hexPattern.test(trimmed);
  const isRgb = rgbPattern.test(trimmed);
  const isNamed = namedColors.includes(trimmed.toLowerCase());

  if (isHex || isRgb || isNamed) {
    return trimmed;
  }

  // Invalid format
  warnings.push(
    `[${id}]: Invalid color format "${value}", using default ${defaultValue}`
  );
  return defaultValue;
}

/**
 * Normalize positive number
 *
 * Validates that a value is a positive number. Invalid values use the
 * provided default.
 *
 * @param {*} value - Value to normalize
 * @param {number} defaultValue - Fallback value if invalid
 * @param {string} id - Annotation ID for warning messages
 * @param {string} fieldName - Field name for warning messages
 * @param {Array<string>} warnings - Array to collect warning messages
 * @returns {number} Positive number
 *
 * @example
 * normalizePositiveNumber(5, 3, 'ink-1', 'size', warnings)      // Returns: 5
 * normalizePositiveNumber(-1, 3, 'ink-1', 'size', warnings)     // Returns: 3, adds warning
 * normalizePositiveNumber('abc', 3, 'ink-1', 'size', warnings)  // Returns: 3, adds warning
 */
export function normalizePositiveNumber(value, defaultValue, id, fieldName, warnings) {
  // Type coercion: parse string to number if needed
  let numValue = value;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
  }

  // Validate is valid number and positive
  if (typeof numValue !== 'number' || isNaN(numValue) || numValue <= 0) {
    warnings.push(
      `[${id}]: Field "${fieldName}" invalid value "${value}", using default ${defaultValue}`
    );
    return defaultValue;
  }

  return numValue;
}

// ============================================================================
// BASE FIELDS NORMALIZER
// ============================================================================

/**
 * Normalize common base annotation fields
 *
 * Validates and normalizes fields common to all annotation types: id, type,
 * page, start, and end. Auto-generates ID if missing. Applies safe defaults
 * for invalid values.
 *
 * @param {Object} raw - Raw annotation object
 * @param {Array<string>} warnings - Array to collect warning messages
 * @param {Array<string>} info - Array to collect info messages
 * @returns {Object} Object with normalized base fields
 *
 * @example
 * normalizeBaseFields({ type: 'text', page: 2 }, warnings, info)
 * // Returns: { id: 'anno-1234...', type: 'text', page: 2, start: 0, end: 0 }
 */
export function normalizeBaseFields(raw, warnings, info) {
  const base = {};

  // ===== ID Field =====
  // Check: non-empty string
  // Invalid: auto-generate unique ID
  if (typeof raw.id !== 'string' || raw.id.trim().length === 0) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    base.id = `anno-${timestamp}-${random}`;
    info.push(`[${base.id}]: Auto-generated ID (original was missing or invalid)`);
  } else {
    base.id = raw.id.trim();
  }

  // ===== Type Field =====
  // Pass through as-is (validated in parent function)
  base.type = raw.type;

  // ===== Page Field =====
  // Check: positive integer
  // Invalid: default to 1
  if (typeof raw.page !== 'number' || raw.page < 1) {
    warnings.push(
      `[${base.id}]: Field "page" invalid value "${raw.page}", using default ${BASE_DEFAULTS.page}`
    );
    base.page = BASE_DEFAULTS.page;
  } else {
    // Floor to ensure integer
    base.page = Math.floor(raw.page);
  }

  // ===== Start Field =====
  // Check: non-negative number
  // Invalid: default to 0
  if (typeof raw.start !== 'number' || raw.start < 0) {
    warnings.push(
      `[${base.id}]: Field "start" invalid value "${raw.start}", using default ${BASE_DEFAULTS.start}`
    );
    base.start = BASE_DEFAULTS.start;
  } else {
    base.start = raw.start;
  }

  // ===== End Field =====
  // Check: non-negative number >= start
  // Invalid: clamp to start value
  if (typeof raw.end !== 'number' || raw.end < 0) {
    warnings.push(
      `[${base.id}]: Field "end" invalid value "${raw.end}", using start value ${base.start}`
    );
    base.end = base.start;
  } else if (raw.end < base.start) {
    warnings.push(
      `[${base.id}]: Field "end" (${raw.end}) less than start (${base.start}), clamping to start`
    );
    base.end = base.start;
  } else {
    base.end = raw.end;
  }

  return base;
}

// ============================================================================
// TYPE-SPECIFIC NORMALIZERS
// ============================================================================

/**
 * Normalize a single quad (rectangular region)
 *
 * @private
 * @param {Object} quad - Quad object with x, y, w, h
 * @param {string} id - Annotation ID
 * @param {Array<string>} warnings - Warnings array
 * @returns {Object} Normalized quad
 */
function normalizeQuad(quad, id, warnings) {
  if (!quad || typeof quad !== 'object') {
    warnings.push(`[${id}]: Invalid quad object, using default`);
    return { x: 0.1, y: 0.1, w: 0.8, h: 0.05 };
  }

  return {
    x: normalizeCoordinate(quad.x, 0.1, id, 'quad.x', warnings),
    y: normalizeCoordinate(quad.y, 0.1, id, 'quad.y', warnings),
    w: normalizeCoordinate(quad.w, 0.8, id, 'quad.w', warnings),
    h: normalizeCoordinate(quad.h, 0.05, id, 'quad.h', warnings)
  };
}

/**
 * Normalize highlight annotation
 *
 * Validates and normalizes highlight-specific fields: mode, quads array,
 * and style.color. Applies defaults for invalid fields.
 *
 * @param {Object} base - Object with normalized base fields
 * @param {Object} raw - Raw annotation object
 * @param {Array<string>} warnings - Warnings array
 * @param {Array<string>} info - Info array
 * @returns {Object} Fully normalized highlight annotation
 *
 * @example
 * normalizeHighlight(base, raw, warnings, info)
 * // Returns: { ...base, mode: 'quads', quads: [...], style: {...} }
 */
export function normalizeHighlight(base, raw, warnings, info) {
  const annotation = { ...base };

  // ===== Mode Field =====
  // Check: value equals "quads"
  // Invalid: default to "quads"
  if (raw.mode !== 'quads') {
    warnings.push(
      `[${base.id}]: Field "mode" invalid value "${raw.mode}", using default "${HIGHLIGHT_DEFAULTS.mode}"`
    );
    annotation.mode = HIGHLIGHT_DEFAULTS.mode;
  } else {
    annotation.mode = raw.mode;
  }

  // ===== Quads Array =====
  // Check: non-empty array
  // Invalid: use default quads
  if (!Array.isArray(raw.quads) || raw.quads.length === 0) {
    warnings.push(
      `[${base.id}]: Field "quads" missing or empty, using default`
    );
    annotation.quads = HIGHLIGHT_DEFAULTS.quads;
  } else {
    // Normalize each quad
    annotation.quads = raw.quads.map((quad, idx) => normalizeQuad(quad, base.id, warnings));
  }

  // ===== Style Object =====
  // Check: object with color property
  const defaultColor = HIGHLIGHT_DEFAULTS.style.color;
  if (!raw.style || typeof raw.style !== 'object') {
    warnings.push(
      `[${base.id}]: Field "style" missing or invalid, using default`
    );
    annotation.style = { color: defaultColor };
  } else {
    annotation.style = {
      color: normalizeColor(raw.style.color, defaultColor, base.id, warnings)
    };
  }

  return annotation;
}

/**
 * Normalize text annotation
 *
 * Validates and normalizes text-specific fields: content, position (x, y),
 * dimensions (w, h), and style (bg, color). Applies defaults for invalid fields.
 *
 * @param {Object} base - Object with normalized base fields
 * @param {Object} raw - Raw annotation object
 * @param {Array<string>} warnings - Warnings array
 * @param {Array<string>} info - Info array
 * @returns {Object} Fully normalized text annotation
 *
 * @example
 * normalizeText(base, raw, warnings, info)
 * // Returns: { ...base, content: '...', x: 0.1, y: 0.1, w: 0.3, h: 0.1, style: {...} }
 */
export function normalizeText(base, raw, warnings, info) {
  const annotation = { ...base };

  // ===== Content Field =====
  // Check: non-empty string
  // Invalid: default to placeholder
  if (typeof raw.content !== 'string' || raw.content.trim().length === 0) {
    warnings.push(
      `[${base.id}]: Field "content" missing or empty, using default "${TEXT_DEFAULTS.content}"`
    );
    annotation.content = TEXT_DEFAULTS.content;
  } else {
    annotation.content = raw.content;
  }

  // ===== Position Fields (x, y) =====
  annotation.x = normalizeCoordinate(raw.x, TEXT_DEFAULTS.x, base.id, 'x', warnings);
  annotation.y = normalizeCoordinate(raw.y, TEXT_DEFAULTS.y, base.id, 'y', warnings);

  // ===== Dimension Fields (w, h) =====
  annotation.w = normalizeCoordinate(raw.w, TEXT_DEFAULTS.w, base.id, 'w', warnings);
  annotation.h = normalizeCoordinate(raw.h, TEXT_DEFAULTS.h, base.id, 'h', warnings);

  // ===== Style Object =====
  const defaultBg = TEXT_DEFAULTS.style.bg;
  const defaultColor = TEXT_DEFAULTS.style.color;

  if (!raw.style || typeof raw.style !== 'object') {
    warnings.push(
      `[${base.id}]: Field "style" missing or invalid, using defaults`
    );
    annotation.style = {
      bg: defaultBg,
      color: defaultColor
    };
  } else {
    annotation.style = {
      bg: normalizeColor(raw.style.bg, defaultBg, base.id, warnings),
      color: normalizeColor(raw.style.color, defaultColor, base.id, warnings)
    };
  }

  return annotation;
}

/**
 * Normalize a single ink point
 *
 * @private
 * @param {Object} point - Point object with t, x, y
 * @param {string} id - Annotation ID
 * @param {Array<string>} warnings - Warnings array
 * @returns {Object} Normalized point
 */
function normalizePoint(point, id, warnings) {
  if (!point || typeof point !== 'object') {
    warnings.push(`[${id}]: Invalid point object, using default`);
    return { t: 0, x: 0.1, y: 0.1 };
  }

  return {
    t: normalizeCoordinate(point.t, 0, id, 'point.t', warnings),
    x: normalizeCoordinate(point.x, 0.1, id, 'point.x', warnings),
    y: normalizeCoordinate(point.y, 0.1, id, 'point.y', warnings)
  };
}

/**
 * Normalize a single ink stroke
 *
 * @private
 * @param {Object} stroke - Stroke object with color, size, points
 * @param {string} id - Annotation ID
 * @param {Array<string>} warnings - Warnings array
 * @returns {Object} Normalized stroke
 */
function normalizeStroke(stroke, id, warnings) {
  if (!stroke || typeof stroke !== 'object') {
    warnings.push(`[${id}]: Invalid stroke object, using default`);
    return INK_DEFAULTS.strokes[0];
  }

  const normalized = {
    color: normalizeColor(stroke.color, INK_DEFAULTS.strokes[0].color, id, warnings),
    size: normalizePositiveNumber(stroke.size, INK_DEFAULTS.strokes[0].size, id, 'stroke.size', warnings)
  };

  // ===== Points Array =====
  if (!Array.isArray(stroke.points) || stroke.points.length === 0) {
    warnings.push(`[${id}]: Stroke missing points array, using default`);
    normalized.points = INK_DEFAULTS.strokes[0].points;
  } else {
    normalized.points = stroke.points.map(point => normalizePoint(point, id, warnings));
  }

  return normalized;
}

/**
 * Normalize ink annotation
 *
 * Validates and normalizes ink-specific fields: strokes array with color,
 * size, and points. Applies defaults for invalid fields.
 *
 * @param {Object} base - Object with normalized base fields
 * @param {Object} raw - Raw annotation object
 * @param {Array<string>} warnings - Warnings array
 * @param {Array<string>} info - Info array
 * @returns {Object} Fully normalized ink annotation
 *
 * @example
 * normalizeInk(base, raw, warnings, info)
 * // Returns: { ...base, strokes: [{ color: '...', size: 3, points: [...] }] }
 */
export function normalizeInk(base, raw, warnings, info) {
  const annotation = { ...base };

  // ===== Strokes Array =====
  // Check: non-empty array
  // Invalid: use default single stroke
  if (!Array.isArray(raw.strokes) || raw.strokes.length === 0) {
    warnings.push(
      `[${base.id}]: Field "strokes" missing or empty, using default`
    );
    annotation.strokes = INK_DEFAULTS.strokes;
  } else {
    // Normalize each stroke
    annotation.strokes = raw.strokes.map(stroke => normalizeStroke(stroke, base.id, warnings));
  }

  return annotation;
}

// ============================================================================
// ORCHESTRATION - SINGLE ANNOTATION & ARRAY
// ============================================================================

/**
 * Normalize a single annotation
 *
 * Routes annotation to appropriate type-specific normalizer based on type field.
 * Handles critical validation errors (missing/invalid type).
 *
 * @param {Object} raw - Raw annotation object
 * @param {number} index - Position in original array (for error context)
 * @returns {Object} Result object with annotation, warnings, info, and critical error
 * @returns {Object|null} return.annotation - Normalized annotation or null if critical error
 * @returns {Array<string>} return.warnings - Warning messages
 * @returns {Array<string>} return.info - Info messages
 * @returns {string|null} return.critical - Critical error message or null
 *
 * @example
 * normalizeAnnotation({ type: 'text', content: 'Hello' }, 0)
 * // Returns: { annotation: {...}, warnings: [], info: [], critical: null }
 */
export function normalizeAnnotation(raw, index) {
  const warnings = [];
  const info = [];

  // Validate input is object
  if (!raw || typeof raw !== 'object') {
    return {
      annotation: null,
      warnings: [],
      info: [],
      critical: `Annotation at index ${index}: Not a valid object`
    };
  }

  // Check type field (critical - cannot route without type)
  if (typeof raw.type !== 'string' || raw.type.trim().length === 0) {
    return {
      annotation: null,
      warnings: [],
      info: [],
      critical: `Annotation at index ${index}: Missing or invalid type field`
    };
  }

  const type = raw.type.trim();

  // Normalize base fields first
  const base = normalizeBaseFields(raw, warnings, info);

  // Route to type-specific normalizer
  let annotation;

  if (type === 'highlight') {
    annotation = normalizeHighlight(base, raw, warnings, info);
  } else if (type === 'text') {
    annotation = normalizeText(base, raw, warnings, info);
  } else if (type === 'ink') {
    annotation = normalizeInk(base, raw, warnings, info);
  } else {
    return {
      annotation: null,
      warnings: [],
      info: [],
      critical: `Annotation at index ${index}: Unsupported type "${type}"`
    };
  }

  return {
    annotation,
    warnings,
    info,
    critical: null
  };
}

/**
 * Normalize array of annotations
 *
 * MAIN ENTRY POINT for annotation normalization. Processes each annotation,
 * collects warnings, and returns normalized data ready for rendering.
 *
 * @param {Array} rawAnnotations - Array of raw annotation objects
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.skipInvalid=true] - Skip critically invalid annotations
 * @param {boolean} [options.warnInConsole=true] - Log warnings to console
 * @param {Function} [options.onWarning] - Custom warning callback
 * @returns {Object} ValidationResult with normalized annotations and messages
 * @returns {Array} return.normalized - Successfully normalized annotations
 * @returns {Array<string>} return.warnings - Warning messages
 * @returns {Array<string>} return.info - Informational messages
 * @returns {Array<Object>} return.skipped - Skipped annotations with reasons
 *
 * @example
 * const result = normalizeAnnotationArray(rawAnnotations, {
 *   skipInvalid: true,
 *   warnInConsole: true
 * });
 *
 * renderer.setAnnotations(result.normalized);
 */
export function normalizeAnnotationArray(rawAnnotations, options = {}) {
  // Default options
  const skipInvalid = options.skipInvalid !== false;  // Default: true
  const warnInConsole = options.warnInConsole !== false;  // Default: true
  const onWarning = options.onWarning || null;

  // Initialize result structure
  const result = {
    normalized: [],
    warnings: [],
    info: [],
    skipped: []
  };

  // Validate input is array
  if (!Array.isArray(rawAnnotations)) {
    const warning = 'normalizeAnnotationArray: Input is not an array, returning empty result';
    result.warnings.push(warning);

    if (warnInConsole) {
      console.warn(`[Annotation Normalizer] ${warning}`);
    }

    return result;
  }

  // Process each annotation
  rawAnnotations.forEach((raw, index) => {
    // Skip null/undefined
    if (raw == null) {
      result.skipped.push({
        index,
        annotation: raw,
        reason: 'Annotation is null or undefined'
      });
      return;
    }

    // Normalize annotation
    const normalized = normalizeAnnotation(raw, index);

    // Check for critical error
    if (normalized.critical) {
      result.skipped.push({
        index,
        annotation: raw,
        reason: normalized.critical
      });

      if (warnInConsole) {
        console.error(`[Annotation Normalizer] ${normalized.critical}`);
      }

      return;
    }

    // Add to normalized array
    result.normalized.push(normalized.annotation);

    // Collect warnings and info
    result.warnings.push(...normalized.warnings);
    result.info.push(...normalized.info);
  });

  // Console output
  if (warnInConsole) {
    if (result.warnings.length > 0 || result.info.length > 0 || result.skipped.length > 0) {
      console.group('[Annotation Normalizer] Validation Summary');

      if (result.normalized.length > 0) {
        console.info(`✓ Normalized ${result.normalized.length} annotation(s)`);
      }

      if (result.skipped.length > 0) {
        console.error(`✗ Skipped ${result.skipped.length} annotation(s)`);
        result.skipped.forEach(s => {
          console.error(`  Index ${s.index}: ${s.reason}`);
        });
      }

      if (result.warnings.length > 0) {
        console.warn(`⚠ ${result.warnings.length} warning(s):`);
        result.warnings.forEach(w => console.warn(`  ${w}`));
      }

      if (result.info.length > 0) {
        console.info(`ℹ ${result.info.length} info message(s):`);
        result.info.forEach(i => console.info(`  ${i}`));
      }

      console.groupEnd();
    }
  }

  // Call custom warning handler
  if (onWarning && typeof onWarning === 'function') {
    onWarning(result);
  }

  return result;
}
