# web-annotation-renderer

[![npm version](https://badge.fury.io/js/web-annotation-renderer.svg)](https://www.npmjs.com/package/web-annotation-renderer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A framework-agnostic PDF annotation renderer with timeline synchronization for educational content, interactive presentations, and annotated documents.

This library renders structured annotation data (highlights, text boxes, drawings) on top of PDF documents, synchronized with audio or video timelines. Built on pdf.js with a clean, modern API.

## Features

- 📄 **PDF Rendering** - Built on pdf.js for reliable PDF display
- ⏱️ **Timeline Synchronization** - Sync annotations with audio/video playback or manual controls
- 🎨 **Multiple Annotation Types** - Highlights, text boxes, and ink drawings
- ⚛️ **Framework Agnostic** - Core engine works with any framework
- ⚛️ **React Adapter** - Ready-to-use React component included
- 🎯 **Progressive Animations** - Smooth reveal animations based on timeline
- 🎬 **Continuous Sync** - Built-in support for real-time audio/video synchronization
- 📦 **Simple Setup** - One-line worker configuration
- 🌲 **Tree-shakeable** - Import only what you need
- ⚡ **Performance Optimized** - Efficient rendering without unnecessary re-draws

## Installation

```bash
npm install web-annotation-renderer
```

**Requirements:**

- Node.js >= 18
- React 18 or 19 (only if using React adapter)

## Worker Configuration

**Important:** Before using the library, configure the PDF.js worker in your application:

```javascript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
```

This must be done once at application startup, before using any PDF functionality.

## Quick Start - Vanilla JavaScript

```javascript
import { AnnotationRenderer } from "web-annotation-renderer";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker (call once at app startup)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Create renderer instance
const renderer = new AnnotationRenderer({
  container: document.getElementById("annotation-container"),
  canvasElement: document.getElementById("pdf-canvas"),
});

// Load PDF
const result = await renderer.loadPDF("/path/to/document.pdf");
if (result.success) {
  console.log(`PDF loaded with ${result.pageCount} pages`);
}

// Set annotations
renderer.setAnnotations([
  {
    id: "1",
    type: "highlight",
    page: 1,
    start: 0,
    end: 5,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
    style: { color: "rgba(255, 255, 0, 0.3)" },
  },
]);

// Set initial page and scale
await renderer.setPage(1);
await renderer.setScale(1.0);

// Update timeline position
renderer.setTime(2.5); // seconds
```

## Quick Start - React

```javascript
import { useState } from "react";
import { AnnotPdf } from "web-annotation-renderer";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker (call once at app startup)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const annotations = [
    {
      id: "1",
      type: "highlight",
      page: 1,
      start: 0,
      end: 5,
      mode: "quads",
      quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
      style: { color: "rgba(255, 255, 0, 0.3)" },
    },
  ];

  const handleLoad = (pdfDocument) => {
    setTotalPages(pdfDocument.pageCount);
    console.log(`PDF loaded with ${pdfDocument.pageCount} pages`);
  };

  const handleError = (error) => {
    console.error("PDF Error:", error);
  };

  return (
    <AnnotPdf
      pdfUrl="/path/to/document.pdf"
      annotations={annotations}
      currentTime={currentTime}
      page={page}
      scale={1.5}
      onLoad={handleLoad}
      onError={handleError}
      onPageChange={setPage}
    />
  );
}
```

## Audio/Video Synchronization

For smooth, real-time synchronization with audio or video playback, use the continuous sync feature:

### Vanilla JavaScript

```javascript
const renderer = new AnnotationRenderer({
  container: document.getElementById("annotation-container"),
  canvasElement: document.getElementById("pdf-canvas"),
});

await renderer.loadPDF("/document.pdf");
await renderer.setPage(1);

// Get reference to audio/video element
const audioElement = document.getElementById("lecture-audio");

// Start continuous sync when playback begins
audioElement.addEventListener("play", () => {
  renderer.timelineSync.startContinuousSync(() => audioElement.currentTime);
});

// Stop continuous sync when playback pauses
audioElement.addEventListener("pause", () => {
  renderer.timelineSync.stopContinuousSync();
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
  renderer.timelineSync.stopContinuousSync();
  renderer.destroy();
});
```

### React

```javascript
import { useRef, useEffect } from "react";
import { AnnotPdf } from "web-annotation-renderer";

function VideoSyncViewer() {
  const audioRef = useRef(null);
  const engineRef = useRef(null);

  // Access the internal engine through the component
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      // Start continuous sync at 60fps
      if (engineRef.current) {
        engineRef.current.timelineSync.startContinuousSync(
          () => audio.currentTime
        );
      }
    };

    const handlePause = () => {
      // Stop continuous sync
      if (engineRef.current) {
        engineRef.current.timelineSync.stopContinuousSync();
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      engineRef.current?.timelineSync.stopContinuousSync();
    };
  }, []);

  return (
    <div>
      <AnnotPdf
        ref={engineRef}
        pdfUrl="/lecture.pdf"
        annotations={annotations}
        onLoad={(doc) => console.log("PDF loaded")}
      />
      <audio ref={audioRef} src="/lecture.mp3" controls />
    </div>
  );
}
```

**How it works:**
- `startContinuousSync()` creates a 60fps requestAnimationFrame loop
- Each frame reads the current time from your callback function
- Annotations update smoothly in sync with playback
- `stopContinuousSync()` stops the loop to save resources when paused

**For manual controls** (sliders, buttons), simply use `renderer.setTime()` or the `currentTime` prop - continuous sync is not needed.

## API Reference

### AnnotationRenderer Class

#### Constructor

```javascript
const renderer = new AnnotationRenderer(config);
```

**Configuration Options:**

| Property        | Type              | Required | Default | Description                            |
| --------------- | ----------------- | -------- | ------- | -------------------------------------- |
| `container`     | HTMLElement       | ✅ Yes   | -       | DOM element for annotation layers      |
| `canvasElement` | HTMLCanvasElement | ✅ Yes   | -       | Canvas element for PDF rendering       |
| `pdfUrl`        | string            | No       | `null`  | PDF URL to auto-load on initialization |
| `initialPage`   | number            | No       | `1`     | Initial page number to display         |
| `initialScale`  | number            | No       | `1.0`   | Initial zoom/scale factor              |
| `annotations`   | Array             | No       | `[]`    | Initial annotation data                |

**Example:**

```javascript
const renderer = new AnnotationRenderer({
  container: document.getElementById("annotation-container"),
  canvasElement: document.getElementById("pdf-canvas"),
  pdfUrl: "/document.pdf", // Optional: auto-load
  initialPage: 1,
  initialScale: 1.5,
  annotations: [],
});
```

#### Methods

##### `loadPDF(url)`

Load a PDF document from URL.

```javascript
const result = await renderer.loadPDF("/path/to/document.pdf");
```

**Parameters:**

- `url` (string): URL or path to PDF file

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,      // Whether loading succeeded
  pageCount?: number,    // Number of pages (if successful)
  error?: string         // Error message (if failed)
}
```

##### `setPage(pageNum)`

Navigate to a specific page.

```javascript
const result = await renderer.setPage(2);
```

**Parameters:**

- `pageNum` (number): Page number (1-indexed)

**Returns:** `Promise<Object>`

```javascript
{
  success: boolean,
  viewport?: Object,     // Viewport dimensions (if successful)
  error?: string         // Error message (if failed)
}
```

##### `setScale(scale)`

Change the zoom level.

```javascript
const result = await renderer.setScale(1.5);
```

**Parameters:**

- `scale` (number): Scale factor (e.g., 0.5, 1.0, 1.5, 2.0)

**Returns:** `Promise<Object>` - Same structure as `setPage()`

##### `setAnnotations(annotations)`

Update the annotation data.

```javascript
renderer.setAnnotations(annotationsArray);
```

**Parameters:**

- `annotations` (Array): Array of annotation objects

**Returns:** `void`

##### `setTime(timestamp)`

Update the timeline position for animation synchronization.

```javascript
renderer.setTime(5.2); // 5.2 seconds
```

**Parameters:**

- `timestamp` (number): Current timeline position in seconds

**Returns:** `void`

##### `getState()`

Get the current renderer state.

```javascript
const state = renderer.getState();
```

**Returns:** `Object`

```javascript
{
  page: number,           // Current page number
  scale: number,          // Current scale factor
  annotations: Array,     // Current annotations array
  pageCount: number,      // Total page count
  time: number,          // Current timeline position
  viewport: Object|null, // Current viewport dimensions
  pdfUrl: string|null    // Current PDF URL
}
```

##### `destroy()`

Clean up all resources and subsystems.

```javascript
renderer.destroy();
```

**Returns:** `void`

**Important:** Call this before removing the renderer instance to prevent memory leaks.

---

### TimelineSync API

The `AnnotationRenderer` exposes a `timelineSync` property for advanced timeline control.

#### `timelineSync.startContinuousSync(getTimeFunction)`

Start continuous timeline synchronization with audio/video.

```javascript
renderer.timelineSync.startContinuousSync(() => audioElement.currentTime);
```

**Parameters:**

- `getTimeFunction` (Function): Callback that returns current time in seconds

**Returns:** `void`

**Details:** Creates a 60fps requestAnimationFrame loop that continuously reads time from the callback and updates annotations. Use this for smooth audio/video synchronization.

#### `timelineSync.stopContinuousSync()`

Stop continuous timeline synchronization.

```javascript
renderer.timelineSync.stopContinuousSync();
```

**Returns:** `void`

**Important:** Always call this when audio/video pauses or when cleaning up to prevent unnecessary rendering.

#### `timelineSync.getCurrentTime()`

Get the current timeline position.

```javascript
const currentTime = renderer.timelineSync.getCurrentTime();
```

**Returns:** `number` - Current timeline position in seconds

#### `timelineSync.subscribe(callback)`

Subscribe to timeline updates.

```javascript
const unsubscribe = renderer.timelineSync.subscribe((time) => {
  console.log("Timeline updated:", time);
});

// Later: unsubscribe
unsubscribe();
```

**Parameters:**

- `callback` (Function): Called when timeline updates with current time

**Returns:** `Function` - Unsubscribe function

---

### AnnotPdf Component (React)

#### Props

```javascript
<AnnotPdf
  pdfUrl={string}
  page={number}
  scale={number}
  annotations={array}
  currentTime={number}
  onLoad={function}
  onError={function}
  onPageChange={function}
  className={string}
  style={object}
  canvasStyle={object}
/>
```

**Prop Reference:**

| Prop           | Type     | Required | Default | Description                                  |
| -------------- | -------- | -------- | ------- | -------------------------------------------- |
| `pdfUrl`       | string   | ✅ Yes   | -       | URL or path to PDF file                      |
| `page`         | number   | No       | `1`     | Current page number (1-indexed)              |
| `scale`        | number   | No       | `1.5`   | Zoom level / scale factor                    |
| `annotations`  | Array    | No       | `[]`    | Array of annotation objects                  |
| `currentTime`  | number   | No       | `0`     | Current timeline position in seconds         |
| `onLoad`       | function | No       | -       | Callback when PDF loads: `(doc) => void`     |
| `onError`      | function | No       | -       | Callback on error: `(error) => void`         |
| `onPageChange` | function | No       | -       | Callback on page change: `(pageNum) => void` |
| `className`    | string   | No       | -       | CSS class for container div                  |
| `style`        | object   | No       | `{}`    | Inline styles for container div              |
| `canvasStyle`  | object   | No       | `{}`    | Inline styles for canvas element             |

**Note:** The component auto-sizes based on PDF dimensions and scale. There are no `width` or `height` props.

**Example with all props:**

```javascript
<AnnotPdf
  pdfUrl="/document.pdf"
  page={currentPage}
  scale={1.5}
  annotations={annotations}
  currentTime={audioTime}
  onLoad={(doc) => setTotalPages(doc.pageCount)}
  onError={(err) => console.error(err)}
  onPageChange={(num) => setCurrentPage(num)}
  className="pdf-viewer"
  style={{ border: "1px solid #ccc" }}
  canvasStyle={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
/>
```

## Annotation Data Format

All annotations use **normalized coordinates** (0-1 range) for positioning, making them resolution-independent.

### Common Fields

All annotation types share these base fields:

| Field   | Type   | Required | Description                                          |
| ------- | ------ | -------- | ---------------------------------------------------- |
| `id`    | string | ✅ Yes   | Unique identifier for the annotation                 |
| `type`  | string | ✅ Yes   | Annotation type: `"highlight"`, `"text"`, or `"ink"` |
| `page`  | number | ✅ Yes   | Page number (1-indexed)                              |
| `start` | number | ✅ Yes   | Timeline start time in seconds                       |
| `end`   | number | ✅ Yes   | Timeline end time in seconds                         |

---

### Highlight Annotations

Highlights rectangular regions on the PDF with progressive reveal animation.

**Type:** `"highlight"`

**Structure:**

```javascript
{
  id: "highlight-1",
  type: "highlight",
  page: 1,
  start: 0,
  end: 5,
  mode: "quads",  // ✅ REQUIRED - must be "quads"
  quads: [
    { x: 0.1, y: 0.2, w: 0.3, h: 0.05 },  // First quad
    { x: 0.1, y: 0.25, w: 0.35, h: 0.05 }  // Second quad (optional)
  ],
  style: {
    color: "rgba(255, 255, 0, 0.3)"  // Highlight color
  }
}
```

**Fields:**

| Field         | Type   | Required | Description                                        |
| ------------- | ------ | -------- | -------------------------------------------------- |
| `mode`        | string | ✅ Yes   | Must be `"quads"`                                  |
| `quads`       | Array  | ✅ Yes   | Array of quad objects defining highlighted regions |
| `quads[].x`   | number | ✅ Yes   | Left position (0-1, normalized)                    |
| `quads[].y`   | number | ✅ Yes   | Top position (0-1, normalized)                     |
| `quads[].w`   | number | ✅ Yes   | Width (0-1, normalized)                            |
| `quads[].h`   | number | ✅ Yes   | Height (0-1, normalized)                           |
| `style.color` | string | ✅ Yes   | CSS color for highlight                            |

**Animation:** Highlights reveal progressively from left to right across all quads during the `start` to `end` timeline.

**Example:**

```javascript
{
  id: "hl-1",
  type: "highlight",
  page: 1,
  start: 2.0,
  end: 7.0,
  mode: "quads",
  quads: [
    { x: 0.1, y: 0.3, w: 0.4, h: 0.05 }
  ],
  style: {
    color: "rgba(255, 255, 0, 0.4)"
  }
}
```

---

### Text Annotations

Display text boxes with progressive typing animation.

**Type:** `"text"`

**Structure:**

```javascript
{
  id: "text-1",
  type: "text",
  page: 1,
  start: 3,
  end: 8,
  content: "This is the annotation text content",
  x: 0.5,   // Left position (normalized)
  y: 0.2,   // Top position (normalized)
  w: 0.3,   // Width (normalized)
  h: 0.1,   // Height (normalized)
  style: {
    bg: "rgba(255, 255, 255, 0.95)",    // Background color
    color: "#1f2937"                     // Text color
  }
}
```

**Fields:**

| Field         | Type   | Required | Default                   | Description                     |
| ------------- | ------ | -------- | ------------------------- | ------------------------------- |
| `content`     | string | ✅ Yes   | -                         | Text to display                 |
| `x`           | number | ✅ Yes   | -                         | Left position (0-1, normalized) |
| `y`           | number | ✅ Yes   | -                         | Top position (0-1, normalized)  |
| `w`           | number | ✅ Yes   | -                         | Width (0-1, normalized)         |
| `h`           | number | ✅ Yes   | -                         | Height (0-1, normalized)        |
| `style.bg`    | string | No       | `"rgba(255,255,255,0.9)"` | Background color                |
| `style.color` | string | No       | `"#1f2937"`               | Text color                      |

**Animation:** Text appears word-by-word with a typing effect during the `start` to `end` timeline.

**Example:**

```javascript
{
  id: "txt-1",
  type: "text",
  page: 1,
  start: 5.0,
  end: 12.0,
  content: "Important concept to remember",
  x: 0.6,
  y: 0.4,
  w: 0.25,
  h: 0.08,
  style: {
    bg: "rgba(255, 255, 200, 0.95)",
    color: "#0066cc"
  }
}
```

---

### Ink Annotations

Draw strokes/paths with progressive reveal animation.

**Type:** `"ink"`

**Structure:**

```javascript
{
  id: "ink-1",
  type: "ink",
  page: 1,
  start: 10,
  end: 15,
  strokes: [
    {
      color: "rgb(255, 0, 0)",
      size: 3,
      points: [
        { t: 0.0, x: 0.2, y: 0.5 },
        { t: 0.5, x: 0.3, y: 0.45 },
        { t: 1.0, x: 0.4, y: 0.5 }
      ]
    }
  ]
}
```

**Fields:**

| Field              | Type   | Required | Default     | Description                          |
| ------------------ | ------ | -------- | ----------- | ------------------------------------ |
| `strokes`          | Array  | ✅ Yes   | -           | Array of stroke objects              |
| `strokes[].color`  | string | No       | `"#1f2937"` | CSS color for stroke                 |
| `strokes[].size`   | number | No       | `3`         | Line width in pixels                 |
| `strokes[].points` | Array  | ✅ Yes   | -           | Array of point objects               |
| `points[].t`       | number | ✅ Yes   | -           | Time within stroke (0-1, normalized) |
| `points[].x`       | number | ✅ Yes   | -           | X position (0-1, normalized)         |
| `points[].y`       | number | ✅ Yes   | -           | Y position (0-1, normalized)         |

**Important:**

- Each point **must have a `t` parameter** representing its position in time within the stroke (0-1 range)
- The `t` values are used for progressive drawing animation
- Points should be ordered by increasing `t` values

**Animation:** Strokes are drawn progressively based on the `t` parameter of each point during the `start` to `end` timeline.

**Example:**

```javascript
{
  id: "ink-1",
  type: "ink",
  page: 1,
  start: 8.0,
  end: 13.0,
  strokes: [
    {
      color: "rgb(255, 0, 0)",
      size: 2,
      points: [
        { t: 0.0, x: 0.2, y: 0.4 },
        { t: 0.25, x: 0.25, y: 0.38 },
        { t: 0.5, x: 0.3, y: 0.4 },
        { t: 0.75, x: 0.35, y: 0.42 },
        { t: 1.0, x: 0.4, y: 0.4 }
      ]
    },
    {
      color: "rgb(255, 0, 0)",
      size: 2,
      points: [
        { t: 0.0, x: 0.22, y: 0.45 },
        { t: 1.0, x: 0.38, y: 0.45 }
      ]
    }
  ]
}
```

---

### Coordinate System

All position and size values use **normalized coordinates** (0-1 range):

- `0` = left edge / top edge
- `1` = right edge / bottom edge
- `0.5` = center

**Example:** `x: 0.1, y: 0.2, w: 0.3, h: 0.05` means:

- Starts at 10% from left, 20% from top
- Width is 30% of page width
- Height is 5% of page height

This makes annotations resolution-independent and responsive to different screen sizes.

---

### Complete Example

```javascript
const annotations = [
  // Highlight
  {
    id: "h1",
    type: "highlight",
    page: 1,
    start: 0,
    end: 5,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
    style: { color: "rgba(255, 255, 0, 0.4)" },
  },

  // Text
  {
    id: "t1",
    type: "text",
    page: 1,
    start: 3,
    end: 8,
    content: "Key concept here",
    x: 0.6,
    y: 0.2,
    w: 0.25,
    h: 0.08,
    style: {
      bg: "rgba(255, 255, 255, 0.95)",
      color: "#0066cc",
    },
  },

  // Ink
  {
    id: "i1",
    type: "ink",
    page: 1,
    start: 6,
    end: 10,
    strokes: [
      {
        color: "rgb(255, 0, 0)",
        size: 3,
        points: [
          { t: 0.0, x: 0.2, y: 0.5 },
          { t: 0.5, x: 0.3, y: 0.45 },
          { t: 1.0, x: 0.4, y: 0.5 },
        ],
      },
    ],
  },
];
```

## Browser Compatibility

Works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires:

- ES6+ support
- Canvas API
- Web Workers

## Troubleshooting

### Annotations not appearing

**Symptoms:** PDF renders but annotations don't show when moving timeline

**Solutions:**

1. Check that highlight annotations include `mode: "quads"` field
2. Verify text annotations use `type: "text"` (not `"textBox"`)
3. Ensure ink annotation points have `t` parameter
4. Check browser console for validation warnings
5. Verify timeline position is within annotation `start`/`end` range

### Worker errors

**Symptoms:** "Setting up fake worker" or worker-related errors

**Solution:** Ensure PDF.js worker is configured before using the library:

```javascript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
```

### Type errors with React

**Symptoms:** TypeScript errors about missing props

**Solution:** Install React type definitions:

```bash
npm install --save-dev @types/react @types/react-dom
```

### Timeline updates feel sluggish

**Symptoms:** Annotations don't update smoothly when dragging timeline slider

**Solution:**
- For manual controls (sliders, buttons): Use `renderer.setTime()` or the `currentTime` prop directly - the system is optimized for discrete updates
- For audio/video: Use `timelineSync.startContinuousSync()` for smooth 60fps synchronization

## Migration Guide

If you're upgrading from documentation examples that used the old format:

### Breaking Changes

1. **Package name:** `@ai-annotator/renderer` → `web-annotation-renderer`
2. **Method name:** `renderer.updateTimeline()` → `renderer.setTime()`
3. **Highlight annotations:** Must include `mode: "quads"` field
4. **Text annotations:** Use `type: "text"` (not `"textBox"`), `content` (not `text`), flat coordinates, and `style.bg`/`style.color`
5. **Ink annotations:** Use `strokes` (not `paths`), `size` (not `width`), and points must have `t` parameter

### Quick Migration

```javascript
// OLD (won't work)
import { AnnotationRenderer } from "@ai-annotator/renderer";
renderer.updateTimeline(5.0);

// NEW (correct)
import { AnnotationRenderer } from "web-annotation-renderer";
renderer.setTime(5.0);
```

## Additional Resources

- [GitHub Repository](https://github.com/jhl72e/pdfAutoAnnotator)
- [Issue Tracker](https://github.com/jhl72e/pdfAutoAnnotator/issues)
- [Changelog](CHANGELOG.md)

## Examples

Check out working examples in the test projects:

- **Vanilla JavaScript:** See `examples/vanilla-js/` for a complete implementation with manual timeline control
- **React:** See `examples/react-basic/` for React component usage with slider controls

Both examples include:

- PDF loading and rendering
- Page navigation and zoom controls
- Timeline slider with annotation synchronization
- All three annotation types (highlight, text, ink)
- Optimized rendering for smooth, flicker-free updates

**Use Cases:**
- **Manual timeline control** (sliders, buttons): Use `setTime()` for discrete updates
- **Audio/video sync**: Use `timelineSync.startContinuousSync()` for continuous 60fps updates

## License

MIT © [jhl72e]
