/**
 * Simple validation script for BaseLayer
 * Run with: node test/baseLayer-validation.js
 */

import { JSDOM } from 'jsdom';

// Setup DOM environment for testing
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;

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

console.log('🧪 BaseLayer Validation Tests\n');

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
const container = document.createElement('div');
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

test('Throws error with invalid viewport', () => {
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

console.log('\nMethod Tests:');
test('setAnnotations() stores data', () => {
  const layer = new TestLayer(container, viewport);
  layer.setAnnotations([{ id: '1' }]);
  if (layer.annotations.length !== 1) throw new Error('Annotations not stored');
});

test('setAnnotations() defaults to empty array', () => {
  const layer = new TestLayer(container, viewport);
  layer.setAnnotations(null);
  if (!Array.isArray(layer.annotations) || layer.annotations.length !== 0) {
    throw new Error('Did not default to empty array');
  }
});

test('setViewport() updates viewport', () => {
  const layer = new TestLayer(container, viewport);
  layer.setViewport({ width: 1024, height: 768, scale: 1.5 });
  if (layer.viewport.width !== 1024) throw new Error('Viewport not updated');
});

test('setViewport() clones viewport object', () => {
  const layer = new TestLayer(container, viewport);
  const newViewport = { width: 1024, height: 768, scale: 1.5 };
  layer.setViewport(newViewport);
  if (layer.viewport === newViewport) throw new Error('Viewport not cloned');
});

test('updateTime() updates currentTime', () => {
  const layer = new TestLayer(container, viewport);
  layer.updateTime(5.5);
  if (layer.currentTime !== 5.5) throw new Error('Time not updated');
});

console.log('\nDestroy Tests:');
test('destroy() sets isDestroyed flag', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (!layer.isDestroyed) throw new Error('isDestroyed not set');
});

test('destroy() clears references', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  if (layer.container !== null) throw new Error('Container not cleared');
  if (layer.viewport !== null) throw new Error('Viewport not cleared');
  if (layer.annotations !== null) throw new Error('Annotations not cleared');
});

test('destroy() is idempotent', () => {
  const layer = new TestLayer(container, viewport);
  layer.destroy();
  layer.destroy(); // Should not throw
  if (!layer.isDestroyed) throw new Error('Idempotent destroy failed');
});

test('Methods throw after destroy', () => {
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

console.log('\nAbstract Method Tests:');
test('render() is implemented by subclass', () => {
  const layer = new TestLayer(container, viewport);
  layer.render(); // Should not throw
});

test('update() is implemented by subclass', () => {
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

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
