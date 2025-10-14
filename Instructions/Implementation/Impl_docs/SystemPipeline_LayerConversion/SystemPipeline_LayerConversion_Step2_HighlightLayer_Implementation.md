# SystemPipeline_LayerConversion_Step2_HighlightLayer_Implementation

---

## What This Document Is

This implementation document specifies the CODE-level technical details for converting the React HighlightLayer component to a framework-agnostic JavaScript class. HighlightLayer renders rectangular highlight annotations with progressive reveal animation.

---

## Purpose

Convert the existing React HighlightLayer component to a pure JavaScript class that:
- Extends BaseLayer abstract class
- Renders highlight annotations with quad support
- Implements progressive scaleX animation from left to right
- Maintains exact visual behavior from React version
- Removes all React dependencies

---

## Context in Overall Plan

**Big Picture:**
- **Outline:** Dynamic PDF Annotation Renderer System
- **Plan:** Layer Conversion (React to Framework-Agnostic)
- **Current Step:** Step 2 of 6 - HighlightLayer Conversion

**This Step's Role:**
- First concrete layer implementation extending BaseLayer
- Demonstrates the pattern for converting React components to pure JS
- Provides progressive animation using requestAnimationFrame

**Dependencies:**
- Step 1: BaseLayer (completed ✅)
- `src/utils/coordinateUtils.js` (existing)

**Enables:**
- Step 5: LayerManager integration (requires all layers)

---

## Current React Implementation Analysis

**File:** `src/layers/HighlightLayer.jsx` (139 lines)

**Key Features:**
- Renders multiple rectangular highlight regions (quads)
- Progressive reveal animation using scaleX transform
- Left-to-right animation based on timeline
- Multi-line highlight support with segment timing
- requestAnimationFrame for smooth 60fps animation

**React Patterns Used:**
- `useRef` for container and RAF ID (lines 23-25)
- `useRef` for Map storing element references
- `useEffect` for DOM creation when annos/viewport change (lines 28-81)
- `useEffect` for animation loop when nowSec changes (lines 84-123)
- `React.memo` for performance optimization (line 138)

**Animation Logic:**
- Calculate total width across all quads (line 39)
- Calculate per-quad timing segments (segStart, segEnd) (lines 43-45)
- Calculate global progress from annotation start/end times (lines 98-101)
- Calculate local progress for each quad segment (lines 103-106)
- Apply scaleX transform to each highlight element (line 108)

**DOM Structure:**
- Container div (position: absolute, inset: 0, zIndex: 25)
- For each quad: wrapper div + highlight div
- Wrapper handles positioning and overflow
- Highlight handles background color and transform animation

---

## File to Create

**File Path:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/HighlightLayer.js`

**Estimated Lines:** ~200 lines

**File Type:** ES6 JavaScript module

---

## Class Structure

### Class Declaration and Imports

```javascript
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
  // Implementation details below
}

export default HighlightLayer;
```

---

## Constructor Specification

### Constructor Implementation

```javascript
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
  // Call parent constructor first
  super(container, viewport);

  // Create layer container element
  this.layerElement = document.createElement('div');
  this.layerElement.style.position = 'absolute';
  this.layerElement.style.inset = '0';
  this.layerElement.style.pointerEvents = 'none';
  this.layerElement.style.zIndex = '25';

  // Append to parent container
  this.container.appendChild(this.layerElement);

  // Initialize element storage
  this.elements = new Map();

  // Initialize RAF ID
  this.rafId = null;
}
```

**Property Mapping from React:**
- `containerRef.current` → `this.layerElement`
- `rafRef.current` → `this.rafId`
- `elementsRef.current` → `this.elements`

---

## render() Method Specification

### Method Signature

```javascript
/**
 * Renders highlight elements for all annotations
 *
 * Creates DOM structure for each quad in each annotation. Calculates
 * timing segments for progressive animation. Clears and recreates all
 * elements when called.
 *
 * This method is idempotent - safe to call multiple times.
 */
render() {
  // Implementation below
}
```

### Implementation Details

```javascript
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
```

**Key Logic Preservation:**

1. **Quad Mode Check:**
   - Only process annotations with `mode === 'quads'`
   - Skip if `quads` array is empty or undefined

2. **Total Width Calculation:**
   - Sum all quad widths for timing distribution
   - Used to calculate proportional timing segments

3. **Per-Quad Timing:**
   - `segStart`: Cumulative width of previous quads / total width
   - `segEnd`: Cumulative width including current quad / total width
   - Ensures each quad animates proportionally to its width

4. **DOM Structure:**
   - Wrapper div: positioned absolutely, handles overflow
   - Highlight div: full size within wrapper, animated with scaleX
   - Transform origin: 'left center' for left-to-right reveal

5. **Default Styling:**
   - Background: `rgba(255,230,100,0.35)` (yellow with transparency)
   - Outline: `1px solid rgba(255,200,0,0.6)` (darker yellow border)
   - Use annotation.style.color if provided

---

## updateTime() Method Specification

### Method Signature

```javascript
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
  // Implementation below
}
```

### Implementation Details

```javascript
updateTime(nowSec) {
  // Call parent implementation
  super.updateTime(nowSec);

  // Cancel existing RAF if running
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  // Start animation loop
  const animate = () => {
    // Check if destroyed
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
        // Clamped to 1 after end time
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

  // Start animation loop
  animate();
}
```

**Animation Algorithm:**

1. **Global Progress Calculation:**
   ```
   globalProgress = (nowSec - annotation.start) / (annotation.end - annotation.start)
   ```
   - Clamped to [0, 1] range
   - Represents overall annotation completion

2. **Local Progress Calculation:**
   ```
   localProgress = (globalProgress - segStart) / (segEnd - segStart)
   ```
   - Clamped to [0, 1] range
   - Represents completion within this quad's time segment
   - Ensures proportional animation across multi-line highlights

3. **ScaleX Transform:**
   - Applied to highlight element
   - `scaleX(0)` = hidden (not started)
   - `scaleX(localProgress)` = partially revealed
   - `scaleX(1)` = fully revealed

4. **Visibility Control:**
   - Before `annotation.start`: wrapper hidden
   - After `annotation.start`: wrapper visible, animation active
   - Transform persists after animation completes

5. **Division by Zero Prevention:**
   - Use `Math.max(1e-6, denominator)` to prevent division by zero
   - Handles edge case where start === end

---

## destroy() Method Specification

### Method Implementation

```javascript
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
```

**Cleanup Order:**
1. Cancel requestAnimationFrame loop
2. Clear element Map
3. Remove DOM elements
4. Clear references
5. Call parent destroy (sets isDestroyed flag)

---

## Complete File Template

```javascript
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
```

---

## Annotation Data Format

### Expected Annotation Structure

```javascript
{
  id: 'string',              // Unique identifier
  type: 'highlight',         // Must be 'highlight'
  mode: 'quads',             // Must be 'quads' for this layer
  start: number,             // Start time in seconds
  end: number,               // End time in seconds
  page: number,              // Page number (1-indexed)
  quads: [                   // Array of quad objects
    {
      x: number,             // Normalized x position (0-1)
      y: number,             // Normalized y position (0-1)
      w: number,             // Normalized width (0-1)
      h: number              // Normalized height (0-1)
    }
  ],
  style: {
    color: 'string'          // Optional: CSS color (rgba format)
  }
}
```

### Example Annotation

```javascript
{
  id: 'hl-1',
  type: 'highlight',
  mode: 'quads',
  start: 2.5,
  end: 5.0,
  page: 1,
  quads: [
    { x: 0.1, y: 0.2, w: 0.6, h: 0.02 },  // First line
    { x: 0.1, y: 0.22, w: 0.4, h: 0.02 }  // Second line
  ],
  style: {
    color: 'rgba(100,200,255,0.3)'
  }
}
```

---

## Testing Requirements

### Unit Tests to Create

**File:** `test/unit/HighlightLayer.test.js`

**Test Cases:**

1. **Constructor Tests:**
   ```javascript
   // Should create layer element with correct styles
   // Should append layer element to container
   // Should initialize elements Map
   // Should initialize rafId as null
   ```

2. **render() Tests:**
   ```javascript
   // Should create DOM elements for each quad
   // Should calculate timing segments correctly
   // Should use rectNormToAbs for coordinate conversion
   // Should apply default color when not specified
   // Should use custom color when provided
   // Should skip annotations without quads
   // Should skip annotations not in quad mode
   // Should be idempotent (safe to call multiple times)
   ```

3. **updateTime() Tests:**
   ```javascript
   // Should hide wrapper before start time
   // Should show wrapper after start time
   // Should animate scaleX from 0 to 1
   // Should calculate global progress correctly
   // Should calculate local progress correctly
   // Should handle division by zero (start === end)
   // Should start requestAnimationFrame loop
   // Should cancel previous RAF before starting new one
   ```

4. **destroy() Tests:**
   ```javascript
   // Should cancel requestAnimationFrame
   // Should clear elements Map
   // Should remove layer element from DOM
   // Should call parent destroy
   ```

5. **Integration Tests:**
   ```javascript
   // Should work with viewport changes (setViewport + render)
   // Should work with annotation updates (setAnnotations + render)
   // Should animate smoothly with changing nowSec
   // Should handle multi-line highlights correctly
   ```

### Manual Test Page

**File:** `test/manual/HighlightLayer-test.html`

**Test Scenarios:**
- Single-line highlight animation
- Multi-line highlight animation
- Multiple highlights with different colors
- Timeline scrubbing (backward/forward)
- Viewport scaling (zoom in/out)
- Highlight before/during/after timeline

---

## Performance Considerations

### RequestAnimationFrame Management

**Pattern:**
- Cancel previous RAF before starting new one
- Check `isDestroyed` at start of animate callback
- Store RAF ID for cleanup

**Rationale:**
- Prevents multiple concurrent animation loops
- Ensures cleanup on destroy
- Smooth 60fps animation

### DOM Optimization

**Strategies:**
- Reuse Map for element storage (no repeated lookups)
- Use `willChange: transform` CSS hint
- Only update transform property (not entire style)
- Batch all updates in single RAF callback

### Memory Management

**Cleanup:**
- Clear Map on render (prevents memory leaks)
- Remove DOM elements on destroy
- Cancel RAF on destroy
- Clear all references on destroy

---

## Coordinate Conversion

### Using rectNormToAbs

```javascript
import { rectNormToAbs } from '../utils/coordinateUtils.js';

// Normalized quad (0-1 range)
const quad = { x: 0.1, y: 0.2, w: 0.5, h: 0.03 };

// Convert to absolute pixels
const abs = rectNormToAbs(quad, this.viewport);
// Returns: { left: 80, top: 120, width: 400, height: 18 }
//   (assuming viewport: { width: 800, height: 600 })

// Apply to DOM element
wrapper.style.left = `${abs.left}px`;
wrapper.style.top = `${abs.top}px`;
wrapper.style.width = `${abs.width}px`;
wrapper.style.height = `${abs.height}px`;
```

---

## Architectural Principles

### Framework Independence

**Requirements Met:**
- No React imports
- No JSX syntax
- No React hooks (useRef, useEffect)
- Standard DOM APIs only
- Standard requestAnimationFrame

**Verification:**
- Import only BaseLayer and coordinateUtils
- Can run in any JavaScript environment
- No framework-specific lifecycle

### Separation of Concerns

**Responsibilities:**
- Create and manage highlight DOM elements
- Calculate quad timing segments
- Animate scaleX transforms
- Handle own RAF loop
- Clean up own resources

**Does NOT Handle:**
- Annotation data management (parent's job)
- Viewport calculation (parent's job)
- Page filtering (parent's job)
- Other layer types (sibling layers)

### BaseLayer Contract

**Implements:**
- `constructor(container, viewport)` - calls super, initializes
- `render()` - creates DOM elements
- `updateTime(nowSec)` - animates highlights
- `update()` - not used, empty implementation
- `destroy()` - cleans up resources

**Uses from BaseLayer:**
- `this.container` - parent element
- `this.viewport` - current dimensions
- `this.annotations` - current data
- `this.currentTime` - timeline position
- `this.isDestroyed` - destroyed state

---

## Success Criteria

### Functional Requirements

✅ Renders rectangular highlight quads correctly
✅ Progressive scaleX animation from left to right
✅ Multi-line highlights with proportional timing
✅ Visibility control based on annotation.start time
✅ Smooth 60fps animation with requestAnimationFrame
✅ Coordinate conversion using rectNormToAbs
✅ Default color with custom color support
✅ Proper cleanup on destroy

### Code Quality Requirements

✅ Extends BaseLayer correctly
✅ Calls super() in constructor
✅ Implements required abstract methods
✅ Comprehensive JSDoc documentation
✅ No React dependencies
✅ Standard DOM APIs only
✅ Proper resource management (RAF, DOM, Map)
✅ Defensive programming (null checks, clamping)

### Animation Requirements

✅ Smooth animation at 60fps
✅ No jank or stuttering
✅ Correct progress calculation (global and local)
✅ Handles edge cases (start === end, division by zero)
✅ Transform persists after completion
✅ Multiple highlights animate independently

### Architecture Requirements

✅ Framework-agnostic pure JavaScript
✅ Follows BaseLayer contract
✅ Separation of concerns
✅ No coupling to other layers
✅ Can be tested independently
✅ Matches React version behavior exactly

---

## Visual Behavior Preservation

### Exact Match Required

The JavaScript version must produce **identical visual output** to the React version:

1. **Positioning:** Exact pixel-perfect positioning
2. **Animation:** Same timing and easing (linear)
3. **Colors:** Same default and custom colors
4. **Transform:** Same scaleX animation from left
5. **Visibility:** Same before/during/after behavior
6. **Multi-line:** Same segment timing calculation

### Verification Method

- Compare side-by-side with React version
- Same test annotations produce same visuals
- Same timeline scrubbing behavior
- Same viewport scaling behavior

---

## Next Steps After Implementation

**After completing HighlightLayer.js:**

1. **Verify file creation:**
   - File exists at `src/layers/HighlightLayer.js`
   - File size approximately 200 lines
   - No syntax errors
   - Imports BaseLayer and coordinateUtils

2. **Run tests:**
   - Create and run unit tests
   - Create and run manual test page
   - Verify animations are smooth
   - Compare visually with React version

3. **Document completion:**
   - Note any deviations from spec
   - Document any decisions made
   - Update progress tracking

4. **Enable next steps:**
   - Step 3 (TextLayer) can proceed in parallel
   - Step 4 (DrawingLayer) can proceed in parallel
   - Step 5 (LayerManager) requires this + others

5. **Summary file (after user confirmation):**
   - File: `Instructions/Summary/SystemPipeline_LayerConversion_Step2_HighlightLayer_Summary.md`

---

## Notes

- This is the first concrete layer implementation - serves as pattern for others
- Animation logic is complex - preserve exact formulas from React version
- RequestAnimationFrame management is critical for performance
- Coordinate conversion must use existing coordinateUtils
- Visual output must match React version exactly
- Multi-line highlight timing is the most complex part - test thoroughly

---
