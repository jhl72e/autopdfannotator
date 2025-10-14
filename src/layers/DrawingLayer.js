import BaseLayer from './BaseLayer.js';

/**
 * DrawingLayer - Renders ink/drawing annotations on HTML canvas
 *
 * Extends BaseLayer to provide progressive stroke animation for ink annotations.
 * Draws stroke points incrementally based on timeline position using requestAnimationFrame.
 * Handles device pixel ratio scaling for crisp rendering on high-DPI displays.
 *
 * Features:
 * - Progressive stroke drawing point-by-point
 * - Multiple strokes per annotation with custom colors/sizes
 * - Device pixel ratio handling for Retina displays
 * - Smooth 60fps animation with RAF
 * - Efficient canvas clear/redraw cycle
 *
 * @extends BaseLayer
 */
class DrawingLayer extends BaseLayer {
  /**
   * Creates a new DrawingLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   */
  constructor(container, viewport) {
    super(container, viewport);

    // Create canvas element
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.inset = '0';
    this.canvasElement.style.pointerEvents = 'none';
    this.canvasElement.style.zIndex = '40';

    // Append to container
    this.container.appendChild(this.canvasElement);

    // Get 2D context
    this.ctx = this.canvasElement.getContext('2d');

    // Initialize animation frame ID
    this.rafId = null;

    // Setup canvas with device pixel ratio
    this._setupCanvas();
  }

  /**
   * Configures canvas dimensions with device pixel ratio scaling
   *
   * Sets canvas buffer size for high-resolution rendering on Retina displays
   * while maintaining correct display size in CSS pixels. Scales context
   * transform to allow drawing with CSS pixel coordinates.
   *
   * @private
   */
  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;

    // Set canvas buffer resolution (high-res for crisp rendering)
    this.canvasElement.width = Math.round(this.viewport.width * dpr);
    this.canvasElement.height = Math.round(this.viewport.height * dpr);

    // Set canvas display size (CSS pixels)
    this.canvasElement.style.width = `${this.viewport.width}px`;
    this.canvasElement.style.height = `${this.viewport.height}px`;

    // Scale context to account for device pixel ratio
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Updates viewport dimensions and resizes canvas
   *
   * Reconfigures canvas buffer and display size when viewport changes
   * due to page navigation or zoom operations.
   *
   * @param {Object} viewport - New viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   * @override
   */
  setViewport(viewport) {
    super.setViewport(viewport);
    this._setupCanvas();
  }

  /**
   * Updates timeline position and starts progressive stroke drawing
   *
   * Cancels any existing animation loop and starts a new requestAnimationFrame
   * loop to redraw the canvas with strokes progressively drawn based on elapsed time.
   * Each frame clears the canvas and redraws all visible strokes.
   *
   * @param {number} nowSec - Current timeline position in seconds
   * @throws {Error} If called after layer is destroyed
   * @override
   */
  updateTime(nowSec) {
    super.updateTime(nowSec);

    // Cancel existing RAF to prevent multiple loops
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Start drawing loop
    const draw = () => {
      // Check destroyed state
      if (this.isDestroyed) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

      // Draw each annotation
      for (const a of this.annotations) {
        // Skip annotations that haven't started yet
        if (nowSec < a.start) continue;

        // Calculate elapsed time (capped at duration for persistence)
        const duration = a.end - a.start;
        const elapsed = Math.min(nowSec - a.start, duration);

        // Draw each stroke
        for (const stroke of (a.strokes || [])) {
          // Configure stroke style
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          this.ctx.strokeStyle = stroke.color || '#1f2937';
          this.ctx.lineWidth = stroke.size || 3;
          this.ctx.beginPath();

          let started = false;

          // Draw points up to current time
          for (const point of stroke.points) {
            // Skip points that haven't been drawn yet
            if (point.t > elapsed) break;

            // Convert normalized coordinates to canvas pixels
            const x = point.x * this.viewport.width;
            const y = point.y * this.viewport.height;

            if (!started) {
              this.ctx.moveTo(x, y);
              started = true;
            } else {
              this.ctx.lineTo(x, y);
            }
          }

          // Render the stroke
          if (started) {
            this.ctx.stroke();
          }
        }
      }

      // Schedule next frame
      this.rafId = requestAnimationFrame(draw);
    };

    // Start the loop
    draw();
  }

  /**
   * Renders the layer content
   *
   * No-op for DrawingLayer - canvas rendering happens in updateTime() RAF loop.
   * Canvas element is created once in constructor and drawn to continuously.
   *
   * @override
   */
  render() {
    // No-op: Canvas rendering happens in updateTime() RAF loop
    // Canvas element is created once in constructor
  }

  /**
   * Updates the visual state of the layer
   *
   * Not used for DrawingLayer - updateTime() handles updates via RAF loop.
   *
   * @override
   */
  update() {
    // Not used - updateTime handles drawing via RAF loop
  }

  /**
   * Destroys the layer and releases resources
   *
   * Cancels animation loop, clears references, and removes canvas from DOM.
   * Safe to call multiple times (idempotent).
   *
   * @override
   */
  destroy() {
    // Cancel animation loop first
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Clear context reference
    this.ctx = null;

    // Remove canvas from DOM
    if (this.canvasElement && this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }
    this.canvasElement = null;

    // Call parent cleanup (always last)
    super.destroy();
  }
}

export default DrawingLayer;
