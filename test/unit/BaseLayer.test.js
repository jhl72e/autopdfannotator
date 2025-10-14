/**
 * Unit tests for BaseLayer abstract class
 */

import BaseLayer from '../../src/layers/BaseLayer.js';

// Test helper: Simple concrete implementation for testing BaseLayer
class TestLayer extends BaseLayer {
  render() {
    // Empty implementation for testing
  }

  update() {
    // Empty implementation for testing
  }
}

// Test setup
function createMockContainer() {
  return document.createElement('div');
}

function createMockViewport() {
  return { width: 800, height: 600, scale: 1.0 };
}

describe('BaseLayer', () => {
  let container;
  let viewport;

  beforeEach(() => {
    container = createMockContainer();
    viewport = createMockViewport();
  });

  describe('Constructor', () => {
    test('should throw error when instantiated directly', () => {
      expect(() => new BaseLayer(container, viewport)).toThrow('abstract class');
    });

    test('should throw error with null container', () => {
      expect(() => new TestLayer(null, viewport)).toThrow('valid HTMLElement');
    });

    test('should throw error with invalid container (string)', () => {
      expect(() => new TestLayer('not-element', viewport)).toThrow('valid HTMLElement');
    });

    test('should throw error with null viewport', () => {
      expect(() => new TestLayer(container, null)).toThrow('viewport must be an object');
    });

    test('should throw error with invalid viewport (missing width)', () => {
      expect(() => new TestLayer(container, { height: 600, scale: 1.0 })).toThrow('viewport.width');
    });

    test('should throw error with invalid viewport (negative width)', () => {
      expect(() => new TestLayer(container, { width: -1, height: 600, scale: 1.0 })).toThrow('positive number');
    });

    test('should throw error with invalid viewport (missing height)', () => {
      expect(() => new TestLayer(container, { width: 800, scale: 1.0 })).toThrow('viewport.height');
    });

    test('should throw error with invalid viewport (missing scale)', () => {
      expect(() => new TestLayer(container, { width: 800, height: 600 })).toThrow('viewport.scale');
    });

    test('should initialize properties correctly', () => {
      const layer = new TestLayer(container, viewport);
      expect(layer.container).toBe(container);
      expect(layer.viewport).toEqual(viewport);
      expect(layer.viewport).not.toBe(viewport); // Should be cloned
      expect(layer.annotations).toEqual([]);
      expect(layer.currentTime).toBe(0);
      expect(layer.isDestroyed).toBe(false);
    });
  });

  describe('setAnnotations()', () => {
    let layer;

    beforeEach(() => {
      layer = new TestLayer(container, viewport);
    });

    test('should store annotations', () => {
      const annos = [{ id: '1' }, { id: '2' }];
      layer.setAnnotations(annos);
      expect(layer.annotations).toEqual(annos);
    });

    test('should default to empty array for null', () => {
      layer.setAnnotations(null);
      expect(layer.annotations).toEqual([]);
    });

    test('should default to empty array for undefined', () => {
      layer.setAnnotations(undefined);
      expect(layer.annotations).toEqual([]);
    });

    test('should throw error when called after destroy', () => {
      layer.destroy();
      expect(() => layer.setAnnotations([])).toThrow('destroyed layer');
    });
  });

  describe('setViewport()', () => {
    let layer;

    beforeEach(() => {
      layer = new TestLayer(container, viewport);
    });

    test('should update viewport', () => {
      const newViewport = { width: 1024, height: 768, scale: 1.5 };
      layer.setViewport(newViewport);
      expect(layer.viewport).toEqual(newViewport);
    });

    test('should clone viewport object', () => {
      const newViewport = { width: 1024, height: 768, scale: 1.5 };
      layer.setViewport(newViewport);
      expect(layer.viewport).not.toBe(newViewport);
    });

    test('should validate viewport structure', () => {
      expect(() => layer.setViewport({ width: -1, height: 600, scale: 1.0 })).toThrow('positive number');
    });

    test('should throw error when called after destroy', () => {
      layer.destroy();
      expect(() => layer.setViewport(viewport)).toThrow('destroyed layer');
    });
  });

  describe('updateTime()', () => {
    let layer;

    beforeEach(() => {
      layer = new TestLayer(container, viewport);
    });

    test('should update currentTime', () => {
      layer.updateTime(5.5);
      expect(layer.currentTime).toBe(5.5);
    });

    test('should handle zero time', () => {
      layer.updateTime(0);
      expect(layer.currentTime).toBe(0);
    });

    test('should throw error when called after destroy', () => {
      layer.destroy();
      expect(() => layer.updateTime(0)).toThrow('destroyed layer');
    });
  });

  describe('destroy()', () => {
    let layer;

    beforeEach(() => {
      layer = new TestLayer(container, viewport);
    });

    test('should set isDestroyed flag', () => {
      layer.destroy();
      expect(layer.isDestroyed).toBe(true);
    });

    test('should clear container reference', () => {
      layer.destroy();
      expect(layer.container).toBeNull();
    });

    test('should clear viewport reference', () => {
      layer.destroy();
      expect(layer.viewport).toBeNull();
    });

    test('should clear annotations reference', () => {
      layer.destroy();
      expect(layer.annotations).toBeNull();
    });

    test('should be idempotent (safe to call multiple times)', () => {
      layer.destroy();
      expect(() => layer.destroy()).not.toThrow();
      expect(layer.isDestroyed).toBe(true);
    });
  });

  describe('Abstract Methods', () => {
    test('render() should throw error if not overridden', () => {
      class IncompleteLayer extends BaseLayer {
        update() {}
      }
      const layer = new IncompleteLayer(container, viewport);
      expect(() => layer.render()).toThrow('must be implemented by subclass');
    });

    test('update() should throw error if not overridden', () => {
      class IncompleteLayer extends BaseLayer {
        render() {}
      }
      const layer = new IncompleteLayer(container, viewport);
      expect(() => layer.update()).toThrow('must be implemented by subclass');
    });
  });
});
