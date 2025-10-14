# Framework Adapters Implementation Plan

---

## What This Document Is

This document defines HOW to implement framework-specific adapter components that wrap the AnnotationRenderer core engine, providing declarative, framework-native APIs for React and future frameworks.

---

## Purpose

Create framework adapter components that transform the imperative AnnotationRenderer API into declarative, framework-specific components, starting with React's AnnotPdf component.

---

## Context

### Current System State

The system has a complete framework-agnostic core:
- AnnotationRenderer orchestrates all subsystems
- PDFRenderer, LayerManager, TimelineSync are pure JavaScript
- BaseLayer and three layer implementations (Highlight, Text, Drawing) are framework-independent
- Public API exports all core components

**Gap:** Core engine uses imperative API (method calls), which is not idiomatic for declarative frameworks like React or Vue.

### Target System State

Provide framework-specific adapters that:
- Wrap AnnotationRenderer with declarative component APIs
- Handle lifecycle management automatically
- Sync props/reactive data to engine methods
- Provide framework-native developer experience

---

## Architecture Overview

### Current (Imperative API)

```
User Code
  ↓ (manual method calls)
AnnotationRenderer
  ├── loadPDF()
  ├── setPage()
  ├── setScale()
  ├── setAnnotations()
  └── setTime()
```

**Issues:**
- Requires manual lifecycle management
- Imperative API not idiomatic for React/Vue
- Users must handle initialization and cleanup
- Prop changes require manual synchronization

---

### Target (Declarative API with Adapters)

```
User Code (Declarative)
  ↓ (props/attributes)
AnnotPdf Component (React Adapter)
  ├── Manages engine lifecycle
  ├── Syncs props to methods
  └── Handles cleanup
      ↓
AnnotationRenderer (Core Engine)
  ├── loadPDF()
  ├── setPage()
  ├── setScale()
  ├── setAnnotations()
  └── setTime()
```

**Benefits:**
- Declarative, framework-idiomatic API
- Automatic lifecycle management
- Automatic prop synchronization
- Familiar developer experience

---

## Scope

### What Is Included

**React Adapter (AnnotPdf):**
- React component wrapping AnnotationRenderer
- Props-based declarative API
- Automatic lifecycle management (mount/unmount)
- Automatic prop-to-method synchronization
- Error handling and callbacks
- Styling and layout management
- JSDoc documentation

**Public API Export:**
- Export AnnotPdf through src/index.js
- Create adapters module structure
- Documentation for adapter usage

**Code Organization:**
- Create src/adapters/ directory
- Establish pattern for future adapters

### What Is Excluded

**Other Framework Adapters:**
- VueAdapter (future phase)
- SvelteAdapter (future phase)
- AngularAdapter (future phase)

**UI Controls:**
- Navigation buttons (previous/next page)
- Zoom controls (zoom in/out buttons)
- Page number display
- Timeline scrubber
- Annotation editing tools

**Advanced Features:**
- Loading/error UI components
- Keyboard shortcuts
- Fullscreen mode
- Touch gesture support

---

## Implementation Plan

### Step 1: Create AnnotPdf Component Structure

**Goal:** Build basic React component wrapper with DOM structure and refs

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create src/adapters/ directory
2. Create AnnotPdf.jsx file
3. Import React (useRef, useEffect, useState)
4. Import AnnotationRenderer from core
5. Define component function with props
6. Create refs for DOM elements (canvas, layer container, engine instance)
7. Define JSX structure (container div → canvas + layer div)
8. Add comprehensive JSDoc documentation
9. Export component as default

**Component Props Definition:**
```javascript
/**
 * @param {Object} props - Component props
 * @param {string} props.pdfUrl - PDF document URL (required)
 * @param {number} [props.page=1] - Current page number (1-indexed)
 * @param {number} [props.scale=1.5] - Zoom scale factor
 * @param {Array} [props.annotations=[]] - Array of annotation objects
 * @param {number} [props.currentTime=0] - Timeline position in seconds
 * @param {Function} [props.onLoad] - Callback when PDF loads: ({pageCount}) => void
 * @param {Function} [props.onError] - Callback on error: (error) => void
 * @param {Function} [props.onPageChange] - Callback when page changes: (page) => void
 * @param {string} [props.className] - CSS class for container div
 * @param {Object} [props.style] - Inline styles for container div
 * @param {Object} [props.canvasStyle] - Inline styles for canvas element
 */
```

**JSX Structure:**
```jsx
<div className={className} style={containerStyle}>
  <canvas ref={canvasRef} style={canvasStyle} />
  <div ref={layerContainerRef} style={layerStyle} />
</div>
```

**Refs Needed:**
- `canvasRef` - Reference to canvas element for PDF rendering
- `layerContainerRef` - Reference to div for annotation layers
- `engineRef` - Reference to AnnotationRenderer instance

**Success Criteria:**
- ✅ Component renders without errors
- ✅ DOM structure correct (div → canvas + layer div)
- ✅ All refs properly initialized
- ✅ Props interface defined and documented
- ✅ JSDoc complete with examples
- ✅ Default prop values handled

---

### Step 2: Implement Engine Initialization and Cleanup

**Goal:** Initialize AnnotationRenderer on mount and destroy on unmount

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create initialization useEffect with empty dependency array
2. Check that canvas and layer container refs exist
3. Instantiate AnnotationRenderer with config object
4. Store engine instance in engineRef.current
5. Add error handling with try-catch
6. Call onError callback if initialization fails
7. Return cleanup function that calls engine.destroy()
8. Set engineRef.current to null after destroy

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Wait for DOM elements to be ready
  if (!canvasRef.current || !layerContainerRef.current) {
    return;
  }

  // Initialize engine
  try {
    engineRef.current = new AnnotationRenderer({
      canvasElement: canvasRef.current,
      container: layerContainerRef.current
    });
  } catch (error) {
    console.error('AnnotPdf: Failed to initialize renderer:', error);
    if (onError) {
      onError(error);
    }
  }

  // Cleanup on unmount
  return () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
  };
}, []); // Empty deps - run once on mount
```

**Lifecycle Flow:**
1. Component mounts
2. useEffect runs after first render (refs populated)
3. AnnotationRenderer instantiated
4. Component renders normally
5. Component unmounts
6. Cleanup function runs
7. Engine destroyed, resources freed

**Success Criteria:**
- ✅ Engine initializes on component mount
- ✅ Engine initializes only after refs are populated
- ✅ Initialization errors caught and handled
- ✅ onError callback fires on initialization failure
- ✅ Engine destroys on component unmount
- ✅ No memory leaks (verified with React DevTools Profiler)
- ✅ engineRef cleared after destroy

---

### Step 3: Implement PDF Loading Synchronization

**Goal:** Load PDF document when pdfUrl prop changes

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create useEffect hook with [pdfUrl] dependency
2. Guard: Check engine exists and pdfUrl is valid
3. Create async loadPdf function inside effect
4. Call engine.loadPDF(pdfUrl) and await result
5. On success, get state and call onLoad callback with pageCount
6. On error, call onError callback
7. Handle cleanup: set cancelled flag to prevent stale updates
8. Call loadPdf function

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Engine must exist and pdfUrl must be valid
  if (!engineRef.current || !pdfUrl) {
    return;
  }

  let cancelled = false;

  const loadPdf = async () => {
    try {
      await engineRef.current.loadPDF(pdfUrl);

      // Check if component unmounted during async operation
      if (cancelled) return;

      // Get engine state and call onLoad callback
      if (onLoad) {
        const state = engineRef.current.getState();
        onLoad({ pageCount: state.pageCount });
      }
    } catch (error) {
      if (cancelled) return;

      console.error('AnnotPdf: Failed to load PDF:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  loadPdf();

  // Cleanup: Prevent state updates if component unmounts during load
  return () => {
    cancelled = true;
  };
}, [pdfUrl, onLoad, onError]);
```

**Edge Cases Handled:**
- Component unmounts during PDF loading → cancelled flag prevents callbacks
- pdfUrl changes during previous load → new effect cancels old, starts new
- Invalid PDF URL → error caught, onError called
- Engine not initialized → guard prevents execution

**Success Criteria:**
- ✅ PDF loads when pdfUrl prop provided
- ✅ PDF reloads when pdfUrl prop changes
- ✅ onLoad callback fires with correct pageCount
- ✅ Loading errors caught and reported via onError
- ✅ No race conditions (cancelled flag works)
- ✅ No state updates after unmount
- ✅ Effect guards against missing engine

---

### Step 4: Implement Page Synchronization

**Goal:** Sync page prop to engine.setPage() method

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create useEffect hook with [page] dependency
2. Guard: Check engine exists and page is valid number
3. Call engine.setPage(page) and await result
4. Catch and log any errors
5. Optionally call onPageChange callback

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Engine must exist and page must be valid
  if (!engineRef.current || !page || typeof page !== 'number') {
    return;
  }

  // Sync page to engine
  engineRef.current.setPage(page)
    .then(() => {
      // Optional: Notify parent of successful page change
      if (onPageChange) {
        onPageChange(page);
      }
    })
    .catch((error) => {
      console.error('AnnotPdf: Failed to set page:', error);
      if (onError) {
        onError(error);
      }
    });
}, [page, onPageChange, onError]);
```

**Behavior:**
- Page changes immediately when prop changes
- Invalid page numbers handled by engine (throws error)
- Async operation (engine renders page)
- Error callback if page out of range

**Success Criteria:**
- ✅ Page changes when page prop changes
- ✅ Engine renders correct page
- ✅ Errors handled (invalid page number)
- ✅ onPageChange callback fires
- ✅ No unnecessary page renders

---

### Step 5: Implement Scale Synchronization

**Goal:** Sync scale prop to engine.setScale() method

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create useEffect hook with [scale] dependency
2. Guard: Check engine exists and scale is valid number
3. Call engine.setScale(scale)
4. Catch and log any errors

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Engine must exist and scale must be valid
  if (!engineRef.current || !scale || typeof scale !== 'number') {
    return;
  }

  // Sync scale to engine
  try {
    engineRef.current.setScale(scale);
  } catch (error) {
    console.error('AnnotPdf: Failed to set scale:', error);
    if (onError) {
      onError(error);
    }
  }
}, [scale, onError]);
```

**Behavior:**
- Scale changes immediately when prop changes
- Engine recalculates viewport and re-renders page
- Annotations reposition automatically

**Success Criteria:**
- ✅ Zoom changes when scale prop changes
- ✅ Page re-renders at new scale
- ✅ Annotations scale correctly
- ✅ No layout issues

---

### Step 6: Implement Annotations Synchronization

**Goal:** Sync annotations prop to engine.setAnnotations() method

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create useEffect hook with [annotations] dependency
2. Guard: Check engine exists
3. Call engine.setAnnotations(annotations || [])
4. Handle empty or undefined annotations

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Engine must exist
  if (!engineRef.current) {
    return;
  }

  // Sync annotations to engine (default to empty array)
  try {
    engineRef.current.setAnnotations(annotations || []);
  } catch (error) {
    console.error('AnnotPdf: Failed to set annotations:', error);
    if (onError) {
      onError(error);
    }
  }
}, [annotations, onError]);
```

**Behavior:**
- Annotations update when prop changes
- Engine filters by current page
- Layers re-render with new annotations
- Empty array clears all annotations

**Success Criteria:**
- ✅ Annotations display when prop provided
- ✅ Annotations update when prop changes
- ✅ Annotations clear when empty array passed
- ✅ Invalid annotations handled gracefully

---

### Step 7: Implement Timeline Synchronization

**Goal:** Sync currentTime prop to engine.setTime() method

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Create useEffect hook with [currentTime] dependency
2. Guard: Check engine exists and currentTime is defined
3. Call engine.setTime(currentTime)
4. Support 0 as valid time value

**Implementation Pattern:**
```javascript
useEffect(() => {
  // Guard: Engine must exist and currentTime must be defined
  if (!engineRef.current || currentTime === undefined || currentTime === null) {
    return;
  }

  // Sync timeline to engine
  try {
    engineRef.current.setTime(currentTime);
  } catch (error) {
    console.error('AnnotPdf: Failed to set time:', error);
    if (onError) {
      onError(error);
    }
  }
}, [currentTime, onError]);
```

**Behavior:**
- Timeline updates when prop changes
- Layers animate progressively based on time
- Time 0 is valid (show annotations at start)
- Negative times ignored

**Success Criteria:**
- ✅ Timeline updates when currentTime prop changes
- ✅ Annotations animate progressively
- ✅ Time 0 works correctly
- ✅ High-frequency updates perform well (60fps)

---

### Step 8: Implement Styling and Layout

**Goal:** Provide proper default styles and allow customization

**File:** `src/adapters/AnnotPdf.jsx`

**Tasks:**
1. Define default container style (relative positioning)
2. Define default layer style (absolute overlay)
3. Define default canvas style (block display)
4. Merge user styles with defaults (user styles override)
5. Apply styles to JSX elements

**Implementation Pattern:**
```javascript
// Define default styles
const defaultContainerStyle = {
  position: 'relative',
  display: 'inline-block',
  lineHeight: 0, // Remove extra space below canvas
  ...style // User styles override defaults
};

const defaultLayerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none', // Allow clicks to pass through
  overflow: 'hidden'
};

const defaultCanvasStyle = {
  display: 'block',
  ...canvasStyle // User styles override defaults
};

// Apply in JSX
return (
  <div className={className} style={defaultContainerStyle}>
    <canvas ref={canvasRef} style={defaultCanvasStyle} />
    <div ref={layerContainerRef} style={defaultLayerStyle} />
  </div>
);
```

**Styling Requirements:**
- Container: Relative positioning to contain absolute layers
- Layer div: Absolute positioning to overlay canvas exactly
- Canvas: Block display to prevent inline spacing issues
- pointerEvents: none on layers to allow PDF interaction

**Success Criteria:**
- ✅ Layers properly overlay canvas
- ✅ No layout gaps or misalignment
- ✅ User styles apply correctly
- ✅ Responsive to container size
- ✅ No pointer event blocking

---

### Step 9: Create Adapters Index Module

**Goal:** Create module structure for adapter exports

**File:** `src/adapters/index.js`

**Tasks:**
1. Create src/adapters/index.js file
2. Import AnnotPdf from AnnotPdf.jsx
3. Export AnnotPdf as named export
4. Add JSDoc module documentation
5. Add comments for future adapters (VueAdapter)

**Implementation:**
```javascript
/**
 * Framework Adapters
 *
 * This module exports framework-specific adapter components that wrap
 * the core AnnotationRenderer engine with declarative APIs.
 *
 * @module adapters
 */

// React Adapter - Declarative React component for PDF annotation rendering
export { default as AnnotPdf } from './AnnotPdf.jsx';

// Future adapters:
// export { default as VuePdfViewer } from './VuePdfViewer.vue';
// export { default as SveltePdfViewer } from './SveltePdfViewer.svelte';
```

**Module Structure:**
- Named exports (not default export)
- Clear naming convention: {Framework}PdfViewer
- Documentation for each adapter
- Placeholder comments for future adapters

**Success Criteria:**
- ✅ Module exports AnnotPdf correctly
- ✅ Import from adapters/index.js works
- ✅ No circular dependencies
- ✅ Documentation clear

---

### Step 10: Update Public API Exports

**Goal:** Export AnnotPdf through main public API (src/index.js)

**File:** `src/index.js`

**Tasks:**
1. Import AnnotPdf from adapters module
2. Add Framework Adapters section to exports
3. Export AnnotPdf as named export
4. Update JSDoc header to mention adapters
5. Add usage example in documentation

**Implementation:**
```javascript
// ============================================================================
// Framework Adapters
// ============================================================================
// Declarative framework-specific wrappers for AnnotationRenderer
// These provide idiomatic APIs for React, Vue, and other frameworks

import { AnnotPdf } from './adapters/index.js';

export { AnnotPdf };
```

**Export Organization:**
```javascript
// src/index.js structure:
// 1. Core Engine
// 2. PDF Rendering Subsystem
// 3. Layer Management Subsystem
// 4. Timeline Synchronization Subsystem
// 5. Layer Classes
// 6. Framework Adapters ← NEW SECTION
// 7. Utilities
// 8. Metadata
```

**Success Criteria:**
- ✅ AnnotPdf exports from main entry point
- ✅ Import from '@ai-annotator/renderer' works
- ✅ No breaking changes to existing exports
- ✅ Documentation updated
- ✅ Consistent with export organization

---

## Data Flow Architecture

### Initialization Flow

```
1. Component mounts
   ↓
2. useEffect (Step 2) runs
   ↓
3. AnnotationRenderer instantiated
   ↓
4. useEffect (Step 3) runs
   ↓
5. PDF loads via engine.loadPDF()
   ↓
6. onLoad callback fires
   ↓
7. Other useEffects run (page, scale, annotations, time)
   ↓
8. Initial render complete
```

### Prop Change Flow

```
User changes prop (e.g., page: 1 → 2)
   ↓
React re-renders component
   ↓
useEffect with [page] dependency triggers
   ↓
engine.setPage(2) called
   ↓
Engine renders new page
   ↓
Annotations filtered for new page
   ↓
Layers re-render
   ↓
Update complete
```

### Unmount Flow

```
Component unmounts
   ↓
Cleanup functions run
   ↓
engine.destroy() called
   ↓
Subsystems destroyed
   ↓
Layers cleaned up
   ↓
Resources freed
```

---

## Code Organization

### Directory Structure

```
src/
├── adapters/                      (NEW)
│   ├── index.js                   (Step 9 - Adapter exports)
│   ├── AnnotPdf.jsx           (Steps 1-8 - React component)
│   └── VuePdfViewer.vue           (Future)
├── core/
│   ├── AnnotationRenderer.js      (Existing - No changes)
│   ├── PDFRenderer.js             (Existing - No changes)
│   ├── LayerManager.js            (Existing - No changes)
│   ├── TimelineSync.js            (Existing - No changes)
│   └── PdfViewer.jsx              (Existing - Coexists)
├── layers/
│   └── [existing layer files]     (No changes)
├── types/
│   └── [existing type files]      (No changes)
├── utils/
│   └── [existing utility files]   (No changes)
└── index.js                        (Step 10 - Add adapter export)
```

### File Sizes (Estimated)

- `AnnotPdf.jsx`: ~250-300 lines
- `adapters/index.js`: ~15 lines
- `index.js` changes: +10 lines

**Total New Code:** ~275-325 lines

---

## API Comparison

### Before (Imperative API - Vanilla JS)

```javascript
import { AnnotationRenderer } from '@ai-annotator/renderer';

// Manual setup
const container = document.getElementById('layer-container');
const canvas = document.getElementById('pdf-canvas');

const renderer = new AnnotationRenderer({
  container,
  canvasElement: canvas
});

// Manual operations
await renderer.loadPDF('/document.pdf');
await renderer.setPage(1);
renderer.setScale(1.5);
renderer.setAnnotations(annotations);

// Manual timeline sync (in animation loop)
function updateTimeline(time) {
  renderer.setTime(time);
  requestAnimationFrame(updateTimeline);
}

// Manual cleanup
window.addEventListener('beforeunload', () => {
  renderer.destroy();
});
```

**Issues:**
- Verbose setup
- Manual lifecycle management
- Manual prop synchronization
- Error-prone cleanup

---

### After (Declarative API - React)

```javascript
import { AnnotPdf } from '@ai-annotator/renderer';

function MyApp() {
  const [page, setPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [annotations, setAnnotations] = useState([]);

  return (
    <AnnotPdf
      pdfUrl="/document.pdf"
      page={page}
      scale={1.5}
      annotations={annotations}
      currentTime={currentTime}
      onLoad={({ pageCount }) => console.log('Loaded:', pageCount)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

**Benefits:**
- Clean, declarative syntax
- Automatic lifecycle management
- Automatic prop synchronization
- Automatic cleanup
- Familiar React patterns

---

## Usage Examples

### Example 1: Basic PDF Display

```jsx
import React from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';

function SimplePdfViewer() {
  return (
    <AnnotPdf
      pdfUrl="/sample.pdf"
      page={1}
      scale={1.5}
    />
  );
}
```

### Example 2: With Annotations

```jsx
import React, { useState } from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';

function AnnotatedPdfViewer() {
  const [annotations] = useState([
    {
      id: '1',
      type: 'highlight',
      page: 1,
      start: 0,
      end: 5,
      quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.05 }],
      style: { color: 'rgba(255, 255, 0, 0.3)' }
    }
  ]);

  return (
    <AnnotPdf
      pdfUrl="/sample.pdf"
      page={1}
      scale={1.5}
      annotations={annotations}
      currentTime={2.5}
    />
  );
}
```

### Example 3: Audio Synchronization

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';

function AudioSyncViewer() {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [annotations, setAnnotations] = useState([]);

  // Sync timeline with audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  return (
    <div>
      <AnnotPdf
        pdfUrl="/lecture.pdf"
        page={1}
        scale={1.5}
        annotations={annotations}
        currentTime={currentTime}
      />
      <audio ref={audioRef} src="/lecture.mp3" controls />
    </div>
  );
}
```

### Example 4: Page Navigation

```jsx
import React, { useState } from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';

function NavigablePdfViewer() {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  return (
    <div>
      <AnnotPdf
        pdfUrl="/sample.pdf"
        page={page}
        scale={1.5}
        onLoad={({ pageCount }) => setPageCount(pageCount)}
      />
      <div>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span>Page {page} of {pageCount}</span>
        <button
          onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          disabled={page >= pageCount}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Example 5: Error Handling

```jsx
import React, { useState } from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';

function RobustPdfViewer() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading && <div>Loading PDF...</div>}
      {error && <div>Error: {error.message}</div>}

      <AnnotPdf
        pdfUrl="/sample.pdf"
        page={1}
        scale={1.5}
        onLoad={() => {
          setLoading(false);
          setError(null);
        }}
        onError={(err) => {
          setLoading(false);
          setError(err);
        }}
      />
    </div>
  );
}
```

---

## Integration Points

### With Core Engine

**Relationship:** AnnotPdf wraps AnnotationRenderer as black box

**Integration:**
- AnnotPdf imports AnnotationRenderer
- Instantiates engine in useEffect
- Calls engine methods when props change
- No modifications to core engine needed

**Benefits:**
- Core remains framework-agnostic
- Adapter is framework-specific
- Clean separation of concerns

---

### With Existing PdfViewer.jsx

**Coexistence Strategy:**

**Current State:**
- `src/core/PdfViewer.jsx` - Original monolithic React component
- Contains PDF rendering + layer rendering in single component
- Used in existing demo applications

**After AnnotPdf:**
- Both components coexist in codebase
- PdfViewer.jsx remains functional (no changes)
- AnnotPdf is recommended for new code
- Migration guide provided for switching

**Differences:**

| Feature | PdfViewer.jsx | AnnotPdf |
|---------|---------------|---------------|
| Architecture | Monolithic | Wraps core engine |
| PDF Rendering | Direct pdf.js | Via PDFRenderer |
| Layer Rendering | Direct React | Via LayerManager |
| Timeline | React state | Via TimelineSync |
| Framework Coupling | High | Low (adapter only) |
| Maintainability | Harder | Easier |
| Future Support | Legacy | Primary |

**Migration Path:**
1. Both components available in v1.x
2. Documentation promotes AnnotPdf
3. Deprecation warnings added to PdfViewer (future)
4. PdfViewer removed in v2.0 (future major version)

**No Breaking Changes:**
- Existing apps using PdfViewer continue to work
- AnnotPdf is additive, not replacement
- Users choose when to migrate

---

### With Layer System

**Integration:**
- AnnotPdf doesn't import layers directly
- All layer management through AnnotationRenderer
- Layers instantiated by LayerManager
- Complete encapsulation preserved

---

### With Utilities

**Integration:**
- AnnotPdf doesn't import utilities directly
- Utilities used by core engine only
- Adapter remains simple, focused on React concerns

---

## Performance Considerations

### Optimization Strategies

**1. Dependency Arrays**
- Each useEffect has minimal dependencies
- Only re-run when specific prop changes
- Prevents unnecessary engine method calls

**2. Ref Usage**
- engineRef stores instance (doesn't cause re-renders)
- canvasRef and layerContainerRef for DOM access
- Prevents re-renders from state changes

**3. Cancelled Flag**
- Prevents stale state updates after unmount
- Prevents race conditions during async operations
- No memory leaks from pending promises

**4. Timeline Updates**
- currentTime prop can update at 60fps
- engine.setTime() is synchronous and fast
- No React re-renders triggered by time changes

**5. Annotation Updates**
- Annotations array should be memoized by parent
- Use React.memo or useMemo to prevent unnecessary changes
- Engine filters and routes efficiently

### Performance Benchmarks (Expected)

- **Initialization:** < 100ms
- **PDF Loading:** Depends on file size (handled by pdf.js)
- **Page Changes:** < 100ms
- **Scale Changes:** < 200ms
- **Timeline Updates:** < 16ms (60fps)
- **Annotation Updates:** < 50ms (depends on count)

---

## Testing Strategy

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Component renders without errors
- [ ] PDF displays correctly
- [ ] Canvas element created
- [ ] Layer container created

**Prop Synchronization:**
- [ ] pdfUrl change loads new PDF
- [ ] page change renders new page
- [ ] scale change zooms correctly
- [ ] annotations prop displays annotations
- [ ] currentTime prop animates annotations

**Lifecycle:**
- [ ] Component mounts successfully
- [ ] Engine initializes after mount
- [ ] Component unmounts cleanly
- [ ] No memory leaks after unmount
- [ ] Can remount and initialize again

**Error Handling:**
- [ ] Invalid PDF URL triggers onError
- [ ] Invalid page number handled
- [ ] Missing props handled gracefully
- [ ] Initialization errors caught

**Callbacks:**
- [ ] onLoad fires with correct pageCount
- [ ] onError fires on errors
- [ ] onPageChange fires when page changes

**Styling:**
- [ ] Custom className applies
- [ ] Custom style applies
- [ ] Custom canvasStyle applies
- [ ] Layers overlay canvas correctly

### Test Files to Create

**examples/react-basic/AnnotPdfBasic.jsx**
- Simple usage example
- Single page PDF
- No annotations

**examples/react-basic/AnnotPdfAnnotations.jsx**
- Annotations example
- Multiple annotation types
- Timeline synchronization

**examples/react-audio-sync/AudioSyncDemo.jsx**
- Audio synchronization demo
- Audio element + PDF viewer
- Timeline updates from audio.currentTime

---

## Success Criteria

### Functional Requirements

- ✅ AnnotPdf component renders correctly
- ✅ All props sync to engine methods accurately
- ✅ PDF loads and displays properly
- ✅ Page navigation works smoothly
- ✅ Zoom (scale) operations work correctly
- ✅ Annotations display and animate correctly
- ✅ Timeline synchronization works at 60fps
- ✅ Lifecycle management (mount/unmount) correct
- ✅ Error handling graceful and informative
- ✅ Callbacks fire at appropriate times

### Code Quality

- ✅ Comprehensive JSDoc documentation
- ✅ Clear, readable code structure
- ✅ Proper React patterns (hooks usage)
- ✅ No memory leaks (verified)
- ✅ No unnecessary re-renders
- ✅ Consistent naming conventions
- ✅ Error messages clear and helpful

### Architecture

- ✅ Clean separation from core engine
- ✅ Framework-agnostic core preserved
- ✅ Adapter pattern established for future frameworks
- ✅ Proper encapsulation maintained
- ✅ No tight coupling between layers

### Integration

- ✅ Exports through public API (src/index.js)
- ✅ Import from '@ai-annotator/renderer' works
- ✅ Coexists with PdfViewer.jsx safely
- ✅ No breaking changes to existing code
- ✅ Works in real React applications
- ✅ Compatible with React 16.8+ (hooks)

### Performance

- ✅ Initialization fast (< 100ms)
- ✅ Timeline updates smooth (60fps)
- ✅ Page changes responsive (< 100ms)
- ✅ No performance degradation vs direct engine usage
- ✅ Memory usage stable during long sessions

### Developer Experience

- ✅ API intuitive and familiar to React developers
- ✅ Props match React conventions
- ✅ Error messages helpful
- ✅ Examples clear and comprehensive
- ✅ Easy to integrate into existing React apps

---

## Edge Cases and Error Handling

### Edge Cases to Handle

**1. Component unmounts during PDF loading:**
- Use cancelled flag to prevent state updates
- Engine destroyed before load completes

**2. Props change rapidly:**
- Each useEffect handles own prop
- Engine operations queued by browser
- No race conditions

**3. Invalid prop values:**
- Guard conditions check validity
- Invalid values ignored or use defaults
- Errors logged to console

**4. Missing required props:**
- pdfUrl required - component shows nothing if missing
- Other props have sensible defaults

**5. Engine initialization failure:**
- Caught in try-catch
- onError callback fires
- Component renders empty (no crash)

**6. PDF fails to load:**
- Promise rejection caught
- onError callback fires
- User can retry by changing pdfUrl

**7. Page out of range:**
- Engine validation throws error
- Error caught and logged
- Current page maintained

### Error Messages

**Initialization error:**
```
AnnotPdf: Failed to initialize renderer: [error details]
```

**PDF loading error:**
```
AnnotPdf: Failed to load PDF: [error details]
```

**Page change error:**
```
AnnotPdf: Failed to set page: [error details]
```

All errors also passed to onError callback for user handling.

---

## Future Extensions

### Phase 2: Vue Adapter (VuePdfViewer)

**Goal:** Create Vue 3 composition API adapter

**File:** `src/adapters/VuePdfViewer.vue`

**Approach:**
- Use Vue 3 composition API (setup function)
- Use ref() for DOM references
- Use watch() for prop synchronization
- Similar structure to AnnotPdf

**Estimated Effort:** Similar to React adapter (~250-300 lines)

---

### Phase 3: Svelte Adapter (SveltePdfViewer)

**Goal:** Create Svelte component adapter

**File:** `src/adapters/SveltePdfViewer.svelte`

**Approach:**
- Use Svelte reactive statements ($:)
- Use onMount/onDestroy for lifecycle
- Use bind:this for DOM references

**Estimated Effort:** Smaller than React (~150-200 lines due to Svelte conciseness)

---

### Phase 4: Angular Adapter

**Goal:** Create Angular component adapter

**Approach:**
- Use Angular component with @Input decorators
- Use ngOnChanges for prop sync
- Use ViewChild for DOM references
- Use ngOnInit/ngOnDestroy for lifecycle

**Estimated Effort:** Larger due to Angular verbosity (~350-400 lines)

---

### Phase 5: Web Component Adapter

**Goal:** Create framework-agnostic web component

**File:** `src/adapters/AnnotPdfElement.js`

**Approach:**
- Extend HTMLElement
- Use Custom Elements API
- Use attributes instead of props
- Works in any framework or vanilla JS

**Benefits:**
- Universal compatibility
- No framework dependency
- Native browser feature

---

## Documentation Requirements

### API Documentation (docs/API.md)

Add AnnotPdf section:

```markdown
## AnnotPdf (React Component)

Declarative React component for rendering PDF documents with timeline-synchronized annotations.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| pdfUrl | string | Yes | - | PDF document URL |
| page | number | No | 1 | Current page number (1-indexed) |
| scale | number | No | 1.5 | Zoom scale factor |
| annotations | array | No | [] | Array of annotation objects |
| currentTime | number | No | 0 | Timeline position in seconds |
| onLoad | function | No | - | Callback when PDF loads |
| onError | function | No | - | Callback on error |
| onPageChange | function | No | - | Callback when page changes |
| className | string | No | - | CSS class for container |
| style | object | No | {} | Inline styles for container |
| canvasStyle | object | No | {} | Inline styles for canvas |

### Examples

[Include usage examples from this document]
```

### Integration Guide (docs/INTEGRATION_GUIDE.md)

Add React integration section:

```markdown
## React Integration

### Installation

npm install @ai-annotator/renderer

### Basic Usage

[Include basic example]

### Audio Synchronization

[Include audio sync example]

### Page Navigation

[Include navigation example]
```

---

## Implementation Timeline

### Estimated Duration

**Total Time:** 4-6 hours for experienced developer

**Breakdown:**
- Steps 1-2 (Structure + Init): 1 hour
- Steps 3-7 (Prop sync): 2 hours
- Step 8 (Styling): 30 minutes
- Steps 9-10 (Exports): 30 minutes
- Testing: 1 hour
- Documentation: 1 hour

### Recommended Order

1. Implement Steps 1-2 first (get component rendering)
2. Test initialization and cleanup
3. Implement Steps 3-7 (add functionality incrementally)
4. Test each prop synchronization
5. Implement Step 8 (styling)
6. Test layout and appearance
7. Implement Steps 9-10 (exports)
8. Test imports from public API
9. Write examples and documentation
10. Final integration testing

---

## Dependencies

### New Dependencies

**None** - AnnotPdf only depends on:
- React (peer dependency, already required)
- AnnotationRenderer (internal dependency)

### Peer Dependencies

**package.json additions:**
```json
{
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

React 16.8+ required for hooks support.

---

## Breaking Changes

**None.**

All changes are additive:
- New directory: src/adapters/
- New files: AnnotPdf.jsx, adapters/index.js
- New export: AnnotPdf in src/index.js
- Existing code untouched and fully functional

---

## Rollback Plan

If issues arise:

1. **Remove adapter export** from src/index.js
2. **Keep adapter files** but don't export publicly
3. **Document as experimental** feature
4. **Fix issues** and re-release

No impact on core engine or existing users.

---

## Conclusion

This plan provides a complete, detailed approach for implementing the React adapter (AnnotPdf) that wraps the AnnotationRenderer core engine with a declarative, React-native API.

**Key Achievements:**
- Transforms imperative API to declarative React component
- Automatic lifecycle and prop synchronization
- Maintains framework-agnostic core
- Establishes pattern for future framework adapters
- No breaking changes to existing code

**Next Steps After Completion:**
1. Implement Vue adapter (VuePdfViewer)
2. Create comprehensive examples
3. Write integration guides
4. Consider web component adapter for universal compatibility

---

## Document Information

**Document Type:** Plan Document (HOW - Functional Level)
**Feature:** Framework Adapters Implementation
**Component:** AnnotPdf (React Adapter)
**Outline Reference:** `Instructions/Outline/Outline_docs/Outline_SystemPipeline.md`
**Status:** DRAFT
**Version:** 1.0
**Created:** October 14, 2025

---
