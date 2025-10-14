# Refactoring Step 2 - Implementation

---

## What This Document Is

This document provides CODE-level implementation instructions for Refactoring Step 2: Separate Demo Application. This step moves all demo-specific code from `src/` to `examples/demo-app/`, establishing a clear boundary between the core library (src/) and the demo application.

---

## Purpose

Separate the demo application from the core library by:
- Creating `examples/demo-app/` directory structure
- Moving all application-specific features to `examples/demo-app/features/`
- Moving App component and entry point to `examples/demo-app/`
- Updating all import paths to reference new locations
- Updating build configuration to use new entry point

---

## Prerequisites

- Step 1 has been completed successfully
- Current directory structure matches Step 1 final state
- No uncommitted changes in the working directory
- Development server is stopped (if running)

---

## File Operations

### 1. Create Demo Application Directory Structure

**Commands:**
```bash
mkdir -p examples/demo-app/features/ai-generation
mkdir -p examples/demo-app/features/manual-creation
```

**Expected Result:**
- `examples/demo-app/` directory exists
- `examples/demo-app/features/ai-generation/` directory exists
- `examples/demo-app/features/manual-creation/` directory exists

---

### 2. Move App Component and Entry Files

**Commands:**
```bash
mv src/App.jsx examples/demo-app/App.jsx
mv src/App.css examples/demo-app/App.css
mv src/main.jsx examples/demo-app/main.jsx
mv src/index.css examples/demo-app/index.css
```

**Expected Results:**
- `examples/demo-app/App.jsx` exists
- `examples/demo-app/App.css` exists
- `examples/demo-app/main.jsx` exists
- `examples/demo-app/index.css` exists
- These files no longer exist in `src/`

---

### 3. Move AI Generation Features

**Commands:**
```bash
mv src/components/AIAnnotationGenerator.jsx examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx
mv src/services/openaiService.js examples/demo-app/features/ai-generation/openaiService.js
mv src/utils/pdfTextExtractor.js examples/demo-app/features/ai-generation/pdfTextExtractor.js
```

**Expected Results:**
- `examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx` exists
- `examples/demo-app/features/ai-generation/openaiService.js` exists
- `examples/demo-app/features/ai-generation/pdfTextExtractor.js` exists

---

### 4. Move Manual Creation Features

**Commands:**
```bash
mv src/components/DrawingInputModal.jsx examples/demo-app/features/manual-creation/DrawingInputModal.jsx
mv src/components/HighlightInputModal.jsx examples/demo-app/features/manual-creation/HighlightInputModal.jsx
mv src/components/TextInputModal.jsx examples/demo-app/features/manual-creation/TextInputModal.jsx
```

**Expected Results:**
- `examples/demo-app/features/manual-creation/DrawingInputModal.jsx` exists
- `examples/demo-app/features/manual-creation/HighlightInputModal.jsx` exists
- `examples/demo-app/features/manual-creation/TextInputModal.jsx` exists

---

### 5. Remove Empty Directories from src/

**Commands:**
```bash
rmdir src/components
rmdir src/services
```

**Expected Results:**
- `src/components/` directory no longer exists
- `src/services/` directory no longer exists

---

## Import Path Updates

After moving files, update import statements in 6 files to reference new locations.

---

### File 1: examples/demo-app/App.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/App.jsx`

**Changes Required:** 5 import statement updates

**Import Update 1 - PdfViewer:**

OLD:
```javascript
import PdfViewer from "./core/PdfViewer";
```

NEW:
```javascript
import PdfViewer from "../../src/core/PdfViewer";
```

**Import Update 2 - DrawingInputModal:**

OLD:
```javascript
import DrawingInputModal from "./components/DrawingInputModal";
```

NEW:
```javascript
import DrawingInputModal from "./features/manual-creation/DrawingInputModal";
```

**Import Update 3 - HighlightInputModal:**

OLD:
```javascript
import HighlightInputModal from "./components/HighlightInputModal";
```

NEW:
```javascript
import HighlightInputModal from "./features/manual-creation/HighlightInputModal";
```

**Import Update 4 - TextInputModal:**

OLD:
```javascript
import TextInputModal from "./components/TextInputModal";
```

NEW:
```javascript
import TextInputModal from "./features/manual-creation/TextInputModal";
```

**Import Update 5 - AIAnnotationGenerator:**

OLD:
```javascript
import AIAnnotationGenerator from "./components/AIAnnotationGenerator";
```

NEW:
```javascript
import AIAnnotationGenerator from "./features/ai-generation/AIAnnotationGenerator";
```

**Import Update 6 - App.css:**

OLD:
```javascript
import "./App.css";
```

NEW:
```javascript
import "./App.css";
```
*No change needed - App.css is in same directory*

**Implementation Method:**
- Use Edit tool to replace each import statement individually
- Ensure exact string match for old_string
- Verify all 5 imports are updated

---

### File 2: examples/demo-app/main.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/main.jsx`

**Changes Required:** 2 import statement updates

**Import Update 1 - index.css:**

OLD:
```javascript
import './index.css'
```

NEW:
```javascript
import './index.css'
```
*No change needed - index.css is in same directory*

**Import Update 2 - App:**

OLD:
```javascript
import App from './App.jsx'
```

NEW:
```javascript
import App from './App.jsx'
```
*No change needed - App.jsx is in same directory*

**Implementation Method:**
- No changes required to this file
- Verify file moved correctly

---

### File 3: examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx`

**Changes Required:** Check and update imports for local services

**Expected Import Pattern:**
- Import openaiService from local directory
- Import pdfTextExtractor from local directory

**Implementation Method:**
- Read the file first to identify current imports
- Update imports to reference files in same directory:
  - `../../services/openaiService` → `./openaiService`
  - `../../utils/pdfTextExtractor` → `./pdfTextExtractor`

**Example Updates:**

If import exists:
```javascript
import { generateAnnotations } from "../../services/openaiService";
```

Change to:
```javascript
import { generateAnnotations } from "./openaiService";
```

If import exists:
```javascript
import { extractTextFromPdf } from "../../utils/pdfTextExtractor";
```

Change to:
```javascript
import { extractTextFromPdf } from "./pdfTextExtractor";
```

---

### File 4: examples/demo-app/features/manual-creation/DrawingInputModal.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/features/manual-creation/DrawingInputModal.jsx`

**Changes Required:** Check and update any imports

**Implementation Method:**
- Read the file to check if any imports need updating
- If imports reference `../../utils/coordinateUtils`, update to `../../../../src/utils/coordinateUtils`
- Most likely this file has no external dependencies besides React

---

### File 5: examples/demo-app/features/manual-creation/HighlightInputModal.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/features/manual-creation/HighlightInputModal.jsx`

**Changes Required:** Check and update any imports

**Implementation Method:**
- Read the file to check if any imports need updating
- If imports reference utils or other modules, update paths accordingly

---

### File 6: examples/demo-app/features/manual-creation/TextInputModal.jsx

**Location:** `/Users/hyungry72/fclab/pdfAutoAnnotator/examples/demo-app/features/manual-creation/TextInputModal.jsx`

**Changes Required:** Check and update any imports

**Implementation Method:**
- Read the file to check if any imports need updating
- If imports reference utils or other modules, update paths accordingly

---

## Configuration Updates

### Update index.html Entry Point

**File:** `/Users/hyungry72/fclab/pdfAutoAnnotator/index.html`

**Change Required:** Update script src to new entry point location

OLD:
```html
<script type="module" src="/src/main.jsx"></script>
```

NEW:
```html
<script type="module" src="/examples/demo-app/main.jsx"></script>
```

**Implementation Method:**
- Use Edit tool to replace the script src
- Ensure exact string match

---

### Verify vite.config.js

**File:** `/Users/hyungry72/fclab/pdfAutoAnnotator/vite.config.js`

**Action:** Read file and verify if any changes needed

**Expected State:**
- Vite automatically resolves entry from index.html
- No explicit entry point configuration needed
- No changes required unless custom root is specified

**Implementation Method:**
- Read vite.config.js
- If default config (no custom root/entry), no changes needed
- If custom entry specified, update to point to `examples/demo-app/main.jsx`

---

## Implementation Sequence

Execute operations in this exact order:

1. **Create directory structure**
   ```bash
   mkdir -p examples/demo-app/features/ai-generation
   mkdir -p examples/demo-app/features/manual-creation
   ```

2. **Move App and entry files**
   ```bash
   mv src/App.jsx examples/demo-app/App.jsx
   mv src/App.css examples/demo-app/App.css
   mv src/main.jsx examples/demo-app/main.jsx
   mv src/index.css examples/demo-app/index.css
   ```

3. **Move AI generation features**
   ```bash
   mv src/components/AIAnnotationGenerator.jsx examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx
   mv src/services/openaiService.js examples/demo-app/features/ai-generation/openaiService.js
   mv src/utils/pdfTextExtractor.js examples/demo-app/features/ai-generation/pdfTextExtractor.js
   ```

4. **Move manual creation features**
   ```bash
   mv src/components/DrawingInputModal.jsx examples/demo-app/features/manual-creation/DrawingInputModal.jsx
   mv src/components/HighlightInputModal.jsx examples/demo-app/features/manual-creation/HighlightInputModal.jsx
   mv src/components/TextInputModal.jsx examples/demo-app/features/manual-creation/TextInputModal.jsx
   ```

5. **Remove empty directories**
   ```bash
   rmdir src/components
   rmdir src/services
   ```

6. **Update imports in App.jsx**
   - Update 5 import statements

7. **Update imports in AIAnnotationGenerator.jsx**
   - Update imports to reference local files

8. **Update imports in manual creation modals**
   - Check and update DrawingInputModal.jsx
   - Check and update HighlightInputModal.jsx
   - Check and update TextInputModal.jsx

9. **Update index.html**
   - Update script src to new entry point

10. **Verify vite.config.js**
    - Read and check if changes needed

---

## Validation Steps

### 1. Verify Directory Structure

**Command:**
```bash
tree examples/demo-app/ -L 3
```

**Expected Output:**
```
examples/demo-app/
├── App.css
├── App.jsx
├── index.css
├── main.jsx
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

### 2. Verify src/ is Clean

**Command:**
```bash
tree src/ -L 2
```

**Expected Output:**
```
src/
├── core/
│   └── PdfViewer.jsx
├── layers/
│   ├── DrawingLayer.jsx
│   ├── HighlightLayer.jsx
│   └── TextLayer.jsx
└── utils/
    └── coordinateUtils.js
```

**Verification:**
- No `components/` directory in src/
- No `services/` directory in src/
- No App.jsx, main.jsx, or CSS files in src/
- Only core library code remains

---

### 3. Verify File Moves

**Command:**
```bash
! test -f src/App.jsx && ! test -f src/components/AIAnnotationGenerator.jsx && echo "Files moved successfully"
```

**Expected Output:**
- "Files moved successfully"

---

### 4. Verify Import Updates

Read each updated file and verify import statements are correct:

**Files to check:**
- `examples/demo-app/App.jsx` - imports from `../../src/core/` and `./features/`
- `examples/demo-app/features/ai-generation/AIAnnotationGenerator.jsx` - imports from local directory
- `examples/demo-app/features/manual-creation/*.jsx` - verify all imports correct

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
- Opens at http://localhost:5173 (or configured port)

---

### 6. Functional Testing

**Test Cases:**

1. **Application Loads:**
   - Demo app loads from new location
   - No console errors
   - UI renders correctly

2. **PDF Rendering:**
   - PDF loads and displays
   - PdfViewer component works from library import

3. **Manual Creation Features:**
   - DrawingInputModal opens and functions
   - HighlightInputModal opens and functions
   - TextInputModal opens and functions
   - Annotations can be created

4. **AI Generation Feature:**
   - AIAnnotationGenerator modal opens
   - Services import correctly
   - Can generate AI annotations (if API configured)

5. **Timeline Integration:**
   - Audio playback works
   - Annotations sync with timeline
   - All annotation types render correctly

**Expected Result:**
- All functionality identical to before refactoring
- No regressions
- Clear separation: demo in examples/, library in src/

---

## Final Directory Structure

After Step 2 completion:

```
.
├── src/                                # CORE LIBRARY (will be published)
│   ├── core/
│   │   └── PdfViewer.jsx
│   ├── layers/
│   │   ├── HighlightLayer.jsx
│   │   ├── TextLayer.jsx
│   │   └── DrawingLayer.jsx
│   └── utils/
│       └── coordinateUtils.js
│
├── examples/                           # DEMO APPLICATION (not published)
│   └── demo-app/
│       ├── App.jsx
│       ├── App.css
│       ├── main.jsx
│       ├── index.css
│       └── features/
│           ├── ai-generation/
│           │   ├── AIAnnotationGenerator.jsx
│           │   ├── openaiService.js
│           │   └── pdfTextExtractor.js
│           └── manual-creation/
│               ├── DrawingInputModal.jsx
│               ├── HighlightInputModal.jsx
│               └── TextInputModal.jsx
│
├── index.html                          # Entry HTML (points to demo)
├── vite.config.js
└── package.json
```

---

## Success Criteria

- ✅ `examples/demo-app/` directory structure created
- ✅ All 10 files moved to correct locations
- ✅ `src/components/` and `src/services/` directories removed
- ✅ `src/` contains only library code (core/, layers/, utils/)
- ✅ All import paths updated correctly in 4-6 files
- ✅ `index.html` script src updated
- ✅ Application builds without errors
- ✅ Application runs from new location
- ✅ All features work identically
- ✅ Clear boundary: library (src/) vs demo (examples/demo-app/)

---

## Notes

**No Functionality Changes:**
- This is pure file reorganization
- No code logic changes
- No data structure changes
- No UI changes
- All features work identically

**Clear Separation Achieved:**
- Library code isolated in `src/`
- Demo application isolated in `examples/demo-app/`
- Demo imports from library using relative paths
- Demo features organized by functional area

**Preparation for Step 3:**
- Clean library structure ready for type system
- Demo serves as integration example
- Next step will add type definitions to library

---

## Troubleshooting

**Issue: Import errors after moving files**
- Verify relative paths are correct (`../../src/` from demo to library)
- Check for typos in import paths
- Ensure all files moved to correct locations

**Issue: index.html not loading app**
- Verify script src points to `/examples/demo-app/main.jsx`
- Check that main.jsx exists at that location
- Clear browser cache and restart dev server

**Issue: Features not working**
- Check feature imports in App.jsx
- Verify AI generation imports local services
- Ensure modal components import correctly

**Issue: Vite build errors**
- Check vite.config.js configuration
- Verify no circular dependencies
- Ensure all imports resolve correctly

---
