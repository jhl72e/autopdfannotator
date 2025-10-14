# API Reference

Complete API documentation for @ai-annotator/renderer.

---

## Table of Contents

- [Core Engine](#core-engine)
  - [AnnotationRenderer](#annotationrenderer)
  - [PDFRenderer](#pdfrenderer)
  - [LayerManager](#layermanager)
  - [TimelineSync](#timelinesync)
- [Annotation Layers](#annotation-layers)
  - [BaseLayer](#baselayer)
  - [HighlightLayer](#highlightlayer)
  - [TextLayer](#textlayer)
  - [DrawingLayer](#drawinglayer)
- [Framework Adapters](#framework-adapters)
  - [AnnotPdf (React)](#annotpdf-react)
- [Utilities](#utilities)
  - [coordinateUtils](#coordinateutils)
  - [viewportUtils](#viewportutils)
- [Type Validators](#type-validators)
  - [normalizeAnnotationArray](#normalizeannotationarray)
  - [Field Normalizers](#field-normalizers)

---

## Core Engine

### AnnotationRenderer

Main facade for PDF annotation rendering. Orchestrates all subsystems (PDFRenderer, LayerManager, TimelineSync) and provides the primary public API.

**Import:**

```javascript
import { AnnotationRenderer } from '@ai-annotator/renderer';
```

#### Constructor

Creates a new AnnotationRenderer instance.

**Syntax:**

```javascript
new AnnotationRenderer(config)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| config | Object | Yes | Configuration object |
| config.container | HTMLElement | Yes | DOM element for annotation layers |
| config.canvasElement | HTMLCanvasElement | Yes | Canvas element for PDF rendering |
| config.pdfUrl | string | No | PDF URL to load immediately |
| config.initialPage | number | No | Initial page number (default: 1) |
| config.initialScale | number | No | Initial scale factor (default: 1.0) |
| config.annotations | Array | No | Initial annotation data (default: []) |

**Returns:** AnnotationRenderer instance

**Throws:**
- `Error` - If config is invalid or required elements are missing

**Example:**

```javascript
const renderer = new AnnotationRenderer({
  container: document.getElementById('layer-container'),
  canvasElement: document.getElementById('pdf-canvas')
});
```

#### loadPDF()

Loads a PDF document from URL.

**Syntax:**

```javascript
await renderer.loadPDF(url)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | URL or path to PDF file |

**Returns:** `Promise<Object>` - Load result

| Property | Type | Description |
|----------|------|-------------|
| success | boolean | Whether loading succeeded |
| pageCount | number | Number of pages (if successful) |
| error | string | Error message (if failed) |

**Example:**

```javascript
const result = await renderer.loadPDF('/document.pdf');
if (result.success) {
  console.log('Loaded:', result.pageCount, 'pages');
} else {
  console.error('Error:', result.error);
}
```

#### setPage()

Navigates to a specific page and renders it.

**Syntax:**

```javascript
await renderer.setPage(pageNum)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pageNum | number | Yes | Page number (1-indexed) |

**Returns:** `Promise<Object>` - Render result

| Property | Type | Description |
|----------|------|-------------|
| success | boolean | Whether rendering succeeded |
| viewport | Object | Viewport dimensions (if successful) |
| error | string | Error message (if failed) |

**Example:**

```javascript
const result = await renderer.setPage(2);
if (result.success) {
  console.log('Viewport:', result.viewport);
}
```

#### setScale()

Changes zoom scale and re-renders current page.

**Syntax:**

```javascript
await renderer.setScale(scale)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| scale | number | Yes | Scale factor (e.g., 1.0, 1.5, 2.0) |

**Returns:** `Promise<Object>` - Render result (same as setPage)

**Example:**

```javascript
await renderer.setScale(1.5); // Zoom to 150%
```

#### setAnnotations()

Updates annotation data for rendering.

**Syntax:**

```javascript
renderer.setAnnotations(annotations)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| annotations | Array | Yes | Array of annotation objects (all pages, all types) |

**Returns:** void

**Example:**

```javascript
const annotations = [
  {
    type: 'highlight',
    page: 1,
    quads: [{ x: 0.1, y: 0.2, w: 0.8, h: 0.05 }],
    style: { color: 'rgba(255,255,0,0.3)' }
  }
];

renderer.setAnnotations(annotations);
```

#### setTime()

Updates timeline position for animation.

**Syntax:**

```javascript
renderer.setTime(timestamp)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timestamp | number | Yes | Timeline position in seconds |

**Returns:** void

**Example:**

```javascript
renderer.setTime(5.0); // Update to 5 seconds
```

#### getState()

Gets current engine state snapshot.

**Syntax:**

```javascript
const state = renderer.getState()
```

**Returns:** Object - Current state

| Property | Type | Description |
|----------|------|-------------|
| page | number | Current page number |
| scale | number | Current scale factor |
| annotations | Array | Current annotation array |
| pageCount | number | Total page count |
| time | number | Current timeline position |
| viewport | Object\|null | Current viewport dimensions |
| pdfUrl | string\|null | Current PDF URL |

**Example:**

```javascript
const state = renderer.getState();
console.log('Current page:', state.page);
console.log('Total pages:', state.pageCount);
```

#### destroy()

Cleans up all resources and subsystems.

**Syntax:**

```javascript
renderer.destroy()
```

**Returns:** void

**Example:**

```javascript
// Cleanup before removing renderer
renderer.destroy();
```

---

### PDFRenderer

Framework-agnostic PDF rendering subsystem. Encapsulates pdf.js operations.

**Import:**

```javascript
import { PDFRenderer } from '@ai-annotator/renderer';
```

#### Constructor

Creates a new PDFRenderer instance.

**Syntax:**

```javascript
new PDFRenderer()
```

**Example:**

```javascript
const pdfRenderer = new PDFRenderer();
```

#### loadDocument()

Loads PDF document from URL.

**Syntax:**

```javascript
await pdfRenderer.loadDocument(url)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| url | string | Yes | URL or path to PDF file |

**Returns:** `Promise<Object>` - Load result

| Property | Type | Description |
|----------|------|-------------|
| success | boolean | Whether loading succeeded |
| pageCount | number | Number of pages (if successful) |
| error | string | Error message (if failed) |

**Example:**

```javascript
const result = await pdfRenderer.loadDocument('/document.pdf');
```

#### renderPage()

Renders PDF page to canvas element.

**Syntax:**

```javascript
await pdfRenderer.renderPage(pageNum, canvas, scale)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pageNum | number | Yes | Page number (1-indexed) |
| canvas | HTMLCanvasElement | Yes | Canvas element to render to |
| scale | number | Yes | Scale factor for rendering |

**Returns:** `Promise<Object>` - Render result

| Property | Type | Description |
|----------|------|-------------|
| success | boolean | Whether rendering succeeded |
| viewport | Object | Viewport dimensions (if successful) |
| error | string | Error message (if failed) |

**Example:**

```javascript
const canvas = document.getElementById('pdf-canvas');
const result = await pdfRenderer.renderPage(1, canvas, 1.5);
```

#### getPageCount()

Gets total number of pages in loaded PDF.

**Syntax:**

```javascript
const count = pdfRenderer.getPageCount()
```

**Returns:** number - Page count (0 if no document loaded)

**Example:**

```javascript
const pageCount = pdfRenderer.getPageCount();
console.log('Total pages:', pageCount);
```

#### cancelRender()

Cancels current rendering task if active.

**Syntax:**

```javascript
pdfRenderer.cancelRender()
```

**Returns:** void

**Example:**

```javascript
pdfRenderer.cancelRender();
```

#### destroy()

Cleans up resources and releases references.

**Syntax:**

```javascript
pdfRenderer.destroy()
```

**Returns:** void

---

### LayerManager

Framework-agnostic layer orchestration subsystem. Manages annotation layer instances and routes annotations by type.

**Import:**

```javascript
import { LayerManager } from '@ai-annotator/renderer';
```

#### Constructor

Creates a new LayerManager instance.

**Syntax:**

```javascript
new LayerManager(containerElement, viewport)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| containerElement | HTMLElement | Yes | DOM element for layer rendering |
| viewport | Object | Yes | Initial viewport dimensions |
| viewport.width | number | Yes | Viewport width in pixels |
| viewport.height | number | Yes | Viewport height in pixels |
| viewport.scale | number | Yes | Scale factor |

**Throws:**
- `Error` - If containerElement is not valid DOM element
- `Error` - If viewport is invalid or missing required properties

**Example:**

```javascript
const viewport = { width: 800, height: 1000, scale: 1.0 };
const manager = new LayerManager(container, viewport);
```

#### setAnnotations()

Sets annotations and routes to appropriate layers.

**Syntax:**

```javascript
manager.setAnnotations(annotations, pageNum)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| annotations | Array | Yes | Complete annotation array (all pages, all types) |
| pageNum | number | Yes | Current page number (1-indexed) |

**Returns:** void

**Example:**

```javascript
manager.setAnnotations(annotations, 1);
```

#### setViewport()

Updates viewport dimensions for all layers.

**Syntax:**

```javascript
manager.setViewport(viewport)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| viewport | Object | Yes | Viewport object from PDFRenderer |
| viewport.width | number | Yes | Viewport width in pixels |
| viewport.height | number | Yes | Viewport height in pixels |
| viewport.scale | number | Yes | Scale factor |

**Returns:** void

**Example:**

```javascript
manager.setViewport({ width: 1200, height: 1500, scale: 1.5 });
```

#### updateTimeline()

Updates timeline position for all layers.

**Syntax:**

```javascript
manager.updateTimeline(timestamp)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timestamp | number | Yes | Current timeline position in seconds |

**Returns:** void

**Example:**

```javascript
manager.updateTimeline(5.0);
```

#### destroy()

Cleans up resources and destroys layer instances.

**Syntax:**

```javascript
manager.destroy()
```

**Returns:** void

---

### TimelineSync

Framework-agnostic timeline synchronization subsystem. Manages timeline position with pub-sub notification system.

**Import:**

```javascript
import { TimelineSync } from '@ai-annotator/renderer';
```

#### Constructor

Creates a new TimelineSync instance.

**Syntax:**

```javascript
new TimelineSync()
```

**Example:**

```javascript
const sync = new TimelineSync();
```

#### setTime()

Sets timeline position and notifies subscribers if changed.

**Syntax:**

```javascript
sync.setTime(timestamp)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timestamp | number | Yes | Timeline position in seconds |

**Returns:** void

**Example:**

```javascript
sync.setTime(5.0);
```

#### getCurrentTime()

Gets current timeline position.

**Syntax:**

```javascript
const time = sync.getCurrentTime()
```

**Returns:** number - Current timeline position in seconds

**Example:**

```javascript
const currentTime = sync.getCurrentTime();
console.log('Current time:', currentTime);
```

#### subscribe()

Subscribes to timeline updates.

**Syntax:**

```javascript
const unsubscribe = sync.subscribe(callback)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| callback | Function | Yes | Function to call on timeline updates |

**Returns:** Function - Unsubscribe function

**Throws:**
- `Error` - If callback is not a function

**Example:**

```javascript
const unsubscribe = sync.subscribe((time) => {
  console.log('Time updated:', time);
});

// Later: unsubscribe
unsubscribe();
```

#### unsubscribe()

Unsubscribes from timeline updates.

**Syntax:**

```javascript
sync.unsubscribe(callback)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| callback | Function | Yes | Callback function to remove |

**Returns:** void

**Example:**

```javascript
sync.unsubscribe(myCallback);
```

#### startContinuousSync()

Starts continuous timeline synchronization with requestAnimationFrame.

**Syntax:**

```javascript
sync.startContinuousSync(getTimeFunction)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| getTimeFunction | Function | Yes | Function that returns current time |

**Returns:** void

**Throws:**
- `Error` - If getTimeFunction is not a function

**Example:**

```javascript
const audio = document.getElementById('audio');
sync.startContinuousSync(() => audio.currentTime);
```

#### stopContinuousSync()

Stops continuous timeline synchronization.

**Syntax:**

```javascript
sync.stopContinuousSync()
```

**Returns:** void

**Example:**

```javascript
sync.stopContinuousSync();
```

#### destroy()

Cleans up resources and releases references.

**Syntax:**

```javascript
sync.destroy()
```

**Returns:** void

---

## Annotation Layers

### BaseLayer

Abstract base class for annotation layers. Provides common interface and lifecycle management.

**Import:**

```javascript
import { BaseLayer } from '@ai-annotator/renderer';
```

#### Constructor

Creates a new BaseLayer instance.

**Syntax:**

```javascript
new BaseLayer(container, viewport)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| container | HTMLElement | Yes | Parent DOM element for layer content |
| viewport | Object | Yes | Initial viewport dimensions |
| viewport.width | number | Yes | Viewport width in pixels |
| viewport.height | number | Yes | Viewport height in pixels |
| viewport.scale | number | Yes | PDF scale/zoom level |

**Throws:**
- `Error` - If container is not valid HTMLElement
- `Error` - If viewport is missing required properties
- `Error` - If instantiated directly (abstract class)

**Example:**

```javascript
// Extend BaseLayer to create custom layer
class CustomLayer extends BaseLayer {
  constructor(container, viewport) {
    super(container, viewport);
    // Custom initialization
  }

  render() {
    // Implement rendering logic
  }

  update() {
    // Implement update logic
  }
}
```

#### setAnnotations()

Sets annotation data for the layer.

**Syntax:**

```javascript
layer.setAnnotations(annotations)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| annotations | Array | Yes | Array of annotation objects |

**Returns:** void

**Throws:**
- `Error` - If called after layer is destroyed

#### setViewport()

Updates viewport dimensions.

**Syntax:**

```javascript
layer.setViewport(viewport)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| viewport | Object | Yes | New viewport dimensions |
| viewport.width | number | Yes | Viewport width in pixels |
| viewport.height | number | Yes | Viewport height in pixels |
| viewport.scale | number | Yes | PDF scale/zoom level |

**Returns:** void

**Throws:**
- `Error` - If viewport is missing required properties
- `Error` - If called after layer is destroyed

#### updateTime()

Updates current timeline position.

**Syntax:**

```javascript
layer.updateTime(nowSec)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nowSec | number | Yes | Current timeline position in seconds |

**Returns:** void

**Throws:**
- `Error` - If called after layer is destroyed

#### render()

Renders the layer content.

**Syntax:**

```javascript
layer.render()
```

**Returns:** void

**Throws:**
- `Error` - If not implemented by subclass (abstract method)

#### update()

Updates the visual state of the layer.

**Syntax:**

```javascript
layer.update()
```

**Returns:** void

**Throws:**
- `Error` - If not implemented by subclass (abstract method)

#### destroy()

Destroys the layer and releases resources.

**Syntax:**

```javascript
layer.destroy()
```

**Returns:** void

**Note:** Safe to call multiple times (idempotent). Subclasses must call `super.destroy()` after their own cleanup.

---

### HighlightLayer

Renders highlight annotations with progressive left-to-right reveal animation.

**Import:**

```javascript
import { HighlightLayer } from '@ai-annotator/renderer';
```

**Extends:** [BaseLayer](#baselayer)

#### Constructor

Creates a new HighlightLayer instance.

**Syntax:**

```javascript
new HighlightLayer(container, viewport)
```

**Parameters:** Same as [BaseLayer constructor](#constructor-3)

**Example:**

```javascript
const layer = new HighlightLayer(container, viewport);
layer.setAnnotations(highlightAnnotations);
layer.render();
```

#### render()

Renders highlight elements for all annotations.

Creates DOM structure for each quad. Calculates timing segments for progressive animation. Clears and recreates all elements when called.

**Syntax:**

```javascript
layer.render()
```

**Returns:** void

#### updateTime()

Updates highlight animations based on timeline position.

Starts requestAnimationFrame loop to animate scaleX transform. Calculates progress for each quad segment and updates visibility.

**Syntax:**

```javascript
layer.updateTime(nowSec)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nowSec | number | Yes | Current timeline position in seconds |

**Returns:** void

---

### TextLayer

Renders text box annotations with progressive word-by-word reveal animation.

**Import:**

```javascript
import { TextLayer } from '@ai-annotator/renderer';
```

**Extends:** [BaseLayer](#baselayer)

#### Constructor

Creates a new TextLayer instance.

**Syntax:**

```javascript
new TextLayer(container, viewport)
```

**Parameters:** Same as [BaseLayer constructor](#constructor-3)

**Example:**

```javascript
const layer = new TextLayer(container, viewport);
layer.setAnnotations(textAnnotations);
layer.render();
```

#### render()

Renders text box elements for all annotations.

Creates DOM structure with proper positioning and styling. Initially hidden (visibility controlled by updateTime).

**Syntax:**

```javascript
layer.render()
```

**Returns:** void

#### updateTime()

Updates text box visibility and content based on timeline position.

Shows/hides text boxes based on start time. Calculates visible text for progressive reveal (typing effect).

**Syntax:**

```javascript
layer.updateTime(nowSec)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nowSec | number | Yes | Current timeline position in seconds |

**Returns:** void

---

### DrawingLayer

Renders ink/drawing annotations on HTML canvas with progressive stroke animation.

**Import:**

```javascript
import { DrawingLayer } from '@ai-annotator/renderer';
```

**Extends:** [BaseLayer](#baselayer)

**Features:**
- Progressive stroke drawing point-by-point
- Multiple strokes per annotation with custom colors/sizes
- Device pixel ratio handling for Retina displays
- Smooth 60fps animation with requestAnimationFrame

#### Constructor

Creates a new DrawingLayer instance.

**Syntax:**

```javascript
new DrawingLayer(container, viewport)
```

**Parameters:** Same as [BaseLayer constructor](#constructor-3)

**Example:**

```javascript
const layer = new DrawingLayer(container, viewport);
layer.setAnnotations(inkAnnotations);
layer.updateTime(0);
```

#### setViewport()

Updates viewport dimensions and resizes canvas.

Reconfigures canvas buffer and display size with device pixel ratio scaling.

**Syntax:**

```javascript
layer.setViewport(viewport)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| viewport | Object | Yes | New viewport dimensions |
| viewport.width | number | Yes | Viewport width in pixels |
| viewport.height | number | Yes | Viewport height in pixels |
| viewport.scale | number | Yes | PDF scale/zoom level |

**Returns:** void

#### updateTime()

Updates timeline position and starts progressive stroke drawing.

Starts requestAnimationFrame loop to redraw canvas with strokes progressively drawn. Each frame clears canvas and redraws all visible strokes.

**Syntax:**

```javascript
layer.updateTime(nowSec)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nowSec | number | Yes | Current timeline position in seconds |

**Returns:** void

**Throws:**
- `Error` - If called after layer is destroyed

---

## Framework Adapters

### AnnotPdf (React)

Declarative React component for PDF annotation rendering. Wraps AnnotationRenderer core engine.

**Import:**

```javascript
import { AnnotPdf } from '@ai-annotator/renderer';
```

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| pdfUrl | string | Yes | - | PDF document URL |
| page | number | No | 1 | Current page number (1-indexed) |
| scale | number | No | 1.5 | Zoom scale factor |
| annotations | Array | No | [] | Annotation data array |
| currentTime | number | No | 0 | Timeline position in seconds |
| onLoad | Function | No | - | Callback when PDF loads |
| onError | Function | No | - | Callback on error |
| onPageChange | Function | No | - | Callback when page changes |
| className | string | No | - | CSS class for container div |
| style | Object | No | - | Inline styles for container div |
| canvasStyle | Object | No | - | Inline styles for canvas element |

#### Callbacks

**onLoad**

Called when PDF loads successfully.

**Signature:** `(result: { pageCount: number }) => void`

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| result | Object | Load result |
| result.pageCount | number | Number of pages in PDF |

**Example:**

```jsx
<AnnotPdf
  pdfUrl="/document.pdf"
  onLoad={({ pageCount }) => console.log('Pages:', pageCount)}
/>
```

**onError**

Called when an error occurs.

**Signature:** `(error: Error) => void`

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| error | Error | Error object |

**Example:**

```jsx
<AnnotPdf
  pdfUrl="/document.pdf"
  onError={(error) => console.error('Error:', error.message)}
/>
```

**onPageChange**

Called when page successfully changes.

**Signature:** `(page: number) => void`

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | New page number |

**Example:**

```jsx
<AnnotPdf
  pdfUrl="/document.pdf"
  page={currentPage}
  onPageChange={(page) => console.log('Page:', page)}
/>
```

#### Example Usage

**Basic Usage:**

```jsx
import { AnnotPdf } from '@ai-annotator/renderer';

function PdfViewer() {
  return (
    <AnnotPdf
      pdfUrl="/document.pdf"
      page={1}
      scale={1.5}
    />
  );
}
```

**With Annotations:**

```jsx
import { AnnotPdf } from '@ai-annotator/renderer';
import { useState } from 'react';

function AnnotatedPdfViewer() {
  const [page, setPage] = useState(1);

  const annotations = [
    {
      type: 'highlight',
      page: 1,
      start: 2.0,
      end: 5.0,
      quads: [{ x: 0.1, y: 0.2, w: 0.8, h: 0.05 }],
      style: { color: 'rgba(255,255,0,0.3)' }
    }
  ];

  return (
    <div>
      <AnnotPdf
        pdfUrl="/document.pdf"
        page={page}
        scale={1.5}
        annotations={annotations}
      />
      <button onClick={() => setPage(page - 1)}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}
```

**With Audio Synchronization:**

```jsx
import { AnnotPdf } from '@ai-annotator/renderer';
import { useState } from 'react';

function AudioSyncViewer() {
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div>
      <AnnotPdf
        pdfUrl="/lecture.pdf"
        page={1}
        scale={1.5}
        annotations={annotations}
        currentTime={currentTime}
      />
      <audio
        src="/lecture.mp3"
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        controls
      />
    </div>
  );
}
```

---

## Utilities

### coordinateUtils

Coordinate transformation utilities for converting between normalized (0-1) and absolute pixel coordinates.

**Import:**

```javascript
import { coordinateUtils } from '@ai-annotator/renderer';
// Or import individual functions:
import { rectNormToAbs, pointNormToAbs } from '@ai-annotator/renderer';
```

#### rectNormToAbs()

Converts normalized rectangle to absolute pixel coordinates.

**Syntax:**

```javascript
const absolute = rectNormToAbs(rect, viewport)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| rect | Object | Normalized rectangle (0-1) |
| rect.x | number | Left position (0-1) |
| rect.y | number | Top position (0-1) |
| rect.w | number | Width (0-1) |
| rect.h | number | Height (0-1) |
| viewport | Object | Viewport dimensions in pixels |
| viewport.width | number | Viewport width |
| viewport.height | number | Viewport height |

**Returns:** Object - Absolute coordinates in pixels

| Property | Type | Description |
|----------|------|-------------|
| left | number | Left position in pixels |
| top | number | Top position in pixels |
| width | number | Width in pixels |
| height | number | Height in pixels |

**Example:**

```javascript
const rect = { x: 0.1, y: 0.2, w: 0.5, h: 0.3 };
const viewport = { width: 1000, height: 1400 };
const absolute = rectNormToAbs(rect, viewport);
// Returns: { left: 100, top: 280, width: 500, height: 420 }
```

#### pointNormToAbs()

Converts normalized point to absolute pixel coordinates.

**Syntax:**

```javascript
const absolute = pointNormToAbs(point, viewport)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| point | Object | Normalized point (0-1) |
| point.x | number | X position (0-1) |
| point.y | number | Y position (0-1) |
| viewport | Object | Viewport dimensions in pixels |
| viewport.width | number | Viewport width |
| viewport.height | number | Viewport height |

**Returns:** Object - Absolute coordinates in pixels

| Property | Type | Description |
|----------|------|-------------|
| x | number | X position in pixels |
| y | number | Y position in pixels |

**Example:**

```javascript
const point = { x: 0.5, y: 0.5 };
const viewport = { width: 1000, height: 1400 };
const absolute = pointNormToAbs(point, viewport);
// Returns: { x: 500, y: 700 }
```

---

### viewportUtils

Viewport calculation utilities for PDF rendering.

**Import:**

```javascript
import { viewportUtils } from '@ai-annotator/renderer';
// Or import individual functions:
import { calculateViewport, getViewportDimensions } from '@ai-annotator/renderer';
```

#### calculateViewport()

Calculates viewport from PDF page with specified scale.

**Syntax:**

```javascript
const viewport = calculateViewport(page, scale)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | Object | PDF.js page object |
| scale | number | Scale factor for rendering |

**Returns:** Object - Viewport object with dimensions and transform matrix

**Throws:**
- `Error` - If page object is not provided

**Example:**

```javascript
const viewport = calculateViewport(pdfPage, 1.5);
// Returns viewport with width, height, scale, and transform matrix
```

#### getViewportDimensions()

Extracts width and height from viewport object.

**Syntax:**

```javascript
const dimensions = getViewportDimensions(viewport)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| viewport | Object | Viewport object from PDF.js |

**Returns:** Object - Dimensions object

| Property | Type | Description |
|----------|------|-------------|
| width | number | Viewport width |
| height | number | Viewport height |

**Example:**

```javascript
const { width, height } = getViewportDimensions(viewport);
```

#### calculateScaledDimensions()

Calculates dimensions for a given scale factor.

**Syntax:**

```javascript
const scaled = calculateScaledDimensions(baseWidth, baseHeight, scale)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| baseWidth | number | Original width |
| baseHeight | number | Original height |
| scale | number | Scale factor |

**Returns:** Object - Scaled dimensions

| Property | Type | Description |
|----------|------|-------------|
| width | number | Scaled width |
| height | number | Scaled height |

**Example:**

```javascript
const scaled = calculateScaledDimensions(800, 1000, 1.5);
// Returns: { width: 1200, height: 1500 }
```

---

## Type Validators

### normalizeAnnotationArray()

Entry point for normalizing complete annotation arrays. Validates and fixes annotation data, replacing invalid values with safe defaults.

**Import:**

```javascript
import { normalizeAnnotationArray } from '@ai-annotator/renderer';
```

**Syntax:**

```javascript
const result = normalizeAnnotationArray(rawAnnotations, options)
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| rawAnnotations | Array | Yes | - | Array of user-provided annotation objects |
| options | Object | No | {} | Configuration object |
| options.skipInvalid | boolean | No | true | Skip critically invalid annotations |
| options.warnInConsole | boolean | No | true | Log warnings to console |
| options.onWarning | Function | No | null | Custom warning callback |

**Returns:** Object - Normalization result

| Property | Type | Description |
|----------|------|-------------|
| normalized | Array | Successfully normalized annotations |
| warnings | Array\<string\> | Warning messages for recovered issues |
| info | Array\<string\> | Informational messages |
| skipped | Array\<Object\> | Critically invalid annotations that were skipped |

**Example:**

```javascript
const rawAnnotations = [
  {
    type: 'text',
    page: 1,
    x: 0.1,
    y: 0.2,
    w: 0.3,
    h: 0.1,
    content: 'Hello World'
    // Missing: id, start, end, style
  }
];

const result = normalizeAnnotationArray(rawAnnotations);
console.log('Normalized:', result.normalized);
console.log('Warnings:', result.warnings);
// Normalized annotation will have auto-generated id, default times, default style
```

**With Options:**

```javascript
const result = normalizeAnnotationArray(rawAnnotations, {
  skipInvalid: true,
  warnInConsole: true,
  onWarning: (result) => {
    // Send to monitoring service
    analytics.track('annotation_validation', {
      warnings: result.warnings.length,
      skipped: result.skipped.length
    });
  }
});
```

---

### Field Normalizers

Low-level normalization functions for individual field values. Exported for advanced use cases.

**Import:**

```javascript
import {
  normalizeCoordinate,
  normalizeColor,
  normalizePositiveNumber
} from '@ai-annotator/renderer';
```

#### normalizeCoordinate()

Normalizes coordinate value to 0-1 range.

**Syntax:**

```javascript
const normalized = normalizeCoordinate(value, defaultValue, id, fieldName, warnings)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| value | any | Value to normalize |
| defaultValue | number | Fallback value if invalid |
| id | string | Annotation ID for warning messages |
| fieldName | string | Field name for warning messages |
| warnings | Array\<string\> | Array to collect warning messages |

**Returns:** number - Normalized coordinate in range [0, 1]

**Example:**

```javascript
const warnings = [];
const x = normalizeCoordinate(5, 0.1, 'txt-1', 'x', warnings);
// Returns: 1 (clamped)
// warnings: ["[txt-1]: Field "x" value 5 exceeds range [0,1], clamping to 1"]
```

#### normalizeColor()

Normalizes color string. Supports hex, rgb/rgba, and named colors.

**Syntax:**

```javascript
const normalized = normalizeColor(value, defaultValue, id, warnings)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| value | any | Color value to normalize |
| defaultValue | string | Fallback color if invalid |
| id | string | Annotation ID for warning messages |
| warnings | Array\<string\> | Array to collect warning messages |

**Returns:** string - Valid color string

**Example:**

```javascript
const warnings = [];
const color = normalizeColor('#fff', '#000', 'txt-1', warnings);
// Returns: '#fff'

const invalid = normalizeColor('notacolor', '#000', 'txt-1', warnings);
// Returns: '#000'
// warnings: ["[txt-1]: Invalid color format "notacolor", using default #000"]
```

#### normalizePositiveNumber()

Normalizes positive number values.

**Syntax:**

```javascript
const normalized = normalizePositiveNumber(value, defaultValue, id, fieldName, warnings)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| value | any | Value to normalize |
| defaultValue | number | Fallback value if invalid |
| id | string | Annotation ID for warning messages |
| fieldName | string | Field name for warning messages |
| warnings | Array\<string\> | Array to collect warning messages |

**Returns:** number - Positive number

**Example:**

```javascript
const warnings = [];
const size = normalizePositiveNumber(5, 3, 'ink-1', 'size', warnings);
// Returns: 5

const invalid = normalizePositiveNumber(-1, 3, 'ink-1', 'size', warnings);
// Returns: 3
// warnings: ["[ink-1]: Field "size" invalid value "-1", using default 3"]
```

---

## Type Definitions

For annotation data format specifications, see [ANNOTATION_FORMAT.md](ANNOTATION_FORMAT.md).

For system architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Version

**Library:** @ai-annotator/renderer
**Version:** 0.1.0
**Last Updated:** 2025-10-14
