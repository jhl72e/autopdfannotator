/**
 * Simple validation script for HighlightLayer
 * Run with: node test/highlightLayer-validation.js
 */

// Mock HTMLElement for Node.js environment
class MockHTMLElement {
  constructor() {
    this.nodeName = 'DIV';
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.parentNode = null;
  }

  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parentNode = null;
    }
  }
}

global.HTMLElement = MockHTMLElement;
global.document = {
  createElement: () => new MockHTMLElement()
};

// Mock requestAnimationFrame and cancelAnimationFrame
let rafId = 0;
global.requestAnimationFrame = (callback) => ++rafId;
global.cancelAnimationFrame = (id) => {};

// Import modules
const BaseLayerModule = await import('../src/layers/BaseLayer.js');
const HighlightLayerModule = await import('../src/layers/HighlightLayer.js');
const BaseLayer = BaseLayerModule.default;
const HighlightLayer = HighlightLayerModule.default;

console.log('🧪 HighlightLayer Validation Tests\n');

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

console.log('Constructor Tests:');
test('Should extend BaseLayer', () => {
  const layer = new HighlightLayer(container, viewport);
  if (!(layer instanceof BaseLayer)) throw new Error('Not instance of BaseLayer');
  if (!(layer instanceof HighlightLayer)) throw new Error('Not instance of HighlightLayer');
});

test('Should create layer element with correct styles', () => {
  const layer = new HighlightLayer(container, viewport);
  if (!layer.layerElement) throw new Error('layerElement not created');
  if (layer.layerElement.style.position !== 'absolute') throw new Error('Wrong position');
  if (layer.layerElement.style.zIndex !== '25') throw new Error('Wrong zIndex');
});

test('Should append layer element to container', () => {
  const testContainer = new MockHTMLElement();
  const layer = new HighlightLayer(testContainer, viewport);
  if (!testContainer.children.includes(layer.layerElement)) {
    throw new Error('Layer element not appended');
  }
});

test('Should initialize elements Map', () => {
  const layer = new HighlightLayer(container, viewport);
  if (!(layer.elements instanceof Map)) throw new Error('elements not a Map');
  if (layer.elements.size !== 0) throw new Error('elements Map not empty');
});

test('Should initialize rafId as null', () => {
  const layer = new HighlightLayer(container, viewport);
  if (layer.rafId !== null) throw new Error('rafId not null');
});

console.log('\nrender() Tests:');
test('Should create DOM elements for single quad', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  if (layer.elements.size !== 1) throw new Error('Wrong element count');
});

test('Should create multiple elements for multi-quad', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [
      { x: 0.1, y: 0.2, w: 0.5, h: 0.03 },
      { x: 0.1, y: 0.23, w: 0.3, h: 0.03 }
    ]
  }]);
  layer.render();

  if (layer.elements.size !== 2) throw new Error('Wrong element count');
});

test('Should calculate timing segments correctly', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [
      { x: 0.1, y: 0.2, w: 0.6, h: 0.03 }, // 60%
      { x: 0.1, y: 0.23, w: 0.4, h: 0.03 } // 40%
    ]
  }]);
  layer.render();

  const elements = Array.from(layer.elements.values());
  if (elements[0].segStart !== 0) throw new Error('Wrong segStart for first quad');
  if (elements[0].segEnd !== 0.6) throw new Error('Wrong segEnd for first quad');
  if (elements[1].segStart !== 0.6) throw new Error('Wrong segStart for second quad');
  if (elements[1].segEnd !== 1.0) throw new Error('Wrong segEnd for second quad');
});

test('Should use default color when not specified', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  const elements = Array.from(layer.elements.values());
  if (elements[0].element.style.background !== 'rgba(255,230,100,0.35)') {
    throw new Error('Wrong default color');
  }
});

test('Should use custom color when provided', () => {
  const layer = new HighlightLayer(container, viewport);
  const customColor = 'rgba(100,200,255,0.5)';
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }],
    style: { color: customColor }
  }]);
  layer.render();

  const elements = Array.from(layer.elements.values());
  if (elements[0].element.style.background !== customColor) {
    throw new Error('Custom color not applied');
  }
});

test('Should skip annotations without quads', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: []
  }]);
  layer.render();

  if (layer.elements.size !== 0) throw new Error('Should have skipped annotation');
});

test('Should skip annotations not in quad mode', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'other',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  if (layer.elements.size !== 0) throw new Error('Should have skipped annotation');
});

test('Should be idempotent', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();
  const firstSize = layer.elements.size;
  layer.render();
  const secondSize = layer.elements.size;

  if (firstSize !== secondSize) throw new Error('Not idempotent');
});

test('Should set initial transform to scaleX(0)', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  const elements = Array.from(layer.elements.values());
  if (elements[0].element.style.transform !== 'scaleX(0)') {
    throw new Error('Wrong initial transform');
  }
});

console.log('\nupdateTime() Tests:');
test('Should call super.updateTime()', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.updateTime(1.5);
  if (layer.currentTime !== 1.5) throw new Error('currentTime not updated');
});

test('Should start requestAnimationFrame loop', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();
  layer.updateTime(1.0);

  if (layer.rafId === null) throw new Error('RAF not started');
  if (typeof layer.rafId !== 'number') throw new Error('RAF ID not a number');
});

test('Should cancel previous RAF before starting new one', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  layer.updateTime(1.0);
  const firstRafId = layer.rafId;
  layer.updateTime(1.5);
  const secondRafId = layer.rafId;

  if (firstRafId === secondRafId) throw new Error('RAF not cancelled and restarted');
});

console.log('\ndestroy() Tests:');
test('Should cancel requestAnimationFrame', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();
  layer.updateTime(1.0);

  layer.destroy();
  if (layer.rafId !== null) throw new Error('RAF not cancelled');
});

test('Should clear elements Map', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);
  layer.render();

  layer.destroy();
  if (layer.elements !== null) throw new Error('elements not cleared');
});

test('Should remove layer element from DOM', () => {
  const testContainer = new MockHTMLElement();
  const layer = new HighlightLayer(testContainer, viewport);

  layer.destroy();
  if (testContainer.children.includes(layer.layerElement)) {
    throw new Error('Layer element not removed');
  }
  if (layer.layerElement !== null) throw new Error('layerElement reference not cleared');
});

test('Should call parent destroy', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.destroy();

  if (!layer.isDestroyed) throw new Error('isDestroyed not set');
  if (layer.container !== null) throw new Error('container not cleared');
  if (layer.viewport !== null) throw new Error('viewport not cleared');
  if (layer.annotations !== null) throw new Error('annotations not cleared');
});

console.log('\nIntegration Tests:');
test('Should work with full workflow', () => {
  const testContainer = new MockHTMLElement();
  const layer = new HighlightLayer(testContainer, viewport);

  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
  }]);

  layer.render();
  if (layer.elements.size !== 1) throw new Error('Render failed');

  layer.updateTime(1.0);
  if (layer.currentTime !== 1.0) throw new Error('updateTime failed');

  layer.destroy();
  if (!layer.isDestroyed) throw new Error('destroy failed');
});

test('Should work with viewport changes', () => {
  const layer = new HighlightLayer(container, viewport);
  layer.setAnnotations([{
    id: 'hl-1',
    type: 'highlight',
    mode: 'quads',
    start: 0,
    end: 2,
    quads: [{ x: 0.5, y: 0.5, w: 0.2, h: 0.03 }]
  }]);
  layer.render();

  const newViewport = { width: 1600, height: 1200, scale: 2.0 };
  layer.setViewport(newViewport);
  if (layer.viewport.width !== 1600) throw new Error('Viewport not updated');

  layer.render();
  if (layer.elements.size !== 1) throw new Error('Re-render failed');
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
  console.log('\nHighlightLayer.js is correctly implemented and ready for use.');
  console.log('Next steps: Test with manual HTML page, then proceed to TextLayer');
  process.exit(0);
}
