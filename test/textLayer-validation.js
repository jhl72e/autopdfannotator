/**
 * Simple validation script for TextLayer
 * Run with: node test/textLayer-validation.js
 */

// Mock HTMLElement for Node.js environment
class MockHTMLElement {
  constructor() {
    this.nodeName = 'DIV';
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
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

// Import modules
const BaseLayerModule = await import('../src/layers/BaseLayer.js');
const TextLayerModule = await import('../src/layers/TextLayer.js');
const BaseLayer = BaseLayerModule.default;
const TextLayer = TextLayerModule.default;

console.log('🧪 TextLayer Validation Tests\n');

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
  const layer = new TextLayer(container, viewport);
  if (!(layer instanceof BaseLayer)) throw new Error('Not instance of BaseLayer');
  if (!(layer instanceof TextLayer)) throw new Error('Not instance of TextLayer');
});

test('Should create layer element with correct styles', () => {
  const layer = new TextLayer(container, viewport);
  if (!layer.layerElement) throw new Error('layerElement not created');
  if (layer.layerElement.style.position !== 'absolute') throw new Error('Wrong position');
  if (layer.layerElement.style.zIndex !== '30') throw new Error('Wrong zIndex');
});

test('Should append layer element to container', () => {
  const testContainer = new MockHTMLElement();
  const layer = new TextLayer(testContainer, viewport);
  if (!testContainer.children.includes(layer.layerElement)) {
    throw new Error('Layer element not appended');
  }
});

test('Should initialize textElements Map', () => {
  const layer = new TextLayer(container, viewport);
  if (!(layer.textElements instanceof Map)) throw new Error('textElements not a Map');
  if (layer.textElements.size !== 0) throw new Error('textElements Map not empty');
});

console.log('\nrender() Tests:');
test('Should create text box for annotation', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();

  if (layer.textElements.size !== 1) throw new Error('Wrong element count');
});

test('Should use default background color', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();

  const element = layer.textElements.get('txt-1').element;
  if (element.style.backgroundColor !== 'rgba(255,255,255,0.9)') {
    throw new Error('Wrong default background color');
  }
});

test('Should use custom background color', () => {
  const layer = new TextLayer(container, viewport);
  const customBg = 'rgba(255,250,205,0.95)';
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1,
    style: { bg: customBg }
  }]);
  layer.render();

  const element = layer.textElements.get('txt-1').element;
  if (element.style.backgroundColor !== customBg) {
    throw new Error('Custom background color not applied');
  }
});

test('Should use default text color', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();

  const element = layer.textElements.get('txt-1').element;
  if (element.style.color !== '#1f2937') {
    throw new Error('Wrong default text color');
  }
});

test('Should set initial display to none', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();

  const element = layer.textElements.get('txt-1').element;
  if (element.style.display !== 'none') {
    throw new Error('Initial display not set to none');
  }
});

test('Should be idempotent', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();
  const firstSize = layer.textElements.size;
  layer.render();
  const secondSize = layer.textElements.size;

  if (firstSize !== secondSize) throw new Error('Not idempotent');
});

console.log('\nupdateTime() Tests:');
test('Should call super.updateTime()', () => {
  const layer = new TextLayer(container, viewport);
  layer.updateTime(1.5);
  if (layer.currentTime !== 1.5) throw new Error('currentTime not updated');
});

test('Should hide text box before start time', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 2.0,
    end: 4.0,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();
  layer.updateTime(1.0);

  const element = layer.textElements.get('txt-1').element;
  if (element.style.display !== 'none') {
    throw new Error('Element not hidden before start');
  }
});

test('Should show text box at start time (instantly)', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 2.0,
    end: 4.0,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();
  layer.updateTime(2.0);

  const element = layer.textElements.get('txt-1').element;
  if (element.style.display !== 'flex') {
    throw new Error('Element not shown at start time');
  }
});

test('Should update text content (typing effect)', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0.0,
    end: 2.0,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();
  layer.updateTime(1.0);

  const element = layer.textElements.get('txt-1').element;
  if (element.textContent === '') throw new Error('Text not updated');
  if (element.textContent === 'Hello world') throw new Error('Full text shown too early');
});

console.log('\n_getVisibleText() Tests:');
test('Should return empty string before start', () => {
  const layer = new TextLayer(container, viewport);
  const result = layer._getVisibleText('Hello world', 2.0, 4.0, 1.0);
  if (result !== '') throw new Error('Should return empty string before start');
});

test('Should return full text after end', () => {
  const layer = new TextLayer(container, viewport);
  const content = 'Hello world from text';
  const result = layer._getVisibleText(content, 0.0, 2.0, 3.0);
  if (result !== content) throw new Error('Should return full text after end');
});

test('Should return partial text during animation', () => {
  const layer = new TextLayer(container, viewport);
  const result = layer._getVisibleText('Hello world', 0.0, 2.0, 1.0);
  if (result === '') throw new Error('Should return some text during animation');
  if (result === 'Hello world') throw new Error('Should not return full text during animation');
});

test('Should reveal words progressively', () => {
  const layer = new TextLayer(container, viewport);
  const content = 'Hello world from text';
  const result1 = layer._getVisibleText(content, 0.0, 4.0, 1.0);
  const result2 = layer._getVisibleText(content, 0.0, 4.0, 2.0);
  const result3 = layer._getVisibleText(content, 0.0, 4.0, 3.0);

  if (result1.length >= result2.length) throw new Error('Words not revealing progressively');
  if (result2.length >= result3.length) throw new Error('Words not revealing progressively');
});

test('Should handle single word content', () => {
  const layer = new TextLayer(container, viewport);
  const result = layer._getVisibleText('Hello', 0.0, 2.0, 1.0);
  if (result !== 'Hello') throw new Error('Single word not handled correctly');
});

test('Should handle empty content', () => {
  const layer = new TextLayer(container, viewport);
  const result = layer._getVisibleText('', 0.0, 2.0, 1.0);
  if (result !== '') throw new Error('Empty content not handled');
});

console.log('\ndestroy() Tests:');
test('Should clear textElements Map', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);
  layer.render();

  layer.destroy();
  if (layer.textElements !== null) throw new Error('textElements not cleared');
});

test('Should remove layer element from DOM', () => {
  const testContainer = new MockHTMLElement();
  const layer = new TextLayer(testContainer, viewport);

  layer.destroy();
  if (testContainer.children.includes(layer.layerElement)) {
    throw new Error('Layer element not removed');
  }
  if (layer.layerElement !== null) throw new Error('layerElement reference not cleared');
});

test('Should call parent destroy', () => {
  const layer = new TextLayer(container, viewport);
  layer.destroy();

  if (!layer.isDestroyed) throw new Error('isDestroyed not set');
  if (layer.container !== null) throw new Error('container not cleared');
  if (layer.viewport !== null) throw new Error('viewport not cleared');
  if (layer.annotations !== null) throw new Error('annotations not cleared');
});

console.log('\nIntegration Tests:');
test('Should work with full workflow', () => {
  const testContainer = new MockHTMLElement();
  const layer = new TextLayer(testContainer, viewport);

  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1
  }]);

  layer.render();
  if (layer.textElements.size !== 1) throw new Error('Render failed');

  layer.updateTime(1.0);
  if (layer.currentTime !== 1.0) throw new Error('updateTime failed');

  layer.destroy();
  if (!layer.isDestroyed) throw new Error('destroy failed');
});

test('Should work with viewport changes', () => {
  const layer = new TextLayer(container, viewport);
  layer.setAnnotations([{
    id: 'txt-1',
    type: 'text',
    start: 0,
    end: 2,
    content: 'Hello world',
    x: 0.5,
    y: 0.5,
    w: 0.2,
    h: 0.1
  }]);
  layer.render();

  const newViewport = { width: 1600, height: 1200, scale: 2.0 };
  layer.setViewport(newViewport);
  if (layer.viewport.width !== 1600) throw new Error('Viewport not updated');

  layer.render();
  if (layer.textElements.size !== 1) throw new Error('Re-render failed');
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
  console.log('\nTextLayer.js is correctly implemented and ready for use.');
  console.log('Next steps: Test with manual HTML page, then proceed to DrawingLayer');
  process.exit(0);
}
