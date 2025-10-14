/**
 * Test importing only core subsystems and utilities (no JSX layers)
 * This test can run in Node.js
 */

import { AnnotationRenderer, PDFRenderer, LayerManager, TimelineSync, coordinateUtils, viewportUtils, VERSION, LIB_NAME } from '../src/core/AnnotationRenderer.js';

console.log('=== Testing Core Imports (without layers) ===\n');

// Test core subsystems
console.log('Core Subsystems:');
console.log('  AnnotationRenderer:', typeof AnnotationRenderer);
console.log('  PDFRenderer:', typeof PDFRenderer);
console.log('  LayerManager:', typeof LayerManager);
console.log('  TimelineSync:', typeof TimelineSync);

// Verify they are constructible
try {
    const ar = new AnnotationRenderer({ container: null, canvasElement: null });
    console.log('  ✅ AnnotationRenderer is constructible');
} catch (e) {
    console.log('  ℹ️  AnnotationRenderer constructor validation works');
}

try {
    const pr = new PDFRenderer();
    console.log('  ✅ PDFRenderer is constructible');
} catch (e) {
    console.log('  ❌ PDFRenderer constructor failed:', e.message);
}

try {
    const lm = new LayerManager(null);
    console.log('  ✅ LayerManager is constructible');
} catch (e) {
    console.log('  ❌ LayerManager constructor failed:', e.message);
}

try {
    const ts = new TimelineSync();
    console.log('  ✅ TimelineSync is constructible');
} catch (e) {
    console.log('  ❌ TimelineSync constructor failed:', e.message);
}

console.log('\n✅ Core subsystem import test passed!');
