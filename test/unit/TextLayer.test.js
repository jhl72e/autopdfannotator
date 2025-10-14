/**
 * Unit tests for TextLayer
 */

import TextLayer from '../../src/layers/TextLayer.js';
import BaseLayer from '../../src/layers/BaseLayer.js';

// Mock HTMLElement for Node.js environment
class MockHTMLElement {
  constructor() {
    this.nodeName = 'DIV';
    this.style = {};
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
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

// Mock document.createElement
global.document = {
  createElement: (tag) => new MockHTMLElement()
};

global.HTMLElement = MockHTMLElement;

describe('TextLayer', () => {
  let container;
  let viewport;

  beforeEach(() => {
    container = new MockHTMLElement();
    viewport = { width: 800, height: 600, scale: 1.0 };
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Constructor', () => {
    test('should extend BaseLayer', () => {
      const layer = new TextLayer(container, viewport);
      expect(layer instanceof BaseLayer).toBe(true);
      expect(layer instanceof TextLayer).toBe(true);
    });

    test('should create layer element with correct styles', () => {
      const layer = new TextLayer(container, viewport);
      expect(layer.layerElement).toBeDefined();
      expect(layer.layerElement.style.position).toBe('absolute');
      expect(layer.layerElement.style.inset).toBe('0');
      expect(layer.layerElement.style.pointerEvents).toBe('none');
      expect(layer.layerElement.style.zIndex).toBe('30');
    });

    test('should append layer element to container', () => {
      const layer = new TextLayer(container, viewport);
      expect(container.children).toContain(layer.layerElement);
      expect(layer.layerElement.parentNode).toBe(container);
    });

    test('should initialize textElements Map', () => {
      const layer = new TextLayer(container, viewport);
      expect(layer.textElements).toBeInstanceOf(Map);
      expect(layer.textElements.size).toBe(0);
    });

    test('should initialize base properties', () => {
      const layer = new TextLayer(container, viewport);
      expect(layer.container).toBe(container);
      expect(layer.viewport).toEqual(viewport);
      expect(layer.annotations).toEqual([]);
      expect(layer.currentTime).toBe(0);
      expect(layer.isDestroyed).toBe(false);
    });
  });

  describe('render()', () => {
    test('should create text box for each annotation', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      expect(layer.textElements.size).toBe(1);
      expect(layer.layerElement.children.length).toBe(1);
    });

    test('should apply default background color when not specified', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.backgroundColor).toBe('rgba(255,255,255,0.9)');
    });

    test('should apply custom background color when provided', () => {
      const layer = new TextLayer(container, viewport);
      const customBg = 'rgba(255,250,205,0.95)';
      const annotation = {
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
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.backgroundColor).toBe(customBg);
    });

    test('should apply default text color when not specified', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.color).toBe('#1f2937');
    });

    test('should apply custom text color when provided', () => {
      const layer = new TextLayer(container, viewport);
      const customColor = '#ff0000';
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1,
        style: { color: customColor }
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.color).toBe(customColor);
    });

    test('should set initial display to none', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.display).toBe('none');
    });

    test('should be idempotent (safe to call multiple times)', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();
      const firstSize = layer.textElements.size;

      layer.render();
      const secondSize = layer.textElements.size;

      expect(firstSize).toBe(secondSize);
      expect(layer.textElements.size).toBe(1);
    });

    test('should clear previous elements on re-render', () => {
      const layer = new TextLayer(container, viewport);

      // First render with one annotation
      layer.setAnnotations([{
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'First',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      }]);
      layer.render();
      expect(layer.textElements.size).toBe(1);

      // Second render with two annotations
      layer.setAnnotations([
        {
          id: 'txt-1',
          type: 'text',
          start: 0,
          end: 2,
          content: 'First',
          x: 0.1,
          y: 0.2,
          w: 0.3,
          h: 0.1
        },
        {
          id: 'txt-2',
          type: 'text',
          start: 0,
          end: 2,
          content: 'Second',
          x: 0.1,
          y: 0.5,
          w: 0.3,
          h: 0.1
        }
      ]);
      layer.render();
      expect(layer.textElements.size).toBe(2);
    });

    test('should set correct typography styles', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.fontSize).toBe('14px');
      expect(element.style.lineHeight).toBe('1.4');
      expect(element.style.fontFamily).toBe('system-ui, -apple-system, sans-serif');
    });

    test('should set correct layout styles', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.alignItems).toBe('center');
      expect(element.style.justifyContent).toBe('flex-start');
    });
  });

  describe('updateTime()', () => {
    test('should call super.updateTime()', () => {
      const layer = new TextLayer(container, viewport);
      layer.updateTime(1.5);
      expect(layer.currentTime).toBe(1.5);
    });

    test('should hide text box before start time', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 2.0,
        end: 4.0,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(1.0); // Before start

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.display).toBe('none');
    });

    test('should show text box at start time (instantly)', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 2.0,
        end: 4.0,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(2.0); // At start

      const element = layer.textElements.get('txt-1').element;
      expect(element.style.display).toBe('flex');
    });

    test('should update text content with visible text (typing effect)', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0.0,
        end: 2.0,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(1.0); // Midway

      const element = layer.textElements.get('txt-1').element;
      expect(element.textContent).not.toBe('');
      expect(element.textContent).not.toBe('Hello world'); // Not full text yet
    });

    test('should handle multiple annotations', () => {
      const layer = new TextLayer(container, viewport);
      const annotations = [
        {
          id: 'txt-1',
          type: 'text',
          start: 0.0,
          end: 2.0,
          content: 'First text',
          x: 0.1,
          y: 0.2,
          w: 0.3,
          h: 0.1
        },
        {
          id: 'txt-2',
          type: 'text',
          start: 1.0,
          end: 3.0,
          content: 'Second text',
          x: 0.1,
          y: 0.5,
          w: 0.3,
          h: 0.1
        }
      ];

      layer.setAnnotations(annotations);
      layer.render();
      layer.updateTime(1.5);

      const element1 = layer.textElements.get('txt-1').element;
      const element2 = layer.textElements.get('txt-2').element;

      expect(element1.style.display).toBe('flex');
      expect(element2.style.display).toBe('flex');
    });
  });

  describe('_getVisibleText()', () => {
    let layer;

    beforeEach(() => {
      layer = new TextLayer(container, viewport);
    });

    test('should return empty string before start time', () => {
      const result = layer._getVisibleText('Hello world', 2.0, 4.0, 1.0);
      expect(result).toBe('');
    });

    test('should return full text after end time', () => {
      const content = 'Hello world from text';
      const result = layer._getVisibleText(content, 0.0, 2.0, 3.0);
      expect(result).toBe(content);
    });

    test('should return partial text during animation', () => {
      const result = layer._getVisibleText('Hello world', 0.0, 2.0, 1.0);
      expect(result).not.toBe('');
      expect(result).not.toBe('Hello world');
    });

    test('should reveal words progressively', () => {
      const content = 'Hello world from text';
      // At 25% progress should show ~1 word
      const result1 = layer._getVisibleText(content, 0.0, 4.0, 1.0);
      // At 50% progress should show ~2 words
      const result2 = layer._getVisibleText(content, 0.0, 4.0, 2.0);
      // At 75% progress should show ~3 words
      const result3 = layer._getVisibleText(content, 0.0, 4.0, 3.0);

      expect(result1.length).toBeLessThan(result2.length);
      expect(result2.length).toBeLessThan(result3.length);
    });

    test('should handle single word content', () => {
      const result = layer._getVisibleText('Hello', 0.0, 2.0, 1.0);
      expect(result).toBe('Hello'); // Should show full single word at 50%
    });

    test('should handle empty content', () => {
      const result = layer._getVisibleText('', 0.0, 2.0, 1.0);
      expect(result).toBe('');
    });

    test('should handle progress = 0', () => {
      const result = layer._getVisibleText('Hello world', 0.0, 2.0, 0.0);
      expect(result).toBe('');
    });

    test('should handle progress = 1', () => {
      const content = 'Hello world';
      const result = layer._getVisibleText(content, 0.0, 2.0, 2.0);
      expect(result).toBe(content);
    });

    test('should calculate word count correctly', () => {
      const content = 'One Two Three Four';
      const words = content.split(' '); // 4 words

      // At 50% progress, should show 2 complete words
      const result = layer._getVisibleText(content, 0.0, 4.0, 2.0);
      const visibleWords = result.split(' ').filter(w => w.length > 0);

      expect(visibleWords.length).toBeGreaterThanOrEqual(2);
      expect(visibleWords.length).toBeLessThanOrEqual(3); // May include partial 3rd word
    });

    test('should include partial character reveal', () => {
      const content = 'Hello world';
      // At slight progress past first word
      const result = layer._getVisibleText(content, 0.0, 4.0, 2.1);

      // Should have "Hello" plus partial "world"
      expect(result).toContain('Hello');
      expect(result.length).toBeGreaterThan('Hello'.length);
    });
  });

  describe('destroy()', () => {
    test('should clear textElements Map', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();
      expect(layer.textElements.size).toBe(1);

      layer.destroy();
      expect(layer.textElements).toBeNull();
    });

    test('should remove layer element from DOM', () => {
      const layer = new TextLayer(container, viewport);
      expect(container.children).toContain(layer.layerElement);

      layer.destroy();
      expect(container.children).not.toContain(layer.layerElement);
      expect(layer.layerElement).toBeNull();
    });

    test('should call parent destroy', () => {
      const layer = new TextLayer(container, viewport);
      layer.destroy();

      expect(layer.isDestroyed).toBe(true);
      expect(layer.container).toBeNull();
      expect(layer.viewport).toBeNull();
      expect(layer.annotations).toBeNull();
    });
  });

  describe('Integration', () => {
    test('should work with full workflow', () => {
      const layer = new TextLayer(container, viewport);

      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.1,
        y: 0.2,
        w: 0.3,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      expect(layer.annotations).toEqual([annotation]);

      layer.render();
      expect(layer.textElements.size).toBe(1);

      layer.updateTime(1.0);
      expect(layer.currentTime).toBe(1.0);

      layer.destroy();
      expect(layer.isDestroyed).toBe(true);
    });

    test('should work with viewport changes', () => {
      const layer = new TextLayer(container, viewport);
      const annotation = {
        id: 'txt-1',
        type: 'text',
        start: 0,
        end: 2,
        content: 'Hello world',
        x: 0.5,
        y: 0.5,
        w: 0.2,
        h: 0.1
      };

      layer.setAnnotations([annotation]);
      layer.render();

      // Change viewport
      const newViewport = { width: 1600, height: 1200, scale: 2.0 };
      layer.setViewport(newViewport);
      expect(layer.viewport).toEqual(newViewport);

      // Re-render with new viewport
      layer.render();
      expect(layer.textElements.size).toBe(1);
    });
  });
});
