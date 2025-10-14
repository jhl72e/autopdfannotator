/**
 * BaseLayer - Abstract base class for annotation layers
 *
 * Provides common interface and lifecycle management for all annotation layer types.
 * Subclasses must implement render() and update() abstract methods.
 *
 * @abstract
 */
class BaseLayer {
  /**
   * Creates a new BaseLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   * @throws {Error} If container is not a valid HTMLElement
   * @throws {Error} If viewport is missing required properties
   * @throws {Error} If instantiated directly (abstract class)
   */
  constructor(container, viewport) {
    // Validate parameters
    this._validateContainer(container);
    this._validateViewport(viewport);

    // Initialize core properties
    this.container = container;
    this.viewport = { ...viewport };
    this.annotations = [];
    this.currentTime = 0;
    this.isDestroyed = false;

    // Prevent direct instantiation
    if (new.target === BaseLayer) {
      throw new Error('BaseLayer is an abstract class and cannot be instantiated directly. Extend it with a concrete implementation.');
    }
  }

  /**
   * Sets the annotation data for this layer
   *
   * @param {Array} annotations - Array of annotation objects
   * @throws {Error} If called after layer is destroyed
   */
  setAnnotations(annotations) {
    this._checkDestroyed('setAnnotations');
    this.annotations = annotations || [];
  }

  /**
   * Updates the viewport dimensions
   *
   * @param {Object} viewport - New viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   * @throws {Error} If viewport is missing required properties
   * @throws {Error} If called after layer is destroyed
   */
  setViewport(viewport) {
    this._checkDestroyed('setViewport');
    this._validateViewport(viewport);
    this.viewport = { ...viewport };
  }

  /**
   * Updates the current timeline position
   *
   * @param {number} nowSec - Current timeline position in seconds
   * @throws {Error} If called after layer is destroyed
   */
  updateTime(nowSec) {
    this._checkDestroyed('updateTime');
    this.currentTime = nowSec;
  }

  /**
   * Destroys the layer and releases resources
   *
   * Safe to call multiple times (idempotent).
   * Subclasses must call super.destroy() after their own cleanup.
   */
  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.annotations = null;
    this.viewport = null;
    this.container = null;
    this.isDestroyed = true;
  }

  /**
   * Renders the layer content
   *
   * @abstract
   * @throws {Error} If not implemented by subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Updates the visual state of the layer
   *
   * @abstract
   * @throws {Error} If not implemented by subclass
   */
  update() {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Validates that container is a valid HTMLElement
   *
   * @private
   * @param {*} container - Value to validate
   * @throws {Error} If container is not a valid HTMLElement
   */
  _validateContainer(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('BaseLayer: container must be a valid HTMLElement');
    }
  }

  /**
   * Validates that viewport has required properties
   *
   * @private
   * @param {*} viewport - Value to validate
   * @throws {Error} If viewport is missing required properties
   */
  _validateViewport(viewport) {
    if (!viewport || typeof viewport !== 'object') {
      throw new Error('BaseLayer: viewport must be an object');
    }

    if (typeof viewport.width !== 'number' || viewport.width <= 0) {
      throw new Error('BaseLayer: viewport.width must be a positive number');
    }

    if (typeof viewport.height !== 'number' || viewport.height <= 0) {
      throw new Error('BaseLayer: viewport.height must be a positive number');
    }

    if (typeof viewport.scale !== 'number' || viewport.scale <= 0) {
      throw new Error('BaseLayer: viewport.scale must be a positive number');
    }
  }

  /**
   * Checks if layer is destroyed and throws error if so
   *
   * @private
   * @param {string} methodName - Name of method being called
   * @throws {Error} If layer is destroyed
   */
  _checkDestroyed(methodName) {
    if (this.isDestroyed) {
      throw new Error(`BaseLayer: Cannot call ${methodName}() on destroyed layer`);
    }
  }
}

export default BaseLayer;
