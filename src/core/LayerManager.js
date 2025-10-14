/**
 * LayerManager - Framework-agnostic layer orchestration subsystem
 *
 * This module manages annotation layer instances, routes annotations by type,
 * and coordinates viewport and timeline state across all layers.
 * Instantiates layer classes directly and manages their lifecycle.
 *
 * @module core/LayerManager
 */

import HighlightLayer from '../layers/HighlightLayer.js';
import TextLayer from '../layers/TextLayer.js';
import DrawingLayer from '../layers/DrawingLayer.js';

/**
 * LayerManager class
 *
 * Orchestrates annotation layers by instantiating and managing layer instances.
 * Routes annotations to appropriate layers by type, propagates viewport changes,
 * and coordinates timeline updates. Uses Direct Instantiation Pattern for
 * framework-agnostic layer management.
 *
 * @class
 * @example
 * const viewport = { width: 800, height: 600, scale: 1.0 };
 * const manager = new LayerManager(containerElement, viewport);
 * manager.setAnnotations(annotations, 1);
 * manager.setViewport(newViewport);
 * manager.updateTimeline(5.0);
 * // Layers render automatically
 * manager.destroy();
 */
export class LayerManager {
  /**
   * Create LayerManager instance
   *
   * Instantiates all layer classes and manages their lifecycle.
   * Layers are created immediately and appended to container.
   *
   * @param {HTMLElement} containerElement - DOM element for layer rendering
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - Scale factor
   * @throws {Error} If containerElement is not a valid DOM element
   * @throws {Error} If viewport is invalid or missing required properties
   */
  constructor(containerElement, viewport) {
    // Validate container element
    if (!containerElement || !(containerElement instanceof HTMLElement)) {
      throw new Error('LayerManager: containerElement must be a valid DOM element');
    }

    // Validate viewport
    if (!viewport || typeof viewport !== 'object') {
      throw new Error('LayerManager: viewport must be a valid object');
    }
    if (typeof viewport.width !== 'number' || typeof viewport.height !== 'number') {
      throw new Error('LayerManager: viewport must have width and height properties');
    }

    /**
     * @private
     * @type {HTMLElement}
     */
    this.container = containerElement;

    /**
     * @private
     * @type {number|null}
     */
    this.currentPage = null;

    /**
     * @private
     * @type {Object}
     */
    this.currentViewport = viewport;

    /**
     * @private
     * @type {Array}
     */
    this.allAnnotations = [];

    /**
     * Layer instances
     * @private
     * @type {Object}
     */
    this.layers = {
      highlight: new HighlightLayer(containerElement, viewport),
      text: new TextLayer(containerElement, viewport),
      drawing: new DrawingLayer(containerElement, viewport)
    };
  }

  /**
   * Set annotations and route to appropriate layers
   *
   * Filters annotations for the specified page and groups by type.
   * Passes annotations to layer instances and triggers render.
   * Layers create/update their DOM elements during render.
   *
   * @param {Array} annotations - Complete annotation array (all pages, all types)
   * @param {number} pageNum - Current page number (1-indexed)
   * @returns {void}
   */
  setAnnotations(annotations, pageNum) {
    // Validate inputs
    if (!Array.isArray(annotations)) {
      console.warn('LayerManager.setAnnotations: annotations must be an array');
      annotations = [];
    }

    if (typeof pageNum !== 'number' || pageNum < 1) {
      console.warn('LayerManager.setAnnotations: invalid page number');
      return;
    }

    // Store for reference
    this.allAnnotations = annotations;
    this.currentPage = pageNum;

    // Filter annotations for current page only
    const pageAnnotations = annotations.filter(a => a.page === pageNum);

    // Group by type
    const highlights = pageAnnotations.filter(a => a.type === 'highlight');
    const textAnnotations = pageAnnotations.filter(a => a.type === 'text');
    const inkAnnotations = pageAnnotations.filter(a => a.type === 'ink');

    // Pass annotations to layer instances
    this.layers.highlight.setAnnotations(highlights);
    this.layers.text.setAnnotations(textAnnotations);
    this.layers.drawing.setAnnotations(inkAnnotations);

    // Trigger render on all layers
    this.layers.highlight.render();
    this.layers.text.render();
    this.layers.drawing.render();
  }

  /**
   * Update viewport dimensions for all layers
   *
   * Propagates viewport object to all layer instances.
   * Triggers render to recalculate element positions and dimensions.
   * Viewport contains width, height, scale from PDFRenderer.
   *
   * @param {Object} viewport - Viewport object from PDFRenderer
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - Scale factor
   * @returns {void}
   */
  setViewport(viewport) {
    // Validate viewport
    if (!viewport || typeof viewport !== 'object') {
      console.warn('LayerManager.setViewport: invalid viewport object');
      return;
    }

    // Store viewport reference
    this.currentViewport = viewport;

    // Propagate to all layer instances
    this.layers.highlight.setViewport(viewport);
    this.layers.text.setViewport(viewport);
    this.layers.drawing.setViewport(viewport);

    // Trigger render on all layers (viewport change requires re-layout)
    this.layers.highlight.render();
    this.layers.text.render();
    this.layers.drawing.render();
  }

  /**
   * Update timeline position for all layers
   *
   * Propagates timestamp to all layer instances.
   * Layers handle their own animation updates (RAF loops, transforms, etc).
   *
   * @param {number} timestamp - Current timeline position in seconds
   * @returns {void}
   */
  updateTimeline(timestamp) {
    // Validate timestamp
    if (typeof timestamp !== 'number') {
      console.warn('LayerManager.updateTimeline: timestamp must be a number');
      return;
    }

    // Propagate time update to all layer instances
    this.layers.highlight.updateTime(timestamp);
    this.layers.text.updateTime(timestamp);
    this.layers.drawing.updateTime(timestamp);
  }

  /**
   * Clean up resources and destroy layer instances
   *
   * Calls destroy() on all layer instances to clean up DOM elements,
   * cancel animations, and release references.
   * Call before removing LayerManager instance.
   *
   * @returns {void}
   */
  destroy() {
    // Destroy all layer instances
    if (this.layers) {
      this.layers.highlight.destroy();
      this.layers.text.destroy();
      this.layers.drawing.destroy();
      this.layers = null;
    }

    // Clear all references
    this.container = null;
    this.currentPage = null;
    this.currentViewport = null;
    this.allAnnotations = [];
  }
}
