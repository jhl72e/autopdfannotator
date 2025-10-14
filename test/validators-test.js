/**
 * Manual test runner for validators
 *
 * Run with: node test/validators-test.js
 */

import { normalizeAnnotationArray } from '../src/types/validators.js';
import {
  validAnnotations,
  invalidAnnotations,
  criticallyInvalidAnnotations
} from './fixtures/test-annotations.js';

console.log('\n========================================');
console.log('VALIDATOR MANUAL TESTS');
console.log('========================================\n');

// Test 1: Valid annotations
console.log('TEST 1: Valid Annotations');
console.log('Expected: No warnings, all normalized');
const result1 = normalizeAnnotationArray(validAnnotations);
console.log(`✓ Normalized: ${result1.normalized.length}/${validAnnotations.length}`);
console.log(`✓ Warnings: ${result1.warnings.length}`);
console.log(`✓ Skipped: ${result1.skipped.length}\n`);

// Test 2: Invalid annotations
console.log('TEST 2: Invalid Annotations');
console.log('Expected: Warnings, all normalized with defaults');
const result2 = normalizeAnnotationArray(invalidAnnotations);
console.log(`✓ Normalized: ${result2.normalized.length}/${invalidAnnotations.length}`);
console.log(`✓ Warnings: ${result2.warnings.length}`);
console.log(`✓ Skipped: ${result2.skipped.length}\n`);

// Test 3: Critically invalid
console.log('TEST 3: Critically Invalid Annotations');
console.log('Expected: All skipped');
const result3 = normalizeAnnotationArray(criticallyInvalidAnnotations);
console.log(`✓ Normalized: ${result3.normalized.length}`);
console.log(`✓ Warnings: ${result3.warnings.length}`);
console.log(`✓ Skipped: ${result3.skipped.length}/${criticallyInvalidAnnotations.length}\n`);

// Test 4: Mixed annotations
console.log('TEST 4: Mixed Valid/Invalid');
const mixedAnnotations = [
  ...validAnnotations,
  ...invalidAnnotations,
  ...criticallyInvalidAnnotations
];
const result4 = normalizeAnnotationArray(mixedAnnotations);
console.log(`✓ Normalized: ${result4.normalized.length}`);
console.log(`✓ Warnings: ${result4.warnings.length}`);
console.log(`✓ Skipped: ${result4.skipped.length}\n`);

// Test 5: Empty array
console.log('TEST 5: Empty Array');
const result5 = normalizeAnnotationArray([]);
console.log(`✓ Normalized: ${result5.normalized.length} (expected: 0)`);
console.log(`✓ Warnings: ${result5.warnings.length} (expected: 0)\n`);

// Test 6: Non-array input
console.log('TEST 6: Non-Array Input');
const result6 = normalizeAnnotationArray('not an array');
console.log(`✓ Normalized: ${result6.normalized.length} (expected: 0)`);
console.log(`✓ Warnings: ${result6.warnings.length} (expected: 1)\n`);

console.log('========================================');
console.log('ALL TESTS COMPLETE');
console.log('========================================\n');
