# Complete Implementation Instructions: React Adapter (AnnotPdf)

---

## **Document Information**

**File Name:** `SystemPipeline_FrameworkAdapters_ReactAdapter_Implementation.md`
**Outline:** System Pipeline
**Plan:** Framework Adapters
**Feature:** React Adapter (AnnotPdf Component)
**Implementation Level:** CODE - Technical and Methodological Specifications

---

## **What This Document Is**

This document provides complete CODE-level implementation instructions for creating the AnnotPdf React component that wraps the AnnotationRenderer core engine with a declarative, React-native API.

---

## **Implementation Overview**

### **Goal**

Create a React component named `AnnotPdf` that:
- Wraps the imperative AnnotationRenderer API
- Provides declarative props-based interface
- Handles lifecycle management automatically
- Synchronizes props to engine methods
- Manages initialization and cleanup

### **Files to Create/Modify**

**New Files:**
1. `src/adapters/AnnotPdf.jsx` - React component implementation
2. `src/adapters/index.js` - Adapter module exports

**Modified Files:**
3. `src/index.js` - Add AnnotPdf to public API exports

### **Total Lines of Code**

- `AnnotPdf.jsx`: ~280 lines
- `adapters/index.js`: ~15 lines
- `index.js` modifications: ~12 lines
- **Total**: ~307 lines

---

## **Implementation Instructions**

---

## **File 1: src/adapters/AnnotPdf.jsx**

### **Complete File Structure**

```javascript
// ============================================================================
// SECTION 1: IMPORTS
// ============================================================================

import { useRef, useEffect } from 'react';
import { AnnotationRenderer } from '../core/AnnotationRenderer.js';

// ============================================================================
// SECTION 2: JSDOC DOCUMENTATION
// ============================================================================

/**
 * AnnotPdf - Declarative React component for PDF annotation rendering
 *
 * A React wrapper around the AnnotationRenderer core engine that provides
 * a declarative, props-based API for rendering PDF documents with
 * timeline-synchronized annotations.
 *
 * Features:
 * - Automatic lifecycle management (initialization and cleanup)
 * - Declarative prop-to-method synchronization
 * - PDF rendering with pdf.js
 * - Timeline-synchronized annotation display
 * - Support for highlight, text, and ink annotations
 * - Page navigation and zoom control
 *
 * @component
 * @example
 * // Basic usage
 * <AnnotPdf
 *   pdfUrl="/document.pdf"
 *   page={1}
 *   scale={1.5}
 *   annotations={[]}
 *   currentTime={0}
 * />
 *
 * @example
 * // With audio synchronization
 * const [currentTime, setCurrentTime] = useState(0);
 *
 * <div>
 *   <AnnotPdf
 *     pdfUrl="/lecture.pdf"
 *     page={1}
 *     scale={1.5}
 *     annotations={annotations}
 *     currentTime={currentTime}
 *     onLoad={({ pageCount }) => console.log('Loaded:', pageCount)}
 *   />
 *   <audio
 *     src="/lecture.mp3"
 *     onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
 *     controls
 *   />
 * </div>
 *
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
 * @returns {JSX.Element} PDF viewer component with annotation layers
 */

// ============================================================================
// SECTION 3: COMPONENT DEFINITION
// ============================================================================

function AnnotPdf({
  // Required props
  pdfUrl,

  // Optional props with defaults
  page = 1,
  scale = 1.5,
  annotations = [],
  currentTime = 0,

  // Callbacks
  onLoad,
  onError,
  onPageChange,

  // Styling
  className,
  style,
  canvasStyle
}) {

  // ==========================================================================
  // SECTION 4: REFS INITIALIZATION
  // ==========================================================================

  /**
   * Reference to the canvas element for PDF rendering
   * @type {React.RefObject<HTMLCanvasElement>}
   */
  const canvasRef = useRef(null);

  /**
   * Reference to the layer container div for annotation layers
   * @type {React.RefObject<HTMLDivElement>}
   */
  const layerContainerRef = useRef(null);

  /**
   * Reference to the AnnotationRenderer engine instance
   * Stored in ref to avoid triggering re-renders
   * @type {React.RefObject<AnnotationRenderer|null>}
   */
  const engineRef = useRef(null);

  // ==========================================================================
  // SECTION 5: ENGINE INITIALIZATION AND CLEANUP
  // ==========================================================================

  /**
   * Initialize AnnotationRenderer on component mount
   * Cleanup on component unmount
   */
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

  // ==========================================================================
  // SECTION 6: PDF LOADING SYNCHRONIZATION
  // ==========================================================================

  /**
   * Load PDF document when pdfUrl prop changes
   * Handles async operation with cancellation support
   */
  useEffect(() => {
    // Guard: Engine must exist and pdfUrl must be valid
    if (!engineRef.current || !pdfUrl) {
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const result = await engineRef.current.loadPDF(pdfUrl);

        // Check if component unmounted during async operation
        if (cancelled) return;

        // Check if load was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to load PDF:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
          return;
        }

        // Call onLoad callback with pageCount from result
        if (onLoad) {
          onLoad({ pageCount: result.pageCount });
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

  // ==========================================================================
  // SECTION 7: PAGE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync page prop to engine.setPage() method
   */
  useEffect(() => {
    // Guard: Engine must exist and page must be valid
    if (!engineRef.current || !page || typeof page !== 'number') {
      return;
    }

    // Sync page to engine
    engineRef.current.setPage(page)
      .then((result) => {
        // Check if page change was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to set page:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
          return;
        }

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

  // ==========================================================================
  // SECTION 8: SCALE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync scale prop to engine.setScale() method
   */
  useEffect(() => {
    // Guard: Engine must exist and scale must be valid
    if (!engineRef.current || !scale || typeof scale !== 'number') {
      return;
    }

    // Sync scale to engine (async method)
    engineRef.current.setScale(scale)
      .then((result) => {
        // Check if scale change was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to set scale:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
        }
      })
      .catch((error) => {
        console.error('AnnotPdf: Failed to set scale:', error);
        if (onError) {
          onError(error);
        }
      });
  }, [scale, onError]);

  // ==========================================================================
  // SECTION 9: ANNOTATIONS SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync annotations prop to engine.setAnnotations() method
   */
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

  // ==========================================================================
  // SECTION 10: TIMELINE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync currentTime prop to engine.setTime() method
   */
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

  // ==========================================================================
  // SECTION 11: STYLING DEFINITIONS
  // ==========================================================================

  /**
   * Default container styles
   * Merged with user-provided styles (user styles override defaults)
   */
  const defaultContainerStyle = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 0, // Remove extra space below canvas
    ...style // User styles override defaults
  };

  /**
   * Default layer container styles
   * Positions layer div absolutely over canvas
   */
  const defaultLayerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allow clicks to pass through to canvas
    overflow: 'hidden'
  };

  /**
   * Default canvas styles
   * Merged with user-provided canvasStyle
   */
  const defaultCanvasStyle = {
    display: 'block',
    ...canvasStyle // User styles override defaults
  };

  // ==========================================================================
  // SECTION 12: JSX RETURN
  // ==========================================================================

  return (
    <div className={className} style={defaultContainerStyle}>
      <canvas ref={canvasRef} style={defaultCanvasStyle} />
      <div ref={layerContainerRef} style={defaultLayerStyle} />
    </div>
  );
}

// ============================================================================
// SECTION 13: EXPORT
// ============================================================================

export default AnnotPdf;
```

---

## **File 2: src/adapters/index.js**

### **Complete File Contents**

```javascript
/**
 * Framework Adapters
 *
 * This module exports framework-specific adapter components that wrap
 * the core AnnotationRenderer engine with declarative APIs.
 *
 * Each adapter provides a framework-native, declarative interface to the
 * imperative AnnotationRenderer API, handling lifecycle management and
 * prop synchronization automatically.
 *
 * @module adapters
 */

// ============================================================================
// React Adapter
// ============================================================================

/**
 * React component for declarative PDF annotation rendering
 * Wraps AnnotationRenderer with React hooks and props-based API
 */
export { default as AnnotPdf } from './AnnotPdf.jsx';

// ============================================================================
// Future Adapters (Placeholders)
// ============================================================================

// Vue 3 Composition API adapter (future implementation)
// export { default as VuePdfViewer } from './VuePdfViewer.vue';

// Svelte adapter (future implementation)
// export { default as SveltePdfViewer } from './SveltePdfViewer.svelte';

// Angular adapter (future implementation)
// export { default as AngularPdfViewer } from './AngularPdfViewer';

// Web Component adapter (future implementation)
// export { default as PdfViewerElement } from './PdfViewerElement.js';
```

---

## **File 3: src/index.js (Modifications)**

### **Instructions**

1. Open `src/index.js`
2. Locate the existing export sections
3. Add the following section AFTER the "Layer Classes" section and BEFORE the "Utilities" section

### **Code to Add**

```javascript
// ============================================================================
// Framework Adapters
// ============================================================================
// Declarative framework-specific wrappers for AnnotationRenderer
// These provide idiomatic APIs for React, Vue, and other frameworks

/**
 * React adapter component for declarative PDF annotation rendering
 * @see {@link AnnotPdf}
 */
export { AnnotPdf } from './adapters/index.js';

// Future framework adapters will be exported here:
// export { VuePdfViewer } from './adapters/index.js';
// export { SveltePdfViewer } from './adapters/index.js';

```

### **Expected src/index.js Structure After Modification**

```javascript
// ============================================================================
// Public API Entry Point
// ============================================================================

// ... existing imports and exports ...

// ============================================================================
// Core Engine
// ============================================================================
// ... existing exports ...

// ============================================================================
// PDF Rendering Subsystem
// ============================================================================
// ... existing exports ...

// ============================================================================
// Layer Management Subsystem
// ============================================================================
// ... existing exports ...

// ============================================================================
// Timeline Synchronization Subsystem
// ============================================================================
// ... existing exports ...

// ============================================================================
// Layer Classes
// ============================================================================
// ... existing exports ...

// ============================================================================
// Framework Adapters                                    ← NEW SECTION
// ============================================================================
// Declarative framework-specific wrappers for AnnotationRenderer
// These provide idiomatic APIs for React, Vue, and other frameworks

export { AnnotPdf } from './adapters/index.js';

// ============================================================================
// Utilities
// ============================================================================
// ... existing exports ...

// ============================================================================
// Type Definitions & Validators
// ============================================================================
// ... existing exports ...

// ============================================================================
// Metadata
// ============================================================================
// ... existing exports ...
```

---

## **Implementation Checklist**

### **Pre-Implementation**

- [ ] Confirm AnnotationRenderer exists at `src/core/AnnotationRenderer.js`
- [ ] Confirm AnnotationRenderer has required methods: `loadPDF()`, `setPage()`, `setScale()`, `setAnnotations()`, `setTime()`, `destroy()`, `getState()`
- [ ] Confirm React version is 16.8+ (hooks support)

### **Implementation Steps**

**Step 1: Create Directory Structure**
- [ ] Create directory `src/adapters/`

**Step 2: Create AnnotPdf.jsx**
- [ ] Create file `src/adapters/AnnotPdf.jsx`
- [ ] Copy complete implementation from File 1 above
- [ ] Verify all 13 sections are present
- [ ] Verify imports are correct
- [ ] Verify all useEffect hooks present (6 total)
- [ ] Verify JSDoc documentation complete

**Step 3: Create adapters/index.js**
- [ ] Create file `src/adapters/index.js`
- [ ] Copy complete implementation from File 2 above
- [ ] Verify export statement correct
- [ ] Verify module documentation present

**Step 4: Update src/index.js**
- [ ] Open `src/index.js`
- [ ] Locate insertion point (after Layer Classes, before Utilities)
- [ ] Add Framework Adapters section from File 3 above
- [ ] Verify import path correct: `'./adapters/index.js'`
- [ ] Verify named export syntax: `export { AnnotPdf }`

**Step 5: Verify File Structure**
- [ ] Confirm directory structure matches specification
- [ ] Confirm no typos in file names
- [ ] Confirm all imports use correct paths

---

## **Technical Specifications**

### **Component Props Specification**

| Prop | Type | Required | Default | Validation |
|------|------|----------|---------|------------|
| pdfUrl | string | Yes | - | Must be non-empty string |
| page | number | No | 1 | Must be positive integer |
| scale | number | No | 1.5 | Must be positive number |
| annotations | array | No | [] | Must be array (can be empty) |
| currentTime | number | No | 0 | Must be number >= 0 |
| onLoad | function | No | undefined | Must be function or undefined |
| onError | function | No | undefined | Must be function or undefined |
| onPageChange | function | No | undefined | Must be function or undefined |
| className | string | No | undefined | Any valid CSS class string |
| style | object | No | {} | Must be valid React style object |
| canvasStyle | object | No | {} | Must be valid React style object |

### **Refs Specification**

```javascript
// canvasRef - Reference to canvas DOM element
const canvasRef = useRef(null);
// Type: React.RefObject<HTMLCanvasElement>
// Purpose: Pass to AnnotationRenderer constructor as canvasElement

// layerContainerRef - Reference to layer container DOM element
const layerContainerRef = useRef(null);
// Type: React.RefObject<HTMLDivElement>
// Purpose: Pass to AnnotationRenderer constructor as container

// engineRef - Reference to AnnotationRenderer instance
const engineRef = useRef(null);
// Type: React.RefObject<AnnotationRenderer|null>
// Purpose: Store engine instance without causing re-renders
// Lifecycle: Set on mount, cleared on unmount
```

### **useEffect Hooks Specification**

**Hook 1: Engine Initialization**
- **Dependencies**: `[]` (empty - run once)
- **Purpose**: Initialize AnnotationRenderer on mount, destroy on unmount
- **Guard**: Check canvasRef and layerContainerRef exist
- **Actions**: Create engine, store in engineRef
- **Cleanup**: Call engine.destroy(), set engineRef to null
- **Error Handling**: Try-catch, call onError callback

**Hook 2: PDF Loading**
- **Dependencies**: `[pdfUrl, onLoad, onError]`
- **Purpose**: Load PDF when pdfUrl changes
- **Guard**: Check engineRef exists and pdfUrl is valid
- **Actions**: Async loadPDF, call onLoad with pageCount
- **Cleanup**: Set cancelled flag to prevent stale updates
- **Error Handling**: Catch promise rejection, call onError

**Hook 3: Page Synchronization**
- **Dependencies**: `[page, onPageChange, onError]`
- **Purpose**: Sync page prop to engine.setPage()
- **Guard**: Check engineRef exists, page is valid number
- **Actions**: Call engine.setPage(), optionally call onPageChange
- **Cleanup**: None
- **Error Handling**: Catch promise rejection, call onError

**Hook 4: Scale Synchronization**
- **Dependencies**: `[scale, onError]`
- **Purpose**: Sync scale prop to engine.setScale()
- **Guard**: Check engineRef exists, scale is valid number
- **Actions**: Call engine.setScale()
- **Cleanup**: None
- **Error Handling**: Try-catch, call onError

**Hook 5: Annotations Synchronization**
- **Dependencies**: `[annotations, onError]`
- **Purpose**: Sync annotations prop to engine.setAnnotations()
- **Guard**: Check engineRef exists
- **Actions**: Call engine.setAnnotations(annotations || [])
- **Cleanup**: None
- **Error Handling**: Try-catch, call onError

**Hook 6: Timeline Synchronization**
- **Dependencies**: `[currentTime, onError]`
- **Purpose**: Sync currentTime prop to engine.setTime()
- **Guard**: Check engineRef exists, currentTime not undefined/null
- **Actions**: Call engine.setTime()
- **Cleanup**: None
- **Error Handling**: Try-catch, call onError

### **Styling Specification**

**Container Style (defaultContainerStyle)**
```javascript
{
  position: 'relative',        // Required: Contains absolute layers
  display: 'inline-block',     // Shrink-wrap to canvas size
  lineHeight: 0,               // Remove inline element spacing
  ...style                     // User overrides
}
```

**Layer Container Style (defaultLayerStyle)**
```javascript
{
  position: 'absolute',        // Overlay canvas
  top: 0,                      // Align with canvas
  left: 0,                     // Align with canvas
  width: '100%',               // Match canvas width
  height: '100%',              // Match canvas height
  pointerEvents: 'none',       // Allow clicks through to canvas
  overflow: 'hidden'           // Clip annotations outside bounds
}
```

**Canvas Style (defaultCanvasStyle)**
```javascript
{
  display: 'block',            // Remove inline spacing
  ...canvasStyle               // User overrides
}
```

### **Error Message Formats**

All error messages follow the pattern: `"AnnotPdf: [Context]: [error details]"`

- Initialization: `"AnnotPdf: Failed to initialize renderer: [error]"`
- PDF Loading: `"AnnotPdf: Failed to load PDF: [error]"`
- Page Change: `"AnnotPdf: Failed to set page: [error]"`
- Scale Change: `"AnnotPdf: Failed to set scale: [error]"`
- Annotations: `"AnnotPdf: Failed to set annotations: [error]"`
- Timeline: `"AnnotPdf: Failed to set time: [error]"`

All errors logged to console AND passed to onError callback (if provided).

### **JSX Structure Specification**

```jsx
<div className={className} style={defaultContainerStyle}>
  <canvas ref={canvasRef} style={defaultCanvasStyle} />
  <div ref={layerContainerRef} style={defaultLayerStyle} />
</div>
```

**Requirements:**
- Container div wraps both elements
- Canvas comes first (z-index: 0 implicit)
- Layer div comes second (z-index: 1 implicit)
- Refs attached to canvas and layer div
- Styles applied to all three elements
- className only on container (not on canvas/layer div)

---

## **Validation & Testing**

### **Manual Testing Steps**

**Test 1: Basic Rendering**
1. Create test file: `examples/react-basic/TestAnnotPdf.jsx`
2. Import AnnotPdf
3. Render with minimal props: `<AnnotPdf pdfUrl="/test.pdf" />`
4. Verify component renders without errors
5. Verify PDF displays in browser
6. Verify no console errors

**Test 2: Page Navigation**
1. Add state: `const [page, setPage] = useState(1)`
2. Add buttons to change page
3. Verify page changes when state updates
4. Verify onPageChange callback fires
5. Verify no errors on invalid page numbers

**Test 3: Zoom Control**
1. Add state: `const [scale, setScale] = useState(1.5)`
2. Add buttons to change scale
3. Verify zoom changes when state updates
4. Verify annotations scale correctly

**Test 4: Annotations Display**
1. Create test annotations array
2. Pass as prop: `annotations={testAnnotations}`
3. Verify annotations render on PDF
4. Verify annotations positioned correctly

**Test 5: Timeline Synchronization**
1. Add state: `const [time, setTime] = useState(0)`
2. Add slider or auto-incrementing timer
3. Verify annotations animate as time changes
4. Verify smooth 60fps animation

**Test 6: Lifecycle**
1. Add conditional rendering: `{show && <AnnotPdf ... />}`
2. Toggle show state
3. Verify component mounts successfully
4. Verify component unmounts without errors
5. Use React DevTools Profiler to check for memory leaks
6. Verify no console errors after unmount

**Test 7: Error Handling**
1. Test invalid PDF URL
2. Verify onError callback fires
3. Verify error message format correct
4. Verify component doesn't crash

**Test 8: Prop Changes**
1. Change pdfUrl dynamically
2. Verify new PDF loads
3. Verify previous PDF cleaned up
4. Verify no memory leaks

### **Expected Behavior**

**Initialization Flow:**
1. Component renders (JSX with refs)
2. First render complete (refs populated)
3. Initialization useEffect runs
4. AnnotationRenderer instantiated
5. PDF loading useEffect runs
6. PDF loads asynchronously
7. onLoad callback fires
8. Other useEffects run (page, scale, annotations, time)
9. Component fully initialized

**Prop Change Flow:**
1. Parent changes prop (e.g., page)
2. React re-renders component
3. Corresponding useEffect triggers
4. Engine method called (e.g., setPage)
5. Engine updates internal state
6. Engine re-renders affected subsystems
7. Update visible in browser

**Unmount Flow:**
1. Component unmounts
2. All cleanup functions run
3. Initialization cleanup runs
4. engine.destroy() called
5. All subsystems destroyed
6. All layers cleaned up
7. Canvas cleared
8. Event listeners removed
9. Memory freed

---

## **Edge Cases & Error Handling**

### **Edge Case 1: Component Unmounts During PDF Loading**

**Scenario:** User navigates away before PDF finishes loading

**Handling:**
- Cancelled flag set in cleanup function
- Async operation completes but checks cancelled flag
- No callbacks fired if cancelled
- No state updates after unmount
- No errors in console

**Code Pattern:**
```javascript
let cancelled = false;
// ... async operation
if (cancelled) return;
// ... success handling
return () => { cancelled = true; };
```

### **Edge Case 2: Props Change Rapidly**

**Scenario:** User rapidly changes page or scale (e.g., slider dragging)

**Handling:**
- Each useEffect re-executes when its deps change
- Engine handles rapid method calls
- React batches state updates
- No race conditions
- Last call wins

**Mitigation:** Users can debounce/throttle prop changes in parent component if needed

### **Edge Case 3: Invalid Prop Values**

**Scenario:** User passes invalid prop values

**Handling:**
- Guards check validity before calling engine methods
- Invalid values ignored (useEffect returns early)
- Default values used when possible
- No errors thrown, no crashes
- Error logged to console if critical

**Examples:**
- `page="invalid"` → Guard checks `typeof page !== 'number'`, returns early
- `scale={-1}` → Engine validates, throws error, caught and logged
- `annotations={null}` → Fallback to empty array: `annotations || []`

### **Edge Case 4: Missing Required Prop (pdfUrl)**

**Scenario:** User doesn't provide pdfUrl

**Handling:**
- Guard in PDF loading useEffect checks `!pdfUrl`
- Returns early, no PDF loaded
- Component renders empty (just container div)
- No errors, no crashes
- User can provide pdfUrl later (will trigger load)

### **Edge Case 5: Engine Initialization Failure**

**Scenario:** AnnotationRenderer constructor throws error

**Handling:**
- Try-catch wraps initialization
- Error caught and logged
- onError callback fired
- engineRef remains null
- All other useEffects guard against null engineRef
- Component renders but non-functional
- User can retry by remounting

### **Edge Case 6: PDF Load Failure**

**Scenario:** PDF URL invalid or network error

**Handling:**
- Promise rejection caught in async handler
- Error logged to console
- onError callback fired with error object
- Component remains mounted
- User can change pdfUrl to retry

### **Edge Case 7: Page Out of Range**

**Scenario:** User sets page to invalid number (e.g., page 999 of 10-page PDF)

**Handling:**
- Engine's setPage() validates page number
- Throws error if out of range
- Error caught in promise .catch()
- onError callback fired
- Current page maintained (no change)

### **Edge Case 8: Multiple AnnotPdf Instances**

**Scenario:** User renders multiple AnnotPdf components simultaneously

**Handling:**
- Each instance has its own refs
- Each instance has its own engine
- No shared state between instances
- Each operates independently
- All instances cleaned up on unmount

---

## **Performance Considerations**

### **Optimization 1: Minimal Re-renders**

**Strategy:** Use refs instead of state for engine storage
- engineRef.current doesn't trigger re-renders when changed
- Only props changes trigger re-renders
- Timeline updates don't cause React re-renders (direct engine call)

### **Optimization 2: Targeted useEffect Dependencies**

**Strategy:** Each useEffect has minimal, specific dependencies
- Prevents unnecessary effect executions
- Only runs when relevant prop changes
- Example: Timeline useEffect only depends on currentTime

### **Optimization 3: Cancellation Flags**

**Strategy:** Prevent stale updates after unmount or prop changes
- Prevents memory leaks
- Prevents "setState on unmounted component" warnings
- Prevents race conditions from overlapping async operations

### **Optimization 4: Direct Engine Method Calls**

**Strategy:** Call engine methods directly, not through React state
- Timeline updates (60fps) go directly to engine
- No React render cycle for timeline changes
- Smooth animation performance

### **Optimization 5: Memoization Hints for Users**

**Documentation Note:** Recommend users memoize annotations array
```javascript
// Good: Memoized annotations (prevents unnecessary updates)
const annotations = useMemo(() => [...], [deps]);

// Bad: New array every render (triggers useEffect every render)
const annotations = [...]; // Don't do this
```

### **Expected Performance Metrics**

- **Initialization Time:** < 100ms
- **PDF Load Time:** Depends on file size (pdf.js performance)
- **Page Change Time:** < 100ms
- **Scale Change Time:** < 200ms (includes re-render)
- **Timeline Update Time:** < 16ms (60fps requirement)
- **Annotation Update Time:** < 50ms (depends on annotation count)
- **Memory Usage:** Stable across long sessions
- **Re-render Count:** Minimal (only on prop changes)

---

## **Integration Points**

### **With Core Engine (AnnotationRenderer)**

**Relationship:** Black box wrapper

**AnnotPdf Actions:**
- Import AnnotationRenderer class
- Instantiate with config object: `{ canvasElement, container }`
- Call public methods: loadPDF, setPage, setScale, setAnnotations, setTime, destroy, getState
- Handle errors from engine

**AnnotPdf Does NOT:**
- Access engine internal state directly
- Modify engine implementation
- Import or use subsystems (PDFRenderer, LayerManager, TimelineSync)
- Import or use layers (HighlightLayer, TextLayer, DrawingLayer)
- Import or use utilities

**Coupling Level:** Low - Only depends on public API

### **With Existing PdfViewer.jsx**

**Coexistence Strategy:** Both components remain functional

**Differences:**
- PdfViewer.jsx: Monolithic React component (legacy)
- AnnotPdf: Thin wrapper over core engine (new)

**No Conflicts:**
- Both can be used in same codebase
- Both exported from src/index.js
- Users choose which to use
- No breaking changes to PdfViewer.jsx

**Recommendation:** New code uses AnnotPdf, existing code can continue using PdfViewer.jsx

### **With Layers System**

**Relationship:** Fully encapsulated

**AnnotPdf Does NOT:**
- Import layer classes
- Create layer instances
- Call layer methods
- Access layer state

**All Layer Management Through:** AnnotationRenderer (via LayerManager)

### **With Utilities**

**Relationship:** Indirect (through core engine)

**AnnotPdf Does NOT:**
- Import utility functions
- Call utility functions
- Use coordinateUtils, viewportUtils, colorUtils

**All Utilities Used By:** Core engine and layers

---

## **Documentation Requirements**

After implementation, update the following documentation files (NOT PART OF THIS IMPLEMENTATION - REQUIRES USER CONFIRMATION):

**docs/API.md**
- Add AnnotPdf Props Reference section
- Add AnnotPdf Usage Examples section
- Add AnnotPdf Callbacks Reference section

**docs/INTEGRATION_GUIDE.md**
- Add React Integration section
- Add Installation instructions
- Add Basic usage example
- Add Audio synchronization example
- Add Page navigation example

**README.md**
- Update Quick Start section with React example
- Add Framework Support section mentioning React adapter

---

## **Success Criteria**

### **Implementation Complete When:**

**Code Quality:**
- ✅ All 3 files created/modified correctly
- ✅ All imports resolve correctly
- ✅ All exports work correctly
- ✅ JSDoc documentation complete
- ✅ Code follows existing project style
- ✅ No linting errors
- ✅ No TypeScript errors (if applicable)

**Functionality:**
- ✅ Component renders without errors
- ✅ PDF loads and displays correctly
- ✅ Page navigation works
- ✅ Zoom works
- ✅ Annotations display correctly
- ✅ Timeline synchronization works at 60fps
- ✅ All callbacks fire at correct times

**Lifecycle:**
- ✅ Engine initializes on mount
- ✅ Engine destroys on unmount
- ✅ No memory leaks (verified with React DevTools)
- ✅ No "setState on unmounted component" warnings
- ✅ Cancellation flags work correctly

**Error Handling:**
- ✅ Invalid props handled gracefully
- ✅ Engine errors caught and reported
- ✅ onError callback fires correctly
- ✅ Component doesn't crash on errors
- ✅ Error messages clear and helpful

**Integration:**
- ✅ Import from `'@ai-annotator/renderer'` works
- ✅ Import as `import { AnnotPdf } from '...'` works
- ✅ Works in real React application
- ✅ Coexists with PdfViewer.jsx
- ✅ No breaking changes to existing code

**Performance:**
- ✅ Initialization fast (< 100ms)
- ✅ Timeline updates smooth (60fps)
- ✅ No unnecessary re-renders
- ✅ Memory usage stable

**Testing:**
- ✅ All manual tests pass
- ✅ Example file works correctly
- ✅ Tested in real browser (Chrome/Firefox/Safari)
- ✅ No console errors or warnings

---

## **Post-Implementation Steps**

After code implementation is complete and verified:

1. **Create Example Files** (in examples/ directory)
   - Basic usage example
   - Annotations example
   - Audio sync example
   - Page navigation example

2. **Update Documentation** (after user confirmation)
   - API.md
   - INTEGRATION_GUIDE.md
   - README.md

3. **Testing**
   - Run in development environment
   - Test all features manually
   - Verify no memory leaks
   - Test in multiple browsers

4. **Code Review**
   - Review code against this specification
   - Verify all requirements met
   - Check for edge case handling
   - Verify error handling complete

5. **Integration Testing**
   - Test import from public API
   - Test with real PDF files
   - Test with real annotation data
   - Test with audio/video synchronization

---

## **Common Implementation Mistakes to Avoid**

### **Mistake 1: Forgetting Guards**
❌ **Wrong:**
```javascript
useEffect(() => {
  engineRef.current.setPage(page); // No guard!
}, [page]);
```

✅ **Correct:**
```javascript
useEffect(() => {
  if (!engineRef.current || !page || typeof page !== 'number') {
    return;
  }
  engineRef.current.setPage(page);
}, [page]);
```

### **Mistake 2: Missing Cancellation Flag**
❌ **Wrong:**
```javascript
useEffect(() => {
  const load = async () => {
    await engineRef.current.loadPDF(pdfUrl);
    if (onLoad) onLoad({ pageCount: 10 }); // Might be unmounted!
  };
  load();
}, [pdfUrl]);
```

✅ **Correct:**
```javascript
useEffect(() => {
  let cancelled = false;
  const load = async () => {
    await engineRef.current.loadPDF(pdfUrl);
    if (cancelled) return; // Check before updating
    if (onLoad) onLoad({ pageCount: 10 });
  };
  load();
  return () => { cancelled = true; };
}, [pdfUrl]);
```

### **Mistake 3: Using State for Engine**
❌ **Wrong:**
```javascript
const [engine, setEngine] = useState(null); // Causes re-renders!
```

✅ **Correct:**
```javascript
const engineRef = useRef(null); // No re-renders
```

### **Mistake 4: Wrong Dependency Arrays**
❌ **Wrong:**
```javascript
useEffect(() => {
  engineRef.current.setPage(page);
}, []); // Missing 'page' dependency!
```

✅ **Correct:**
```javascript
useEffect(() => {
  if (!engineRef.current || !page) return;
  engineRef.current.setPage(page);
}, [page]); // Include all used props
```

### **Mistake 5: Forgetting Error Handling**
❌ **Wrong:**
```javascript
useEffect(() => {
  engineRef.current.setScale(scale); // Might throw!
}, [scale]);
```

✅ **Correct:**
```javascript
useEffect(() => {
  if (!engineRef.current || !scale) return;
  try {
    engineRef.current.setScale(scale);
  } catch (error) {
    console.error('AnnotPdf: Failed to set scale:', error);
    if (onError) onError(error);
  }
}, [scale, onError]);
```

### **Mistake 6: Not Merging User Styles**
❌ **Wrong:**
```javascript
const containerStyle = { position: 'relative' }; // Ignores user styles!
```

✅ **Correct:**
```javascript
const containerStyle = {
  position: 'relative',
  ...style // User styles override defaults
};
```

### **Mistake 7: Wrong Import Paths**
❌ **Wrong:**
```javascript
import { AnnotationRenderer } from '../AnnotationRenderer'; // Wrong path!
```

✅ **Correct:**
```javascript
import { AnnotationRenderer } from '../core/AnnotationRenderer.js';
```

---

## **Final Checklist Before Submission**

- [ ] All 3 files created/modified
- [ ] All code copied exactly as specified
- [ ] All imports correct
- [ ] All exports correct
- [ ] JSDoc complete
- [ ] All 6 useEffect hooks present
- [ ] All guards present
- [ ] All error handling present
- [ ] Cancellation flag present
- [ ] Styling correct
- [ ] JSX structure correct
- [ ] No syntax errors
- [ ] No console errors when rendering
- [ ] Component renders successfully
- [ ] Can import from public API
- [ ] Manual tests pass

---

## **Implementation Complete**

When all checklist items are complete and all success criteria are met, the implementation is done.

Next phase (after user confirmation): Create examples and update documentation.

---
