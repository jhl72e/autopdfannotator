/**
 * Example: Standalone Validator Usage (Node.js compatible)
 *
 * This example demonstrates the validator system without browser dependencies.
 */

import { normalizeAnnotationArray } from '../src/types/validators.js';

// ============================================================================
// Example 1: Basic External Normalization
// ============================================================================

console.log('\n=== Example 1: Basic External Normalization ===\n');

// User's raw annotation data (potentially invalid)
const rawAnnotations = [
  {
    type: 'text',
    content: 'Hello World'
    // Missing: id, page, start, end, x, y, w, h, style
  },
  {
    type: 'highlight',
    page: 1,
    quads: [{ x: 5, y: 0.5, w: 0.8, h: 0.05 }]  // x is out of range
    // Missing: id, start, end, mode, style
  }
];

// Normalize data
const result = normalizeAnnotationArray(rawAnnotations);

console.log('Normalization Results:');
console.log(`- Normalized: ${result.normalized.length} annotations`);
console.log(`- Warnings: ${result.warnings.length} issues fixed`);
console.log(`- Skipped: ${result.skipped.length} invalid annotations\n`);

console.log('Normalized annotations ready for rendering:');
console.log(JSON.stringify(result.normalized, null, 2));

// ============================================================================
// Example 2: With Custom Options
// ============================================================================

console.log('\n\n=== Example 2: Custom Options ===\n');

const result2 = normalizeAnnotationArray(rawAnnotations, {
  skipInvalid: true,           // Skip critically invalid (default: true)
  warnInConsole: false,        // Disable console output
  onWarning: (result) => {     // Custom warning handler
    console.log('Custom handler called!');
    console.log(`Found ${result.warnings.length} warnings`);
    console.log(`Normalized ${result.normalized.length} annotations`);
  }
});

// ============================================================================
// Example 3: Handling Different Annotation Types
// ============================================================================

console.log('\n\n=== Example 3: All Annotation Types ===\n');

const multiTypeAnnotations = [
  // Highlight with invalid color
  {
    id: 'hl-1',
    type: 'highlight',
    page: 1,
    start: 0,
    end: 2,
    mode: 'quads',
    quads: [{ x: 0.1, y: 0.2, w: 0.8, h: 0.05 }],
    style: { color: 'notacolor' }  // Invalid color -> will use default
  },
  // Text with missing position
  {
    id: 'txt-1',
    type: 'text',
    page: 1,
    start: 2,
    end: 5,
    content: 'Important note'
    // Missing: x, y, w, h, style -> will use defaults
  },
  // Ink with invalid stroke
  {
    id: 'ink-1',
    type: 'ink',
    page: 1,
    start: 5,
    end: 8,
    strokes: [
      {
        color: '#FF0000',
        size: -5,  // Invalid size -> will use default
        points: []  // Empty points -> will use default
      }
    ]
  }
];

const result3 = normalizeAnnotationArray(multiTypeAnnotations, {
  warnInConsole: false
});

console.log('Results:');
console.log(`- Highlight: normalized with default color`);
console.log(`- Text: normalized with default position and style`);
console.log(`- Ink: normalized with default size and points`);
console.log(`\nAll ${result3.normalized.length} annotations are ready to render!`);

// ============================================================================
// Example 4: Validation Only (No Rendering)
// ============================================================================

console.log('\n\n=== Example 4: Validation-Only Mode ===\n');

function validateAnnotations(annotations) {
  const result = normalizeAnnotationArray(annotations, {
    warnInConsole: false
  });

  const isValid = result.warnings.length === 0 && result.skipped.length === 0;

  return {
    isValid,
    normalized: result.normalized,
    issues: {
      warnings: result.warnings,
      skipped: result.skipped
    }
  };
}

const validation = validateAnnotations(rawAnnotations);

if (!validation.isValid) {
  console.log('⚠️  Annotation data has issues:');
  console.log(`   - ${validation.issues.warnings.length} warnings`);
  console.log(`   - ${validation.issues.skipped.length} skipped`);
  console.log('\n   But normalized data is still usable!');
}

console.log('\n=== Examples Complete ===\n');
