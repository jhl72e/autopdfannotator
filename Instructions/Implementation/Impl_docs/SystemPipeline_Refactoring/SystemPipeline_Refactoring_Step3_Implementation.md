# Refactoring Step 3 - Implementation

---

## What This Document Is

This document provides CODE-level implementation instructions for Refactoring Step 3: Establish Type System. This step creates comprehensive type definitions using JSDoc for all annotation data structures, establishing the library's data contracts and improving IDE support.

---

## Purpose

Establish the type system for the library by:
- Creating `src/types/annotations.js` with complete type definitions
- Documenting all annotation data structures using JSDoc
- Adding type annotations to library components (PdfViewer, layers)
- Providing IDE autocomplete and type checking support
- Establishing clear data contracts for the library API

---

## Prerequisites

- Step 2 has been completed successfully
- Current directory structure has library code in `src/` and demo in `examples/demo-app/`
- No uncommitted changes in the working directory
- Development server is stopped (if running)

---

## File Operations

### 1. Create Types Directory (if needed)

**Command:**
```bash
mkdir -p src/types
```

**Expected Result:**
- `src/types/` directory exists

---

### 2. Create Type Definitions File

**File to Create:** `src/types/annotations.js`

**Complete File Content:**

```javascript
/**
 * Annotation Type Definitions
 *
 * This file defines the data structures for all annotation types used in the
 * PDF annotation renderer library. These types establish the public API contract
 * for consumers of the library.
 *
 * All coordinates use normalized values (0-1 range) for position-independence
 * across different screen sizes and zoom levels.
 */

/**
 * Base annotation fields common to all annotation types
 *
 * @typedef {Object} BaseAnnotation
 * @property {string} id - Unique identifier for the annotation
 * @property {string} type - Annotation type ('highlight', 'text', or 'ink')
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Timeline start time in seconds
 * @property {number} end - Timeline end time in seconds
 */

/**
 * Highlight annotation with rectangular regions
 *
 * Renders rectangular highlight regions over PDF content with progressive
 * reveal animation from left to right.
 *
 * @typedef {Object} HighlightAnnotation
 * @property {string} id - Unique identifier
 * @property {'highlight'} type - Must be 'highlight'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {'quads'} mode - Must be 'quads' for rectangular regions
 * @property {Array<{x: number, y: number, w: number, h: number}>} quads - Array of rectangles (normalized 0-1)
 * @property {{color: string}} style - Style object with color in rgba format
 *
 * @example
 * {
 *   id: "hl-1",
 *   type: "highlight",
 *   page: 1,
 *   start: 0,
 *   end: 2,
 *   mode: "quads",
 *   quads: [
 *     { x: 0.1, y: 0.2, w: 0.8, h: 0.05 }
 *   ],
 *   style: { color: "rgba(255, 255, 0, 0.3)" }
 * }
 */

/**
 * Text box annotation
 *
 * Displays text boxes positioned absolutely over PDF content with progressive
 * text reveal animation word by word.
 *
 * @typedef {Object} TextAnnotation
 * @property {string} id - Unique identifier
 * @property {'text'} type - Must be 'text'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {string} content - Text content to display
 * @property {number} x - Normalized x position (0-1)
 * @property {number} y - Normalized y position (0-1)
 * @property {number} w - Normalized width (0-1)
 * @property {number} h - Normalized height (0-1)
 * @property {{bg: string, color: string}} style - Background and text colors
 *
 * @example
 * {
 *   id: "txt-1",
 *   type: "text",
 *   page: 1,
 *   start: 0,
 *   end: 3,
 *   content: "This is an important note",
 *   x: 0.1,
 *   y: 0.5,
 *   w: 0.3,
 *   h: 0.1,
 *   style: {
 *     bg: "rgba(255, 255, 255, 0.9)",
 *     color: "#000000"
 *   }
 * }
 */

/**
 * Ink/drawing annotation with strokes
 *
 * Renders freehand drawings and strokes on a canvas layer with progressive
 * drawing animation based on point time offsets.
 *
 * @typedef {Object} InkAnnotation
 * @property {string} id - Unique identifier
 * @property {'ink'} type - Must be 'ink'
 * @property {number} page - Page number (1-indexed)
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {Array<InkStroke>} strokes - Array of stroke objects
 *
 * @example
 * {
 *   id: "ink-1",
 *   type: "ink",
 *   page: 1,
 *   start: 0,
 *   end: 5,
 *   strokes: [
 *     {
 *       color: "#FF0000",
 *       size: 2,
 *       points: [
 *         { t: 0, x: 0.1, y: 0.1 },
 *         { t: 0.5, x: 0.2, y: 0.2 },
 *         { t: 1, x: 0.3, y: 0.1 }
 *       ]
 *     }
 *   ]
 * }
 */

/**
 * Individual stroke within an ink annotation
 *
 * @typedef {Object} InkStroke
 * @property {string} color - Stroke color (hex or rgba)
 * @property {number} size - Stroke width in pixels
 * @property {Array<InkPoint>} points - Array of points defining the stroke path
 */

/**
 * Point within an ink stroke
 *
 * @typedef {Object} InkPoint
 * @property {number} t - Time offset within stroke duration (0-1)
 * @property {number} x - Normalized x position (0-1)
 * @property {number} y - Normalized y position (0-1)
 */

/**
 * Union type for all annotation types
 *
 * @typedef {HighlightAnnotation|TextAnnotation|InkAnnotation} Annotation
 */

/**
 * Viewport dimensions for coordinate transformations
 *
 * @typedef {Object} Viewport
 * @property {number} width - Viewport width in pixels
 * @property {number} height - Viewport height in pixels
 * @property {number} [scale] - Optional scale factor
 */

// Export type definitions (for documentation purposes)
export default {};
```

**Implementation Method:**
- Use Write tool to create the file with exact content above
- Ensure proper JSDoc formatting
- Include all type definitions and examples

---

## Component Documentation Updates

After creating type definitions, add JSDoc documentation to library components.

---

### File 1: src/core/PdfViewer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/core/PdfViewer.jsx`

**Changes Required:** Add JSDoc import and component documentation

**Add at top of file (after imports):**

```javascript
/**
 * @typedef {import('../types/annotations').Annotation} Annotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */
```

**Add before component definition:**

```javascript
/**
 * PDF Viewer with Annotation Overlay
 *
 * Renders PDF documents with dynamic annotation layers synchronized to timeline position.
 * Supports highlight, text, and ink annotations with progressive animations.
 *
 * @param {Object} props - Component props
 * @param {string} props.pdfUrl - URL to PDF document
 * @param {number} props.pageNum - Current page number (1-indexed)
 * @param {Function} [props.onPageChange] - Callback when page changes
 * @param {Function} [props.onPdfLoad] - Callback when PDF loads, receives {pageCount}
 * @param {Function} [props.onError] - Callback when error occurs
 * @param {number} [props.scale=1.5] - Zoom scale factor
 * @param {string} [props.className=""] - Additional CSS class
 * @param {Object} [props.style={}] - Additional inline styles
 * @param {Annotation[]} [props.annotations=[]] - Array of annotations to render
 * @param {number} [props.nowSec=0] - Current timeline position in seconds
 * @returns {JSX.Element}
 */
```

**Implementation Method:**
- Read current PdfViewer.jsx file
- Use Edit tool to add typedef imports after existing imports
- Use Edit tool to add JSDoc comment before component definition
- Ensure no changes to component logic

---

### File 2: src/layers/HighlightLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/HighlightLayer.jsx`

**Changes Required:** Add JSDoc import and component documentation

**Add at top of file (after imports):**

```javascript
/**
 * @typedef {import('../types/annotations').HighlightAnnotation} HighlightAnnotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */
```

**Add before component definition:**

```javascript
/**
 * Highlight Layer Component
 *
 * Renders highlight annotations with progressive reveal animation.
 * Uses scaleX transform to animate from left to right based on timeline.
 *
 * @param {Object} props - Component props
 * @param {HighlightAnnotation[]} props.annos - Highlight annotations for current page
 * @param {Viewport} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position in seconds
 * @returns {JSX.Element}
 */
```

**Implementation Method:**
- Read current HighlightLayer.jsx file
- Use Edit tool to add typedef imports after existing imports
- Use Edit tool to add JSDoc comment before function definition

---

### File 3: src/layers/TextLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/TextLayer.jsx`

**Changes Required:** Add JSDoc import and component documentation

**Add at top of file (after imports):**

```javascript
/**
 * @typedef {import('../types/annotations').TextAnnotation} TextAnnotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */
```

**Add before component definition:**

```javascript
/**
 * Text Layer Component
 *
 * Renders text box annotations with progressive text reveal animation.
 * Displays text word by word based on timeline progression.
 *
 * @param {Object} props - Component props
 * @param {TextAnnotation[]} props.annos - Text annotations for current page
 * @param {Viewport} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position in seconds
 * @returns {JSX.Element}
 */
```

**Implementation Method:**
- Read current TextLayer.jsx file
- Use Edit tool to add typedef imports after existing imports
- Use Edit tool to add JSDoc comment before function definition

---

### File 4: src/layers/DrawingLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/DrawingLayer.jsx`

**Changes Required:** Add JSDoc import and component documentation

**Add at top of file (after imports):**

```javascript
/**
 * @typedef {import('../types/annotations').InkAnnotation} InkAnnotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */
```

**Add before component definition:**

```javascript
/**
 * Drawing/Ink Layer Component
 *
 * Renders ink/drawing annotations with progressive stroke animation.
 * Draws stroke points progressively based on point time offsets.
 *
 * @param {Object} props - Component props
 * @param {InkAnnotation[]} props.annos - Ink annotations for current page
 * @param {Viewport} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position in seconds
 * @returns {JSX.Element}
 */
```

**Implementation Method:**
- Read current DrawingLayer.jsx file
- Use Edit tool to add typedef imports after existing imports
- Use Edit tool to add JSDoc comment before function definition

---

## Implementation Sequence

Execute operations in this exact order:

1. **Create types directory**
   ```bash
   mkdir -p src/types
   ```

2. **Create annotations.js type definitions file**
   - Use Write tool to create `src/types/annotations.js`
   - Include complete content as specified above

3. **Update PdfViewer.jsx documentation**
   - Read the file
   - Add typedef imports after existing imports
   - Add JSDoc comment before component definition

4. **Update HighlightLayer.jsx documentation**
   - Read the file
   - Add typedef imports after existing imports
   - Add JSDoc comment before function definition

5. **Update TextLayer.jsx documentation**
   - Read the file
   - Add typedef imports after existing imports
   - Add JSDoc comment before function definition

6. **Update DrawingLayer.jsx documentation**
   - Read the file
   - Add typedef imports after existing imports
   - Add JSDoc comment before function definition

---

## Validation Steps

### 1. Verify Type Definitions File Created

**Command:**
```bash
ls -la src/types/
```

**Expected Output:**
- `src/types/annotations.js` exists

**Verification:**
```bash
wc -l src/types/annotations.js
```

**Expected:** File contains approximately 200-220 lines

---

### 2. Verify JSDoc Imports Added

**Check each file for typedef imports:**

```bash
grep -n "@typedef" src/core/PdfViewer.jsx
grep -n "@typedef" src/layers/HighlightLayer.jsx
grep -n "@typedef" src/layers/TextLayer.jsx
grep -n "@typedef" src/layers/DrawingLayer.jsx
```

**Expected Output:**
- Each file contains typedef import statements
- References correct annotation types

---

### 3. Verify Component Documentation

Read each updated file and verify:
- JSDoc comment exists before component/function definition
- All parameters documented with @param
- Return type documented with @returns
- Type references use imported typedefs

---

### 4. Build and Run Application

**Command:**
```bash
npm run dev
```

**Expected Result:**
- No build errors
- No type-related warnings
- Application starts successfully
- All functionality works identically

**Note:** This step adds only documentation, no runtime changes expected

---

### 5. IDE Type Checking

**Manual Verification:**

Open files in IDE and verify:
- Hovering over `annotations` prop shows type information
- Autocomplete suggests annotation properties
- Type errors show when incorrect data passed
- JSDoc comments appear in hover tooltips

**Expected Result:**
- IDE provides better autocomplete
- Type information visible in tooltips
- No false type errors

---

## Final Directory Structure

After Step 3 completion:

```
src/                                # CORE LIBRARY
├── core/
│   └── PdfViewer.jsx              # ✅ JSDoc documented
├── layers/
│   ├── HighlightLayer.jsx         # ✅ JSDoc documented
│   ├── TextLayer.jsx              # ✅ JSDoc documented
│   └── DrawingLayer.jsx           # ✅ JSDoc documented
├── utils/
│   └── coordinateUtils.js
└── types/                          # ✅ NEW
    └── annotations.js              # ✅ Type definitions

examples/demo-app/                  # DEMO APPLICATION
├── App.jsx
├── App.css
├── main.jsx
├── index.css
└── features/
    ├── ai-generation/
    │   ├── AIAnnotationGenerator.jsx
    │   ├── openaiService.js
    │   └── pdfTextExtractor.js
    └── manual-creation/
        ├── DrawingInputModal.jsx
        ├── HighlightInputModal.jsx
        └── TextInputModal.jsx
```

---

## Success Criteria

- ✅ `src/types/` directory created
- ✅ `src/types/annotations.js` exists with complete type definitions
- ✅ All base types defined (BaseAnnotation, HighlightAnnotation, TextAnnotation, InkAnnotation)
- ✅ Helper types defined (InkStroke, InkPoint, Viewport)
- ✅ Union type Annotation defined
- ✅ PdfViewer.jsx has typedef imports and JSDoc
- ✅ HighlightLayer.jsx has typedef imports and JSDoc
- ✅ TextLayer.jsx has typedef imports and JSDoc
- ✅ DrawingLayer.jsx has typedef imports and JSDoc
- ✅ Application builds without errors
- ✅ No runtime changes (only documentation added)
- ✅ IDE provides type information and autocomplete

---

## Notes

**No Functionality Changes:**
- This step adds only documentation
- No code logic changes
- No runtime behavior changes
- All features work identically

**Benefits:**
- Clear API contract established
- Better IDE support (autocomplete, tooltips)
- Easier for consumers to use library correctly
- Foundation for future runtime validation

**Type System Scope:**
- JSDoc only (no TypeScript yet)
- Runtime type checking not included (future step)
- Focuses on documentation and IDE support
- Maintains JavaScript compatibility

**Preparation for Step 4:**
- Type definitions ready for component refinement
- Clear data contracts for interface documentation
- Foundation for adding validators in future

---

## Troubleshooting

**Issue: Type definitions not showing in IDE**
- Restart IDE/TypeScript server
- Ensure JSDoc syntax is correct
- Check typedef import paths are correct
- Verify annotations.js exists at specified path

**Issue: JSDoc syntax errors**
- Check @typedef, @property, @param syntax
- Ensure proper braces and brackets
- Verify typedef names match imports
- Use VSCode JSDoc validation

**Issue: Build errors after adding JSDoc**
- JSDoc comments should not cause build errors
- Check for syntax errors in added comments
- Ensure imports are comments (/* */) not code
- Verify no missing closing tags

**Issue: Autocomplete not working**
- Ensure typedef imports reference correct paths
- Check component props use imported types
- Restart IDE to reload type information
- Verify JSDoc @param types match typedef names

---
