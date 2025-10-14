# DrawingLayer JavaScript Implementation - Step 4

---

## What This Document Is

This document provides detailed CODE-level implementation specifications for converting the React-based DrawingLayer component (`src/layers/DrawingLayer.jsx`) into a framework-agnostic JavaScript class (`src/layers/DrawingLayer.js`) that extends BaseLayer. This is Step 4 of the Layer Conversion plan.

---

## Purpose

Convert DrawingLayer from React component to pure JavaScript class while:
- Removing all React dependencies (hooks, JSX, lifecycle)
- Extending BaseLayer abstract class
- Preserving 100% of rendering functionality
- Maintaining progressive stroke animation with RAF
- Implementing device pixel ratio handling for crisp rendering
- Supporting multiple strokes per annotation with different colors/sizes

---

## Prerequisites

**Completed Steps:**
- ✅ Step 1: BaseLayer abstract class created (`src/layers/BaseLayer.js`)
- ✅ Step 2: HighlightLayer converted to JavaScript
- ✅ Step 3: TextLayer converted to JavaScript

**Required Files:**
- `src/layers/BaseLayer.js` (must exist and be functional)
- `src/layers/DrawingLayer.jsx` (source for conversion)
- `src/utils/coordinateUtils.js` (optional, not used by DrawingLayer)

---

## File Specifications

### File Location

**Create:** `src/layers/DrawingLayer.js`

**Preserve:** `src/layers/DrawingLayer.jsx` (React version remains for coexistence)

### Estimated Size

Approximately 170-180 lines including:
- Imports and class declaration: ~10 lines
- Constructor: ~20 lines
- Methods: ~110 lines
- JSDoc documentation: ~30-40 lines

### File Structure

```javascript
import BaseLayer from './BaseLayer.js';

/**
 * JSDoc documentation
 */
class DrawingLayer extends BaseLayer {
  constructor(container, viewport) { }
  setViewport(viewport) { }
  updateTime(nowSec) { }
  render() { }
  update() { }
  destroy() { }
  _setupCanvas() { }
}

export default DrawingLayer;
```

---

## Class Architecture

### Inheritance

```javascript
import BaseLayer from './BaseLayer.js';

class DrawingLayer extends BaseLayer {
  // Implementation
}
```

**Must extend:** BaseLayer abstract class
**Must implement:** `render()`, `update()` abstract methods
**Must override:** `setViewport()`, `updateTime()`, `destroy()` for layer-specific behavior

### Properties

#### Inherited from BaseLayer

```javascript
this.container      // HTMLElement - parent container
this.viewport       // { width, height, scale }
this.annotations    // Array of ink annotations
this.currentTime    // Number - timeline position in seconds
this.isDestroyed    // Boolean - destroyed state flag
```

#### DrawingLayer-Specific

```javascript
this.canvasElement  // HTMLCanvasElement - canvas for drawing
this.ctx            // CanvasRenderingContext2D - 2D drawing context
this.rafId          // Number | null - requestAnimationFrame ID
```

---

## Constructor Implementation

### Signature

```javascript
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
  // Implementation
}
```

### Implementation Requirements

1. **Call parent constructor first:**
   ```javascript
   super(container, viewport);
   ```

2. **Create canvas element:**
   ```javascript
   this.canvasElement = document.createElement('canvas');
   ```

3. **Set canvas styles:**
   ```javascript
   this.canvasElement.style.position = 'absolute';
   this.canvasElement.style.inset = '0';
   this.canvasElement.style.pointerEvents = 'none';
   this.canvasElement.style.zIndex = '40';
   ```
   - **zIndex: 40** - Above TextLayer (30) and HighlightLayer (25)
   - **pointerEvents: none** - Annotations are non-interactive
   - **position: absolute** - Overlay positioning
   - **inset: 0** - Fill entire container

4. **Append canvas to container:**
   ```javascript
   this.container.appendChild(this.canvasElement);
   ```

5. **Get 2D context:**
   ```javascript
   this.ctx = this.canvasElement.getContext('2d');
   ```

6. **Initialize RAF ID:**
   ```javascript
   this.rafId = null;
   ```

7. **Setup canvas dimensions:**
   ```javascript
   this._setupCanvas();
   ```

### Complete Constructor Pattern

```javascript
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
```

---

## Canvas Setup Method (_setupCanvas)

### Purpose

Configure canvas dimensions with device pixel ratio (DPR) scaling for crisp rendering on high-DPI displays (Retina, 4K, etc.).

### Signature

```javascript
/**
 * Configures canvas dimensions with device pixel ratio scaling
 *
 * @private
 */
_setupCanvas() {
  // Implementation
}
```

### Algorithm

**Source:** Lines 26-38 in `DrawingLayer.jsx`

1. **Get device pixel ratio:**
   ```javascript
   const dpr = window.devicePixelRatio || 1;
   ```
   - Returns 1 on standard displays
   - Returns 2 on Retina displays
   - Returns 3 on some high-DPI displays

2. **Set canvas buffer size (high resolution):**
   ```javascript
   this.canvasElement.width = Math.round(this.viewport.width * dpr);
   this.canvasElement.height = Math.round(this.viewport.height * dpr);
   ```
   - Buffer size = viewport × DPR
   - Round to avoid fractional pixels
   - This is the internal drawing resolution

3. **Set canvas display size (CSS pixels):**
   ```javascript
   this.canvasElement.style.width = `${this.viewport.width}px`;
   this.canvasElement.style.height = `${this.viewport.height}px`;
   ```
   - Display size matches viewport exactly
   - Controls how canvas appears in layout

4. **Scale context transform:**
   ```javascript
   this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
   ```
   - Scales coordinate system to match CSS pixels
   - After this, drawing at (100, 100) renders at CSS pixel (100, 100)

### Complete Implementation Pattern

```javascript
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
```

### Why This Is Required

**Without DPR scaling:** Canvas appears blurry on high-DPI displays because the browser stretches low-resolution pixels.

**With DPR scaling:** Canvas renders at native display resolution, producing crisp lines and text.

---

## setViewport Method Override

### Purpose

Update viewport dimensions and reconfigure canvas when PDF page changes or zoom level changes.

### Signature

```javascript
/**
 * Updates viewport dimensions and resizes canvas
 *
 * @param {Object} viewport - New viewport dimensions
 * @param {number} viewport.width - Viewport width in pixels
 * @param {number} viewport.height - Viewport height in pixels
 * @param {number} viewport.scale - PDF scale/zoom level
 * @override
 */
setViewport(viewport) {
  // Implementation
}
```

### Implementation Requirements

1. **Call parent method:**
   ```javascript
   super.setViewport(viewport);
   ```
   - Updates `this.viewport` property
   - Validates viewport structure
   - Throws error if layer is destroyed

2. **Reconfigure canvas:**
   ```javascript
   this._setupCanvas();
   ```
   - Resizes canvas buffer and display
   - Recalculates DPR scaling
   - Updates context transform

### Complete Implementation Pattern

```javascript
setViewport(viewport) {
  super.setViewport(viewport);
  this._setupCanvas();
}
```

**Rationale:** Canvas dimensions are tied to viewport, so any viewport change requires canvas reconfiguration. Unlike DOM-based layers, canvas doesn't automatically reflow.

---

## updateTime Method Override

### Purpose

Update current timeline position and start requestAnimationFrame loop to progressively draw strokes.

### Signature

```javascript
/**
 * Updates timeline position and starts progressive stroke drawing
 *
 * @param {number} nowSec - Current timeline position in seconds
 * @override
 */
updateTime(nowSec) {
  // Implementation
}
```

### Algorithm

**Source:** Lines 41-107 in `DrawingLayer.jsx`

#### High-Level Flow

1. Call `super.updateTime(nowSec)` to update `this.currentTime`
2. Cancel existing RAF if running (prevent multiple loops)
3. Define `draw()` function with progressive stroke rendering
4. Start RAF loop by calling `draw()`

#### RAF Loop Implementation

**The draw() function must:**

1. **Check destroyed state:**
   ```javascript
   if (this.isDestroyed) return;
   ```
   - Replaces React's `mounted` flag
   - Prevents drawing after cleanup

2. **Clear canvas:**
   ```javascript
   this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
   ```
   - Clear entire canvas before redrawing
   - Use canvas buffer dimensions (not style dimensions)

3. **Iterate annotations:**
   ```javascript
   for (const a of this.annotations) {
     if (nowSec < a.start) continue;
     // Draw annotation
   }
   ```
   - Skip annotations that haven't started yet
   - Process all started annotations

4. **Calculate elapsed time:**
   ```javascript
   const duration = a.end - a.start;
   const elapsed = Math.min(nowSec - a.start, duration);
   ```
   - `elapsed` = time since annotation started
   - Capped at duration for persistence after animation completes

5. **Iterate strokes:**
   ```javascript
   for (const stroke of (a.strokes || [])) {
     // Draw stroke
   }
   ```
   - Handle missing strokes array (defensive)
   - Each stroke drawn independently

6. **Configure stroke style:**
   ```javascript
   this.ctx.lineCap = 'round';
   this.ctx.lineJoin = 'round';
   this.ctx.strokeStyle = stroke.color || '#1f2937';
   this.ctx.lineWidth = stroke.size || 3;
   this.ctx.beginPath();
   ```
   - Round caps/joins for smooth appearance
   - Default color: dark gray `#1f2937`
   - Default size: 3 pixels

7. **Draw stroke points:**
   ```javascript
   let started = false;

   for (const point of stroke.points) {
     if (point.t > elapsed) break;

     const x = point.x * this.viewport.width;
     const y = point.y * this.viewport.height;

     if (!started) {
       this.ctx.moveTo(x, y);
       started = true;
     } else {
       this.ctx.lineTo(x, y);
     }
   }

   if (started) {
     this.ctx.stroke();
   }
   ```
   - Only draw points where `point.t <= elapsed`
   - Convert normalized coordinates (0-1) to canvas pixels
   - Use `moveTo()` for first point, `lineTo()` for subsequent
   - Only call `stroke()` if at least one point drawn

8. **Schedule next frame:**
   ```javascript
   this.rafId = requestAnimationFrame(draw);
   ```
   - Continues loop until layer is destroyed

### Complete Implementation Pattern

```javascript
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
```

---

## render Method Implementation

### Purpose

Implement abstract method from BaseLayer. For DrawingLayer, this is a no-op because canvas rendering happens entirely in the `updateTime()` RAF loop.

### Signature

```javascript
/**
 * Renders the layer content
 *
 * No-op for DrawingLayer - canvas rendering happens in updateTime() RAF loop.
 * Canvas element is created once in constructor and drawn to continuously.
 *
 * @override
 */
render() {
  // Implementation
}
```

### Implementation Pattern

```javascript
render() {
  // No-op: Canvas rendering happens in updateTime() RAF loop
  // Canvas element is created once in constructor
}
```

**Rationale:**
- Unlike HighlightLayer/TextLayer, canvas doesn't create per-annotation DOM elements
- Canvas is created once in constructor and persists
- All visual updates happen in RAF loop via context drawing commands
- This method exists only to satisfy BaseLayer contract

---

## update Method Implementation

### Purpose

Implement abstract method from BaseLayer. For DrawingLayer, this is not used because `updateTime()` handles all updates via RAF loop.

### Signature

```javascript
/**
 * Updates the visual state of the layer
 *
 * Not used for DrawingLayer - updateTime() handles updates via RAF loop.
 *
 * @override
 */
update() {
  // Implementation
}
```

### Implementation Pattern

```javascript
update() {
  // Not used - updateTime handles drawing via RAF loop
}
```

**Rationale:** BaseLayer defines `update()` as abstract, so all subclasses must implement it. DrawingLayer's architecture uses RAF loop in `updateTime()` for continuous drawing, making a separate `update()` method unnecessary.

---

## destroy Method Override

### Purpose

Clean up resources and prevent memory leaks when layer is no longer needed.

### Signature

```javascript
/**
 * Destroys the layer and releases resources
 *
 * Cancels animation loop, clears references, and removes canvas from DOM.
 *
 * @override
 */
destroy() {
  // Implementation
}
```

### Cleanup Requirements

**Order matters:** Clean up in this sequence to prevent errors.

1. **Cancel animation loop:**
   ```javascript
   if (this.rafId) {
     cancelAnimationFrame(this.rafId);
     this.rafId = null;
   }
   ```
   - Must cancel RAF before setting `isDestroyed`
   - Prevents orphaned animation loops
   - Safe to call even if no RAF running

2. **Clear context reference:**
   ```javascript
   this.ctx = null;
   ```
   - Release reference to canvas context
   - Enables garbage collection

3. **Remove canvas from DOM:**
   ```javascript
   if (this.canvasElement && this.canvasElement.parentNode) {
     this.canvasElement.parentNode.removeChild(this.canvasElement);
   }
   this.canvasElement = null;
   ```
   - Check existence before removal (defensive)
   - Clear reference after removal

4. **Call parent cleanup:**
   ```javascript
   super.destroy();
   ```
   - Sets `isDestroyed` flag
   - Clears inherited properties
   - **Must be called last**

### Complete Implementation Pattern

```javascript
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
```

**Why RAF cleanup is critical:** Without canceling RAF, the `draw()` function continues executing even after layer is "destroyed", causing memory leaks and potential errors accessing null references.

---

## Progressive Stroke Drawing Algorithm

### Data Structure

**Annotation Structure:**
```javascript
{
  id: 'anno-1',
  type: 'ink',
  page: 1,
  start: 0,      // Animation start time (seconds)
  end: 2,        // Animation end time (seconds)
  strokes: [     // Array of stroke objects
    {
      color: '#ff0000',  // Stroke color (CSS color)
      size: 5,           // Line width (pixels)
      points: [          // Array of point objects
        { x: 0.1, y: 0.2, t: 0 },     // x, y normalized (0-1), t = time offset
        { x: 0.2, y: 0.3, t: 0.5 },
        { x: 0.3, y: 0.2, t: 1.0 }
      ]
    }
  ]
}
```

### Time Offset System

**Point time offset (`point.t`):**
- Relative to annotation start time (not absolute timeline)
- Range: 0 to `(end - start)` seconds
- Example: If `start=5`, `end=8`, then points can have `t` from 0 to 3

**Elapsed time calculation:**
```javascript
const elapsed = nowSec - a.start;  // Time since annotation started
```

**Point visibility:**
```javascript
if (point.t <= elapsed) {
  // Draw this point
}
```

### Drawing Logic Flow

1. **Check if annotation has started:**
   ```javascript
   if (nowSec < a.start) continue;
   ```

2. **Calculate elapsed time (capped at duration):**
   ```javascript
   const duration = a.end - a.start;
   const elapsed = Math.min(nowSec - a.start, duration);
   ```
   - Capping ensures strokes persist after animation completes
   - All points remain visible after `nowSec >= a.end`

3. **For each point, check time offset:**
   ```javascript
   if (point.t > elapsed) break;
   ```
   - Early break optimizes performance (assumes points are time-sorted)

4. **Convert coordinates and draw:**
   ```javascript
   const x = point.x * this.viewport.width;
   const y = point.y * this.viewport.height;

   if (!started) {
     this.ctx.moveTo(x, y);
   } else {
     this.ctx.lineTo(x, y);
   }
   ```

### Multi-Stroke Support

Each annotation can have multiple strokes with different colors and sizes:

```javascript
for (const stroke of (a.strokes || [])) {
  // Set stroke-specific style
  this.ctx.strokeStyle = stroke.color || '#1f2937';
  this.ctx.lineWidth = stroke.size || 3;

  // Draw this stroke's points
  this.ctx.beginPath();
  // ... draw points ...
  this.ctx.stroke();
}
```

Each stroke is drawn independently with its own path and style.

---

## Coordinate Conversion

### Normalized to Canvas Pixels

**Annotations use normalized coordinates (0-1 range):**
- Independent of viewport size
- Portable across different screen sizes
- Used by all annotation types

**Conversion formula:**
```javascript
const canvasX = normalizedX * viewport.width;
const canvasY = normalizedY * viewport.height;
```

**Example:**
```javascript
// Annotation point at center of page
const point = { x: 0.5, y: 0.5, t: 0 };

// Viewport dimensions
const viewport = { width: 800, height: 600, scale: 1.0 };

// Convert to canvas pixels
const x = point.x * viewport.width;   // 0.5 * 800 = 400
const y = point.y * viewport.height;  // 0.5 * 600 = 300

// Draw at canvas coordinates
ctx.lineTo(x, y);  // Draws at (400, 300)
```

### Why DrawingLayer Doesn't Use coordinateUtils

**HighlightLayer and TextLayer:**
- Use `rectNormToAbs()` utility
- Convert rectangles (x, y, w, h) once during render()
- Apply to DOM element styles

**DrawingLayer:**
- Converts individual points on-the-fly during drawing loop
- Point-by-point conversion is simpler: `x * width`, `y * height`
- No benefit from utility function for simple multiplication
- Conversion happens many times per frame (performance-sensitive)

---

## Device Pixel Ratio Deep Dive

### The Problem

On high-DPI displays (Retina, 4K), CSS pixels don't match device pixels:
- Standard display: 1 CSS pixel = 1 device pixel (DPR = 1)
- Retina display: 1 CSS pixel = 2 device pixels (DPR = 2)
- Some 4K displays: 1 CSS pixel = 3 device pixels (DPR = 3)

Without DPR handling, canvas content appears blurry because the browser stretches low-resolution pixels across high-resolution display.

### The Solution

**Set different sizes for buffer and display:**

```javascript
const dpr = window.devicePixelRatio || 1;

// Canvas buffer (internal drawing resolution) - HIGH
canvas.width = viewport.width * dpr;    // e.g., 800 * 2 = 1600 pixels
canvas.height = viewport.height * dpr;  // e.g., 600 * 2 = 1200 pixels

// Canvas display (CSS layout size) - NORMAL
canvas.style.width = viewport.width + 'px';   // e.g., '800px'
canvas.style.height = viewport.height + 'px'; // e.g., '600px'

// Context transform (coordinate scaling)
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

**Result:**
- Canvas displays at normal layout size (800×600)
- Canvas buffer is high-resolution (1600×1200 on Retina)
- Drawing commands use CSS pixel coordinates (no conversion needed)
- Crisp, sharp rendering on all displays

### Before and After

**Without DPR handling:**
```javascript
canvas.width = 800;
canvas.height = 600;
ctx.lineTo(400, 300);
// Result: Blurry on Retina displays (800 logical pixels stretched to 1600 device pixels)
```

**With DPR handling:**
```javascript
canvas.width = 1600;  // 800 * 2
canvas.height = 1200; // 600 * 2
ctx.setTransform(2, 0, 0, 2, 0, 0);
ctx.lineTo(400, 300);  // Still uses CSS pixel coordinates
// Result: Crisp on Retina displays (1600 device pixels render natively)
```

---

## JSDoc Documentation Requirements

### Class Documentation

```javascript
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
  // Implementation
}
```

### Method Documentation

**Document all public and private methods with:**
- Purpose description
- Parameter types and descriptions
- Return type (if applicable)
- Throws declarations (if applicable)
- Override/Private annotations

**Example:**
```javascript
/**
 * Updates timeline position and starts progressive stroke drawing
 *
 * Cancels any existing animation loop and starts a new requestAnimationFrame
 * loop to redraw the canvas with strokes progressively drawn based on elapsed time.
 *
 * @param {number} nowSec - Current timeline position in seconds
 * @throws {Error} If called after layer is destroyed
 * @override
 */
updateTime(nowSec) {
  // Implementation
}
```

### Property Documentation

```javascript
/**
 * @property {HTMLCanvasElement} canvasElement - Canvas element for drawing
 * @property {CanvasRenderingContext2D} ctx - 2D rendering context
 * @property {number|null} rafId - RequestAnimationFrame ID for animation loop
 */
```

---

## Testing Requirements

### Unit Tests

Create test file: `test/drawing-layer-test.html`

**Test Cases:**

1. **Instantiation Test:**
   ```javascript
   const layer = new DrawingLayer(container, viewport);
   console.assert(layer instanceof BaseLayer, 'Extends BaseLayer');
   console.assert(layer.canvasElement instanceof HTMLCanvasElement, 'Creates canvas');
   console.assert(layer.canvasElement.style.zIndex === '40', 'Correct zIndex');
   ```

2. **Canvas Setup Test:**
   ```javascript
   const dpr = window.devicePixelRatio || 1;
   console.assert(layer.canvasElement.width === viewport.width * dpr, 'Buffer width');
   console.assert(layer.canvasElement.style.width === `${viewport.width}px`, 'Display width');
   ```

3. **Viewport Change Test:**
   ```javascript
   const newViewport = { width: 1000, height: 800, scale: 1.5 };
   layer.setViewport(newViewport);
   console.assert(layer.viewport.width === 1000, 'Viewport updated');
   console.assert(layer.canvasElement.width === 1000 * dpr, 'Canvas resized');
   ```

4. **Animation Test:**
   ```javascript
   const annotations = [{
     id: 'test-1',
     type: 'ink',
     start: 0,
     end: 2,
     strokes: [{ color: '#ff0000', size: 5, points: [...] }]
   }];

   layer.setAnnotations(annotations);
   layer.render();
   layer.updateTime(1.0);
   console.assert(layer.rafId !== null, 'RAF loop started');
   ```

5. **Destroy Test:**
   ```javascript
   layer.destroy();
   console.assert(layer.rafId === null, 'RAF canceled');
   console.assert(layer.canvasElement === null, 'Canvas cleared');
   console.assert(layer.isDestroyed === true, 'Destroyed flag set');
   ```

### Visual Verification

**Create interactive demo:**
```html
<button onclick="testAnimation()">Test Progressive Drawing</button>
<div id="container" style="width:800px;height:600px;position:relative;border:1px solid black;"></div>

<script type="module">
  import DrawingLayer from './src/layers/DrawingLayer.js';

  const container = document.getElementById('container');
  const viewport = { width: 800, height: 600, scale: 1.0 };
  const layer = new DrawingLayer(container, viewport);

  const annotations = [{
    id: 'demo-1',
    type: 'ink',
    page: 1,
    start: 0,
    end: 3,
    strokes: [{
      color: '#ff0000',
      size: 5,
      points: [
        { x: 0.1, y: 0.1, t: 0 },
        { x: 0.3, y: 0.3, t: 1 },
        { x: 0.5, y: 0.1, t: 2 },
        { x: 0.7, y: 0.3, t: 3 }
      ]
    }]
  }];

  layer.setAnnotations(annotations);
  layer.render();

  window.testAnimation = function() {
    let time = 0;
    const interval = setInterval(() => {
      time += 0.05;
      layer.updateTime(time);
      if (time > 4) {
        time = 0; // Loop animation
      }
    }, 50);
  };
</script>
```

**Expected Visual Results:**
- Red stroke draws progressively from left to right
- Animation completes in 3 seconds
- Stroke persists after completion
- Smooth 60fps animation (no stuttering)

### Integration Test

**Test with multiple layers:**
```javascript
import HighlightLayer from './src/layers/HighlightLayer.js';
import TextLayer from './src/layers/TextLayer.js';
import DrawingLayer from './src/layers/DrawingLayer.js';

// Create all three layers
const highlight = new HighlightLayer(container, viewport);
const text = new TextLayer(container, viewport);
const drawing = new DrawingLayer(container, viewport);

// Verify zIndex ordering
console.assert(highlight.layerElement.style.zIndex === '25', 'Highlight zIndex');
console.assert(text.layerElement.style.zIndex === '30', 'Text zIndex');
console.assert(drawing.canvasElement.style.zIndex === '40', 'Drawing zIndex');
```

---

## Success Criteria

### Functional Requirements

- ✅ Extends BaseLayer correctly (instanceof check passes)
- ✅ Creates canvas element with zIndex 40
- ✅ Handles device pixel ratio for crisp rendering
- ✅ Draws strokes progressively based on timeline
- ✅ Supports multiple strokes per annotation
- ✅ Supports custom stroke colors and sizes
- ✅ Clears and redraws canvas each frame
- ✅ Strokes persist after animation completes
- ✅ Proper cleanup in destroy() (no memory leaks)

### Code Quality Requirements

- ✅ Zero React dependencies (no imports, JSX, hooks)
- ✅ Follows BaseLayer contract (implements all required methods)
- ✅ Proper resource management (RAF, canvas, context)
- ✅ Comprehensive JSDoc documentation
- ✅ Follows naming conventions from HighlightLayer/TextLayer
- ✅ Error handling for edge cases (missing strokes, etc.)
- ✅ Clean, readable code structure

### Performance Requirements

- ✅ RAF loop runs at 60fps
- ✅ Canvas clear/redraw is efficient
- ✅ No memory leaks from RAF or canvas references
- ✅ DPR scaling provides crisp rendering on all displays
- ✅ Point drawing optimization (early break when t > elapsed)

### Architecture Requirements

- ✅ No coupling to other layers
- ✅ Self-contained and autonomous
- ✅ Can be instantiated and tested independently
- ✅ Follows established patterns from Steps 2-3
- ✅ Compatible with LayerManager integration (Step 5)

---

## Common Pitfalls and Solutions

### Pitfall 1: Multiple RAF Loops

**Problem:** Not canceling existing RAF before starting new one.

**Solution:**
```javascript
updateTime(nowSec) {
  // Always cancel first
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
  }

  const draw = () => { /* ... */ };
  draw();
}
```

### Pitfall 2: Drawing After Destroy

**Problem:** RAF loop continues after destroy() is called.

**Solution:**
```javascript
const draw = () => {
  // Check destroyed state at start of every frame
  if (this.isDestroyed) return;

  // ... drawing code ...
};
```

### Pitfall 3: Incorrect Canvas Clear

**Problem:** Using viewport dimensions instead of buffer dimensions.

**Wrong:**
```javascript
ctx.clearRect(0, 0, this.viewport.width, this.viewport.height); // Wrong!
```

**Correct:**
```javascript
ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
```

### Pitfall 4: Missing DPR Scaling

**Problem:** Canvas appears blurry on Retina displays.

**Solution:** Always use the DPR pattern in `_setupCanvas()`:
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = viewport.width * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

### Pitfall 5: Memory Leaks

**Problem:** Not nullifying references in destroy().

**Solution:**
```javascript
destroy() {
  if (this.rafId) cancelAnimationFrame(this.rafId);
  this.rafId = null;
  this.ctx = null;
  this.canvasElement = null;
  super.destroy();
}
```

---

## Code Quality Checklist

Before considering implementation complete:

- [ ] No React imports or dependencies
- [ ] No JSX syntax
- [ ] Extends BaseLayer with super() calls
- [ ] Implements render() and update() methods
- [ ] Overrides setViewport(), updateTime(), destroy()
- [ ] Canvas created and styled correctly
- [ ] zIndex set to 40
- [ ] Device pixel ratio handling implemented
- [ ] RAF loop cancels previous before starting
- [ ] RAF loop checks isDestroyed flag
- [ ] Canvas cleared using buffer dimensions
- [ ] Coordinates converted from normalized to pixels
- [ ] Progressive drawing logic matches React version
- [ ] destroy() cancels RAF and clears all references
- [ ] Comprehensive JSDoc documentation
- [ ] All methods have parameter types
- [ ] Private methods marked with underscore
- [ ] No console.log or debug code
- [ ] Tests written and passing
- [ ] Visual verification completed

---

## Integration with LayerManager (Step 5 Preview)

After completing DrawingLayer, LayerManager will instantiate it:

```javascript
// In LayerManager constructor
this.layers = {
  highlight: new HighlightLayer(container, viewport),
  text: new TextLayer(container, viewport),
  drawing: new DrawingLayer(container, viewport)  // Step 4
};

// In LayerManager.setAnnotations()
this.layers.drawing.setAnnotations(inkAnnotations);
this.layers.drawing.render();

// In LayerManager.updateTimeline()
this.layers.drawing.updateTime(nowSec);
```

This integration will be implemented in Step 5.

---

## Reference Files

**Plan Document:**
- `Instructions/Plan/Plan_docs/Plan_SystemPipeline_LayerConversion.md` (lines 593-779)

**Source Files:**
- `src/layers/BaseLayer.js` (completed in Step 1)
- `src/layers/DrawingLayer.jsx` (React source to convert)
- `src/layers/HighlightLayer.js` (reference for RAF pattern)
- `src/layers/TextLayer.js` (reference for class structure)

**Related Documentation:**
- `Instructions/Guidelines/GeneralGuideline.md` (coding standards)
- `Instructions/Implementation/Implementation_Instructions.md` (document format)

---

## Notes

This implementation completes Step 4 of 6 in the Layer Conversion plan. After completing DrawingLayer:

1. All three layer types will be framework-agnostic JavaScript classes
2. Step 5 can proceed (LayerManager integration)
3. Step 6 can proceed (Public API exports)

The DrawingLayer is the most complex of the three layers due to:
- Canvas API usage (vs DOM manipulation)
- Device pixel ratio handling requirements
- Continuous RAF loop (vs discrete updates)

However, the architecture and patterns established in Steps 1-3 make this conversion straightforward.

---
