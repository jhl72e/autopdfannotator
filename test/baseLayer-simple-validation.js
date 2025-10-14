/**
 * Simple validation script for BaseLayer (no dependencies)
 * Run with: node test/baseLayer-simple-validation.js
 */

// Mock HTMLElement for Node.js environment
class MockHTMLElement {
  constructor() {
    this.nodeName = 'DIV';
  }
}
global.HTMLElement = MockHTMLElement;

// Import BaseLayer
const BaseLayerModule = await import('../src/layers/BaseLayer.js');
const BaseLayer = BaseLayerModule.default;

// Test helper class
class TestLayer extends BaseLayer {
  render() {
    // Implementation for testing
  }

  update() {
    // Implementation for testing
  }
}

console.log('🧪 BaseLayer Simple Validation Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${e.message}`);
    failed++;
  }
}

// Test fixtures
const container = new MockHTMLElement();
const viewport = { width: 800, height: 600, scale: 1.0 };

// Run tests
console.log('Constructor Tests:');
test('Cannot instantiate BaseLayer directly', () => {
  try {
    new BaseLayer(container, viewport);
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('abstract class')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('Throws error with invalid container', () => {
  try {
    new TestLayer(null, viewport);
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('HTMLElement')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('Throws error with invalid viewport (missing width)', () => {
  try {
    new TestLayer(container, { height: 600, scale: 1.0 });
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('viewport.width')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('Throws error with negative viewport values', () => {
  try {
    new TestLayer(container, { width: -1, height: 600, scale: 1.0 });
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('positive number')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('Initializes properties correctly', () => {
  const layer = new TestLayer(container, viewport);
  if (layer.container !== container) throw new Error('Container not set');
  if (layer.viewport.width !== 800) throw new Error('Viewport not set');
  if (layer.annotations.length !== 0) throw new Error('Annotations not empty array');
  if (layer.currentTime !== 0) throw new Error('Current time not 0');
  if (layer.isDestroyed !== false) throw new Error('isDestroyed not false');
});

test('Viewport is cloned (not same reference)', () => {
  const layer = new TestLayer(container, viewport);
  if (layer.viewport === viewport) throw new Error('Viewport not cloned');
  if (layer.viewport.width !== viewport.width) throw new Error('Viewport data not copied');
});

console.log('\nMethod Tests:');
test('setAnnotations() stores data', () => {
  const layer = new TestLayer(container, viewport);
  layer.setAnnotations([{ id: '1' }, { id: '2' }]);
  if (layer.annotations.length !== 2) throw new Error('Annotations not stored');
  if (layer.annotations[0].id !== '1') throw new Error('Annotation data not preserved');
});

test('setAnnotations() defaults to empty array for null', () => {
  const layer = new TestLayer(container, viewport);
  layer.setAnnotations(null);
  if (!Array.isArray(layer.annotations) || layer.annotations.length !== 0) {
    throw new Error('Did not default to empty array');
  }
});

test('setAnnotations() defaults to empty array for undefined', () => {
  const layer = new TestLayer(container, viewport);
  layer.setAnnotations(undefined);
  if (!Array.isArray(layer.annotations) || layer.annotations.length !== 0) {
    throw new Error('Did not default to empty array');
  }
});

test('setViewport() updates viewport', () => {
  const layer = new TestLayer(container, viewport);
  layer.setViewport({ width: 1024, height: 768, scale: 1.5 });
  if (layer.viewport.width !== 1024) throw new Error('Viewport width not updated');
  if (layer.viewport.height !== 768) throw new Error('Viewport height not updated');
  if (layer.viewport.scale !== 1.5) throw new Error('Viewport scale not updated');
});

test('setViewport() clones viewport object', () => {
  const layer = new TestLayer(container, viewport);
  const newViewport = { width: 1024, height: 768, scale: 1.5 };
  layer.setViewport(newViewport);
  if (layer.viewport === newViewport) throw new Error('Viewport not cloned');
});

test('setViewport() validates viewport structure', () => {
  const layer = new TestLayer(container, viewport);
  try {
    layer.setViewport({ width: -100, height: 600, scale: 1.0 });
    throw new Error('Should have thrown validation error');
  } catch (e) {
    if (!e.message.includes('positive number')) {
      throw new Error(`Wrong validation error: ${e.message}`);
    }
  }
});

test('updateTime() updates currentTime', () => {
  const layer = new TestLayer(container, viewport);
  layer.updateTime(5.5);
  if (layer.currentTime !== 5.5) throw new Error('Time not updated');
});

test('updateTime() handles zero', () => {
  const layer = new TestLayer(container, viewport);
  layer.updateTime(0);
  if (layer.currentTime !== 0) throw new Error('Zero time not handled');
});

test('updateTime() handles large values', () => {
  const layer = new TestLayer(container, viewport);
  layer.updateTime(999.999);
  if (layer.currentTime !== 999.999) throw new Error('Large time value not handled');
});

console.log('\nDestroy Tests:');
test('destroy() sets isDestroyed flag', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (!layer.isDestroyed) throw new Error('isDestroyed not set');
});

test('destroy() clears container reference', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (layer.container !== null) throw new Error('Container not cleared');
});

test('destroy() clears viewport reference', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (layer.viewport !== null) throw new Error('Viewport not cleared');
});

test('destroy() clears annotations reference', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (layer.annotations !== null) throw new Error('Annotations not cleared');
});

test('destroy() is idempotent', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  layer.destroy(); // Should not throw
  layer.destroy(); // Should not throw again
  if (!layer.isDestroyed) throw new Error('Idempotent destroy failed');
});

test('setAnnotations() throws after destroy', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  try {
    layer.setAnnotations([]);
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('destroyed layer')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('setViewport() throws after destroy', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  try {
    layer.setViewport(viewport);
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('destroyed layer')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('updateTime() throws after destroy', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  try {
    layer.updateTime(0);
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('destroyed layer')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

console.log('\nAbstract Method Tests:');
test('render() can be called on subclass', () => {
  const layer = new TestLayer(container, viewport);
  layer.render(); // Should not throw
});

test('update() can be called on subclass', () => {
  const layer = new TestLayer(container, viewport);
  layer.update(); // Should not throw
});

test('render() throws if not implemented', () => {
  class IncompleteLayer extends BaseLayer {
    update() {}
  }
  const layer = new IncompleteLayer(container, viewport);
  try {
    layer.render();
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('must be implemented by subclass')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

test('update() throws if not implemented', () => {
  class IncompleteLayer extends BaseLayer {
    render() {}
  }
  const layer = new IncompleteLayer(container, viewport);
  try {
    layer.update();
    throw new Error('Should have thrown error');
  } catch (e) {
    if (!e.message.includes('must be implemented by subclass')) {
      throw new Error(`Wrong error message: ${e.message}`);
    }
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All validation tests passed successfully!');
  console.log('\nBaseLayer.js is correctly implemented and ready for use.');
  console.log('Next steps: Implement HighlightLayer, TextLayer, and DrawingLayer');
  process.exit(0);
}
