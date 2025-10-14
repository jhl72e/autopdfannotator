# Refactoring Step 4 - Implementation

---

## What This Document Is

This document provides CODE-level implementation instructions for Refactoring Step 4: Refine Component Interfaces. This step cleans up component implementations, removes dead code, extracts viewport utilities, and ensures clear, documented interfaces.

---

## Purpose

Refine component interfaces and implementations by:
- Removing commented or dead code from components
- Extracting viewport calculation logic to utility functions
- Creating `src/utils/viewportUtils.js` for viewport operations
- Cleaning up component implementations
- Ensuring consistent patterns across layers
- Maintaining exact same functionality

---

## Prerequisites

- Step 3 has been completed successfully
- JSDoc type definitions exist in `src/types/annotations.js`
- All components have basic JSDoc documentation
- No uncommitted changes in the working directory
- Development server is stopped (if running)

---

## File Operations

### 1. Create Viewport Utils File

**File to Create:** `src/utils/viewportUtils.js`

**Complete File Content:**

```javascript
/**
 * Viewport Utility Functions
 *
 * This module provides utility functions for PDF viewport calculations
 * and transformations. These functions are used by the PDF viewer to
 * calculate viewport dimensions and manage scaling.
 */

/**
 * Calculate viewport from PDF page
 *
 * Creates a viewport object from a PDF.js page with the specified scale.
 * The viewport contains dimensions and transformation matrix for rendering.
 *
 * @param {Object} page - PDF.js page object
 * @param {number} scale - Scale factor for rendering
 * @returns {Object} Viewport object with width, height, and transform matrix
 *
 * @example
 * const viewport = calculateViewport(pdfPage, 1.5);
 * // Returns: { width: 1200, height: 1600, scale: 1.5, ... }
 */
export function calculateViewport(page, scale) {
  if (!page) {
    throw new Error('Page object is required');
  }

  return page.getViewport({ scale });
}

/**
 * Get viewport dimensions
 *
 * Extracts width and height from a viewport object.
 * Useful for coordinate transformations and layout calculations.
 *
 * @param {Object} viewport - Viewport object from PDF.js
 * @returns {{width: number, height: number}} Dimensions object
 *
 * @example
 * const { width, height } = getViewportDimensions(viewport);
 * // Returns: { width: 1200, height: 1600 }
 */
export function getViewportDimensions(viewport) {
  if (!viewport) {
    return { width: 0, height: 0 };
  }

  return {
    width: viewport.width,
    height: viewport.height
  };
}

/**
 * Calculate scaled dimensions
 *
 * Calculates dimensions for a given scale factor.
 * Used when zoom level changes to determine new canvas size.
 *
 * @param {number} baseWidth - Original width
 * @param {number} baseHeight - Original height
 * @param {number} scale - Scale factor
 * @returns {{width: number, height: number}} Scaled dimensions
 *
 * @example
 * const scaled = calculateScaledDimensions(800, 1000, 1.5);
 * // Returns: { width: 1200, height: 1500 }
 */
export function calculateScaledDimensions(baseWidth, baseHeight, scale) {
  return {
    width: baseWidth * scale,
    height: baseHeight * scale
  };
}
```

**Implementation Method:**
- Use Write tool to create the file with exact content above
- Ensure proper JSDoc formatting
- Include all function definitions and examples

---

### 2. Update PdfViewer.jsx - Extract Viewport Logic

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/core/PdfViewer.jsx`

**Changes Required:**

**Step 2a: Add import for viewportUtils**

Add after existing imports:
```javascript
import { calculateViewport } from "../utils/viewportUtils";
```

**Step 2b: Remove debug console.log**

Remove these lines (around line 56-61):
```javascript
  console.log(
    "PdfViewer 컴포넌트 렌더링됨 - pageNum:",
    pageNum,
    "scale:",
    scale
  );
```

**Step 2c: Update viewport calculation to use utility**

Find the code that calls `page.getViewport({ scale })` and replace with:
```javascript
const newViewport = calculateViewport(page, scale);
```

**Implementation Method:**
- Read PdfViewer.jsx to locate exact code patterns
- Use Edit tool to add import statement
- Use Edit tool to remove console.log
- Use Edit tool to replace viewport calculations with utility function call
- Verify no functionality changes

---

### 3. Clean Up Layer Components

**Goal:** Ensure layers are clean and have no dead code

**Files to Check:**
- `src/layers/HighlightLayer.jsx`
- `src/layers/TextLayer.jsx`
- `src/layers/DrawingLayer.jsx`

**Actions:**
- Read each file
- Identify any commented code or unused variables
- Remove dead code if found
- Ensure clean implementation
- Keep all functionality identical

**Implementation Method:**
- Read each layer file completely
- Look for:
  - Commented-out code blocks
  - Unused imports
  - Unused state variables
  - Debug console.log statements
- Remove only truly dead code
- Do not change any active logic

---

## Implementation Sequence

Execute operations in this exact order:

1. **Create viewportUtils.js**
   - Use Write tool to create `src/utils/viewportUtils.js`
   - Include complete content as specified above

2. **Update PdfViewer.jsx imports**
   - Read PdfViewer.jsx
   - Add import for calculateViewport from viewportUtils

3. **Remove debug code from PdfViewer.jsx**
   - Locate and remove console.log statement
   - Remove any other debug code if present

4. **Replace viewport calculation in PdfViewer.jsx**
   - Find `page.getViewport({ scale })` calls
   - Replace with `calculateViewport(page, scale)`

5. **Clean up HighlightLayer.jsx**
   - Read the file
   - Remove any dead code if found
   - Ensure clean implementation

6. **Clean up TextLayer.jsx**
   - Read the file
   - Remove any dead code if found
   - Ensure clean implementation

7. **Clean up DrawingLayer.jsx**
   - Read the file
   - Remove any dead code if found
   - Ensure clean implementation

---

## Validation Steps

### 1. Verify viewportUtils.js Created

**Command:**
```bash
ls -la src/utils/
```

**Expected Output:**
- `src/utils/viewportUtils.js` exists
- `src/utils/coordinateUtils.js` exists

**Verification:**
```bash
wc -l src/utils/viewportUtils.js
```

**Expected:** File contains approximately 70-80 lines

---

### 2. Verify PdfViewer Imports Updated

**Command:**
```bash
grep -n "import.*viewportUtils" src/core/PdfViewer.jsx
```

**Expected Output:**
- Line showing import of calculateViewport from viewportUtils

---

### 3. Verify Console.log Removed

**Command:**
```bash
grep -n "console.log" src/core/PdfViewer.jsx
```

**Expected Output:**
- No debug console.log statements (or only essential error logging)

---

### 4. Verify Viewport Calculation Uses Utility

**Command:**
```bash
grep -n "calculateViewport" src/core/PdfViewer.jsx
```

**Expected Output:**
- Lines showing usage of calculateViewport function

---

### 5. Build and Run Application

**Command:**
```bash
npm run dev
```

**Expected Result:**
- No build errors
- No import resolution errors
- Application starts successfully
- All functionality works identically

---

### 6. Functional Testing

**Test Cases:**

1. **PDF Rendering:**
   - PDF loads and displays correctly
   - Viewport calculations work properly
   - No visual differences from before

2. **Zoom Operations:**
   - Zoom in/out works correctly
   - Viewport updates properly
   - Annotations scale correctly

3. **Page Navigation:**
   - Page changes work
   - Viewport recalculates correctly
   - No rendering issues

4. **Annotation Display:**
   - All annotation types render
   - Timeline synchronization works
   - Progressive animations function

**Expected Result:**
- All functionality identical to before refactoring
- Cleaner, more maintainable code
- Better separation of concerns

---

## Final Directory Structure

After Step 4 completion:

```
src/                                # CORE LIBRARY
├── core/
│   └── PdfViewer.jsx              # ✅ Cleaned, uses viewportUtils
├── layers/
│   ├── HighlightLayer.jsx         # ✅ Cleaned
│   ├── TextLayer.jsx              # ✅ Cleaned
│   └── DrawingLayer.jsx           # ✅ Cleaned
├── utils/
│   ├── coordinateUtils.js
│   └── viewportUtils.js            # ✅ NEW - Viewport utilities
└── types/
    └── annotations.js

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

- ✅ `src/utils/viewportUtils.js` created with 3 utility functions
- ✅ `calculateViewport()` function exported and documented
- ✅ `getViewportDimensions()` function exported and documented
- ✅ `calculateScaledDimensions()` function exported and documented
- ✅ PdfViewer.jsx imports viewportUtils
- ✅ PdfViewer.jsx uses calculateViewport utility
- ✅ Debug console.log removed from PdfViewer
- ✅ All layer components cleaned
- ✅ No dead code in library components
- ✅ Application builds without errors
- ✅ All functionality works identically

---

## Notes

**No Functionality Changes:**
- This step only refactors and cleans code
- No logic changes
- No behavioral changes
- All features work identically

**Code Quality Improvements:**
- Better separation of concerns
- Viewport logic extracted to utilities
- Cleaner component implementations
- More maintainable codebase

**Utility Functions:**
- Viewport calculations centralized
- Reusable across components
- Well-documented with JSDoc
- Easier to test independently

**Preparation for Step 5:**
- Utility organization established
- Clear patterns for utility functions
- Foundation for additional utilities
- Ready for final utility organization

---

## Troubleshooting

**Issue: Import errors for viewportUtils**
- Verify file path is correct: `../utils/viewportUtils`
- Ensure viewportUtils.js exists
- Check export statements in viewportUtils
- Restart dev server

**Issue: Viewport calculations broken**
- Verify calculateViewport function implementation
- Check that it returns same structure as page.getViewport()
- Ensure scale parameter is passed correctly
- Test with different zoom levels

**Issue: Build errors after refactoring**
- Check for syntax errors in viewportUtils.js
- Verify all imports are correct
- Ensure no circular dependencies
- Review error messages for specific issues

**Issue: Annotations not rendering correctly**
- Verify viewport object structure unchanged
- Check that viewport dimensions are correct
- Test coordinate transformations
- Ensure no breaking changes in refactoring

---
