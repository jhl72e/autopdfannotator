# @ai-annotator/renderer

[![npm version](https://badge.fury.io/js/@ai-annotator%2Frenderer.svg)](https://www.npmjs.com/package/@ai-annotator/renderer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A framework-agnostic PDF annotation renderer with timeline synchronization for educational content, interactive presentations, and annotated documents.

This library renders structured annotation data (highlights, text boxes, drawings) on top of PDF documents, synchronized with audio or video timelines. Built on pdf.js with a clean, modern API.

## Features

- 📄 **PDF Rendering** - Built on pdf.js for reliable PDF display
- ⏱️ **Timeline Synchronization** - Sync annotations with audio/video playback
- 🎨 **Multiple Annotation Types** - Highlights, text boxes, and ink drawings
- ⚛️ **Framework Agnostic** - Core engine works with any framework
- ⚛️ **React Adapter** - Ready-to-use React component included
- 🎯 **Progressive Animations** - Smooth reveal animations based on timeline
- 📦 **Simple Setup** - One-line worker configuration
- 🌲 **Tree-shakeable** - Import only what you need

## Installation

```bash
npm install @ai-annotator/renderer
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
import { AnnotationRenderer } from "@ai-annotator/renderer";
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
await renderer.loadPDF("/path/to/document.pdf");

// Set annotations
renderer.setAnnotations([
  {
    id: "1",
    type: "highlight",
    page: 1,
    start: 0,
    end: 5,
    quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
    style: { color: "rgba(255, 255, 0, 0.3)" },
  },
]);

// Update timeline position
renderer.updateTimeline(2.5); // seconds
```

## Quick Start - React

```javascript
import { AnnotPdf } from "@ai-annotator/renderer";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker (call once at app startup)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function App() {
  const [currentTime, setCurrentTime] = useState(0);

  const annotations = [
    {
      id: "1",
      type: "highlight",
      page: 1,
      start: 0,
      end: 5,
      quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
      style: { color: "rgba(255, 255, 0, 0.3)" },
    },
  ];

  return (
    <AnnotPdf
      pdfUrl="/path/to/document.pdf"
      annotations={annotations}
      currentTime={currentTime}
      page={1}
      scale={1.0}
      width={800}
      height={600}
    />
  );
}
```

## Documentation

- [Full API Reference](https://github.com/jhl72e/pdfAutoAnnotator/blob/main/docs/API.md)
- [Annotation Data Format](https://github.com/jhl72e/pdfAutoAnnotator/blob/main/docs/ANNOTATION_FORMAT.md)
- [Examples](https://github.com/jhl72e/pdfAutoAnnotator/tree/main/examples)

## Browser Compatibility

Works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires:

- ES6+ support
- Canvas API
- Web Workers

## Examples

Check out the [examples directory](https://github.com/jhl72e/pdfAutoAnnotator/tree/main/examples) for complete working examples:

- Vanilla JavaScript
- React with timeline sync
- React with audio integration

## License

MIT © [jhl72e]
