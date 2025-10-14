# SystemPipeline_CoreSystem_Step4_AnnotationRenderer_Implementation

---

## What This Document Is

This document specifies the CODE-level implementation for the AnnotationRenderer engine (Step 4 of Core System Construction Plan). AnnotationRenderer is the main facade that orchestrates all subsystems (PDFRenderer, LayerManager, TimelineSync) and provides the primary public API for rendering PDFs with annotations.

---

## File Location

**Path:** `src/core/AnnotationRenderer.js`

**Module Type:** ES6 Module (export class)

---

## Dependencies

### Internal Imports

```javascript
import { PDFRenderer } from './PDFRenderer.js';
import { LayerManager } from './LayerManager.js';
import { TimelineSync } from './TimelineSync.js';
```

**Note:** AnnotationRenderer is completely framework-agnostic. No React or other framework imports.

### No Utility Dependencies

AnnotationRenderer only orchestrates subsystems. All specialized operations are delegated to subsystems.

---

## Class Structure

### File Header Documentation

```javascript
/**
 * AnnotationRenderer - Main facade for PDF annotation rendering engine
 *
 * This module orchestrates all subsystems (PDFRenderer, LayerManager, TimelineSync)
 * and provides the primary public API for rendering PDFs with timeline-synchronized
 * annotations. Framework-agnostic core that can be wrapped by React/Vue adapters.
 *
 * @module core/AnnotationRenderer
 */
```

### Class Declaration

```javascript
/**
 * AnnotationRenderer class
 *
 * Main engine that coordinates PDF rendering, annotation layers, and timeline
 * synchronization. Provides simple imperative API for consumers.
 *
 * @class
 * @example
 * const renderer = new AnnotationRenderer({
 *   container: document.getElementById('layer-container'),
 *   canvasElement: document.getElementById('pdf-canvas')
 * });
 *
 * await renderer.loadPDF('/path/to/doc.pdf');
 * await renderer.setPage(1);
 * renderer.setAnnotations(annotationData);
 * renderer.setScale(1.5);
 * renderer.setTime(3.5);
 */
export class AnnotationRenderer {
  // Implementation
}
```

---

## Constructor

### Signature

```javascript
constructor(config)
```

### Parameters

**config** (Object, required) - Configuration object with the following properties:

- `container` (HTMLElement, required) - DOM element for layer rendering
- `canvasElement` (HTMLCanvasElement, required) - Canvas element for PDF rendering
- `pdfUrl` (String, optional) - PDF URL to load immediately
- `initialPage` (Number, optional) - Initial page number (default: 1)
- `initialScale` (Number, optional) - Initial scale factor (default: 1.0)
- `annotations` (Array, optional) - Initial annotation data

### Validation

```javascript
if (!config || typeof config !== 'object') {
  throw new Error('AnnotationRenderer: config object is required');
}

if (!config.container || !(config.container instanceof HTMLElement)) {
  throw new Error('AnnotationRenderer: config.container must be a valid DOM element');
}

if (!config.canvasElement || !(config.canvasElement instanceof HTMLCanvasElement)) {
  throw new Error('AnnotationRenderer: config.canvasElement must be a valid canvas element');
}
```

### Implementation

```javascript
constructor(config) {
  // Validate config
  if (!config || typeof config !== 'object') {
    throw new Error('AnnotationRenderer: config object is required');
  }

  if (!config.container || !(config.container instanceof HTMLElement)) {
    throw new Error('AnnotationRenderer: config.container must be a valid DOM element');
  }

  if (!config.canvasElement || !(config.canvasElement instanceof HTMLCanvasElement)) {
    throw new Error('AnnotationRenderer: config.canvasElement must be a valid canvas element');
  }

  /**
   * @private
   * @type {Object}
   */
  this.config = config;

  /**
   * @private
   * @type {HTMLCanvasElement}
   */
  this.canvasElement = config.canvasElement;

  /**
   * @private
   * @type {HTMLElement}
   */
  this.container = config.container;

  /**
   * @private
   * @type {PDFRenderer}
   */
  this.pdfRenderer = new PDFRenderer();

  /**
   * @private
   * @type {LayerManager}
   */
  this.layerManager = new LayerManager(config.container);

  /**
   * @private
   * @type {TimelineSync}
   */
  this.timelineSync = new TimelineSync();

  /**
   * @private
   * @type {number}
   */
  this.currentPage = config.initialPage || 1;

  /**
   * @private
   * @type {number}
   */
  this.currentScale = config.initialScale || 1.0;

  /**
   * @private
   * @type {Array}
   */
  this.annotations = config.annotations || [];

  /**
   * @private
   * @type {number}
   */
  this.pageCount = 0;

  /**
   * @private
   * @type {Object|null}
   */
  this.currentViewport = null;

  /**
   * @private
   * @type {string|null}
   */
  this.pdfUrl = null;

  // Wire up subsystem communication
  // Timeline updates automatically propagate to LayerManager
  this.timelineSync.subscribe((time) => {
    this.layerManager.updateTimeline(time);
  });

  // Auto-load PDF if provided
  if (config.pdfUrl) {
    this.loadPDF(config.pdfUrl).catch(err => {
      console.error('AnnotationRenderer: Failed to auto-load PDF:', err);
    });
  }
}
```

### JSDoc for Constructor

```javascript
/**
 * Create AnnotationRenderer instance
 *
 * @param {Object} config - Configuration object
 * @param {HTMLElement} config.container - DOM element for layer rendering
 * @param {HTMLCanvasElement} config.canvasElement - Canvas element for PDF rendering
 * @param {string} [config.pdfUrl] - PDF URL to load immediately
 * @param {number} [config.initialPage=1] - Initial page number
 * @param {number} [config.initialScale=1.0] - Initial scale factor
 * @param {Array} [config.annotations=[]] - Initial annotation data
 * @throws {Error} If config is invalid or required elements are missing
 */
```

---

## Public Methods

### 1. loadPDF()

**Purpose:** Load PDF document from URL

**Signature:**
```javascript
async loadPDF(url)
```

**Parameters:**
- `url` (String, required) - URL or path to PDF file

**Returns:** `Promise<Object>`
- `{ success: boolean, pageCount?: number, error?: string }`

**Implementation:**

```javascript
/**
 * Load PDF document from URL
 *
 * @param {string} url - URL or path to PDF file
 * @returns {Promise<Object>} Load result with success status and page count
 * @returns {boolean} return.success - Whether loading succeeded
 * @returns {number} [return.pageCount] - Number of pages if successful
 * @returns {string} [return.error] - Error message if failed
 */
async loadPDF(url) {
  try {
    // Validate URL
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        error: 'Invalid PDF URL provided'
      };
    }

    // Load via PDFRenderer
    const result = await this.pdfRenderer.loadDocument(url);

    if (result.success) {
      // Store PDF metadata
      this.pdfUrl = url;
      this.pageCount = result.pageCount;

      return {
        success: true,
        pageCount: result.pageCount
      };
    } else {
      return result;
    }
  } catch (err) {
    console.error('AnnotationRenderer.loadPDF: Error loading PDF:', err);
    return {
      success: false,
      error: `Failed to load PDF: ${err.message}`
    };
  }
}
```

---

### 2. setPage()

**Purpose:** Navigate to specific page and render it

**Signature:**
```javascript
async setPage(pageNum)
```

**Parameters:**
- `pageNum` (Number, required) - Page number (1-indexed)

**Returns:** `Promise<Object>`
- `{ success: boolean, viewport?: Object, error?: string }`

**Implementation:**

```javascript
/**
 * Navigate to specific page and render it
 *
 * @param {number} pageNum - Page number (1-indexed)
 * @returns {Promise<Object>} Render result with viewport information
 * @returns {boolean} return.success - Whether rendering succeeded
 * @returns {Object} [return.viewport] - Viewport dimensions if successful
 * @returns {string} [return.error] - Error message if failed
 */
async setPage(pageNum) {
  try {
    // Validate page number
    if (typeof pageNum !== 'number' || pageNum < 1) {
      return {
        success: false,
        error: 'Invalid page number'
      };
    }

    if (this.pageCount > 0 && pageNum > this.pageCount) {
      return {
        success: false,
        error: `Page ${pageNum} exceeds document page count (${this.pageCount})`
      };
    }

    // Cancel any in-progress rendering
    this.pdfRenderer.cancelRender();

    // Render page via PDFRenderer
    const result = await this.pdfRenderer.renderPage(
      pageNum,
      this.canvasElement,
      this.currentScale
    );

    if (result.success) {
      // Store current state
      this.currentPage = pageNum;
      this.currentViewport = result.viewport;

      // Update LayerManager with new page and viewport
      this.layerManager.setAnnotations(this.annotations, pageNum);
      this.layerManager.setViewport(result.viewport);

      return {
        success: true,
        viewport: result.viewport
      };
    } else {
      return result;
    }
  } catch (err) {
    console.error('AnnotationRenderer.setPage: Error rendering page:', err);
    return {
      success: false,
      error: `Failed to render page: ${err.message}`
    };
  }
}
```

---

### 3. setScale()

**Purpose:** Change zoom scale and re-render current page

**Signature:**
```javascript
async setScale(scale)
```

**Parameters:**
- `scale` (Number, required) - Scale factor (e.g., 1.0, 1.5, 2.0)

**Returns:** `Promise<Object>`
- `{ success: boolean, viewport?: Object, error?: string }`

**Implementation:**

```javascript
/**
 * Change zoom scale and re-render current page
 *
 * @param {number} scale - Scale factor (e.g., 1.0, 1.5, 2.0)
 * @returns {Promise<Object>} Render result with viewport information
 * @returns {boolean} return.success - Whether rendering succeeded
 * @returns {Object} [return.viewport] - Viewport dimensions if successful
 * @returns {string} [return.error] - Error message if failed
 */
async setScale(scale) {
  try {
    // Validate scale
    if (typeof scale !== 'number' || scale <= 0) {
      return {
        success: false,
        error: 'Invalid scale value (must be positive number)'
      };
    }

    // Store new scale
    this.currentScale = scale;

    // Re-render current page at new scale
    const result = await this.setPage(this.currentPage);

    return result;
  } catch (err) {
    console.error('AnnotationRenderer.setScale: Error changing scale:', err);
    return {
      success: false,
      error: `Failed to change scale: ${err.message}`
    };
  }
}
```

---

### 4. setAnnotations()

**Purpose:** Update annotation data for rendering

**Signature:**
```javascript
setAnnotations(annotations)
```

**Parameters:**
- `annotations` (Array, required) - Complete annotation array (all pages, all types)

**Returns:** `void`

**Implementation:**

```javascript
/**
 * Update annotation data for rendering
 *
 * @param {Array} annotations - Complete annotation array (all pages, all types)
 * @returns {void}
 */
setAnnotations(annotations) {
  // Validate annotations
  if (!Array.isArray(annotations)) {
    console.warn('AnnotationRenderer.setAnnotations: annotations must be an array');
    annotations = [];
  }

  // Store annotations
  this.annotations = annotations;

  // Route to LayerManager for current page
  this.layerManager.setAnnotations(annotations, this.currentPage);
}
```

---

### 5. setTime()

**Purpose:** Update timeline position for animation

**Signature:**
```javascript
setTime(timestamp)
```

**Parameters:**
- `timestamp` (Number, required) - Current timeline position in seconds

**Returns:** `void`

**Implementation:**

```javascript
/**
 * Update timeline position for animation
 *
 * @param {number} timestamp - Current timeline position in seconds
 * @returns {void}
 */
setTime(timestamp) {
  // Validate timestamp
  if (typeof timestamp !== 'number') {
    console.warn('AnnotationRenderer.setTime: timestamp must be a number');
    return;
  }

  // Forward to TimelineSync
  // TimelineSync will notify LayerManager automatically via subscription
  this.timelineSync.setTime(timestamp);
}
```

---

### 6. getState()

**Purpose:** Get current engine state snapshot

**Signature:**
```javascript
getState()
```

**Returns:** `Object`

**Implementation:**

```javascript
/**
 * Get current engine state snapshot
 *
 * @returns {Object} Current state
 * @returns {number} return.page - Current page number
 * @returns {number} return.scale - Current scale factor
 * @returns {Array} return.annotations - Current annotation array
 * @returns {number} return.pageCount - Total page count
 * @returns {number} return.time - Current timeline position
 * @returns {Object|null} return.viewport - Current viewport dimensions
 * @returns {string|null} return.pdfUrl - Current PDF URL
 */
getState() {
  return {
    page: this.currentPage,
    scale: this.currentScale,
    annotations: this.annotations,
    pageCount: this.pageCount,
    time: this.timelineSync.getCurrentTime(),
    viewport: this.currentViewport,
    pdfUrl: this.pdfUrl
  };
}
```

---

### 7. destroy()

**Purpose:** Clean up all resources and subsystems

**Signature:**
```javascript
destroy()
```

**Returns:** `void`

**Implementation:**

```javascript
/**
 * Clean up all resources and subsystems
 *
 * Call before removing AnnotationRenderer instance.
 * Destroys all subsystems and releases references.
 *
 * @returns {void}
 */
destroy() {
  // Destroy all subsystems
  if (this.pdfRenderer) {
    this.pdfRenderer.destroy();
  }

  if (this.layerManager) {
    this.layerManager.destroy();
  }

  if (this.timelineSync) {
    this.timelineSync.destroy();
  }

  // Clear all references
  this.pdfRenderer = null;
  this.layerManager = null;
  this.timelineSync = null;
  this.config = null;
  this.canvasElement = null;
  this.container = null;
  this.annotations = [];
  this.currentPage = 0;
  this.currentScale = 1.0;
  this.pageCount = 0;
  this.currentViewport = null;
  this.pdfUrl = null;
}
```

---

## Data Flow

### Initialization Flow

```
new AnnotationRenderer(config)
    ↓
1. Validate config
    ↓
2. Create subsystem instances
    ↓
3. Wire up timeline subscription
    ↓
4. Auto-load PDF if provided
    ↓
Engine ready
```

### Timeline Update Flow

```
setTime(timestamp)
    ↓
TimelineSync.setTime(timestamp)
    ↓
TimelineSync notifies subscribers
    ↓
LayerManager.updateTimeline(timestamp)
```

---

## Testing Strategy

### What CAN Be Tested:
- ✅ PDF renders to canvas
- ✅ Page navigation works
- ✅ Zoom in/out works
- ✅ State management works
- ✅ Subsystem coordination works

### What CANNOT Be Tested Yet:
- ❌ Annotation layers (React components, won't render in vanilla JS)

This is expected and acceptable for Step 4.

---

## Success Criteria

- ✅ Framework-agnostic (no React imports)
- ✅ All 7 public methods implemented
- ✅ Subsystems properly wired
- ✅ Complete state management
- ✅ Comprehensive error handling
- ✅ Full JSDoc documentation
- ✅ PDF renders to canvas (visible verification)

---
