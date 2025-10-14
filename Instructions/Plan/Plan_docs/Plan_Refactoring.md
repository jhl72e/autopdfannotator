# Refactoring Plan - DRAFT

---

## What This Document Is

This document describes HOW to refactor the current PDF Auto Annotator codebase at a functional level. This refactoring prepares the existing monolithic application for the core architecture implementation described in Outline_SystemPipeline.md.

---

## Purpose

Reorganize the existing React application to establish clear functional boundaries between library code and demo application. This refactoring aligns the current structure with the final library architecture, creating a clean foundation without changing core functionality.

---

## Current System State

### Functional Organization

The current system is organized as a single-tier React application:

**PDF Viewing Function:**

- PdfViewer component handles PDF loading, rendering, and annotation display
- Three layer components render different annotation types
- Coordinate utilities transform between normalized and absolute positions

**Annotation Creation Function:**

- AI generation modal creates annotations using OpenAI API
- Three manual creation modals allow user-drawn annotations
- PDF text extraction service supports AI generation

**Application Orchestration:**

- App component manages all state and user interactions
- Audio element provides timeline source
- Buttons control modal visibility

### Functional Issues

**Unclear boundaries:**

- Rendering logic mixed with React-specific implementation
- Application features intermingled with viewing functionality
- Utility functions scattered across different concerns

**Tight coupling:**

- PdfViewer component couples PDF rendering with layer management
- Application features directly reference internal viewer structures
- No clear interface between functional areas

---

## Refactoring Approach

### Functional Separation Strategy

Separate the system into two distinct codebases:

**Core Library (src/):**

1. **Rendering Components** - PDF display and annotation visualization
2. **Type System** - Data structure definitions
3. **Utilities** - Coordinate and viewport transformations

**Demo Application (examples/demo-app/):** 4. **Application Features** - Annotation generation and creation tools 5. **Integration Example** - How to use the library

### Architectural Decisions

**Preserve existing functionality:**

- Keep all current features working
- Maintain existing data structures
- Preserve React-based implementation

**Align with final library structure:**

- Organize src/ to match final library layout
- Place layers, utils, types at correct hierarchy level
- Minimize reorganization needed in next phase

**Prepare for future library packaging:**

- Core library code isolated in src/
- Demo application shows library usage patterns
- Clear separation enables independent versioning
- Document data contracts with type definitions

---

## Functional Structure Design

### Target Functional Organization

```
CORE LIBRARY (src/)
├── Layer Components (src/layers/)
│   ├── Highlight rendering
│   ├── Text rendering
│   └── Drawing/Ink rendering
├── Core Rendering (src/core/)
│   └── PdfViewer orchestration
├── Utilities (src/utils/)
│   └── Coordinate/viewport transformations
└── Type System (src/types/)
    └── Annotation data structures

DEMO APPLICATION (examples/demo-app/)
├── AI Generation Feature
│   ├── Generation UI modal
│   ├── OpenAI service integration
│   └── PDF text extraction
├── Manual Creation Features
│   ├── Drawing creation modal
│   ├── Highlight creation modal
│   └── Text creation modal
└── Application Orchestration
    └── App component
```

### Directory Structure

```
src/                                 # Core Library (will be published)
├── layers/
│   ├── HighlightLayer.jsx
│   ├── TextLayer.jsx
│   └── DrawingLayer.jsx
├── core/
│   └── PdfViewer.jsx               # Will become AnnotationRenderer.js in next phase
├── utils/
│   └── coordinateUtils.js
└── types/
    └── annotations.js

examples/demo-app/                   # Demo Application (excluded from library)
├── features/
│   ├── ai-generation/
│   │   ├── AIAnnotationGenerator.jsx
│   │   ├── openaiService.js
│   │   └── pdfTextExtractor.js
│   └── manual-creation/
│       ├── DrawingInputModal.jsx
│       ├── HighlightInputModal.jsx
│       └── TextInputModal.jsx
├── App.jsx
├── App.css
└── main.jsx
```

### Alignment with Final Architecture

This refactored structure maps directly to the final library architecture:

```
Refactoring Structure          →    Final Library Structure
─────────────────────────────────────────────────────────────
src/layers/                    →    src/layers/
  ├── HighlightLayer.jsx       →      ├── HighlightLayer.js (converted)
  ├── TextLayer.jsx            →      ├── TextLayer.js (converted)
  └── DrawingLayer.jsx         →      └── DrawingLayer.js (converted)

src/core/                      →    src/core/
  └── PdfViewer.jsx            →      ├── AnnotationRenderer.js (refactored)
                                      ├── PDFRenderer.js (extracted)
                                      ├── LayerManager.js (extracted)
                                      └── TimelineSync.js (extracted)

src/utils/                     →    src/utils/
  └── coordinateUtils.js       →      ├── coordinateUtils.js
                                      ├── viewportUtils.js (added)
                                      └── colorUtils.js (added)

src/types/                     →    src/types/
  └── annotations.js           →      ├── Annotation.js
                                      ├── validators.js (added)
                                      └── index.js

examples/demo-app/             →    examples/react-basic/ (renamed)
```

---

## Refactoring Steps

### Step 1: Establish Core Library Structure

**Goal:** Create library directory structure aligned with final architecture.

**Functional Changes:**

Create library directory hierarchy:

- Create `src/layers/` for annotation layer components
- Create `src/core/` for main rendering orchestration
- Create `src/utils/` for utility functions
- Keep `src/types/` for type definitions

**File Operations:**

- Create `src/layers/` directory
- Move `src/layers/HighlightLayer.jsx` → `src/layers/HighlightLayer.jsx`
- Move `src/layers/TextLayer.jsx` → `src/layers/TextLayer.jsx`
- Move `src/layers/DrawingLayer.jsx` → `src/layers/DrawingLayer.jsx`
- Create `src/core/` directory
- Move `src/PdfViewer.jsx` → `src/core/PdfViewer.jsx`
- Create `src/utils/` directory
- Move `src/utils/coords.jsx` → `src/utils/coordinateUtils.js`

**Update Dependencies:**

- Update PdfViewer imports to reference `../layers/` for layer components
- Update layer imports to reference `../utils/` for coordinate utilities
- Temporarily update App.jsx imports (will move App in Step 2)

**Data Flow:**

- Same as before - no changes to interfaces
- PdfViewer receives props and renders PDF with annotations
- Layers receive filtered data from PdfViewer
- Utilities provide coordinate transformations

**Result:** Library code organized in final structure hierarchy (layers, core, utils at root level).

---

### Step 2: Separate Demo Application

**Goal:** Move all demo/example code outside the library to examples/.

**Functional Changes:**

Create demo application structure:

- Create `examples/demo-app/` directory
- Move all application-specific features to demo
- Move App component and entry point to demo
- Separate library code from usage examples

**File Operations:**

- Create `examples/demo-app/` directory
- Create `examples/demo-app/features/` directory structure
- Move `src/App.jsx` → `examples/demo-app/App.jsx`
- Move `src/App.css` → `examples/demo-app/App.css`
- Move `src/main.jsx` → `examples/demo-app/main.jsx`
- Create `examples/demo-app/features/ai-generation/`
- Move `src/components/AIAnnotationGenerator.jsx` → `examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx`
- Move `src/services/openaiService.js` → `examples/demo-app/features/ai-generation/openaiService.js`
- Move `src/utils/pdfTextExtractor.js` → `examples/demo-app/features/ai-generation/pdfTextExtractor.js`
- Create `examples/demo-app/features/manual-creation/`
- Move `src/components/DrawingInputModal.jsx` → `examples/demo-app/features/manual-creation/DrawingInputModal.jsx`
- Move `src/components/HighlightInputModal.jsx` → `examples/demo-app/features/manual-creation/HighlightInputModal.jsx`
- Move `src/components/TextInputModal.jsx` → `examples/demo-app/features/manual-creation/TextInputModal.jsx`

**Update Dependencies:**

- Update demo App.jsx to import PdfViewer from `../../src/core/PdfViewer`
- Update demo App.jsx to import features from local `./features/`
- Update demo main.jsx to import App from local `./App.jsx`
- Update vite.config.js to use `examples/demo-app/main.jsx` as entry point

**Data Flow:**

- Demo App orchestrates library usage
- Features generate annotations and pass to App
- App passes annotations to library's PdfViewer
- Clear boundary: demo consumes library, doesn't modify it

**Result:** Complete separation between library (src/) and demo application (examples/demo-app/).

---

### Step 3: Establish Type System

**Goal:** Document and centralize data structure definitions in library.

**Functional Changes:**

Create library type definitions:

- Create `src/types/` directory (if not exists)
- Define annotation data structures with JSDoc
- Establish data contracts for library API

**File Operations:**

- Create `src/types/annotations.js`
- Define all annotation type structures

**Type Definitions:**

```javascript
/**
 * Common annotation fields
 * @typedef {Object} BaseAnnotation
 * @property {string} id - Unique identifier
 * @property {string} type - Annotation type
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 */

/**
 * Highlight annotation with rectangular regions
 * @typedef {Object} HighlightAnnotation
 * @property {string} id
 * @property {'highlight'} type
 * @property {number} page
 * @property {number} start
 * @property {number} end
 * @property {'quads'} mode
 * @property {Array<{x: number, y: number, w: number, h: number}>} quads
 * @property {{color: string}} style
 */

/**
 * Text box annotation
 * @typedef {Object} TextAnnotation
 * @property {string} id
 * @property {'text'} type
 * @property {number} page
 * @property {number} start
 * @property {number} end
 * @property {string} content
 * @property {number} x - Normalized position (0-1)
 * @property {number} y - Normalized position (0-1)
 * @property {number} w - Normalized width (0-1)
 * @property {number} h - Normalized height (0-1)
 * @property {{bg: string, color: string}} style
 */

/**
 * Ink/drawing annotation with strokes
 * @typedef {Object} InkAnnotation
 * @property {string} id
 * @property {'ink'} type
 * @property {number} page
 * @property {number} start
 * @property {number} end
 * @property {Array<{color: string, size: number, points: Array<{t: number, x: number, y: number}>}>} strokes
 */

/**
 * Union type for all annotation types
 * @typedef {HighlightAnnotation|TextAnnotation|InkAnnotation} Annotation
 */
```

**Documentation Integration:**

- Add JSDoc imports to PdfViewer component (library)
- Add JSDoc imports to layer components (library)
- Add JSDoc imports to demo feature components (reference library types)
- Reference Annotation types in all component prop definitions

**Data Flow:**

- Types define library's public API contract
- Demo application references library types
- No runtime changes, only documentation
- IDE provides better autocomplete and validation

**Result:** Library data structures documented; demo references library types.

---

### Step 4: Refine Component Interfaces

**Goal:** Clean up component implementations and clarify interfaces.

**Functional Changes:**

Clean PdfViewer component:

- Remove commented or dead code
- Add JSDoc documentation for props
- Extract complex calculations to utility functions
- Maintain exact same functionality

Clean layer components:

- Ensure consistent implementation patterns
- Add JSDoc documentation for props
- Remove any unused state or effects
- Keep rendering behavior identical

Clean feature components:

- Verify self-contained implementation
- Document expected props and callbacks
- Ensure no hidden dependencies on library internals

**Component Interface Documentation:**

Document PdfViewer interface:

```javascript
/**
 * PDF viewer with annotation overlay
 * @param {Object} props
 * @param {string} props.pdfUrl - URL to PDF document
 * @param {number} props.pageNum - Current page number
 * @param {number} props.scale - Zoom scale
 * @param {Annotation[]} props.annotations - Annotations to display
 * @param {number} props.nowSec - Current timeline position
 * @param {Function} props.onPdfLoad - PDF load callback
 * @param {Function} props.onError - Error callback
 */
```

Document layer interfaces:

```javascript
/**
 * Renders highlight annotations
 * @param {Object} props
 * @param {HighlightAnnotation[]} props.annos - Highlight annotations for current page
 * @param {Object} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position
 */
```

**Utility Function Extraction:**

Extract viewport calculations from PdfViewer:

- Create `src/utils/viewportUtils.js`
- Move viewport calculation logic
- Keep PdfViewer logic cleaner

**Data Flow:**

- No changes to data flow between components
- Library components receive same props
- Demo features use same callback patterns
- Only added documentation

**Result:** Library and demo components have clear, documented interfaces.

---

### Step 5: Organize Utility Functions

**Goal:** Centralize and organize utility functions in library.

**Functional Changes:**

Organize library utilities:

- Centralize coordinate transformation functions
- Create viewport utility functions
- Establish clear utility module structure

**File Operations:**

- Ensure `src/utils/coordinateUtils.js` exists (from Step 1)
- Create `src/utils/viewportUtils.js`
- Extract viewport logic from PdfViewer

**Coordinate Utilities (`coordinateUtils.js`):**

```javascript
/**
 * Convert normalized rectangle to absolute pixel coordinates
 * @param {{x: number, y: number, w: number, h: number}} rect - Normalized rectangle (0-1)
 * @param {{width: number, height: number}} viewport - Viewport dimensions
 * @returns {{left: number, top: number, width: number, height: number}}
 */
export function rectNormToAbs(rect, viewport)

/**
 * Convert normalized point to absolute pixel coordinates
 * @param {{x: number, y: number}} point - Normalized point (0-1)
 * @param {{width: number, height: number}} viewport - Viewport dimensions
 * @returns {{x: number, y: number}}
 */
export function pointNormToAbs(point, viewport)
```

**Viewport Utilities (`viewportUtils.js`):**

```javascript
/**
 * Calculate viewport dimensions from PDF page
 * @param {Object} page - PDF.js page object
 * @param {number} scale - Scale factor
 * @returns {{width: number, height: number, scale: number}}
 */
export function calculateViewport(page, scale)

/**
 * Get viewport dimensions
 * @param {Object} viewport - Viewport object
 * @returns {{width: number, height: number}}
 */
export function getViewportDimensions(viewport)
```

**Functional Organization:**

- Library utilities in src/utils/ (published with library)
- Demo feature utilities in examples/demo-app/features/ (demo-specific)
- Clear separation: library utilities vs demo utilities

**Data Flow:**

- Components import and use utility functions
- Pure functions with no side effects
- Clear input/output contracts

**Result:** Utilities organized at correct hierarchy level with clear interfaces.

---

### Data Interfaces

**Demo App → Library:**

- PDF URL (string)
- Page number (number)
- Scale (number)
- Annotations array (Annotation[] - defined in library types)
- Timeline position (number)

**Demo Features → Demo App:**

- Generated annotations (Annotation[])
- User-created annotations (Annotation[])

**Library → Demo App:**

- Load events (page count, status)
- Error events

### Clear Boundary

**Library exports (src/):**

- PdfViewer component (src/core/PdfViewer.jsx)
- Layer components (src/layers/)
- Type definitions (src/types/annotations.js)
- Utility functions (src/utils/)

**Demo application (examples/demo-app/):**

- Imports and uses PdfViewer from library
- Uses type definitions for data validation
- Implements its own annotation generation logic
- Shows integration patterns

---

## Backward Compatibility

### Functional Preservation

**No functionality changes:**

- All existing features work identically
- Same user workflows
- Same annotation data formats
- Same rendering behavior

**Interface preservation:**

- Component props unchanged
- Callback signatures unchanged
- Data structures unchanged
- No API changes

**State management:**

- App component maintains same state structure
- Same state update patterns
- No changes to React hooks usage

---

## Testing Strategy

### Functional Testing

**Library components:**

- Verify PDF loads and displays correctly
- Verify annotations render on correct pages
- Verify timeline synchronization works
- Verify zoom and scale operations
- Test all three annotation types

**Demo application:**

- Verify AI generation modal functions
- Verify manual creation modals work
- Verify generated annotations display correctly
- Test audio timeline integration

**Integration:**

- Verify data flows correctly between library and demo
- Test complete user workflows
- Verify no regressions in functionality

---

## Success Criteria

### Functional Criteria

**Library/Demo separation:**

- Library code isolated in src/
- Demo application isolated in examples/demo-app/
- No coupling: demo consumes library, doesn't modify it

**Functionality preservation:**

- All features work as before refactoring
- No user-visible changes
- No data structure changes
- No behavioral changes

**Code organization:**

- Library code in src/ (will be published)
- Demo code in examples/ (shows usage)
- Directory structure matches final architecture
- Minimal reorganization needed in next phase

### Technical Criteria

**Import structure:**

- All imports updated and working
- No broken dependencies
- Clear import paths
- No circular dependencies

**Documentation:**

- Type definitions documented
- Component interfaces documented
- Utility functions documented
- Data flow documented

**Alignment:**

- src/layers/ ready for framework-agnostic conversion
- src/core/ ready for subsystem extraction
- src/utils/ ready for additional utilities
- src/types/ ready for validators

---

## Next Steps

This refactoring establishes the foundation for the next plan phase, which will:

**Transform library components:**

- Convert React layer components to framework-agnostic JavaScript classes
- Extract subsystems from PdfViewer (PDFRenderer, LayerManager, TimelineSync)
- Create AnnotationRenderer engine class
- Build framework adapters (ReactAdapter)

**Establish library infrastructure:**

- Add validation system (src/types/validators.js)
- Create public API (src/index.js)
- Add color utilities (src/utils/colorUtils.js)
- Build examples and documentation

**The refactored structure maps directly to final architecture:**

- src/layers/ → stays at src/layers/ (just convert to JS classes)
- src/core/PdfViewer.jsx → splits into src/core/ subsystems
- src/utils/ → stays at src/utils/ (add more utilities)
- src/types/ → stays at src/types/ (add validators)
- examples/demo-app/ → becomes examples/react-basic/

---

## Notes

This refactoring focuses exclusively on reorganization and documentation. It does not change functionality, data structures, or user experience.

**Key Achievements:**

- Library code (src/) organized in final architecture hierarchy
- Demo code (examples/demo-app/) completely separated
- Directory structure aligned with target library structure
- Minimal reorganization needed in next construction phase
- Clear boundary enables library to be packaged independently
- Demo serves as usage example and testing ground

The goal is to create a clean separation between what will become the published library and what remains as example/demo code, while organizing the library code to match the final architecture. This minimizes disruption in the next phase when building the core architecture described in the outline.

---
