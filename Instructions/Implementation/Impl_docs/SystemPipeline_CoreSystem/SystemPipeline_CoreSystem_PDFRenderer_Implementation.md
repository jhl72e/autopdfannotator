# PDFRenderer Subsystem - Implementation Document

---

## What This Document Is

This document provides CODE-level implementation specifications for the PDFRenderer subsystem. This is the first subsystem of the core engine that encapsulates all pdf.js operations in a framework-agnostic module.

---

## Purpose

Create a pure JavaScript class that handles PDF document loading, page rendering, viewport calculations, and rendering task management. This module abstracts pdf.js complexity and provides a clean interface for the AnnotationRenderer engine.

---

## File Location

**File Path:** `src/core/PDFRenderer.js`

**Module Type:** ES6 JavaScript class (no JSX, no React)

---

## Dependencies

### External Libraries

```javascript
import * as pdfjsLib from 'pdfjs-dist';
```

**Version:** `pdfjs-dist@^5.4.149` (already installed)

### Internal Utilities

```javascript
import { calculateViewport } from '../utils/viewportUtils.js';
```

**Purpose:** Calculate viewport dimensions from PDF.js page objects

---

## Class Structure

### Class Definition

```javascript
/**
 * PDFRenderer - Framework-agnostic PDF rendering subsystem
 *
 * Encapsulates all pdf.js operations including document loading,
 * page rendering, viewport calculations, and task management.
 *
 * @class
 */
export class PDFRenderer {
  constructor() {
    // Implementation details below
  }
}
```

---

## Constructor Implementation

### Signature

```javascript
constructor()
```

### Implementation

```javascript
constructor() {
  /**
   * @private
   * @type {PDFDocumentProxy|null}
   * @description Reference to loaded PDF document from pdf.js
   */
  this.pdfDoc = null;

  /**
   * @private
   * @type {RenderTask|null}
   * @description Current rendering task for cancellation
   */
  this.renderTask = null;

  // Configure pdf.js worker path
  // Worker file must be available at /pdf.worker.min.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}
```

### State Initialization

- `pdfDoc`: Initialize to `null` (no document loaded yet)
- `renderTask`: Initialize to `null` (no rendering in progress)
- Worker configuration: Set to `/pdf.worker.min.js` (matches existing setup in PdfViewer.jsx:14)

---

## Public Methods

### Method 1: loadDocument()

#### Signature

```javascript
/**
 * Load PDF document from URL
 *
 * @param {string} url - URL or path to PDF file
 * @returns {Promise<{success: boolean, pageCount?: number, error?: string}>}
 * @async
 */
async loadDocument(url)
```

#### Implementation

```javascript
async loadDocument(url) {
  try {
    // Validate input
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        error: 'Invalid PDF URL provided'
      };
    }

    // Load PDF document using pdf.js
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;

    // Store document reference
    this.pdfDoc = pdf;

    // Return success with metadata
    return {
      success: true,
      pageCount: pdf.numPages
    };

  } catch (err) {
    // Handle loading errors
    console.error('PDF loading error:', err);

    return {
      success: false,
      error: `Failed to load PDF: ${err.message}`
    };
  }
}
```

#### Behavior

- **Input Validation:** Check URL is non-empty string
- **Loading:** Use `pdfjsLib.getDocument(url).promise` (matches PdfViewer.jsx:76)
- **Storage:** Store PDF document reference in `this.pdfDoc`
- **Return:** Object with `success`, `pageCount` (on success), or `error` (on failure)
- **Error Handling:** Catch all errors, log them, return descriptive error message

#### Return Value Examples

**Success:**
```javascript
{ success: true, pageCount: 25 }
```

**Failure:**
```javascript
{ success: false, error: 'Failed to load PDF: Network error' }
```

---

### Method 2: renderPage()

#### Signature

```javascript
/**
 * Render PDF page to canvas element
 *
 * @param {number} pageNum - Page number (1-indexed)
 * @param {HTMLCanvasElement} canvas - Canvas element to render to
 * @param {number} scale - Scale factor for rendering
 * @returns {Promise<{success: boolean, viewport?: Object, error?: string}>}
 * @async
 */
async renderPage(pageNum, canvas, scale)
```

#### Implementation

```javascript
async renderPage(pageNum, canvas, scale) {
  try {
    // Validate inputs
    if (!this.pdfDoc) {
      return {
        success: false,
        error: 'No PDF document loaded'
      };
    }

    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      return {
        success: false,
        error: 'Invalid canvas element provided'
      };
    }

    if (pageNum < 1 || pageNum > this.pdfDoc.numPages) {
      return {
        success: false,
        error: `Invalid page number: ${pageNum}. Document has ${this.pdfDoc.numPages} pages.`
      };
    }

    // Cancel any in-progress rendering
    if (this.renderTask) {
      this.renderTask.cancel();
      this.renderTask = null;
    }

    // Get page from document
    const page = await this.pdfDoc.getPage(pageNum);

    // Calculate viewport using utility
    const viewport = calculateViewport(page, scale);

    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Get canvas context
    const context = canvas.getContext('2d');
    if (!context) {
      return {
        success: false,
        error: 'Failed to get canvas 2d context'
      };
    }

    // Create render context
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    // Start rendering
    this.renderTask = page.render(renderContext);

    // Wait for rendering to complete
    await this.renderTask.promise;

    // Clear render task reference
    this.renderTask = null;

    // Return success with viewport
    return {
      success: true,
      viewport: viewport
    };

  } catch (err) {
    // Handle RenderingCancelledException separately
    if (err.name === 'RenderingCancelledException') {
      console.log('Rendering cancelled');
      return {
        success: false,
        error: 'Rendering was cancelled'
      };
    }

    // Handle other errors
    console.error('Page rendering error:', err);
    return {
      success: false,
      error: `Failed to render page: ${err.message}`
    };

  } finally {
    // Ensure render task is cleared
    this.renderTask = null;
  }
}
```

#### Behavior

- **Validation:** Check PDF loaded, canvas valid, page number in range
- **Cancellation:** Cancel previous render task if exists (matches PdfViewer.jsx:125-129)
- **Page Retrieval:** Get page using `pdfDoc.getPage(pageNum)`
- **Viewport Calculation:** Use `calculateViewport(page, scale)` utility
- **Canvas Setup:** Set canvas width/height to viewport dimensions (matches PdfViewer.jsx:149-150)
- **Rendering:** Create render context and execute `page.render()` (matches PdfViewer.jsx:152-158)
- **Task Storage:** Store renderTask reference for cancellation
- **Completion:** Wait for promise, then clear task reference
- **Error Handling:** Handle `RenderingCancelledException` specially (matches PdfViewer.jsx:169-171)

#### Return Value Examples

**Success:**
```javascript
{
  success: true,
  viewport: {
    width: 1200,
    height: 1600,
    scale: 1.5,
    // ... other viewport properties
  }
}
```

**Failure:**
```javascript
{ success: false, error: 'Invalid page number: 999. Document has 25 pages.' }
```

---

### Method 3: getPageCount()

#### Signature

```javascript
/**
 * Get total number of pages in loaded PDF
 *
 * @returns {number} Page count, or 0 if no document loaded
 */
getPageCount()
```

#### Implementation

```javascript
getPageCount() {
  return this.pdfDoc ? this.pdfDoc.numPages : 0;
}
```

#### Behavior

- **Safe Access:** Return 0 if no document loaded
- **Simple Getter:** Returns `pdfDoc.numPages` property

---

### Method 4: cancelRender()

#### Signature

```javascript
/**
 * Cancel current rendering task if active
 *
 * Safe to call even if no rendering is active.
 *
 * @returns {void}
 */
cancelRender()
```

#### Implementation

```javascript
cancelRender() {
  if (this.renderTask) {
    try {
      this.renderTask.cancel();
    } catch (err) {
      // Ignore cancellation errors
      console.log('Render cancellation error (ignored):', err);
    } finally {
      this.renderTask = null;
    }
  }
}
```

#### Behavior

- **Safe Cancellation:** Only cancel if renderTask exists
- **Error Handling:** Catch and ignore cancellation errors
- **Cleanup:** Always clear renderTask reference
- **Idempotent:** Safe to call multiple times

---

### Method 5: destroy()

#### Signature

```javascript
/**
 * Clean up resources and release references
 *
 * Call this method when PDFRenderer is no longer needed.
 * After calling destroy(), the instance should not be used.
 *
 * @returns {void}
 */
destroy()
```

#### Implementation

```javascript
destroy() {
  // Cancel any active rendering
  this.cancelRender();

  // Release PDF document reference
  if (this.pdfDoc) {
    // pdf.js documents don't have explicit cleanup in current version
    // Just clear the reference
    this.pdfDoc = null;
  }

  // Clear render task reference
  this.renderTask = null;
}
```

#### Behavior

- **Render Cancellation:** Cancel active rendering first
- **Document Cleanup:** Clear PDF document reference
- **Task Cleanup:** Clear render task reference
- **Complete Cleanup:** Prepare instance for garbage collection

---

## Complete Implementation File

### Full Code

```javascript
/**
 * PDFRenderer - Framework-agnostic PDF rendering subsystem
 *
 * This module encapsulates all pdf.js operations including document loading,
 * page rendering, viewport calculations, and rendering task management.
 *
 * @module core/PDFRenderer
 */

import * as pdfjsLib from 'pdfjs-dist';
import { calculateViewport } from '../utils/viewportUtils.js';

/**
 * PDFRenderer class
 *
 * Provides framework-agnostic PDF rendering capabilities.
 * Abstracts pdf.js complexity and provides clean interface for engine.
 *
 * @class
 * @example
 * const renderer = new PDFRenderer();
 * await renderer.loadDocument('/path/to/doc.pdf');
 * const result = await renderer.renderPage(1, canvasElement, 1.5);
 */
export class PDFRenderer {
  constructor() {
    /**
     * @private
     * @type {PDFDocumentProxy|null}
     */
    this.pdfDoc = null;

    /**
     * @private
     * @type {RenderTask|null}
     */
    this.renderTask = null;

    // Configure pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }

  /**
   * Load PDF document from URL
   *
   * @param {string} url - URL or path to PDF file
   * @returns {Promise<{success: boolean, pageCount?: number, error?: string}>}
   */
  async loadDocument(url) {
    try {
      if (!url || typeof url !== 'string') {
        return {
          success: false,
          error: 'Invalid PDF URL provided'
        };
      }

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;

      this.pdfDoc = pdf;

      return {
        success: true,
        pageCount: pdf.numPages
      };

    } catch (err) {
      console.error('PDF loading error:', err);
      return {
        success: false,
        error: `Failed to load PDF: ${err.message}`
      };
    }
  }

  /**
   * Render PDF page to canvas element
   *
   * @param {number} pageNum - Page number (1-indexed)
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {number} scale - Scale factor for rendering
   * @returns {Promise<{success: boolean, viewport?: Object, error?: string}>}
   */
  async renderPage(pageNum, canvas, scale) {
    try {
      if (!this.pdfDoc) {
        return {
          success: false,
          error: 'No PDF document loaded'
        };
      }

      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        return {
          success: false,
          error: 'Invalid canvas element provided'
        };
      }

      if (pageNum < 1 || pageNum > this.pdfDoc.numPages) {
        return {
          success: false,
          error: `Invalid page number: ${pageNum}. Document has ${this.pdfDoc.numPages} pages.`
        };
      }

      // Cancel any in-progress rendering
      if (this.renderTask) {
        this.renderTask.cancel();
        this.renderTask = null;
      }

      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = calculateViewport(page, scale);

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d');
      if (!context) {
        return {
          success: false,
          error: 'Failed to get canvas 2d context'
        };
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      this.renderTask = page.render(renderContext);
      await this.renderTask.promise;

      this.renderTask = null;

      return {
        success: true,
        viewport: viewport
      };

    } catch (err) {
      if (err.name === 'RenderingCancelledException') {
        console.log('Rendering cancelled');
        return {
          success: false,
          error: 'Rendering was cancelled'
        };
      }

      console.error('Page rendering error:', err);
      return {
        success: false,
        error: `Failed to render page: ${err.message}`
      };

    } finally {
      this.renderTask = null;
    }
  }

  /**
   * Get total number of pages in loaded PDF
   *
   * @returns {number} Page count, or 0 if no document loaded
   */
  getPageCount() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  /**
   * Cancel current rendering task if active
   *
   * @returns {void}
   */
  cancelRender() {
    if (this.renderTask) {
      try {
        this.renderTask.cancel();
      } catch (err) {
        console.log('Render cancellation error (ignored):', err);
      } finally {
        this.renderTask = null;
      }
    }
  }

  /**
   * Clean up resources and release references
   *
   * @returns {void}
   */
  destroy() {
    this.cancelRender();

    if (this.pdfDoc) {
      this.pdfDoc = null;
    }

    this.renderTask = null;
  }
}
```

---

## Usage Examples

### Example 1: Basic Usage

```javascript
import { PDFRenderer } from './core/PDFRenderer.js';

// Create renderer instance
const renderer = new PDFRenderer();

// Load PDF
const loadResult = await renderer.loadDocument('/example.pdf');
if (!loadResult.success) {
  console.error('Failed to load:', loadResult.error);
  return;
}

console.log(`PDF loaded with ${loadResult.pageCount} pages`);

// Render first page
const canvas = document.getElementById('pdf-canvas');
const renderResult = await renderer.renderPage(1, canvas, 1.5);

if (renderResult.success) {
  console.log('Page rendered successfully');
  console.log('Viewport:', renderResult.viewport);
} else {
  console.error('Failed to render:', renderResult.error);
}

// Clean up
renderer.destroy();
```

### Example 2: Page Navigation

```javascript
const renderer = new PDFRenderer();
await renderer.loadDocument('/example.pdf');

const canvas = document.getElementById('pdf-canvas');
let currentPage = 1;

async function goToPage(pageNum) {
  const result = await renderer.renderPage(pageNum, canvas, 1.5);
  if (result.success) {
    currentPage = pageNum;
    console.log(`Now viewing page ${pageNum}`);
  }
}

// Navigate pages
await goToPage(1);
await goToPage(2);
await goToPage(3);
```

### Example 3: Zoom Control

```javascript
const renderer = new PDFRenderer();
await renderer.loadDocument('/example.pdf');

const canvas = document.getElementById('pdf-canvas');
const pageNum = 1;

async function setZoom(scale) {
  const result = await renderer.renderPage(pageNum, canvas, scale);
  if (result.success) {
    console.log(`Zoomed to ${scale}x`);
  }
}

// Different zoom levels
await setZoom(1.0);   // 100%
await setZoom(1.5);   // 150%
await setZoom(2.0);   // 200%
```

### Example 4: Error Handling

```javascript
const renderer = new PDFRenderer();

// Handle load errors
const loadResult = await renderer.loadDocument('invalid-url.pdf');
if (!loadResult.success) {
  console.error('Load error:', loadResult.error);
  // Show error to user
}

// Handle render errors
const renderResult = await renderer.renderPage(999, canvas, 1.5);
if (!renderResult.success) {
  console.error('Render error:', renderResult.error);
  // Show error to user
}
```

---

## Integration Points

### Used By

- `AnnotationRenderer` (Step 4) - Main engine facade

### Uses

- `pdfjs-dist` - PDF.js library for document loading and rendering
- `src/utils/viewportUtils.js` - Viewport calculation utility

### Independent From

- LayerManager - No direct interaction
- TimelineSync - No direct interaction
- React or any framework - Pure JavaScript

---

## Testing Strategy

### Manual Testing Approach

Create a test HTML file to verify PDFRenderer independently:

**File:** `test/pdfrenderer-test.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>PDFRenderer Test</title>
</head>
<body>
  <h1>PDFRenderer Test</h1>
  <div>
    <button id="load-btn">Load PDF</button>
    <button id="render-btn">Render Page 1</button>
    <button id="next-btn">Next Page</button>
    <button id="zoom-in">Zoom In</button>
    <button id="zoom-out">Zoom Out</button>
  </div>
  <div>
    <canvas id="pdf-canvas" style="border: 1px solid black;"></canvas>
  </div>
  <div id="status"></div>

  <script type="module">
    import { PDFRenderer } from '../src/core/PDFRenderer.js';

    const renderer = new PDFRenderer();
    const canvas = document.getElementById('pdf-canvas');
    const status = document.getElementById('status');
    let currentPage = 1;
    let currentScale = 1.5;

    document.getElementById('load-btn').onclick = async () => {
      status.textContent = 'Loading...';
      const result = await renderer.loadDocument('/examples/sample.pdf');
      if (result.success) {
        status.textContent = `Loaded! Pages: ${result.pageCount}`;
      } else {
        status.textContent = `Error: ${result.error}`;
      }
    };

    document.getElementById('render-btn').onclick = async () => {
      const result = await renderer.renderPage(currentPage, canvas, currentScale);
      status.textContent = result.success ? 'Rendered!' : `Error: ${result.error}`;
    };

    document.getElementById('next-btn').onclick = async () => {
      currentPage++;
      const result = await renderer.renderPage(currentPage, canvas, currentScale);
      status.textContent = result.success ? `Page ${currentPage}` : `Error: ${result.error}`;
    };

    document.getElementById('zoom-in').onclick = async () => {
      currentScale += 0.25;
      const result = await renderer.renderPage(currentPage, canvas, currentScale);
      status.textContent = `Zoom: ${currentScale}x`;
    };

    document.getElementById('zoom-out').onclick = async () => {
      currentScale -= 0.25;
      const result = await renderer.renderPage(currentPage, canvas, currentScale);
      status.textContent = `Zoom: ${currentScale}x`;
    };
  </script>
</body>
</html>
```

### Test Checklist

**PDF Loading:**
- ✅ Load valid PDF successfully
- ✅ Handle invalid URL gracefully
- ✅ Return correct page count
- ✅ Handle network errors

**Page Rendering:**
- ✅ Render page 1 successfully
- ✅ Handle invalid page numbers
- ✅ Cancel previous rendering when new render starts
- ✅ Handle RenderingCancelledException correctly
- ✅ Return valid viewport object

**Canvas Operations:**
- ✅ Set canvas dimensions correctly
- ✅ Handle invalid canvas element
- ✅ Handle missing canvas context

**Zoom Operations:**
- ✅ Render at different scales (0.5x, 1.0x, 1.5x, 2.0x)
- ✅ Viewport dimensions adjust correctly
- ✅ Canvas resizes appropriately

**Resource Management:**
- ✅ cancelRender() stops active rendering
- ✅ destroy() cleans up all references
- ✅ No memory leaks after destroy

---

## Error Handling

### Error Categories

**1. Input Validation Errors:**
- Invalid URL (null, empty, non-string)
- Invalid page number (out of range)
- Invalid canvas element (null, not HTMLCanvasElement)

**2. PDF.js Errors:**
- Network errors (file not found, connection failed)
- Parsing errors (invalid PDF format)
- Rendering errors (corrupted page)

**3. Rendering Cancellation:**
- RenderingCancelledException (expected behavior)

### Error Response Format

All methods return consistent error format:

```javascript
{
  success: false,
  error: "Descriptive error message"
}
```

### Error Logging

- All errors logged to console with `console.error()`
- Cancellations logged with `console.log()`
- Descriptive messages for debugging

---

## Performance Considerations

### Rendering Cancellation

- Cancel previous render before starting new one
- Prevents multiple simultaneous renders
- Avoids race conditions

### Resource Management

- Clear renderTask after completion
- Release document reference on destroy
- Prepare for garbage collection

### Canvas Optimization

- Set canvas dimensions before rendering
- Reuse same canvas element for multiple renders
- Let browser handle canvas memory

---

## Notes

### Worker Configuration

- Worker path set to `/pdf.worker.min.js`
- Matches existing PdfViewer.jsx configuration
- Worker file must be in public directory
- Vite serves public files at root

### Coordinate System

- Page numbers are 1-indexed (matches PDF.js convention)
- Viewport uses pixel coordinates
- Scale factor is multiplicative (1.0 = 100%, 1.5 = 150%)

### Framework Independence

- No React imports or JSX
- Pure JavaScript ES6 classes
- Standard DOM APIs only
- Works in any JavaScript environment

### Future Enhancements

- Add support for rotation
- Add support for custom render intent (print vs display)
- Add progress callbacks for long renders
- Add support for annotation rendering hints

---
