/**
 * Unit tests for HighlightLayer
 */

import HighlightLayer from '../../src/layers/HighlightLayer.js';
import BaseLayer from '../../src/layers/BaseLayer.js';

// Mock HTMLElement for Node.js environment
class MockHTMLElement {
  constructor() {
    this.nodeName = 'DIV';
    this.style = {};
    this.children = [];
    this.innerHTML = '';
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
const originalCreateElement = global.document?.createElement;
global.document = {
  createElement: (tag) => new MockHTMLElement()
};

global.HTMLElement = MockHTMLElement;

// Mock requestAnimationFrame and cancelAnimationFrame
let rafId = 0;
global.requestAnimationFrame = (callback) => {
  return ++rafId;
};
global.cancelAnimationFrame = (id) => {
  // Mock implementation
};

describe('HighlightLayer', () => {
  let container;
  let viewport;

  beforeEach(() => {
    container = new MockHTMLElement();
    viewport = { width: 800, height: 600, scale: 1.0 };
    rafId = 0; // Reset RAF ID
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Constructor', () => {
    test('should extend BaseLayer', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(layer instanceof BaseLayer).toBe(true);
      expect(layer instanceof HighlightLayer).toBe(true);
    });

    test('should create layer element with correct styles', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(layer.layerElement).toBeDefined();
      expect(layer.layerElement.style.position).toBe('absolute');
      expect(layer.layerElement.style.inset).toBe('0');
      expect(layer.layerElement.style.pointerEvents).toBe('none');
      expect(layer.layerElement.style.zIndex).toBe('25');
    });

    test('should append layer element to container', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(container.children).toContain(layer.layerElement);
      expect(layer.layerElement.parentNode).toBe(container);
    });

    test('should initialize elements Map', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(layer.elements).toBeInstanceOf(Map);
      expect(layer.elements.size).toBe(0);
    });

    test('should initialize rafId as null', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(layer.rafId).toBeNull();
    });

    test('should initialize base properties', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(layer.container).toBe(container);
      expect(layer.viewport).toEqual(viewport);
      expect(layer.annotations).toEqual([]);
      expect(layer.currentTime).toBe(0);
      expect(layer.isDestroyed).toBe(false);
    });
  });

  describe('render()', () => {
    test('should create DOM elements for single quad annotation', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }],
        style: { color: 'rgba(255,0,0,0.3)' }
      };

      layer.setAnnotations([annotation]);
      layer.render();

      expect(layer.elements.size).toBe(1);
      expect(layer.layerElement.children.length).toBe(1);
    });

    test('should create multiple elements for multi-quad annotation', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [
          { x: 0.1, y: 0.2, w: 0.5, h: 0.03 },
          { x: 0.1, y: 0.23, w: 0.3, h: 0.03 }
        ],
        style: { color: 'rgba(255,0,0,0.3)' }
      };

      layer.setAnnotations([annotation]);
      layer.render();

      expect(layer.elements.size).toBe(2);
      expect(layer.layerElement.children.length).toBe(2);
    });

    test('should calculate timing segments correctly', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [
          { x: 0.1, y: 0.2, w: 0.6, h: 0.03 }, // 60% of total
          { x: 0.1, y: 0.23, w: 0.4, h: 0.03 } // 40% of total
        ],
        style: { color: 'rgba(255,0,0,0.3)' }
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const elements = Array.from(layer.elements.values());
      expect(elements[0].segStart).toBe(0);
      expect(elements[0].segEnd).toBe(0.6);
      expect(elements[1].segStart).toBe(0.6);
      expect(elements[1].segEnd).toBe(1.0);
    });

    test('should use default color when not specified', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const elements = Array.from(layer.elements.values());
      expect(elements[0].element.style.background).toBe('rgba(255,230,100,0.35)');
    });

    test('should use custom color when provided', () => {
      const layer = new HighlightLayer(container, viewport);
      const customColor = 'rgba(100,200,255,0.5)';
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }],
        style: { color: customColor }
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const elements = Array.from(layer.elements.values());
      expect(elements[0].element.style.background).toBe(customColor);
    });

    test('should skip annotations without quads', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: []
      };

      layer.setAnnotations([annotation]);
      layer.render();

      expect(layer.elements.size).toBe(0);
      expect(layer.layerElement.children.length).toBe(0);
    });

    test('should skip annotations not in quad mode', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'other',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      expect(layer.elements.size).toBe(0);
    });

    test('should be idempotent (safe to call multiple times)', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }],
        style: { color: 'rgba(255,0,0,0.3)' }
      };

      layer.setAnnotations([annotation]);
      layer.render();
      const firstSize = layer.elements.size;

      layer.render();
      const secondSize = layer.elements.size;

      expect(firstSize).toBe(secondSize);
      expect(layer.elements.size).toBe(1);
    });

    test('should clear previous elements on re-render', () => {
      const layer = new HighlightLayer(container, viewport);

      // First render with one annotation
      layer.setAnnotations([{
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      }]);
      layer.render();
      expect(layer.elements.size).toBe(1);

      // Second render with two annotations
      layer.setAnnotations([
        {
          id: 'hl-1',
          type: 'highlight',
          mode: 'quads',
          start: 0,
          end: 2,
          quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
        },
        {
          id: 'hl-2',
          type: 'highlight',
          mode: 'quads',
          start: 0,
          end: 2,
          quads: [{ x: 0.1, y: 0.5, w: 0.5, h: 0.03 }]
        }
      ]);
      layer.render();
      expect(layer.elements.size).toBe(2);
    });

    test('should set initial transform to scaleX(0)', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const elements = Array.from(layer.elements.values());
      expect(elements[0].element.style.transform).toBe('scaleX(0)');
    });

    test('should set transformOrigin to left center', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      const elements = Array.from(layer.elements.values());
      expect(elements[0].element.style.transformOrigin).toBe('left center');
    });
  });

  describe('updateTime()', () => {
    test('should call super.updateTime()', () => {
      const layer = new HighlightLayer(container, viewport);
      layer.updateTime(1.5);
      expect(layer.currentTime).toBe(1.5);
    });

    test('should start requestAnimationFrame loop', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(1.0);

      expect(layer.rafId).not.toBeNull();
      expect(typeof layer.rafId).toBe('number');
    });

    test('should cancel previous RAF before starting new one', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      layer.updateTime(1.0);
      const firstRafId = layer.rafId;

      layer.updateTime(1.5);
      const secondRafId = layer.rafId;

      expect(firstRafId).not.toBe(secondRafId);
    });

    test('should hide wrapper before annotation start time', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 2.0,
        end: 4.0,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(1.0); // Before start

      const elements = Array.from(layer.elements.values());
      expect(elements[0].wrapper.style.display).toBe('none');
    });

    test('should show wrapper at annotation start time', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 2.0,
        end: 4.0,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(2.0); // At start

      const elements = Array.from(layer.elements.values());
      expect(elements[0].wrapper.style.display).toBe('block');
    });
  });

  describe('destroy()', () => {
    test('should cancel requestAnimationFrame', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();
      layer.updateTime(1.0);
      expect(layer.rafId).not.toBeNull();

      layer.destroy();
      expect(layer.rafId).toBeNull();
    });

    test('should clear elements Map', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();
      expect(layer.elements.size).toBe(1);

      layer.destroy();
      expect(layer.elements).toBeNull();
    });

    test('should remove layer element from DOM', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(container.children).toContain(layer.layerElement);

      layer.destroy();
      expect(container.children).not.toContain(layer.layerElement);
      expect(layer.layerElement).toBeNull();
    });

    test('should call parent destroy', () => {
      const layer = new HighlightLayer(container, viewport);
      layer.destroy();

      expect(layer.isDestroyed).toBe(true);
      expect(layer.container).toBeNull();
      expect(layer.viewport).toBeNull();
      expect(layer.annotations).toBeNull();
    });

    test('should handle destroy when RAF is not running', () => {
      const layer = new HighlightLayer(container, viewport);
      expect(() => layer.destroy()).not.toThrow();
    });
  });

  describe('Integration', () => {
    test('should work with setAnnotations + render + updateTime flow', () => {
      const layer = new HighlightLayer(container, viewport);

      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      expect(layer.annotations).toEqual([annotation]);

      layer.render();
      expect(layer.elements.size).toBe(1);

      layer.updateTime(1.0);
      expect(layer.currentTime).toBe(1.0);
      expect(layer.rafId).not.toBeNull();

      layer.destroy();
      expect(layer.isDestroyed).toBe(true);
    });

    test('should work with viewport changes', () => {
      const layer = new HighlightLayer(container, viewport);
      const annotation = {
        id: 'hl-1',
        type: 'highlight',
        mode: 'quads',
        start: 0,
        end: 2,
        quads: [{ x: 0.5, y: 0.5, w: 0.2, h: 0.03 }]
      };

      layer.setAnnotations([annotation]);
      layer.render();

      // Change viewport
      const newViewport = { width: 1600, height: 1200, scale: 2.0 };
      layer.setViewport(newViewport);
      expect(layer.viewport).toEqual(newViewport);

      // Re-render with new viewport
      layer.render();
      expect(layer.elements.size).toBe(1);
    });
  });
});
