import BaseLayer from './BaseLayer.js';
import { rectNormToAbs } from '../utils/coordinateUtils.js';

/**
 * HighlightLayer - Renders highlight annotations with progressive reveal
 *
 * Extends BaseLayer to render rectangular highlight regions (quads) with
 * progressive left-to-right scaleX animation based on timeline position.
 * Supports multi-line highlights with per-quad timing segments.
 *
 * @extends BaseLayer
 */
class HighlightLayer extends BaseLayer {
  /**
   * Creates a new HighlightLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   */
  constructor(container, viewport) {
    super(container, viewport);

    // Create layer container element
    this.layerElement = document.createElement('div');
    this.layerElement.style.position = 'absolute';
    this.layerElement.style.inset = '0';
    this.layerElement.style.pointerEvents = 'none';
    this.layerElement.style.zIndex = '25';

    this.container.appendChild(this.layerElement);

    // Initialize element storage
    this.elements = new Map();

    // Initialize RAF ID
    this.rafId = null;
  }

  /**
   * Renders highlight elements for all annotations
   *
   * Creates DOM structure for each quad in each annotation. Calculates
   * timing segments for progressive animation. Clears and recreates all
   * elements when called.
   */
  render() {
    // Clear existing elements
    this.layerElement.innerHTML = '';
    this.elements.clear();

    // Process each annotation
    this.annotations.forEach((annotation) => {
      // Skip if not quad mode or no quads
      if (annotation.mode !== 'quads' || !annotation.quads?.length) {
        return;
      }

      // Calculate total width across all quads
      const totalW = annotation.quads.reduce((sum, quad) => sum + quad.w, 0);

      // Process each quad
      annotation.quads.forEach((quad, idx) => {
        // Convert normalized coordinates to absolute pixels
        const abs = rectNormToAbs(quad, this.viewport);

        // Calculate timing segment for this quad
        const prevW = annotation.quads.slice(0, idx).reduce((sum, q) => sum + q.w, 0);
        const segStart = prevW / totalW;
        const segEnd = (prevW + quad.w) / totalW;

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = `${abs.left}px`;
        wrapper.style.top = `${abs.top}px`;
        wrapper.style.width = `${abs.width}px`;
        wrapper.style.height = `${abs.height}px`;
        wrapper.style.overflow = 'hidden';
        wrapper.style.borderRadius = '2px';

        // Create highlight div
        const highlight = document.createElement('div');
        highlight.style.width = '100%';
        highlight.style.height = '100%';
        highlight.style.background = annotation?.style?.color ?? 'rgba(255,230,100,0.35)';
        highlight.style.outline = '1px solid rgba(255,200,0,0.6)';
        highlight.style.transformOrigin = 'left center';
        highlight.style.transform = 'scaleX(0)';
        highlight.style.willChange = 'transform';

        // Assemble DOM structure
        wrapper.appendChild(highlight);
        this.layerElement.appendChild(wrapper);

        // Store reference for animation
        const key = `${annotation.id}-${idx}`;
        this.elements.set(key, {
          element: highlight,
          wrapper: wrapper,
          annotation: annotation,
          segStart: segStart,
          segEnd: segEnd
        });
      });
    });
  }

  /**
   * Updates highlight animations based on current timeline position
   *
   * Starts requestAnimationFrame loop to animate scaleX transform for
   * each highlight element. Calculates progress for each quad segment
   * and updates visibility.
   *
   * @param {number} nowSec - Current timeline position in seconds
   */
  updateTime(nowSec) {
    super.updateTime(nowSec);

    // Cancel existing RAF if running
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Start animation loop
    const animate = () => {
      if (this.isDestroyed) {
        return;
      }

      // Update each highlight element
      this.elements.forEach(({ element, wrapper, annotation, segStart, segEnd }) => {
        // Hide wrapper if time hasn't reached annotation start
        if (nowSec < annotation.start) {
          wrapper.style.display = 'none';
        } else {
          // Show wrapper
          wrapper.style.display = 'block';

          // Calculate global progress (0 to 1)
          const globalProgress = Math.max(
            0,
            Math.min(
              1,
              (nowSec - annotation.start) / Math.max(1e-6, annotation.end - annotation.start)
            )
          );

          // Calculate local progress for this quad segment (0 to 1)
          const localProgress = Math.max(
            0,
            Math.min(
              1,
              (globalProgress - segStart) / Math.max(1e-6, segEnd - segStart)
            )
          );

          // Apply scaleX transform
          element.style.transform = `scaleX(${localProgress})`;
        }
      });

      // Schedule next frame
      this.rafId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Updates the visual state of the layer
   *
   * Not used by HighlightLayer - animation handled in updateTime()
   */
  update() {
    // Not used - updateTime handles animation directly
  }

  /**
   * Destroys the layer and releases all resources
   *
   * Cancels animation loop, clears element storage, removes DOM elements,
   * and calls parent cleanup.
   */
  destroy() {
    // Cancel RAF if running
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Clear element storage
    this.elements.clear();
    this.elements = null;

    // Remove layer element from DOM
    if (this.layerElement && this.layerElement.parentNode) {
      this.layerElement.parentNode.removeChild(this.layerElement);
    }
    this.layerElement = null;

    // Call parent destroy
    super.destroy();
  }
}

export default HighlightLayer;
