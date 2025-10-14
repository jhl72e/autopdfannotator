# Dynamic PDF Annotation Renderer System - Outline

---

## What This Document Is

This document describes the Dynamic PDF Annotation Renderer System at a semantic level. This system is a frontend library that renders structured annotation data on PDF documents with timeline synchronization for web applications.

---

## Purpose

### What This System Is

This system is a complete PDF viewer library that displays annotations on top of PDF documents. The system renders annotations dynamically based on timeline positions, enabling synchronized educational content, presentations, and interactive documents.

### What This System Does

The system receives structured annotation data and renders it visually on PDF pages. Users provide PDF URLs and pre-structured annotation data. The system displays these annotations synchronized with audio or video timelines.

The system handles:

- PDF document rendering using pdf.js
- Overlay annotation layers on top of PDF canvas
- Timeline-based progressive animation of annotations
- Page navigation and zoom controls
- Multiple annotation types (highlights, text boxes, drawings)

### Why This System Is Needed

Educational platforms, corporate training applications, and e-learning systems need to display annotations on PDF documents synchronized with narration or video. These applications generate or fetch annotation data from various sources (AI services, databases, manual creation tools) and need a reliable way to render them visually.

The system provides a clean, reusable solution that separates annotation rendering from annotation generation and storage. This separation enables the same rendering system to work across multiple projects with different annotation sources.

---

## Scope and Boundaries

### What Is Included

**PDF Rendering:**

- Load and display PDF documents
- Render pages to canvas using pdf.js
- Handle page navigation (previous/next page)
- Support zoom and scale operations
- Manage viewport calculations

**Annotation Rendering:**

- Display highlight annotations with progressive reveal
- Display text box annotations with typing effects
- Display ink/drawing annotations with progressive strokes
- Position annotations using normalized coordinates
- Layer annotations on top of PDF canvas

**Timeline Synchronization:**

- Synchronize annotation display with timeline position
- Progressive animation based on start and end times
- Support audio/video timeline integration
- Efficient frame-by-frame updates

**Framework Integration:**

- React component wrapper for declarative usage
- Vanilla JavaScript API for imperative usage

**Data Validation:**

- Validate annotation data structure
- Check required fields and data types
- Ensure coordinate ranges are valid
- Provide clear error messages for invalid data

### What Is Excluded

**Annotation Generation:**

- AI integration for generating annotations
- OpenAI, Claude, or other LLM services
- Prompt engineering for annotation generation
- PDF text extraction for AI processing
- Business logic for determining annotation placement

**Annotation Storage:**

- Database operations (create, read, update, delete)
- File system operations
- Cloud storage integration (Firebase, Supabase)
- Caching mechanisms
- Data persistence

**Annotation Creation UI:**

- User interfaces for manual annotation creation
- Drawing tools and text input forms
- Highlight selection interfaces
- Annotation editing capabilities

**Backend Operations:**

- Server-side processing
- API endpoints
- Authentication and authorization
- File uploads and downloads

**Static PDF Modification:**

- Writing annotations to PDF files
- PDF binary manipulation
- Screenshot rendering
- MCP server tools (future extension, separate module)

---

## Complete package structure

@ai-annotator/renderer/
│
├── package.json
├── README.md
├── LICENSE
│
├── src/
│ │
│ ├── index.js # Public API (single export point)
│ │
│ ├── core/ # Framework-agnostic business logic
│ │ ├── AnnotationRenderer.js # Main facade/orchestrator
│ │ ├── PDFRenderer.js # PDF.js wrapper
│ │ ├── LayerManager.js # Layer orchestration
│ │ └── TimelineSync.js # Timeline synchronization
│ │
│ ├── layers/ # Annotation rendering layers
│ │ ├── BaseLayer.js # Abstract base class
│ │ ├── HighlightLayer.js # Highlight annotations
│ │ ├── TextLayer.js # Text box annotations
│ │ ├── DrawingLayer.js # Ink/drawing annotations
│ │ └── index.js
│ │
│ ├── adapters/ # Framework wrappers
│ │ ├── ReactAdapter.jsx # React component
│ │ ├── VueAdapter.vue # Vue component (future)
│ │ └── index.js
│ │
│ ├── types/ # Type definitions & validators
│ │ ├── Annotation.js
│ │ ├── HighlightAnnotation.js
│ │ ├── TextAnnotation.js
│ │ ├── InkAnnotation.js
│ │ ├── validators.js
│ │ └── index.js
│ │
│ └── utils/ # Utility functions
│ ├── coordinateUtils.js
│ ├── viewportUtils.js
│ ├── colorUtils.js
│ └── index.js
│
├── examples/
│ ├── react-basic/
│ ├── react-audio-sync/
│ └── vanilla-js/
│
├── docs/
│ ├── API.md
│ ├── ANNOTATION_FORMAT.md
│ ├── INTEGRATION_GUIDE.md
│ └── ARCHITECTURE.md
│
└── tests/
├── unit/
├── integration/
└── fixtures/

---

## System Components

### Core Rendering Engine

The core rendering engine orchestrates all rendering operations. This engine provides a clean API for loading PDFs, setting annotation data, and controlling timeline position. The engine is framework-agnostic and works in any JavaScript environment.

The engine manages three main subsystems:

- PDF rendering subsystem
- Layer management subsystem
- Timeline synchronization subsystem

### PDF Rendering Subsystem

This subsystem handles all pdf.js operations. Load PDF documents from URLs, render pages to canvas elements, calculate viewports, and manage rendering tasks. This subsystem encapsulates pdf.js complexity and provides a simple interface to the core engine.

### Layer Management Subsystem

This subsystem manages annotation layers overlaid on the PDF canvas. Create, update, and destroy layer instances based on annotation data. Route annotations to appropriate layers by type. Update all layers when viewport changes due to zoom or page navigation.

The subsystem maintains three layer types:

- Highlight layer for highlighting text or regions
- Text layer for text box annotations
- Drawing layer for ink and freehand drawings

### Timeline Synchronization Subsystem

This subsystem synchronizes annotation rendering with timeline positions. Update layer rendering states based on current timestamp. Use requestAnimationFrame for smooth progressive animations. Support continuous sync mode for playing audio or video.

### Annotation Layers

Each annotation type has a dedicated rendering layer. Layers render annotations independently and handle their own animation logic.

**Highlight Layer:**
Renders rectangular highlight regions over PDF content. Supports multiple highlight regions per annotation. Animates progressive reveal from left to right. Hides annotations before their start time and shows them fully after their end time.

**Text Layer:**
Renders text box annotations positioned absolutely over PDF content. Displays text with background boxes and borders. Animates progressive text reveal word-by-word.

**Drawing Layer:**
Renders ink strokes and freehand drawings on a canvas layer. Supports multiple strokes per annotation with different colors and sizes. Draws stroke points progressively based on timeline position. Clears and redraws canvas efficiently for smooth animation.

### Framework Adapters

Framework adapters wrap the core engine for specific frameworks. These adapters manage the engine lifecycle and synchronize framework state with engine operations.

**React Adapter:**
Provides a React component that wraps the core engine. Manages engine initialization and cleanup using useEffect hooks. Syncs React props to engine methods when props change. Provides declarative API for React developers.

### Data Validation System

The validation system ensures annotation data follows the required format. Validates data structure, required fields, coordinate ranges, and color formats. Provides clear error messages when validation fails. Prevents rendering errors caused by malformed data.

### Utility Functions

Utility functions provide shared functionality across the system. Coordinate utilities convert between normalized (0-1) and absolute pixel coordinates. Viewport utilities calculate dimensions and scaling. Color utilities parse and convert color formats.

---

## Annotation Data Format

### Standard Format

All annotations follow a standard data format. Consumers must provide annotation data in this format. The format uses normalized coordinates (0-1 range) for position-independence across different screen sizes and zoom levels.

**Common Fields:**

- `id`: Unique string identifier for the annotation
- `type`: Annotation type ('highlight', 'text', or 'ink')
- `page`: Page number (1-indexed)
- `start`: Timeline start time in seconds
- `end`: Timeline end time in seconds

### Highlight Annotations

Highlight annotations mark rectangular regions on PDF pages. Use an array of quads to support multi-line highlights. Each quad defines a rectangular region with normalized coordinates.

**Required Fields:**

- `style.color`: Color in rgba format

### Text Annotations

Text annotations display text boxes positioned on PDF pages. Define position and size with normalized coordinates. Support custom styling for background and text colors.

**Required Fields:**

- `content`: Text string to display
- `x`, `y`: Position (0-1 normalized)
- `w`, `h`: Size (0-1 normalized)
- `style.bg`: Background color
- `style.color`: Text color

### Ink Annotations

Ink annotations display freehand drawings and strokes. Support multiple strokes per annotation. Each stroke contains an array of points with timeline offsets for progressive drawing.

**Required Fields:**

- `strokes`: Array of stroke objects
- Each stroke has `color`, `size`, and `points` array
- Each point has `t` (time offset 0-1), `x`, `y` (normalized)

---

## User Workflow

### Installation

Users install the library via npm package manager. The library is published as `@ai-annotator/renderer`. Installation includes pdf.js as a dependency. React is a peer dependency for React applications.

### Basic Usage

Users import the renderer component appropriate for their framework. For React applications, import `ReactAnnotationRenderer`. For vanilla JavaScript, import `AnnotationRenderer`.

Provide the required props or configuration:

- PDF URL or file path
- Page number to display
- Scale/zoom level
- Array of annotation data
- Current timeline position

The renderer handles all PDF loading, annotation rendering, and timeline synchronization automatically.

### Integration with Audio/Video

Users track audio or video timeline position in their application state. Pass the current timestamp to the renderer as a prop. The renderer updates annotation display automatically as the timestamp changes. Annotations appear, animate, and disappear based on their start and end times.

### Page Navigation

Users control page navigation through component props. Change the page number prop to navigate to a different page. The renderer loads and displays the new page automatically. Annotations for the new page are filtered and rendered.

### Zoom Control

Users control zoom level through the scale prop. Increase scale to zoom in, decrease to zoom out. The renderer recalculates viewport and repositions all annotations automatically.

---

## Integration with Existing Projects

### For New Projects

Start by installing the renderer library. Create a React component that manages annotation data and timeline state. Use the renderer component to display PDF with annotations. Obtain annotation data from any source (AI service, database, API).

### For Existing PDF Viewers

Replace existing pdf.js implementation with the renderer component. The renderer provides complete PDF viewing functionality. Prepare annotation data in the required format. Pass annotation data and timeline position to the renderer.

### For Multiple Projects

Install the renderer library in each project independently. Each project provides its own annotation data source. Projects can use different AI services, different databases, or different annotation creation tools. All projects use the same renderer for consistent display.

---

## System Behavior

### Loading Sequence

When initialized, the system loads the PDF document from the provided URL. Display loading state while PDF loads. Once loaded, render the first page to canvas. Calculate viewport dimensions based on page size and scale. Initialize annotation layers. Notify user via onLoad callback.

### Annotation Display

Filter annotations for the current page. Route each annotation to its appropriate layer based on type. Each layer creates DOM elements or canvas content for its annotations. Annotations remain hidden until their start time is reached.

### Timeline Progression

As timeline position updates, check each annotation's start and end times. When current time reaches an annotation's start time, begin displaying it. Animate the annotation progressively from start time to end time. When current time exceeds end time, display the annotation fully. Annotations persist after their end time unless explicitly removed.

### Progressive Animation

**Highlights:** Scale from 0 to full width. Calculate progress as percentage between start and end times. Apply scaleX transform based on progress.

**Text:** Reveal text word by word. Calculate number of visible words based on progress. Display partial current word character by character.

**Drawings:** Draw stroke points progressively. Check each point's time offset against elapsed time. Draw only points that should be visible at current time.

### Page Navigation

When page number changes, cancel any in-progress rendering. Load the new page from the PDF document. Render the new page to canvas. Filter annotations for the new page. Update all layers with new annotations and viewport. Maintain current zoom level.

### Zoom Operations

When scale changes, recalculate viewport dimensions. Re-render the PDF page at new scale. Update all layers with new viewport. Recalculate annotation positions based on new viewport. Maintain current page and timeline position.

---

## Success Criteria

### Functional Requirements

The system successfully renders PDF documents in web browsers. Annotations display correctly positioned on PDF pages. Timeline synchronization works smoothly with audio and video. Progressive animations appear fluid without stuttering. Page navigation responds quickly. Zoom operations maintain annotation accuracy.

### Integration Requirements

The system integrates easily into React applications with a single component. The system works with annotation data from any source. The system coexists with other libraries without conflicts. The system provides clear error messages for integration issues.

### Performance Requirements

PDF pages load and render within reasonable time. Annotation updates respond to timeline changes within one frame. Page navigation completes within one second. Memory usage remains stable during long sessions. The system handles dozens of annotations per page efficiently.

### User Experience Requirements

API is simple and intuitive for developers. Documentation is clear and comprehensive. Examples demonstrate common use cases. Error messages help users identify and fix issues. The system works across modern browsers without compatibility issues.

---

## Notes

This system is purely a rendering library. Consumers are responsible for providing annotation data. Annotation generation, storage, and creation tools are separate concerns. The system is designed for maximum reusability across different projects with different annotation sources.

---
