# Core Subsystem Construction Plan

---

## What This Document Is

This plan describes HOW to construct the framework-agnostic core engine architecture for the Dynamic PDF Annotation Renderer System. This plan transforms the monolithic React component into modular, reusable subsystems that provide the foundation for the library.

---

## Purpose

Build four core subsystems that work together to create a framework-agnostic annotation rendering engine. Extract functionality from the existing React component and reorganize it into specialized modules with clear responsibilities.

---

## Architectural Overview

### Current Architecture

```
PdfViewer.jsx (258 lines - monolithic React component)
├── PDF loading and rendering logic (pdf.js)
├── Layer management and routing
├── Timeline synchronization
├── React lifecycle management
└── All concerns mixed together
```

### Target Architecture

```
AnnotationRenderer.js (Facade/Orchestrator)
├── PDFRenderer.js (PDF operations)
│   └── Encapsulates pdf.js complexity
├── LayerManager.js (Layer orchestration)
│   └── Manages layer instances and routing
└── TimelineSync.js (Timeline synchronization)
    └── Handles timeline position updates
```

### Architectural Principles

**Framework-Agnostic Core:**
- Pure JavaScript classes (no JSX, no React hooks)
- Standard DOM manipulation only
- Can be used in any JavaScript environment
- Framework wrappers (React, Vue) built separately

**Separation of Concerns:**
- Each subsystem has single, well-defined responsibility
- Clear interfaces between modules
- Minimal coupling between subsystems
- Independent lifecycle management

**Encapsulation:**
- Hide internal complexity from consumers
- Expose clean, minimal public APIs
- Manage internal state privately
- Provide lifecycle methods for resource cleanup

---

## Step 1: Build PDFRenderer Subsystem

### Purpose

Create a framework-agnostic module that encapsulates all pdf.js operations. This module handles PDF document loading, page rendering, viewport calculations, and rendering task management.

### Responsibilities

**PDF Document Operations:**
- Load PDF documents from URLs using pdf.js
- Store PDF document reference
- Provide document metadata (page count, page dimensions)
- Handle loading errors gracefully

**Page Rendering:**
- Render specific pages to canvas elements
- Calculate viewport dimensions using existing utilities
- Manage rendering tasks and cancellation
- Handle rendering errors and cancellation exceptions

**State Management:**
- Track current PDF document
- Track active rendering task
- Provide rendering status

**Resource Cleanup:**
- Cancel in-progress rendering tasks
- Release PDF document resources
- Clear references on destruction

### Module Structure

**File:** `src/core/PDFRenderer.js`

**Class:** `PDFRenderer`

**Constructor:**
```javascript
constructor()
```
- Initialize with no parameters
- Set up internal state (pdfDoc, renderTask references)
- Configure pdf.js worker path

**Public Methods:**

`async loadDocument(url)`
- Load PDF from URL using pdfjsLib.getDocument()
- Store document reference internally
- Return object: `{ pageCount, success, error }`
- Handle and return loading errors

`async renderPage(pageNum, canvas, scale)`
- Get page from PDF document
- Calculate viewport using viewportUtils.calculateViewport()
- Set canvas dimensions to viewport size
- Create render context with canvas and viewport
- Execute render task via page.render()
- Store renderTask reference for cancellation
- Return viewport object on success
- Handle RenderingCancelledException separately from other errors

`getPageCount()`
- Return total number of pages
- Return 0 if no document loaded

`cancelRender()`
- Cancel current rendering task if exists
- Clear renderTask reference
- Safe to call even if no task active

`destroy()`
- Cancel any active rendering
- Release PDF document reference
- Clear all internal state

**Internal State:**
- `pdfDoc` - PDF document reference from pdf.js
- `renderTask` - Current rendering task for cancellation

**Dependencies:**
- `pdfjs-dist` - PDF.js library
- `../utils/viewportUtils` - calculateViewport function

**Error Handling:**
- Catch and return loading errors with descriptive messages
- Handle RenderingCancelledException as expected behavior
- Propagate other rendering errors to caller
- Ensure cleanup happens in finally blocks

### Data Flow

**Input:**
- PDF URL string
- Page number (1-indexed)
- Canvas element reference
- Scale factor

**Processing:**
1. Load PDF document via pdf.js
2. Get specific page from document
3. Calculate viewport dimensions
4. Render page to canvas
5. Track rendering task for cancellation

**Output:**
- Rendered canvas with PDF page
- Viewport dimensions object
- Document metadata
- Error information if failed

### Integration Points

**Used By:**
- AnnotationRenderer (main engine)

**Uses:**
- pdf.js library (getDocument, page.render)
- viewportUtils.calculateViewport()

**Independent From:**
- LayerManager (no interaction)
- TimelineSync (no interaction)
- React or any framework

---

## Step 2: Build TimelineSync Subsystem

### Purpose

Create a framework-agnostic module that manages timeline position and notifies subscribers of timeline changes. This module provides the synchronization mechanism for annotation animations.

### Responsibilities

**Timeline State:**
- Track current timeline position (in seconds)
- Detect when timeline position changes
- Maintain previous position for comparison

**Subscriber Management:**
- Register callback functions for timeline updates
- Unregister callbacks
- Notify all subscribers when timeline changes
- Manage subscriber list safely

**Sync Modes:**
- Support discrete updates (manual setTime calls)
- Support continuous sync via requestAnimationFrame
- Provide start/stop methods for continuous mode
- Track sync mode state

**Performance:**
- Only notify on actual changes (avoid redundant updates)
- Use requestAnimationFrame for smooth continuous sync
- Cleanup animation frame on stop

### Module Structure

**File:** `src/core/TimelineSync.js`

**Class:** `TimelineSync`

**Constructor:**
```javascript
constructor()
```
- Initialize currentTime to 0
- Create empty subscribers Set
- Initialize continuous sync state (animationFrameId, isRunning)

**Public Methods:**

`setTime(timestamp)`
- Accept timestamp in seconds
- Compare with current time
- Only update if different (avoid redundant notifications)
- Update currentTime
- Notify all subscribers with new time

`getCurrentTime()`
- Return current timeline position

`subscribe(callback)`
- Add callback function to subscribers Set
- Return unsubscribe function for convenience
- Validate callback is a function

`unsubscribe(callback)`
- Remove callback from subscribers Set
- Safe to call even if callback not registered

`startContinuousSync(getTimeFunction)`
- Accept function that returns current time (e.g., from audio.currentTime)
- Start requestAnimationFrame loop
- Each frame: get time from function, call setTime()
- Store animationFrameId for cleanup
- Prevent multiple simultaneous sync loops

`stopContinuousSync()`
- Cancel requestAnimationFrame
- Clear animationFrameId
- Set isRunning to false
- Safe to call even if not running

`destroy()`
- Stop continuous sync if running
- Clear all subscribers
- Reset state

**Internal State:**
- `currentTime` - Current timeline position in seconds
- `subscribers` - Set of callback functions
- `animationFrameId` - RAF id for continuous sync
- `isRunning` - Boolean flag for continuous sync state

**Dependencies:**
- None (pure JavaScript)

**Subscriber Notification:**
- Iterate through subscribers Set
- Call each callback with currentTime
- Wrap in try-catch to prevent one callback from breaking others
- Log errors but continue notifying other subscribers

### Data Flow

**Input:**
- Timeline timestamp (seconds) via setTime()
- Time-getter function for continuous sync

**Processing:**
1. Receive new time value
2. Compare with current time
3. Update if changed
4. Notify all subscribers

**Output:**
- Callbacks invoked with current time
- Subscribers can update their state/rendering

### Integration Points

**Used By:**
- AnnotationRenderer (subscribes to updates)

**Notifies:**
- LayerManager (via AnnotationRenderer subscription)

**Independent From:**
- PDFRenderer (no interaction)
- pdf.js
- React or any framework

---

## Step 3: Build LayerManager Subsystem

### Purpose

Create a framework-agnostic module that orchestrates annotation layer instances. This module routes annotations to appropriate layers, manages layer lifecycle, and coordinates layer updates.

### Responsibilities

**Layer Instance Management:**
- Create instances of HighlightLayer, TextLayer, DrawingLayer
- Store layer instances
- Destroy layer instances on cleanup
- Manage layer container DOM element

**Annotation Routing:**
- Receive complete annotation array
- Filter annotations by current page number
- Group annotations by type (highlight, text, ink)
- Route grouped annotations to appropriate layers
- Update layers when annotations change

**Viewport Coordination:**
- Receive viewport updates
- Propagate viewport to all layer instances
- Ensure layers re-render with new dimensions

**Timeline Coordination:**
- Receive timeline position updates
- Propagate timestamp to all layer instances
- Trigger layer animation updates

**Layer Communication:**
- Provide consistent interface to all layers
- Call layer methods: setAnnotations(), setViewport(), update()
- Handle layers that may not implement all methods

### Module Structure

**File:** `src/core/LayerManager.js`

**Class:** `LayerManager`

**Constructor:**
```javascript
constructor(containerElement)
```
- Accept DOM container element for layer rendering
- Create instances of all three layer types
- Store layer instances in object/Map
- Store container reference

**Public Methods:**

`setAnnotations(annotations, pageNum)`
- Accept complete annotation array and current page number
- Filter annotations for current page only
- Group by type: highlights (type='highlight'), text (type='text'), ink (type='ink')
- Route to layers: highlightLayer.setAnnotations(highlights), etc.
- Store current page number for future filtering

`setViewport(viewport)`
- Accept viewport object (width, height, scale, etc.)
- Call setViewport() on all layer instances
- Store current viewport for reference

`updateTimeline(timestamp)`
- Accept timestamp in seconds
- Call update(timestamp) on all layer instances
- Layers handle their own animation logic

`destroy()`
- Call destroy() on all layer instances
- Clear layer references
- Clear container reference

**Internal State:**
- `container` - DOM element for layers
- `layers` - Object containing layer instances: `{ highlight, text, drawing }`
- `currentPage` - Current page number for filtering
- `currentViewport` - Current viewport for reference

**Dependencies:**
- `../layers/HighlightLayer` (currently .jsx, will be .js later)
- `../layers/TextLayer` (currently .jsx, will be .js later)
- `../layers/DrawingLayer` (currently .jsx, will be .js later)

**Annotation Filtering Logic:**
```javascript
const pageAnnotations = annotations.filter(a => a.page === pageNum)
const highlights = pageAnnotations.filter(a => a.type === 'highlight')
const textAnnotations = pageAnnotations.filter(a => a.type === 'text')
const inkAnnotations = pageAnnotations.filter(a => a.type === 'ink')
```

### Data Flow

**Input:**
- Annotation array (all pages, all types)
- Page number for filtering
- Viewport object for positioning
- Timestamp for animation

**Processing:**
1. Filter annotations by page
2. Group by annotation type
3. Route to appropriate layer
4. Coordinate viewport updates
5. Coordinate timeline updates

**Output:**
- Layers receive their specific annotations
- Layers render to DOM container
- Layers animate based on timeline

### Integration Points

**Used By:**
- AnnotationRenderer (creates and manages instance)

**Uses:**
- Layer classes (Highlight, Text, Drawing)

**Receives Updates From:**
- AnnotationRenderer (annotations, viewport, timeline)

### Temporary Layer Compatibility

**Current Situation:**
- Existing layers are React components (.jsx)
- Use React hooks and JSX
- Render via React elements

**Temporary Solution:**
- LayerManager works with current JSX layers temporarily
- Layers need minimal interface: setAnnotations(), update(), destroy()
- Full layer conversion happens in next phase

**Future State:**
- Layers will be plain JavaScript classes
- Extend BaseLayer abstract class
- Use DOM manipulation instead of JSX
- LayerManager interface remains same

### Layer Progress Calculation

**Timeline Progress Logic:**

Layers calculate animation progress based on current time and annotation start/end times. The calculation naturally supports both progressive animations and instant rendering.

**Progress Calculation Logic:**
```javascript
calculateProgress(annotation, currentTime) {
  const duration = annotation.end - annotation.start;

  // Division by zero guard: instant rendering
  if (duration === 0) {
    return currentTime >= annotation.start ? 1 : 0;
  }

  // Progressive animation
  if (currentTime < annotation.start) return 0;
  if (currentTime >= annotation.end) return 1;

  return (currentTime - annotation.start) / duration;
}
```

**Natural Behavior:**
- When `duration > 0`: Progressive animation from start to end
- When `duration === 0`: Instant rendering (appears fully when time >= start)
- No special cases needed - division by zero guard provides both behaviors

**Behavior Examples:**
- `{start: 0, end: 0}` → duration = 0 → always returns 1 (static annotation)
- `{start: 5, end: 5}` → duration = 0 → returns 0 or 1 at threshold (instant)
- `{start: 2, end: 6}` → duration = 4 → returns 0 to 1 progressively (animated)

---

## Step 4: Build AnnotationRenderer Engine

### Purpose

Create the main facade that orchestrates all subsystems. This is the primary public API that consumers use to render PDFs with annotations. The engine coordinates PDFRenderer, LayerManager, and TimelineSync subsystems.

### Responsibilities

**Initialization:**
- Accept configuration (container, PDF URL, initial state)
- Create instances of all subsystems
- Wire up communication between subsystems
- Initialize with default values

**API Surface:**
- Provide simple, declarative methods for consumers
- Abstract away subsystem complexity
- Handle state management internally
- Expose only necessary controls

**Subsystem Coordination:**
- Route PDF operations to PDFRenderer
- Route annotation operations to LayerManager
- Route timeline operations to TimelineSync
- Ensure subsystems stay synchronized

**State Management:**
- Track current page, scale, annotations
- Maintain configuration
- Provide getters for current state
- Handle state updates atomically

**Lifecycle:**
- Initialize all subsystems on construction
- Clean up all subsystems on destroy
- Manage event subscriptions
- Release all resources properly

### Module Structure

**File:** `src/core/AnnotationRenderer.js`

**Class:** `AnnotationRenderer`

**Constructor:**
```javascript
constructor(config)
```
- Accept config object: `{ container, canvasElement, pdfUrl, initialPage, initialScale, annotations }`
- Validate required config (container, canvasElement)
- Create subsystem instances:
  - `this.pdfRenderer = new PDFRenderer()`
  - `this.layerManager = new LayerManager(container)`
  - `this.timelineSync = new TimelineSync()`
- Wire up timeline subscription:
  - `this.timelineSync.subscribe(time => this.layerManager.updateTimeline(time))`
- Store configuration
- Initialize state: currentPage, currentScale, annotations
- Auto-load PDF if pdfUrl provided

**Public Methods:**

`async loadPDF(url)`
- Call pdfRenderer.loadDocument(url)
- Store PDF metadata (page count)
- Store PDF URL
- Return load result
- Handle errors gracefully

`async setPage(pageNum)`
- Validate page number (1 to pageCount)
- Cancel current rendering via pdfRenderer
- Render new page via pdfRenderer.renderPage()
- Update layerManager with new page annotations
- Store currentPage
- Return success/error

`setScale(scale)`
- Store new scale value
- Re-render current page at new scale
- Update layerManager viewport
- Maintain current page

`setAnnotations(annotations)`
- Store annotation array
- Filter and route to layerManager
- Maintain current page and viewport

`setTime(timestamp)`
- Forward to timelineSync.setTime()
- TimelineSync notifies layerManager automatically

`getState()`
- Return current state object: `{ page, scale, annotations, pageCount, time }`

`destroy()`
- Destroy all subsystems: pdfRenderer, layerManager, timelineSync
- Clear all references
- Unsubscribe from events

**Internal State:**
- `config` - Initial configuration
- `pdfRenderer` - PDFRenderer instance
- `layerManager` - LayerManager instance
- `timelineSync` - TimelineSync instance
- `currentPage` - Current page number
- `currentScale` - Current scale factor
- `annotations` - Current annotation array
- `pageCount` - Total page count from PDF
- `currentViewport` - Last viewport from rendering

**Subsystem Wiring:**

Timeline updates flow automatically:
```javascript
// In constructor:
this.timelineSync.subscribe((time) => {
  this.layerManager.updateTimeline(time)
})

// When consumer calls:
renderer.setTime(5.2)  // User sets time

// Flow:
// 1. TimelineSync receives time
// 2. TimelineSync notifies subscribers
// 3. LayerManager receives update
// 4. Layers animate
```

**Dependencies:**
- `./PDFRenderer` - PDF operations
- `./LayerManager` - Layer management
- `./TimelineSync` - Timeline sync

**Error Handling:**
- Validate inputs (page numbers, scale values)
- Catch subsystem errors
- Provide meaningful error messages
- Maintain stable state on errors

### Data Flow

**Initialization Flow:**
```
User creates AnnotationRenderer
  → Constructor creates subsystems
  → loadPDF() loads document
  → setPage() renders first page
  → setAnnotations() populates layers
  → Engine ready
```

**Update Flow:**
```
User calls setTime(5.2)
  → TimelineSync updates
  → Subscribers notified
  → LayerManager receives update
  → Layers animate

User calls setPage(3)
  → PDFRenderer renders page 3
  → Viewport calculated
  → LayerManager updated with page 3 annotations
  → LayerManager updated with new viewport
```

**Coordination:**
- AnnotationRenderer is the single point of control
- Subsystems don't communicate directly
- All coordination flows through AnnotationRenderer
- Consumers only interact with AnnotationRenderer

### Integration Points

**Used By:**
- Framework adapters (ReactAdapter, future VueAdapter)
- Vanilla JavaScript consumers

**Uses:**
- PDFRenderer (Step 1)
- TimelineSync (Step 2)
- LayerManager (Step 3)

**Provides:**
- Complete annotation rendering engine
- Simple API for consumers
- No framework dependencies

### API Design

**Imperative API (Vanilla JS):**
```javascript
const renderer = new AnnotationRenderer({
  container: document.getElementById('layer-container'),
  canvasElement: document.getElementById('pdf-canvas')
})

await renderer.loadPDF('/path/to/doc.pdf')
await renderer.setPage(1)
renderer.setAnnotations(annotationData)
renderer.setScale(1.5)
renderer.setTime(3.5)
```

**Declarative API (via React Adapter - future):**
```jsx
<ReactAnnotationRenderer
  pdfUrl="/path/to/doc.pdf"
  page={1}
  scale={1.5}
  annotations={data}
  currentTime={3.5}
/>
```

---

## Implementation Sequence

### Phase 1: Independent Subsystems (Parallel)

**Build Order:**
1. **PDFRenderer** (Step 1) - No dependencies on other subsystems
2. **TimelineSync** (Step 2) - No dependencies on other subsystems

These can be built simultaneously as they're completely independent.

### Phase 2: Dependent Subsystem

3. **LayerManager** (Step 3) - Depends on layer interfaces

Wait for Step 1-2 to complete (for testing integration), but LayerManager primarily depends on existing layers.

### Phase 3: Integration

4. **AnnotationRenderer** (Step 4) - Depends on all previous steps

Requires Steps 1-3 to be complete. Integrates all subsystems into cohesive engine.

---

## Coexistence Strategy

### During Construction

**Current Code Remains:**
- `src/core/PdfViewer.jsx` stays unchanged
- Demo app continues using PdfViewer.jsx
- All existing functionality preserved

**New Code Added:**
- New subsystems built in parallel
- No modifications to existing files
- Testing done independently

### After Construction

**Gradual Migration:**
- AnnotationRenderer built and tested
- ReactAdapter created wrapping AnnotationRenderer
- Demo app updated to use ReactAdapter
- PdfViewer.jsx removed only after full migration

**Benefits:**
- No disruption during development
- Old and new code coexist
- Easy rollback if needed
- Incremental testing

---

## Dependencies and Utilities

### Reuse Existing Code

**Type Definitions:**
- `src/types/annotations.js` - Use existing types
- Add JSDoc imports in new modules

**Utilities:**
- `src/utils/viewportUtils.js` - Use calculateViewport()
- `src/utils/coordinateUtils.js` - Use coordinate conversions
- No changes needed to utilities

**Layer Classes:**
- Current JSX layers work temporarily with LayerManager
- Conversion to plain JS happens in next phase
- Interface remains compatible

### External Dependencies

**pdf.js:**
- Already installed and configured
- PDFRenderer uses pdfjsLib.getDocument()
- Worker path already set in PdfViewer.jsx, replicate in PDFRenderer

**DOM APIs:**
- Standard DOM manipulation
- Canvas API for rendering
- requestAnimationFrame for timeline sync
- No special polyfills needed

---

## Testing Strategy

### Unit Testing (Per Module)

**PDFRenderer:**
- Test PDF loading with valid/invalid URLs
- Test page rendering to canvas
- Test viewport calculation
- Test rendering cancellation
- Test error handling

**TimelineSync:**
- Test setTime updates subscribers
- Test subscribe/unsubscribe
- Test continuous sync with RAF
- Test no notification on same time
- Test multiple subscribers

**LayerManager:**
- Test annotation filtering by page
- Test annotation routing by type
- Test viewport propagation
- Test timeline propagation
- Test layer instance management

**AnnotationRenderer:**
- Test subsystem initialization
- Test PDF loading flow
- Test page navigation
- Test annotation updates
- Test timeline synchronization
- Test cleanup

### Integration Testing

**Subsystem Integration:**
- Test PDFRenderer → LayerManager flow (viewport)
- Test TimelineSync → LayerManager flow (timeline)
- Test AnnotationRenderer coordination

**End-to-End:**
- Test complete annotation rendering flow
- Test with sample PDF and annotation data
- Test interactive timeline scrubbing
- Test page navigation
- Test zoom operations

### Manual Testing

**Create Test Page:**
- Vanilla JS usage example
- Load PDF, set annotations, control timeline
- Verify all features work without React

---

## Success Criteria

### Functional Requirements

✅ PDFRenderer loads and renders PDFs independently
✅ TimelineSync manages timeline state and notifications
✅ LayerManager routes annotations to correct layers
✅ AnnotationRenderer orchestrates all subsystems successfully
✅ Engine works in vanilla JavaScript (no framework required)

### Code Quality

✅ All modules are framework-agnostic (no React imports)
✅ Each module has single, clear responsibility
✅ Clean public APIs with minimal surface area
✅ Comprehensive JSDoc documentation
✅ Proper error handling throughout
✅ Resource cleanup via destroy() methods

### Architecture

✅ Clear separation of concerns
✅ Minimal coupling between subsystems
✅ Subsystems can be tested independently
✅ Easy to extend with new features
✅ Ready for framework adapter wrapping

### Integration

✅ Engine integrates with existing utilities
✅ Works with current layer implementations (temporary)
✅ Coexists with PdfViewer.jsx during development
✅ Provides foundation for ReactAdapter

---

## Next Phase Preview

After core subsystem construction:

1. **Layer Conversion** - Convert React layers to plain JS with BaseLayer
2. **Framework Adapters** - Create ReactAdapter wrapping AnnotationRenderer
3. **Enhancement** - Add validators, colorUtils, additional features
4. **Package Preparation** - Prepare for npm publishing

This plan establishes the framework-agnostic foundation that makes all future phases possible.

---

## Notes

- This plan builds the core engine without modifying existing code
- Existing PdfViewer.jsx remains functional throughout construction
- Layer conversion is separate phase after core is stable
- Focus on framework-agnostic, clean architecture
- All code uses ES6+ JavaScript (classes, async/await, modules)

### Rendering Modes

The system naturally supports three rendering modes through the annotation time values, without requiring special configuration:

**Progressive Animation:**
```javascript
{start: 2.5, end: 5.0}  // Animates gradually over 2.5 seconds
```

**Instant Rendering:**
```javascript
{start: 5, end: 5}  // Appears instantly at 5 seconds
```

**Static Rendering:**
```javascript
{start: 0, end: 0}  // Always visible throughout
```

These behaviors emerge naturally from the progress calculation's division-by-zero guard. No mode flags or special cases needed.

---
