# Refactoring Step 1 - Implementation

---

## What This Document Is

This document provides CODE-level implementation instructions for Refactoring Step 1: Establish Core Library Structure. This step reorganizes existing files into the core library hierarchy (`src/layers/`, `src/core/`, `src/utils/`) that aligns with the final library architecture.

---

## Purpose

Reorganize the current flat file structure into a hierarchical library structure by:
- Moving `src/PdfViewer.jsx` to `src/core/PdfViewer.jsx`
- Renaming `src/utils/coords.jsx` to `src/utils/coordinateUtils.js`
- Updating all import paths to reference new file locations

---

## Prerequisites

- All existing files are in their current locations
- No uncommitted changes in the working directory
- Development server is stopped (if running)

---

## File Operations

### 1. Create Core Directory

**Command:**
```bash
mkdir -p src/core
```

**Expected Result:**
- `src/core/` directory exists

---

### 2. Move PdfViewer to Core

**Command:**
```bash
mv src/PdfViewer.jsx src/core/PdfViewer.jsx
```

**Expected Result:**
- `src/core/PdfViewer.jsx` exists
- `src/PdfViewer.jsx` no longer exists

---

### 3. Rename Coordinate Utility File

**Command:**
```bash
mv src/utils/coords.jsx src/utils/coordinateUtils.js
```

**Expected Result:**
- `src/utils/coordinateUtils.js` exists
- `src/utils/coords.jsx` no longer exists

---

## Import Path Updates

After moving files, update import statements in 5 files to reference new locations.

---

### File 1: src/core/PdfViewer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/core/PdfViewer.jsx`

**Changes Required:** 3 import statement updates (layer imports use relative paths, so they need to go up one directory)

**Import Update 1 - HighlightLayer:**

OLD:
```javascript
import HighlightLayer from "./layers/HighlightLayer";
```

NEW:
```javascript
import HighlightLayer from "../layers/HighlightLayer";
```

**Import Update 2 - TextLayer:**

OLD:
```javascript
import TextLayer from "./layers/TextLayer";
```

NEW:
```javascript
import TextLayer from "../layers/TextLayer";
```

**Import Update 3 - DrawingLayer:**

OLD:
```javascript
import DrawingLayer from "./layers/DrawingLayer";
```

NEW:
```javascript
import DrawingLayer from "../layers/DrawingLayer";
```

**Implementation Method:**
- Use Edit tool to replace each import statement individually
- Ensure exact string match for old_string
- Verify all 3 imports are updated

---

### File 2: src/layers/HighlightLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/HighlightLayer.jsx`

**Changes Required:** 1 import statement update (coordinate utility renamed)

**Import Update:**

OLD:
```javascript
import { rectNormToAbs } from "../utils/coords";
```

NEW:
```javascript
import { rectNormToAbs } from "../utils/coordinateUtils";
```

**Implementation Method:**
- Use Edit tool to replace the import statement
- Ensure exact string match for old_string

---

### File 3: src/layers/TextLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/TextLayer.jsx`

**Changes Required:** 1 import statement update (coordinate utility renamed)

**Import Update:**

OLD:
```javascript
import { rectNormToAbs } from "../utils/coords";
```

NEW:
```javascript
import { rectNormToAbs } from "../utils/coordinateUtils";
```

**Implementation Method:**
- Use Edit tool to replace the import statement
- Ensure exact string match for old_string

---

### File 4: src/layers/DrawingLayer.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/DrawingLayer.jsx`

**Changes Required:** Check if this file imports coordinate utilities

**Expected Import Pattern:**
- If file contains `import ... from "../utils/coords"`, update to `"../utils/coordinateUtils"`
- If no coordinate utility import exists, no changes needed

**Import Update (if exists):**

OLD:
```javascript
import { [function_name] } from "../utils/coords";
```

NEW:
```javascript
import { [function_name] } from "../utils/coordinateUtils";
```

**Implementation Method:**
- Read the file first to check if import exists
- If exists, use Edit tool to replace the import statement

---

### File 5: src/App.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/App.jsx`

**Changes Required:** 1 import statement update (PdfViewer moved to core/)

**Import Update:**

OLD:
```javascript
import PdfViewer from "./PdfViewer";
```

NEW:
```javascript
import PdfViewer from "./core/PdfViewer";
```

**Implementation Method:**
- Use Edit tool to replace the import statement
- Ensure exact string match for old_string

---

## Implementation Sequence

Execute operations in this exact order:

1. **Create directory structure**
   - Run: `mkdir -p src/core`

2. **Move files**
   - Run: `mv src/PdfViewer.jsx src/core/PdfViewer.jsx`
   - Run: `mv src/utils/coords.jsx src/utils/coordinateUtils.js`

3. **Update imports in moved file (src/core/PdfViewer.jsx)**
   - Update 3 layer imports (HighlightLayer, TextLayer, DrawingLayer)
   - Change from `"./layers/*"` to `"../layers/*"`

4. **Update imports in layer files**
   - Update src/layers/HighlightLayer.jsx
   - Update src/layers/TextLayer.jsx
   - Check and update src/layers/DrawingLayer.jsx if needed
   - Change from `"../utils/coords"` to `"../utils/coordinateUtils"`

5. **Update imports in App.jsx**
   - Update PdfViewer import
   - Change from `"./PdfViewer"` to `"./core/PdfViewer"`

---

## Validation Steps

### 1. Verify Directory Structure

**Command:**
```bash
ls -la src/core/ && ls -la src/utils/
```

**Expected Output:**
- `src/core/PdfViewer.jsx` exists
- `src/utils/coordinateUtils.js` exists

---

### 2. Verify File Moves

**Command:**
```bash
! test -f src/PdfViewer.jsx && ! test -f src/utils/coords.jsx && echo "Files moved successfully"
```

**Expected Output:**
- "Files moved successfully"
- Old file paths no longer exist

---

### 3. Verify Import Updates

Read each updated file and verify import statements are correct:

**Files to check:**
- `src/core/PdfViewer.jsx` - imports from `../layers/`
- `src/layers/HighlightLayer.jsx` - imports from `../utils/coordinateUtils`
- `src/layers/TextLayer.jsx` - imports from `../utils/coordinateUtils`
- `src/layers/DrawingLayer.jsx` - imports from `../utils/coordinateUtils` (if applicable)
- `src/App.jsx` - imports from `./core/PdfViewer`

---

### 4. Build and Run Application

**Command:**
```bash
npm run dev
```

**Expected Result:**
- No build errors
- No import resolution errors
- Application starts successfully

---

### 5. Functional Testing

**Test Cases:**

1. **PDF Loading:**
   - Application loads without errors
   - PDF document displays correctly
   - No console errors related to imports

2. **Annotation Rendering:**
   - Existing annotations render correctly
   - All three layer types (Highlight, Text, Drawing) work
   - Timeline synchronization functions

3. **UI Interaction:**
   - Modal buttons functional
   - Page navigation works
   - Audio timeline updates

**Expected Result:**
- All functionality identical to before refactoring
- No regressions
- No visible changes to user experience

---

## Final Directory Structure

After Step 1 completion:

```
src/
├── layers/                      # Core library - annotation layers
│   ├── HighlightLayer.jsx
│   ├── TextLayer.jsx
│   └── DrawingLayer.jsx
├── core/                        # Core library - orchestration (NEW)
│   └── PdfViewer.jsx
├── utils/                       # Core library - utilities
│   ├── coordinateUtils.js      # (renamed from coords.jsx)
│   └── pdfTextExtractor.js     # (stays here, will move in Step 2)
├── components/                  # (stays here, will move in Step 2)
│   ├── AIAnnotationGenerator.jsx
│   ├── DrawingInputModal.jsx
│   ├── HighlightInputModal.jsx
│   └── TextInputModal.jsx
├── services/                    # (stays here, will move in Step 2)
│   └── openaiService.js
├── App.jsx                      # (stays here, will move in Step 2)
├── App.css
├── main.jsx                     # (stays here, will move in Step 2)
└── index.css
```

---

## Success Criteria

- ✅ `src/core/` directory created
- ✅ `src/core/PdfViewer.jsx` exists at new location
- ✅ `src/utils/coordinateUtils.js` exists with new name
- ✅ All 5 files have updated import paths
- ✅ Application builds without errors
- ✅ Application runs without errors
- ✅ PDF loads and displays correctly
- ✅ All annotations render correctly
- ✅ Timeline synchronization works
- ✅ No functionality regressions

---

## Notes

**No Functionality Changes:**
- This is pure file reorganization
- No code logic changes
- No data structure changes
- No UI changes
- All features work identically to before

**Preparation for Step 2:**
- Library code now in proper hierarchy (layers/, core/, utils/)
- Demo-specific code still in src/ (components/, services/, App.jsx)
- Step 2 will move demo code to examples/demo-app/

---

## Troubleshooting

**Issue: Import errors after moving files**
- Verify all import paths updated correctly
- Check for typos in relative paths (`../` vs `./`)
- Ensure file extensions match (.jsx vs .js)

**Issue: Application won't start**
- Check console for specific import resolution errors
- Verify no files are missing after moves
- Ensure vite.config.js entry point still valid

**Issue: Annotations not rendering**
- Verify layer components imported correctly in PdfViewer
- Check coordinate utility functions imported correctly in layers
- Ensure no circular dependencies created

---
