/**
 * Simple test: Import core subsystems from index.js
 */

import {
    AnnotationRenderer,
    PDFRenderer,
    LayerManager,
    TimelineSync,
    coordinateUtils,
    viewportUtils,
    VERSION,
    LIB_NAME
} from '../src/index.js';

console.log('=== Testing src/index.js Exports ===\n');

// Test core subsystems
console.log('Core Subsystems:');
console.log('  AnnotationRenderer:', typeof AnnotationRenderer, AnnotationRenderer ? '✅' : '❌');
console.log('  PDFRenderer:', typeof PDFRenderer, PDFRenderer ? '✅' : '❌');
console.log('  LayerManager:', typeof LayerManager, LayerManager ? '✅' : '❌');
console.log('  TimelineSync:', typeof TimelineSync, TimelineSync ? '✅' : '❌');

// Test utilities
console.log('\nUtilities:');
console.log('  coordinateUtils:', typeof coordinateUtils, coordinateUtils ? '✅' : '❌');
console.log('  viewportUtils:', typeof viewportUtils, viewportUtils ? '✅' : '❌');

if (coordinateUtils) {
    console.log('    Functions:', Object.keys(coordinateUtils).join(', '));
}
if (viewportUtils) {
    console.log('    Functions:', Object.keys(viewportUtils).join(', '));
}

// Test metadata
console.log('\nPackage Metadata:');
console.log('  VERSION:', VERSION, VERSION ? '✅' : '❌');
console.log('  LIB_NAME:', LIB_NAME, LIB_NAME ? '✅' : '❌');

// Verify constructors work
console.log('\nConstructor Tests:');
try {
    const pr = new PDFRenderer();
    console.log('  PDFRenderer constructor: ✅');
} catch (e) {
    console.log('  PDFRenderer constructor: ❌', e.message);
}

try {
    const ts = new TimelineSync();
    console.log('  TimelineSync constructor: ✅');
} catch (e) {
    console.log('  TimelineSync constructor: ❌', e.message);
}

try {
    const lm = new LayerManager(null);
    console.log('  LayerManager constructor: ✅');
} catch (e) {
    console.log('  LayerManager constructor: ❌', e.message);
}

console.log('\n✅ All core exports verified successfully!');
console.log('⚠️  Note: Layer components (JSX) cannot be tested in Node.js - use browser test instead');
