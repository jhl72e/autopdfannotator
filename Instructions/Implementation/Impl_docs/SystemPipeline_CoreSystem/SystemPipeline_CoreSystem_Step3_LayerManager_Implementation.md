# SystemPipeline_CoreSystem_Step3_LayerManager_Implementation

---

## What This Document Is

This document specifies the CODE-level implementation for the LayerManager subsystem (Step 3 of Core System Construction Plan). LayerManager orchestrates annotation layer instances, routes annotations to appropriate layers by type, and coordinates viewport and timeline updates.

---

## File Location

**Path:** `src/core/LayerManager.js`

**Module Type:** ES6 Module (export class)

---

## Dependencies

### External Imports

```javascript
// No direct layer imports - LayerManager stores data only
// Layers will be imported by parent component (React-aware code)
```

**Note:** LayerManager does NOT import React layer components to maintain framework-agnostic architecture. It uses the Data Provider Pattern (Approach A) where LayerManager stores and manages data, while the parent component handles React rendering.

### No Utility Dependencies

LayerManager does not need coordinate or viewport utilities. It only manages and routes data to layers.

---

## Class Structure

### File Header Documentation

```javascript
/**
 * LayerManager - Framework-agnostic layer orchestration subsystem
 *
 * This module manages annotation layer data, routes annotations by type,
 * and coordinates viewport and timeline state across all layers.
 * Uses Data Provider Pattern to work with React layer components without
 * breaking framework-agnostic architecture.
 *
 * @module core/LayerManager
 */
```

### Class Declaration

```javascript
/**
 * LayerManager class
 *
 * Orchestrates annotation layers by managing their data state.
 * Filters annotations by page, routes by type, and coordinates
 * viewport/timeline updates. Provides data via getLayerData() for
 * parent component to render React layers.
 *
 * @class
 * @example
 * const manager = new LayerManager(containerElement);
 * manager.setAnnotations(annotations, 1);
 * manager.setViewport(viewport);
 * manager.updateTimeline(5.0);
 * const data = manager.getLayerData();
 */
export class LayerManager {
  // Implementation
}
```

---

## Constructor

### Signature

```javascript
constructor(containerElement)
```

### Parameters

- `containerElement` (HTMLElement, required) - DOM element where layers will be rendered

### Implementation

```javascript
constructor(containerElement) {
  // Validate container element
  if (!containerElement || !(containerElement instanceof HTMLElement)) {
    throw new Error('LayerManager: containerElement must be a valid DOM element');
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
   * @type {Object|null}
   */
  this.currentViewport = null;

  /**
   * @private
   * @type {Array}
   */
  this.allAnnotations = [];

  /**
   * Layer data storage for React rendering
   * @private
   * @type {Object}
   */
  this.layerData = {
    highlight: { annos: [], viewport: null, nowSec: 0 },
    text: { annos: [], viewport: null, nowSec: 0 },
    drawing: { annos: [], viewport: null, nowSec: 0 }
  };
}
```

### JSDoc for Constructor

```javascript
/**
 * Create LayerManager instance
 *
 * @param {HTMLElement} containerElement - DOM element for layer rendering
 * @throws {Error} If containerElement is not a valid DOM element
 */
```

---

## Public Methods

### 1. setAnnotations()

**Purpose:** Accept complete annotation array, filter by page, and route by type to layer data

**Signature:**
```javascript
setAnnotations(annotations, pageNum)
```

**Implementation:**

```javascript
/**
 * Set annotations and route to appropriate layer data stores
 *
 * Filters annotations for the specified page and groups by type.
 * Updates internal layer data with filtered annotations.
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

  // Group by type and route to layer data
  const highlights = pageAnnotations.filter(a => a.type === 'highlight');
  const textAnnotations = pageAnnotations.filter(a => a.type === 'text');
  const inkAnnotations = pageAnnotations.filter(a => a.type === 'ink');

  // Update layer data stores
  this.layerData.highlight.annos = highlights;
  this.layerData.text.annos = textAnnotations;
  this.layerData.drawing.annos = inkAnnotations;
}
```

**Error Handling:**
- If annotations is not an array, default to empty array and warn
- If pageNum is invalid, warn and return early
- Graceful degradation - continue with empty arrays

---

### 2. setViewport()

**Purpose:** Update viewport dimensions across all layer data stores

**Signature:**
```javascript
setViewport(viewport)
```

**Implementation:**

```javascript
/**
 * Update viewport dimensions for all layers
 *
 * Propagates viewport object to all layer data stores.
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

  // Update all layer data stores
  this.layerData.highlight.viewport = viewport;
  this.layerData.text.viewport = viewport;
  this.layerData.drawing.viewport = viewport;
}
```

**Error Handling:**
- Validate viewport is object
- Warn and return if invalid
- Do not throw - maintain stable state

---

### 3. updateTimeline()

**Purpose:** Update timeline position across all layer data stores for animation

**Signature:**
```javascript
updateTimeline(timestamp)
```

**Implementation:**

```javascript
/**
 * Update timeline position for all layers
 *
 * Propagates timestamp to all layer data stores.
 * Layers use this for progressive animation calculations.
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

  // Update all layer data stores
  this.layerData.highlight.nowSec = timestamp;
  this.layerData.text.nowSec = timestamp;
  this.layerData.drawing.nowSec = timestamp;
}
```

**Error Handling:**
- Validate timestamp is number
- Warn and return if invalid
- Allow negative timestamps (valid use case)

---

### 4. getLayerData()

**Purpose:** Provide current layer data for parent component to render React layers

**Signature:**
```javascript
getLayerData()
```

**Implementation:**

```javascript
/**
 * Get current layer data for rendering
 *
 * Returns data object containing annotations, viewport, and timeline
 * position for each layer type. Parent component uses this to pass
 * props to React layer components.
 *
 * @returns {Object} Layer data object with highlight, text, and drawing properties
 * @returns {Object} return.highlight - Highlight layer data
 * @returns {Array} return.highlight.annos - Highlight annotations
 * @returns {Object|null} return.highlight.viewport - Viewport dimensions
 * @returns {number} return.highlight.nowSec - Timeline position
 * @returns {Object} return.text - Text layer data
 * @returns {Array} return.text.annos - Text annotations
 * @returns {Object|null} return.text.viewport - Viewport dimensions
 * @returns {number} return.text.nowSec - Timeline position
 * @returns {Object} return.drawing - Drawing layer data
 * @returns {Array} return.drawing.annos - Ink annotations
 * @returns {Object|null} return.drawing.viewport - Viewport dimensions
 * @returns {number} return.drawing.nowSec - Timeline position
 */
getLayerData() {
  return {
    highlight: { ...this.layerData.highlight },
    text: { ...this.layerData.text },
    drawing: { ...this.layerData.drawing }
  };
}
```

**Return Value:**
```javascript
{
  highlight: { annos: Array, viewport: Object|null, nowSec: number },
  text: { annos: Array, viewport: Object|null, nowSec: number },
  drawing: { annos: Array, viewport: Object|null, nowSec: number }
}
```

---

### 5. destroy()

**Purpose:** Clean up resources and release all references

**Signature:**
```javascript
destroy()
```

**Implementation:**

```javascript
/**
 * Clean up resources and release references
 *
 * Resets all layer data and clears references.
 * Call before removing LayerManager instance.
 *
 * @returns {void}
 */
destroy() {
  // Reset layer data to initial state
  this.layerData.highlight = { annos: [], viewport: null, nowSec: 0 };
  this.layerData.text = { annos: [], viewport: null, nowSec: 0 };
  this.layerData.drawing = { annos: [], viewport: null, nowSec: 0 };

  // Clear all references
  this.container = null;
  this.currentPage = null;
  this.currentViewport = null;
  this.allAnnotations = [];
}
```

---

## Data Flow

### Input Flow

```
Annotations Array (all pages, all types)
    ↓
LayerManager.setAnnotations(annotations, pageNum)
    ↓
Filter by page: annotations.filter(a => a.page === pageNum)
    ↓
Group by type: filter(a => a.type === 'highlight|text|ink')
    ↓
Store in layerData.{highlight|text|drawing}.annos
```

### Output Flow

```
Parent Component calls getLayerData()
    ↓
LayerManager returns { highlight: {...}, text: {...}, drawing: {...} }
    ↓
Parent passes data as props to React components
    ↓
<HighlightLayer annos={...} viewport={...} nowSec={...} />
<TextLayer annos={...} viewport={...} nowSec={...} />
<DrawingLayer annos={...} viewport={...} nowSec={...} />
```

---

## Annotation Filtering Logic

### Page Filtering

```javascript
const pageAnnotations = annotations.filter(a => a.page === pageNum);
```

**Rules:**
- Match exact page number (strict equality)
- Page numbers are 1-indexed
- Annotations without `page` field are excluded (filter returns false)

### Type Routing

```javascript
const highlights = pageAnnotations.filter(a => a.type === 'highlight');
const textAnnotations = pageAnnotations.filter(a => a.type === 'text');
const inkAnnotations = pageAnnotations.filter(a => a.type === 'ink');
```

**Type Mapping:**
- `type === 'highlight'` → HighlightLayer data
- `type === 'text'` → TextLayer data
- `type === 'ink'` → DrawingLayer data

**Unrecognized Types:**
- Annotations with unknown type values are silently ignored
- No error thrown (graceful degradation)
- Future layer types can be added without breaking existing code

---

## Layer Data Structure

### Internal Storage Format

```javascript
this.layerData = {
  highlight: {
    annos: Array,        // Filtered highlight annotations
    viewport: Object|null, // Viewport from PDFRenderer
    nowSec: number       // Timeline position in seconds
  },
  text: {
    annos: Array,
    viewport: Object|null,
    nowSec: number
  },
  drawing: {
    annos: Array,
    viewport: Object|null,
    nowSec: number
  }
}
```

### Expected Viewport Structure

```javascript
{
  width: number,    // Viewport width in pixels
  height: number,   // Viewport height in pixels
  scale: number,    // Scale factor (e.g., 1.5)
  // May contain additional pdf.js viewport properties
}
```

---

## Integration Pattern

### Usage in Parent Component (Future AnnotationRenderer/ReactAdapter)

```javascript
import { LayerManager } from './core/LayerManager.js';
import HighlightLayer from './layers/HighlightLayer.jsx';
import TextLayer from './layers/TextLayer.jsx';
import DrawingLayer from './layers/DrawingLayer.jsx';

// In React component or vanilla wrapper
const layerManager = new LayerManager(containerElement);

// Update when data changes
layerManager.setAnnotations(annotations, currentPage);
layerManager.setViewport(viewport);
layerManager.updateTimeline(currentTime);

// Get data for rendering
const layerData = layerManager.getLayerData();

// Render with React (in JSX)
return (
  <div ref={containerRef}>
    <HighlightLayer {...layerData.highlight} />
    <TextLayer {...layerData.text} />
    <DrawingLayer {...layerData.drawing} />
  </div>
);
```

---

## Error Handling

### Validation Strategy

**Constructor:**
- Throw Error if containerElement is invalid
- Stop execution immediately - cannot proceed without valid container

**Public Methods:**
- Validate all inputs
- Use `console.warn` for invalid inputs
- Degrade gracefully - continue with safe defaults
- Never throw errors in public methods (stability)

### Error Message Format

```javascript
console.warn('LayerManager.methodName: descriptive error message');
```

**Guidelines:**
- Always include class name and method name
- Describe what went wrong
- Suggest expected input type/format
- Use `warn` for recoverable issues
- Use `error` only for unexpected failures

---

## Future Transition Plan

### Current Implementation (Step 3)

LayerManager uses **Data Provider Pattern**:
- Stores layer data internally
- Provides `getLayerData()` method
- Parent component renders React layers

### Future Implementation (After Layer Conversion)

When layers are converted to plain JavaScript classes:

**1. Constructor creates layer instances:**
```javascript
constructor(containerElement) {
  this.container = containerElement;

  // Create layer instances directly
  this.layers = {
    highlight: new HighlightLayer(containerElement),
    text: new TextLayer(containerElement),
    drawing: new DrawingLayer(containerElement)
  };
}
```

**2. Methods call layer methods directly:**
```javascript
setAnnotations(annotations, pageNum) {
  const highlights = annotations.filter(...);
  this.layers.highlight.setAnnotations(highlights);  // Direct call
}

updateTimeline(timestamp) {
  this.layers.highlight.update(timestamp);
  this.layers.text.update(timestamp);
  this.layers.drawing.update(timestamp);
}
```

**3. Remove `getLayerData()` method:**
```javascript
// No longer needed - layers render themselves
```

**Public API remains unchanged** - consumers don't need to know about internal changes.

---

## Testing Considerations

### Unit Test Cases

**Constructor:**
1. ✅ Throws error if containerElement is null
2. ✅ Throws error if containerElement is not HTMLElement
3. ✅ Initializes with empty layer data

**setAnnotations:**
4. ✅ Filters annotations by page number
5. ✅ Routes highlights (type='highlight') correctly
6. ✅ Routes text annotations (type='text') correctly
7. ✅ Routes ink annotations (type='ink') correctly
8. ✅ Ignores annotations with unrecognized type
9. ✅ Handles empty annotation array
10. ✅ Warns on invalid inputs

**setViewport:**
11. ✅ Propagates viewport to all layer data
12. ✅ Stores viewport reference
13. ✅ Warns on invalid viewport

**updateTimeline:**
14. ✅ Propagates timestamp to all layer data
15. ✅ Accepts negative timestamps
16. ✅ Warns on non-number timestamp

**getLayerData:**
17. ✅ Returns correct data structure
18. ✅ Returns shallow copy (not deep reference)

**destroy:**
19. ✅ Clears all layer data
20. ✅ Releases all references

### Test Data

```javascript
const mockContainer = document.createElement('div');

const mockAnnotations = [
  { id: '1', type: 'highlight', page: 1, start: 0, end: 2 },
  { id: '2', type: 'text', page: 1, start: 1, end: 3 },
  { id: '3', type: 'ink', page: 1, start: 2, end: 4 },
  { id: '4', type: 'highlight', page: 2, start: 0, end: 2 },
  { id: '5', type: 'unknown', page: 1, start: 0, end: 1 }
];

const mockViewport = {
  width: 800,
  height: 1000,
  scale: 1.5
};
```

### Expected Behavior

```javascript
const manager = new LayerManager(mockContainer);
manager.setAnnotations(mockAnnotations, 1);
manager.setViewport(mockViewport);
manager.updateTimeline(2.5);

const data = manager.getLayerData();

// Assertions
expect(data.highlight.annos).toHaveLength(1); // Only page 1 highlight
expect(data.text.annos).toHaveLength(1);      // Only page 1 text
expect(data.drawing.annos).toHaveLength(1);   // Only page 1 ink
expect(data.highlight.viewport).toBe(mockViewport);
expect(data.highlight.nowSec).toBe(2.5);
```

---

## Success Criteria

✅ LayerManager correctly filters annotations by page number
✅ LayerManager correctly routes annotations by type (highlight, text, ink)
✅ LayerManager propagates viewport updates to all layers
✅ LayerManager propagates timeline updates to all layers
✅ LayerManager provides correct data structure via getLayerData()
✅ LayerManager validates inputs and handles errors gracefully
✅ LayerManager cleans up resources on destroy
✅ LayerManager maintains framework-agnostic architecture
✅ All methods have comprehensive JSDoc documentation
✅ All code follows ES6+ conventions (classes, arrow functions, destructuring)

---

## Notes

### Why Data Provider Pattern

LayerManager uses Data Provider Pattern because current layers are React components. This pattern:
- Maintains framework-agnostic core architecture
- Works immediately with existing React layers
- Provides clean separation: LayerManager handles logic, parent handles rendering
- Enables smooth transition when layers convert to plain JavaScript

### Stateless Operation

All LayerManager methods are idempotent and stateless from caller perspective:
- Multiple calls with same values are safe
- No hidden side effects
- State changes are explicit and predictable

### No Direct DOM Manipulation

LayerManager does not create or manipulate DOM elements. It only manages data. Rendering is delegated to:
- Current: React layer components (via parent)
- Future: Plain JavaScript layer classes (direct instantiation)

---
