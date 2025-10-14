import BaseLayer from "./BaseLayer.js";
import { rectNormToAbs } from "../utils/coordinateUtils.js";

/**
 * TextLayer - Renders text annotations with progressive reveal
 *
 * Extends BaseLayer to render text box annotations with progressive
 * word-by-word text reveal animation (typing effect). Text appears
 * immediately and types in character by character, simulating real-time typing.
 *
 * @extends BaseLayer
 */
class TextLayer extends BaseLayer {
  /**
   * Creates a new TextLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   */
  constructor(container, viewport) {
    // Call parent constructor first
    super(container, viewport);

    // Create layer container element
    this.layerElement = document.createElement("div");
    this.layerElement.style.position = "absolute";
    this.layerElement.style.inset = "0";
    this.layerElement.style.pointerEvents = "none";
    this.layerElement.style.zIndex = "30";

    // Append to parent container
    this.container.appendChild(this.layerElement);

    // Initialize element storage (Map of id -> element)
    this.textElements = new Map();
  }

  /**
   * Renders text box elements for all annotations
   *
   * Creates DOM structure for each text annotation. Creates text box divs
   * with proper positioning and styling. Initially hidden (visibility
   * controlled by updateTime).
   *
   * This method is idempotent - safe to call multiple times.
   */
  render() {
    // Clear existing elements
    this.layerElement.innerHTML = "";
    this.textElements.clear();

    // Process each annotation
    this.annotations.forEach((annotation) => {
      // Convert normalized coordinates to absolute pixels
      const abs = rectNormToAbs(annotation, this.viewport);

      // Create text box div
      const textBox = document.createElement("div");

      // Set positioning
      textBox.style.position = "absolute";
      textBox.style.left = `${abs.left}px`;
      textBox.style.top = `${abs.top}px`;
      textBox.style.width = `${abs.width}px`;
      textBox.style.height = `${abs.height}px`;

      // Set background and border
      textBox.style.backgroundColor =
        annotation.style?.bg || "rgba(255,255,255,0.9)";
      textBox.style.borderRadius = "4px";
      textBox.style.padding = "8px";

      // Set text styling
      textBox.style.fontSize = "14px";
      textBox.style.lineHeight = "1.4";
      textBox.style.color = annotation.style?.color || "#1f2937";
      textBox.style.fontFamily = "system-ui, -apple-system, sans-serif";

      // Set layout
      textBox.style.display = "flex";
      textBox.style.alignItems = "center";
      textBox.style.justifyContent = "flex-start";
      textBox.style.overflow = "hidden";
      textBox.style.wordWrap = "break-word";

      // Initially hidden (will be shown/updated in updateTime)
      textBox.style.display = "none";

      // Append to layer
      this.layerElement.appendChild(textBox);

      // Store reference
      this.textElements.set(annotation.id, {
        element: textBox,
        annotation: annotation,
      });
    });
  }

  /**
   * Updates text box visibility and content based on timeline position
   *
   * Shows/hides text boxes based on start time. Calculates visible text
   * for progressive reveal (typing effect). Text appears immediately when
   * start time is reached and types in progressively.
   *
   * @param {number} nowSec - Current timeline position in seconds
   */
  updateTime(nowSec) {
    // Call parent implementation
    super.updateTime(nowSec);

    // Update each text element
    this.textElements.forEach(({ element, annotation }) => {
      // Check if annotation should be visible
      if (nowSec < annotation.start) {
        // Before start time - hide
        element.style.display = "none";
      } else {
        // After start time - show
        element.style.display = "flex";

        // Calculate visible text
        const visibleText = this._getVisibleText(
          annotation.content,
          annotation.start,
          annotation.end,
          nowSec
        );

        // Update text content (typing effect)
        element.textContent = visibleText;
      }
    });
  }

  /**
   * Calculates visible text based on progress between start and end times
   *
   * Implements word-by-word reveal with partial character reveal for
   * the current word being typed.
   *
   * @private
   * @param {string} content - Full text content
   * @param {number} start - Start time in seconds
   * @param {number} end - End time in seconds
   * @param {number} currentTime - Current timeline position in seconds
   * @returns {string} Visible portion of text
   */
  _getVisibleText(content, start, end, currentTime) {
    // Before start - no text visible
    if (currentTime < start) {
      return "";
    }

    // After end - full text visible
    if (currentTime >= end) {
      return content;
    }

    // During animation - calculate progress
    const progress = (currentTime - start) / (end - start);

    // Split into words
    const words = content.split(" ");

    // Calculate visible word count
    const visibleWordCount = Math.floor(progress * words.length);

    // No words visible yet
    if (visibleWordCount === 0) {
      return "";
    }

    // Get complete visible words
    const visibleWords = words.slice(0, visibleWordCount);

    // Add partial of the next word if not at the end
    if (visibleWordCount < words.length) {
      // Calculate progress within current word
      const currentWordProgress = progress * words.length - visibleWordCount;

      // Get current word being typed
      const currentWord = words[visibleWordCount];

      // Calculate visible character count
      const visibleCharCount = Math.floor(
        currentWordProgress * currentWord.length
      );

      // Add partial word if any characters are visible
      if (visibleCharCount > 0) {
        visibleWords.push(currentWord.slice(0, visibleCharCount));
      }
    }

    // Join words with spaces
    return visibleWords.join(" ");
  }

  /**
   * Updates the visual state of the layer
   *
   * Not used by TextLayer - updateTime handles all updates directly.
   * Implemented to satisfy BaseLayer contract.
   */
  update() {
    // Not used - updateTime handles updates directly
  }

  /**
   * Destroys the layer and releases all resources
   *
   * Clears element storage, removes DOM elements, and calls parent cleanup.
   */
  destroy() {
    // Clear element storage
    this.textElements.clear();
    this.textElements = null;

    // Remove layer element from DOM
    if (this.layerElement && this.layerElement.parentNode) {
      this.layerElement.parentNode.removeChild(this.layerElement);
    }
    this.layerElement = null;

    // Call parent destroy
    super.destroy();
  }
}

export default TextLayer;
