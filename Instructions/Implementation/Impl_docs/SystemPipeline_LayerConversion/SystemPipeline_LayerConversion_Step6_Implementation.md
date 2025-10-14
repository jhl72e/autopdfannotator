# Implementation Instructions: Step 6 - Update Public API Exports

---

## What This Document Is

This document provides complete implementation instructions for Step 6 of the Layer Conversion Plan: updating the public API exports in `src/index.js` to export the new framework-agnostic layer classes and BaseLayer abstract class.

---

## Overview

**Goal:** Update `src/index.js` to export the new JavaScript layer classes (BaseLayer, HighlightLayer, TextLayer, DrawingLayer) instead of the React versions, making the framework-agnostic layers the default public API.

**File to Modify:** `src/index.js`

**Expected Line Count:** ~95 lines (current: 92 lines, minimal changes)

---

## Prerequisites

Before implementing this step, verify:
- ✅ Step 1 complete: `src/layers/BaseLayer.js` exists and is functional
- ✅ Step 2 complete: `src/layers/HighlightLayer.js` exists and is functional
- ✅ Step 3 complete: `src/layers/TextLayer.js` exists and is functional
- ✅ Step 4 complete: `src/layers/DrawingLayer.js` exists and is functional
- ✅ Step 5 complete: LayerManager updated to use new layer classes
- ✅ All layer classes tested and working correctly

---

## Changes Summary

### Key Modifications

1. **Add BaseLayer import and export** - Export the abstract base class for public use
2. **Update layer imports** - Change from `.jsx` to `.js` file extensions
3. **Update layer exports** - Export JavaScript versions as default
4. **Update comments** - Remove "Future" markers and update documentation
5. **Verify export order** - Maintain clean organization

### Impact

**Breaking Changes:**
- None for consumers using the public API (imports remain the same)
- Direct imports of `.jsx` files will still work (coexistence maintained)
- Public API now returns framework-agnostic versions by default

**Non-Breaking:**
- React components (`.jsx`) remain in place for backward compatibility
- Can be accessed directly if needed: `import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.jsx'`

---

## Detailed Implementation Instructions

### 1. Add BaseLayer Import

**Location:** After line 28, in the "Annotation Layers" section

**Current State:**
```javascript
// ============================================================================
// Annotation Layers
// ============================================================================

import HighlightLayer from './layers/HighlightLayer.jsx';
import TextLayer from './layers/TextLayer.jsx';
import DrawingLayer from './layers/DrawingLayer.jsx';
```

**Action:** Add BaseLayer import before the other layer imports

**New Code:**
```javascript
// ============================================================================
// Annotation Layers
// ============================================================================

import { BaseLayer } from './layers/BaseLayer.js';
import HighlightLayer from './layers/HighlightLayer.jsx';
import TextLayer from './layers/TextLayer.jsx';
import DrawingLayer from './layers/DrawingLayer.jsx';
```

**Notes:**
- BaseLayer uses named export (use curly braces)
- Import from `.js` file
- Place before concrete layer imports for logical ordering

---

### 2. Update Layer Imports to JavaScript Versions

**Location:** Lines 30-32 (after adding BaseLayer)

**Current State:**
```javascript
import HighlightLayer from './layers/HighlightLayer.jsx';
import TextLayer from './layers/TextLayer.jsx';
import DrawingLayer from './layers/DrawingLayer.jsx';
```

**Action:** Change file extensions from `.jsx` to `.js`

**New Code:**
```javascript
import HighlightLayer from './layers/HighlightLayer.js';
import TextLayer from './layers/TextLayer.js';
import DrawingLayer from './layers/DrawingLayer.js';
```

**Notes:**
- These are default exports (no curly braces)
- Change only the file extension
- Import names remain the same

---

### 3. Update Layer Exports and Add BaseLayer Export

**Location:** Lines 34-40 (export statements)

**Current State:**
```javascript
export { HighlightLayer };
export { TextLayer };
export { DrawingLayer };

// Future: BaseLayer (when layers are converted to plain JS)
// import { BaseLayer } from './layers/BaseLayer.js';
// export { BaseLayer };
```

**Action:** Export BaseLayer and remove "Future" comment

**New Code:**
```javascript
export { BaseLayer };
export { HighlightLayer };
export { TextLayer };
export { DrawingLayer };
```

**Notes:**
- BaseLayer exported first (abstract base class)
- Concrete layer classes follow
- Remove the "Future" comment block entirely
- Maintain alphabetical/hierarchical order

---

### 4. Update Section Comment

**Location:** Lines 26-28 (section header comment)

**Current State:**
```javascript
// ============================================================================
// Annotation Layers
// ============================================================================
```

**Action:** Add clarifying comment about layer architecture

**New Code:**
```javascript
// ============================================================================
// Annotation Layers
// ============================================================================

// Framework-agnostic layer classes
// BaseLayer: Abstract base class for creating custom layers
// HighlightLayer, TextLayer, DrawingLayer: Built-in layer implementations
```

**Notes:**
- Add architectural context
- Explain BaseLayer purpose
- Keep comment concise

---

### 5. Verify Complete Annotation Layers Section

**After all changes, the complete section should look like:**

```javascript
// ============================================================================
// Annotation Layers
// ============================================================================

// Framework-agnostic layer classes
// BaseLayer: Abstract base class for creating custom layers
// HighlightLayer, TextLayer, DrawingLayer: Built-in layer implementations

import { BaseLayer } from './layers/BaseLayer.js';
import HighlightLayer from './layers/HighlightLayer.js';
import TextLayer from './layers/TextLayer.js';
import DrawingLayer from './layers/DrawingLayer.js';

export { BaseLayer };
export { HighlightLayer };
export { TextLayer };
export { DrawingLayer };
```

---

### 6. Optional: Add Migration Note Comment

**Location:** After the layer exports (around line 45)

**Action:** Add a note about React layer coexistence

**Optional Code:**
```javascript
// Note: React layer components (.jsx) remain available for backward compatibility
// and can be imported directly if needed:
// import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.jsx';
```

**Notes:**
- This is optional but helpful for documentation
- Clarifies that React versions still exist
- Useful during transition period

---

## Testing Instructions

### 1. Verify Import Resolution

**Test that all imports resolve correctly:**

```bash
# Check for any import errors
node -e "import('./src/index.js').then(() => console.log('✓ All imports resolved'))"
```

**Expected Output:**
```
✓ All imports resolved
```

### 2. Test Export Availability

**Create test file:** `test/test-exports.js`

```javascript
import {
  BaseLayer,
  HighlightLayer,
  TextLayer,
  DrawingLayer,
  LayerManager,
  AnnotationRenderer
} from '../src/index.js';

// Test BaseLayer
console.log('BaseLayer:', typeof BaseLayer); // should be 'function'
console.log('Is BaseLayer a class?', BaseLayer.toString().startsWith('class')); // should be true

// Test layer classes
console.log('HighlightLayer:', typeof HighlightLayer); // should be 'function'
console.log('TextLayer:', typeof TextLayer); // should be 'function'
console.log('DrawingLayer:', typeof DrawingLayer); // should be 'function'

// Test inheritance
console.log('HighlightLayer extends BaseLayer:', HighlightLayer.prototype instanceof BaseLayer); // should be true

console.log('\n✓ All exports available and correct');
```

**Run test:**
```bash
node test/test-exports.js
```

### 3. Test Layer Instantiation

**Create test file:** `test/test-layer-instantiation.js`

```javascript
import { BaseLayer, HighlightLayer, TextLayer, DrawingLayer } from '../src/index.js';

// Create test container and viewport
const container = { appendChild: () => {}, removeChild: () => {} }; // Mock DOM element
const viewport = { width: 800, height: 600, scale: 1.0 };

try {
  // Test BaseLayer cannot be instantiated directly
  try {
    const base = new BaseLayer(container, viewport);
    console.error('✗ BaseLayer should not be instantiable');
  } catch (e) {
    console.log('✓ BaseLayer correctly throws when instantiated directly');
  }

  // Test concrete layers can be instantiated
  const highlight = new HighlightLayer(container, viewport);
  console.log('✓ HighlightLayer instantiated');

  const text = new TextLayer(container, viewport);
  console.log('✓ TextLayer instantiated');

  const drawing = new DrawingLayer(container, viewport);
  console.log('✓ DrawingLayer instantiated');

  // Test inheritance
  console.log('✓ HighlightLayer instanceof BaseLayer:', highlight instanceof BaseLayer);
  console.log('✓ TextLayer instanceof BaseLayer:', text instanceof BaseLayer);
  console.log('✓ DrawingLayer instanceof BaseLayer:', drawing instanceof BaseLayer);

  console.log('\n✓ All layer instantiation tests passed');
} catch (error) {
  console.error('✗ Test failed:', error.message);
}
```

### 4. Test Namespace Import

**Test that namespace import works:**

```javascript
import * as Renderer from '../src/index.js';

console.log('Available exports:', Object.keys(Renderer));
console.log('Has BaseLayer:', 'BaseLayer' in Renderer);
console.log('Has HighlightLayer:', 'HighlightLayer' in Renderer);
console.log('Has VERSION:', 'VERSION' in Renderer);
```

### 5. Test Backward Compatibility

**Test that React layers still accessible:**

```javascript
// Direct import should still work (if needed)
import HighlightLayerReact from '../src/layers/HighlightLayer.jsx';
import HighlightLayerJS from '../src/layers/HighlightLayer.js';

console.log('React version accessible:', typeof HighlightLayerReact);
console.log('JS version accessible:', typeof HighlightLayerJS);
console.log('Are they different?', HighlightLayerReact !== HighlightLayerJS);
```

---

## Validation Checklist

- [ ] BaseLayer imported from `./layers/BaseLayer.js`
- [ ] HighlightLayer imported from `./layers/HighlightLayer.js`
- [ ] TextLayer imported from `./layers/TextLayer.js`
- [ ] DrawingLayer imported from `./layers/DrawingLayer.js`
- [ ] BaseLayer exported in public API
- [ ] All layer classes exported in public API
- [ ] "Future" comment removed
- [ ] Section comments updated
- [ ] No import errors when running `node -e "import('./src/index.js')"`
- [ ] All exports accessible via namespace import
- [ ] Layer classes can be instantiated
- [ ] BaseLayer cannot be instantiated directly (throws error)
- [ ] All layers inherit from BaseLayer
- [ ] React versions (.jsx) still exist and accessible if needed
- [ ] VERSION and LIB_NAME exports unchanged

---

## Expected Behavior After Implementation

### Successful Import Examples

```javascript
// Named imports (recommended)
import { BaseLayer, HighlightLayer, TextLayer, DrawingLayer } from '@ai-annotator/renderer';

// Namespace import
import * as Renderer from '@ai-annotator/renderer';
const { BaseLayer, HighlightLayer } = Renderer;

// Individual imports
import { HighlightLayer } from '@ai-annotator/renderer';

// Direct file import (for React versions, if needed)
import HighlightLayerReact from '@ai-annotator/renderer/layers/HighlightLayer.jsx';
```

### Usage Example

```javascript
import { BaseLayer, HighlightLayer, LayerManager } from '@ai-annotator/renderer';

// Create custom layer by extending BaseLayer
class CustomLayer extends BaseLayer {
  constructor(container, viewport) {
    super(container, viewport);
    // Custom initialization
  }

  render() {
    // Custom rendering logic
  }

  updateTime(nowSec) {
    super.updateTime(nowSec);
    // Custom animation logic
  }

  destroy() {
    // Custom cleanup
    super.destroy();
  }
}

// Use built-in layers
const container = document.getElementById('pdf-container');
const viewport = { width: 800, height: 600, scale: 1.0 };

const highlightLayer = new HighlightLayer(container, viewport);
const customLayer = new CustomLayer(container, viewport);
```

---

## Common Issues and Solutions

### Issue: "Module not found: './layers/BaseLayer.js'"
**Cause:** BaseLayer.js file doesn't exist
**Solution:** Verify Step 1 (BaseLayer creation) is complete

### Issue: "HighlightLayer is not a constructor"
**Cause:** Import statement uses wrong syntax (named vs default export)
**Solution:** Use default import: `import HighlightLayer from './layers/HighlightLayer.js'`

### Issue: "BaseLayer is not a constructor"
**Cause:** BaseLayer is abstract and cannot be instantiated
**Solution:** This is expected behavior. Extend BaseLayer instead of instantiating it directly

### Issue: Exports not available when importing package
**Cause:** Package.json may need "exports" field update
**Solution:** Ensure package.json has correct exports configuration (separate task)

### Issue: React layers not working anymore
**Cause:** React layers (.jsx) still exist and work, but need direct import
**Solution:** Import directly: `import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.jsx'`

---

## Success Criteria

✅ **BaseLayer exported in public API**
✅ **All layer classes export from .js versions (not .jsx)**
✅ **Imports resolve without errors**
✅ **BaseLayer can be imported and extended**
✅ **Layer classes can be imported and instantiated**
✅ **Namespace import works correctly**
✅ **React versions (.jsx) still accessible via direct import**
✅ **No breaking changes to existing public API consumers**
✅ **Documentation comments updated**
✅ **All exports follow consistent naming conventions**

---

## Dependencies

**This step depends on:**
- Step 1: BaseLayer.js (abstract base class)
- Step 2: HighlightLayer.js (framework-agnostic version)
- Step 3: TextLayer.js (framework-agnostic version)
- Step 4: DrawingLayer.js (framework-agnostic version)
- Step 5: LayerManager.js (updated to use new layers)

**This step enables:**
- Public consumers to use framework-agnostic layer classes
- Developers to create custom layers by extending BaseLayer
- Full framework independence of the rendering system
- Future removal of React layer files (in major version bump)

---

## Impact Analysis

### Who This Affects

**Package Consumers (via npm):**
- No impact - imports remain the same
- Get framework-agnostic versions automatically
- Better performance (no React overhead)

**Direct File Importers:**
- If importing `.jsx` files directly, need to update imports or continue using direct imports
- Most consumers use public API, so minimal impact

**Internal Development:**
- LayerManager already updated in Step 5
- AnnotationRenderer may need updates (future task)
- Test files may need updates

### Migration Path

**For consumers using public API:**
```javascript
// Before (still works the same)
import { HighlightLayer } from '@ai-annotator/renderer';

// After (no change needed - gets .js version automatically)
import { HighlightLayer } from '@ai-annotator/renderer';
```

**For consumers doing direct imports:**
```javascript
// Before
import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.jsx';

// After (if wanting JS version)
import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.js';

// Or keep using .jsx version (backward compatible)
import HighlightLayer from '@ai-annotator/renderer/layers/HighlightLayer.jsx';
```

---

## Future Considerations

### When to Remove React Layers

**Do NOT remove `.jsx` files yet:**
- Maintain coexistence during transition period
- Allow gradual migration
- Provide rollback capability
- Wait for major version bump (v1.0.0 or v2.0.0)

**Future cleanup (v2.0.0):**
1. Announce deprecation of `.jsx` files in v1.x
2. Add deprecation warnings in documentation
3. Remove `.jsx` files in v2.0.0
4. Update all examples and documentation
5. Publish migration guide

### Package.json Updates

**May need to update package.json:**
```json
{
  "exports": {
    ".": "./src/index.js",
    "./layers/BaseLayer": "./src/layers/BaseLayer.js",
    "./layers/HighlightLayer": "./src/layers/HighlightLayer.js",
    "./layers/TextLayer": "./src/layers/TextLayer.js",
    "./layers/DrawingLayer": "./src/layers/DrawingLayer.js",
    "./layers/*": "./src/layers/*.js"
  }
}
```

This is a separate task and not part of Step 6.

---

## Notes

- This step completes the public API transition to framework-agnostic layers
- Changes are minimal but high-impact (affects public API surface)
- Maintains backward compatibility through coexistence
- Enables custom layer development via BaseLayer
- Simplifies future framework adapter development (React, Vue, etc.)
- Follows semantic versioning principles (non-breaking change)

---
