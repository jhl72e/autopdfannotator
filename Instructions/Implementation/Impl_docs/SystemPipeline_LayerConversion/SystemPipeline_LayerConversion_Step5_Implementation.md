# Implementation Instructions: Step 5 - LayerManager Integration

---

## What This Document Is

This document provides complete implementation instructions for Step 5 of the Layer Conversion Plan: refactoring LayerManager from Data Provider Pattern to Direct Instantiation Pattern.

---

## Overview

**Goal:** Refactor LayerManager from Data Provider Pattern to Direct Instantiation Pattern by having it instantiate and manage layer class instances directly.

**File to Modify:** `src/core/LayerManager.js`

**Expected Line Count:** ~220 lines (current: 217 lines)

---

## Prerequisites

Before implementing this step, verify:
- ✅ Step 1 complete: `src/layers/BaseLayer.js` exists and is functional
- ✅ Step 2 complete: `src/layers/HighlightLayer.js` exists and is functional
- ✅ Step 3 complete: `src/layers/TextLayer.js` exists and is functional
- ✅ Step 4 complete: `src/layers/DrawingLayer.js` exists and is functional
- ✅ All layer classes tested independently and working correctly

---

## Changes Summary

### Architectural Change

**From: Data Provider Pattern**
- LayerManager stores annotation data in internal `layerData` object
- Parent component calls `getLayerData()` to retrieve data
- Parent component renders React layer components with data as props
- Indirect communication through data passing

**To: Direct Instantiation Pattern**
- LayerManager instantiates layer class instances in constructor
- LayerManager calls layer methods directly (`setAnnotations()`, `setViewport()`, `updateTime()`, `render()`)
- No parent component involvement in layer rendering
- Direct method invocation, no intermediate data structures

### Key Modifications

1. **Add imports** for the three layer classes
2. **Modify constructor** to accept `viewport` parameter and instantiate layer instances
3. **Refactor `setAnnotations()`** to call layer methods instead of storing data
4. **Refactor `setViewport()`** to call layer methods
5. **Refactor `updateTimeline()`** to call layer methods
6. **Remove `getLayerData()`** method (no longer needed)
7. **Update `destroy()`** to destroy layer instances
8. **Update JSDoc** documentation throughout

---

## Detailed Implementation Instructions

### 1. Add Layer Class Imports

**Location:** Top of file, after the module docstring

**Action:** Add import statements for the three layer classes

```javascript
import { HighlightLayer } from '../layers/HighlightLayer.js';
import { TextLayer } from '../layers/TextLayer.js';
import { DrawingLayer } from '../layers/DrawingLayer.js';
```

**Notes:**
- Import from `.js` files, not `.jsx`
- Use relative paths from `src/core/` to `src/layers/`
- These are the framework-agnostic versions created in Steps 2-4

---

### 2. Modify Constructor

**Current Constructor Signature:**
```javascript
constructor(containerElement)
```

**New Constructor Signature:**
```javascript
constructor(containerElement, viewport)
```

**Changes:**

1. **Add `viewport` parameter**
   - Required for layer instantiation
   - Must be provided when LayerManager is created
   - Contains `{ width, height, scale }` from PDFRenderer

2. **Validate viewport parameter**
   ```javascript
   if (!viewport || typeof viewport !== 'object') {
     throw new Error('LayerManager: viewport must be a valid object');
   }
   if (typeof viewport.width !== 'number' || typeof viewport.height !== 'number') {
     throw new Error('LayerManager: viewport must have width and height properties');
   }
   ```

3. **Store viewport**
   ```javascript
   this.currentViewport = viewport;
   ```

4. **Remove `layerData` property initialization**
   - Delete lines 66-74
   - No longer using Data Provider Pattern

5. **Add layer instance initialization**
   ```javascript
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
   ```

**Complete New Constructor:**
```javascript
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
```

**Update Constructor JSDoc:**
```javascript
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
```

---

### 3. Refactor `setAnnotations()` Method

**Current Approach:**
- Filters annotations by page and type
- Stores in `this.layerData` object
- Returns void

**New Approach:**
- Filters annotations by page and type
- Calls `layer.setAnnotations()` for each layer
- Calls `layer.render()` for each layer to create/update DOM

**Implementation:**

Replace lines 87-115 with:

```javascript
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
```

**Update JSDoc:**
```javascript
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
```

---

### 4. Refactor `setViewport()` Method

**Current Approach:**
- Stores viewport in `this.layerData` for each layer type
- Returns void

**New Approach:**
- Calls `layer.setViewport()` for each layer instance
- Calls `layer.render()` to recalculate layout with new dimensions

**Implementation:**

Replace lines 129-143 with:

```javascript
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
```

**Update JSDoc:**
```javascript
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
```

---

### 5. Refactor `updateTimeline()` Method

**Current Approach:**
- Stores timestamp in `this.layerData` for each layer type
- Returns void

**New Approach:**
- Calls `layer.updateTime()` for each layer instance
- Layers handle their own animation updates

**Implementation:**

Replace lines 154-165 with:

```javascript
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
```

**Update JSDoc:**
```javascript
/**
 * Update timeline position for all layers
 *
 * Propagates timestamp to all layer instances.
 * Layers handle their own animation updates (RAF loops, transforms, etc).
 *
 * @param {number} timestamp - Current timeline position in seconds
 * @returns {void}
 */
```

---

### 6. Remove `getLayerData()` Method

**Action:** Delete the entire `getLayerData()` method (lines 167-194)

**Reason:**
- Data Provider Pattern eliminated
- No longer needed with direct instantiation
- Layers render themselves, no external data retrieval needed

---

### 7. Update `destroy()` Method

**Current Approach:**
- Resets `layerData` to initial state
- Clears references

**New Approach:**
- Calls `destroy()` on each layer instance
- Clears layer references
- Clears other references

**Implementation:**

Replace lines 204-215 with:

```javascript
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
```

**Update JSDoc:**
```javascript
/**
 * Clean up resources and destroy layer instances
 *
 * Calls destroy() on all layer instances to clean up DOM elements,
 * cancel animations, and release references.
 * Call before removing LayerManager instance.
 *
 * @returns {void}
 */
```

---

### 8. Update Class-Level JSDoc

**Location:** Lines 12-27

**Replace with:**

```javascript
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
```

---

### 9. Update Module-Level JSDoc

**Location:** Lines 1-10

**Replace with:**

```javascript
/**
 * LayerManager - Framework-agnostic layer orchestration subsystem
 *
 * This module manages annotation layer instances, routes annotations by type,
 * and coordinates viewport and timeline state across all layers.
 * Instantiates layer classes directly and manages their lifecycle.
 *
 * @module core/LayerManager
 */
```

---

## Testing Instructions

### Unit Tests

1. **Test Constructor**
   ```javascript
   const viewport = { width: 800, height: 600, scale: 1.0 };
   const container = document.createElement('div');
   const manager = new LayerManager(container, viewport);

   // Verify layers instantiated
   assert(manager.layers.highlight instanceof HighlightLayer);
   assert(manager.layers.text instanceof TextLayer);
   assert(manager.layers.drawing instanceof DrawingLayer);
   ```

2. **Test setAnnotations Routing**
   ```javascript
   const annotations = [
     { id: '1', type: 'highlight', page: 1, /* ... */ },
     { id: '2', type: 'text', page: 1, /* ... */ },
     { id: '3', type: 'ink', page: 1, /* ... */ }
   ];

   manager.setAnnotations(annotations, 1);

   // Verify each layer received correct annotations
   assert(manager.layers.highlight.annotations.length === 1);
   assert(manager.layers.text.annotations.length === 1);
   assert(manager.layers.drawing.annotations.length === 1);
   ```

3. **Test setViewport Propagation**
   ```javascript
   const newViewport = { width: 1000, height: 800, scale: 1.5 };
   manager.setViewport(newViewport);

   // Verify all layers received viewport
   assert(manager.layers.highlight.viewport === newViewport);
   assert(manager.layers.text.viewport === newViewport);
   assert(manager.layers.drawing.viewport === newViewport);
   ```

4. **Test updateTimeline Propagation**
   ```javascript
   manager.updateTimeline(5.5);

   // Verify all layers received time update
   assert(manager.layers.highlight.currentTime === 5.5);
   assert(manager.layers.text.currentTime === 5.5);
   assert(manager.layers.drawing.currentTime === 5.5);
   ```

5. **Test destroy Cleanup**
   ```javascript
   manager.destroy();

   // Verify layers destroyed
   assert(manager.layers === null);
   assert(manager.container === null);
   ```

### Integration Tests

1. **Test with AnnotationRenderer**
   - Create AnnotationRenderer instance
   - Load PDF document
   - Set annotations
   - Verify layers render correctly
   - Verify animations work
   - Verify page navigation updates layers
   - Verify zoom updates layers

2. **Test Layer Rendering**
   - Add container to document body
   - Create LayerManager
   - Set sample annotations
   - Verify DOM elements created in correct z-order
   - Verify layer elements positioned correctly

3. **Test Timeline Synchronization**
   - Set annotations with different start/end times
   - Update timeline position progressively
   - Verify highlight animations trigger
   - Verify text reveals trigger
   - Verify drawing strokes trigger

---

## Validation Checklist

- [ ] LayerManager imports all three layer classes correctly
- [ ] Constructor instantiates all three layer instances
- [ ] Constructor validates viewport parameter
- [ ] setAnnotations() filters and routes annotations correctly
- [ ] setAnnotations() calls render() on all layers
- [ ] setViewport() propagates to all layers
- [ ] setViewport() calls render() on all layers
- [ ] updateTimeline() propagates to all layers
- [ ] getLayerData() method removed completely
- [ ] destroy() calls destroy() on all layer instances
- [ ] All JSDoc comments updated
- [ ] No references to `layerData` property remain
- [ ] No references to Data Provider Pattern remain
- [ ] All tests pass
- [ ] Integration with AnnotationRenderer works
- [ ] No React dependencies in LayerManager

---

## Expected Behavior After Implementation

### Initialization
```
LayerManager constructor called
  ↓
HighlightLayer instance created → layer element appended to container
TextLayer instance created → layer element appended to container
DrawingLayer instance created → canvas element appended to container
  ↓
All three layers ready for use
```

### Annotation Update
```
manager.setAnnotations(annotations, pageNum)
  ↓
Filter by page → Group by type
  ↓
highlightLayer.setAnnotations(highlights)
textLayer.setAnnotations(texts)
drawingLayer.setAnnotations(inks)
  ↓
highlightLayer.render() → creates highlight DOM elements
textLayer.render() → creates text box DOM elements
drawingLayer.render() → prepares canvas
  ↓
Annotations rendered on screen
```

### Timeline Update
```
manager.updateTimeline(5.5)
  ↓
highlightLayer.updateTime(5.5) → starts RAF loop for scaleX animation
textLayer.updateTime(5.5) → updates visible text content
drawingLayer.updateTime(5.5) → starts RAF loop for stroke drawing
  ↓
Animations play smoothly at 60fps
```

### Cleanup
```
manager.destroy()
  ↓
highlightLayer.destroy() → cancels RAF, removes elements
textLayer.destroy() → removes elements
drawingLayer.destroy() → cancels RAF, removes canvas
  ↓
All references cleared, ready for garbage collection
```

---

## Common Issues and Solutions

### Issue: "Cannot read property 'setAnnotations' of undefined"
**Cause:** Layer instance not created in constructor
**Solution:** Verify all three layers instantiated in constructor

### Issue: Annotations not rendering
**Cause:** render() not called after setAnnotations()
**Solution:** Ensure render() called for each layer after setting annotations

### Issue: Viewport changes not reflected
**Cause:** render() not called after setViewport()
**Solution:** Ensure render() called for each layer after setting viewport

### Issue: Animations not playing
**Cause:** updateTime() not being called
**Solution:** Verify updateTimeline() calls updateTime() on all layers

### Issue: Memory leak from old layers
**Cause:** destroy() not cleaning up properly
**Solution:** Ensure destroy() called on all layers before clearing references

---

## Success Criteria

✅ **LayerManager instantiates all layer instances in constructor**
✅ **Annotations route to correct layer types**
✅ **Viewport changes propagate and trigger re-render**
✅ **Timeline updates trigger layer animations**
✅ **destroy() cleans up all layer instances**
✅ **Data Provider Pattern completely removed**
✅ **getLayerData() method removed**
✅ **No React dependencies in LayerManager**
✅ **All JSDoc updated to reflect new architecture**
✅ **Integration tests pass with AnnotationRenderer**

---

## Dependencies

**This step depends on:**
- Step 1: BaseLayer.js (abstract base class)
- Step 2: HighlightLayer.js (framework-agnostic version)
- Step 3: TextLayer.js (framework-agnostic version)
- Step 4: DrawingLayer.js (framework-agnostic version)

**This step is required for:**
- Step 6: Update public API exports
- Full system integration testing
- AnnotationRenderer using new architecture

---

## Notes

- This change is internal to LayerManager - no changes to AnnotationRenderer needed at this point
- React layer components (.jsx) remain untouched - coexistence preserved
- AnnotationRenderer may need updates in a future step to pass viewport to LayerManager constructor
- This completes the framework independence of the core rendering system

---
