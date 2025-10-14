# SystemPipeline_LayerConversion_Step1_BaseLayer_Implementation

---

## What This Document Is

This implementation document specifies the CODE-level technical details for creating the BaseLayer abstract class. BaseLayer serves as the foundation for all annotation layer types, defining a common interface and shared lifecycle management functionality.

---

## Purpose

Create an abstract base class that:
- Defines the interface contract for all annotation layers
- Provides shared lifecycle management methods
- Enforces implementation requirements through abstract methods
- Enables framework-agnostic layer implementations

---

## Context in Overall Plan

**Big Picture:**
- **Outline:** Dynamic PDF Annotation Renderer System
- **Plan:** Layer Conversion (React to Framework-Agnostic)
- **Current Step:** Step 1 of 6 - BaseLayer Foundation

**This Step's Role:**
- Foundation for all subsequent layer implementations
- Steps 2-4 (HighlightLayer, TextLayer, DrawingLayer) depend on this
- Establishes the interface contract that LayerManager will use

**Dependencies:**
- None (foundation class)

**Enables:**
- Step 2: HighlightLayer conversion
- Step 3: TextLayer conversion
- Step 4: DrawingLayer conversion

---

## File to Create

**File Path:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/BaseLayer.js`

**Estimated Lines:** ~150 lines

**File Type:** ES6 JavaScript module

---

## Class Structure

### Class Declaration

```javascript
/**
 * BaseLayer - Abstract base class for annotation layers
 *
 * This class defines the common interface and lifecycle management for all
 * annotation layer types. Subclasses must implement the abstract methods
 * render() and update().
 *
 * @abstract
 */
class BaseLayer {
  // Implementation details below
}

export default BaseLayer;
```

---

## Constructor Specification

### Constructor Signature

```javascript
/**
 * Creates a new BaseLayer instance
 *
 * @param {HTMLElement} container - Parent DOM element for layer content
 * @param {Object} viewport - Initial viewport dimensions
 * @param {number} viewport.width - Viewport width in pixels
 * @param {number} viewport.height - Viewport height in pixels
 * @param {number} viewport.scale - PDF scale/zoom level
 * @throws {Error} If container is not a valid HTMLElement
 * @throws {Error} If viewport is missing required properties
 */
constructor(container, viewport) {
  // Implementation below
}
```

### Constructor Implementation

```javascript
constructor(container, viewport) {
  // Validate parameters
  this._validateContainer(container);
  this._validateViewport(viewport);

  // Initialize core properties
  this.container = container;
  this.viewport = { ...viewport }; // Clone to prevent external mutations
  this.annotations = [];
  this.currentTime = 0;
  this.isDestroyed = false;

  // Check if being instantiated directly (abstract class check)
  if (new.target === BaseLayer) {
    throw new Error('BaseLayer is an abstract class and cannot be instantiated directly. Extend it with a concrete implementation.');
  }
}
```

---

## Properties Specification

### Instance Properties

```javascript
/**
 * @property {HTMLElement} container - Parent DOM element for layer content
 */
this.container = container;

/**
 * @property {Object} viewport - Current viewport dimensions
 * @property {number} viewport.width - Viewport width in pixels
 * @property {number} viewport.height - Viewport height in pixels
 * @property {number} viewport.scale - PDF scale/zoom level
 */
this.viewport = { ...viewport };

/**
 * @property {Array} annotations - Current annotation data for this layer
 */
this.annotations = [];

/**
 * @property {number} currentTime - Current timeline position in seconds
 */
this.currentTime = 0;

/**
 * @property {boolean} isDestroyed - Flag indicating if layer has been destroyed
 */
this.isDestroyed = false;
```

---

## Public Methods Specification

### setAnnotations() Method

```javascript
/**
 * Sets the annotation data for this layer
 *
 * Stores the provided annotations for rendering. Does not automatically
 * trigger render - parent must call render() explicitly.
 *
 * @param {Array} annotations - Array of annotation objects
 * @throws {Error} If called after layer is destroyed
 */
setAnnotations(annotations) {
  this._checkDestroyed('setAnnotations');
  this.annotations = annotations || [];
}
```

**Behavior:**
- Store annotations in `this.annotations`
- Default to empty array if undefined/null
- Validate layer is not destroyed before operation
- Do NOT automatically call render()

---

### setViewport() Method

```javascript
/**
 * Updates the viewport dimensions
 *
 * Stores new viewport dimensions for coordinate calculations. Does not
 * automatically trigger render - parent must call render() explicitly.
 *
 * @param {Object} viewport - New viewport dimensions
 * @param {number} viewport.width - Viewport width in pixels
 * @param {number} viewport.height - Viewport height in pixels
 * @param {number} viewport.scale - PDF scale/zoom level
 * @throws {Error} If viewport is missing required properties
 * @throws {Error} If called after layer is destroyed
 */
setViewport(viewport) {
  this._checkDestroyed('setViewport');
  this._validateViewport(viewport);
  this.viewport = { ...viewport }; // Clone to prevent external mutations
}
```

**Behavior:**
- Validate viewport structure
- Clone viewport object (defensive copy)
- Validate layer is not destroyed
- Do NOT automatically call render()

---

### updateTime() Method

```javascript
/**
 * Updates the current timeline position
 *
 * Stores the current timeline position and should trigger animation updates
 * in subclasses.
 *
 * @param {number} nowSec - Current timeline position in seconds
 * @throws {Error} If called after layer is destroyed
 */
updateTime(nowSec) {
  this._checkDestroyed('updateTime');
  this.currentTime = nowSec;
  // Subclasses should override to implement animation logic
}
```

**Behavior:**
- Store time in `this.currentTime`
- Validate layer is not destroyed
- Subclasses override to implement animation

---

### destroy() Method

```javascript
/**
 * Destroys the layer and releases resources
 *
 * Cleans up all references and sets the destroyed flag. Subclasses must
 * override to clean up their specific resources (DOM elements, RAF loops, etc.)
 * and then call super.destroy().
 *
 * Safe to call multiple times (idempotent).
 */
destroy() {
  if (this.isDestroyed) {
    return; // Already destroyed, safe to call multiple times
  }

  // Clear references
  this.annotations = null;
  this.viewport = null;
  this.container = null;

  // Set destroyed flag
  this.isDestroyed = true;
}
```

**Behavior:**
- Set `isDestroyed` to true
- Clear all property references
- Idempotent (safe to call multiple times)
- Subclasses call this AFTER their own cleanup

---

## Abstract Methods Specification

### render() Method

```javascript
/**
 * Renders the layer content
 *
 * Abstract method that must be implemented by subclasses. Creates or recreates
 * DOM elements based on current annotations and viewport.
 *
 * @abstract
 * @throws {Error} If not implemented by subclass
 */
render() {
  throw new Error('render() must be implemented by subclass');
}
```

**Requirements for Subclasses:**
- Create or recreate DOM elements
- Use `this.annotations` for data
- Use `this.viewport` for positioning
- Must be idempotent (safe to call multiple times)
- Handle empty annotations array gracefully

---

### update() Method

```javascript
/**
 * Updates the visual state of the layer
 *
 * Abstract method that must be implemented by subclasses if needed.
 * Updates visual state based on current time and annotations.
 *
 * @abstract
 * @throws {Error} If not implemented by subclass
 */
update() {
  throw new Error('update() must be implemented by subclass');
}
```

**Requirements for Subclasses:**
- Update element transforms, styles, or canvas content
- Use `this.currentTime` for animation calculations
- May be called frequently (60fps)
- Some subclasses may not use this (use updateTime directly)

---

## Protected/Internal Methods Specification

### _validateContainer() Method

```javascript
/**
 * Validates that container is a valid HTMLElement
 *
 * @private
 * @param {*} container - Value to validate
 * @throws {Error} If container is not a valid HTMLElement
 */
_validateContainer(container) {
  if (!container || !(container instanceof HTMLElement)) {
    throw new Error('BaseLayer: container must be a valid HTMLElement');
  }
}
```

**Validation Rules:**
- Must not be null or undefined
- Must be an instance of HTMLElement
- Throw clear error message if invalid

---

### _validateViewport() Method

```javascript
/**
 * Validates that viewport has required properties
 *
 * @private
 * @param {*} viewport - Value to validate
 * @throws {Error} If viewport is missing required properties
 */
_validateViewport(viewport) {
  if (!viewport || typeof viewport !== 'object') {
    throw new Error('BaseLayer: viewport must be an object');
  }

  if (typeof viewport.width !== 'number' || viewport.width <= 0) {
    throw new Error('BaseLayer: viewport.width must be a positive number');
  }

  if (typeof viewport.height !== 'number' || viewport.height <= 0) {
    throw new Error('BaseLayer: viewport.height must be a positive number');
  }

  if (typeof viewport.scale !== 'number' || viewport.scale <= 0) {
    throw new Error('BaseLayer: viewport.scale must be a positive number');
  }
}
```

**Validation Rules:**
- Must be a non-null object
- Must have `width` property (number > 0)
- Must have `height` property (number > 0)
- Must have `scale` property (number > 0)
- Throw clear error messages for each validation failure

---

### _checkDestroyed() Method

```javascript
/**
 * Checks if layer is destroyed and throws error if so
 *
 * @private
 * @param {string} methodName - Name of method being called (for error message)
 * @throws {Error} If layer is destroyed
 */
_checkDestroyed(methodName) {
  if (this.isDestroyed) {
    throw new Error(`BaseLayer: Cannot call ${methodName}() on destroyed layer`);
  }
}
```

**Behavior:**
- Check `this.isDestroyed` flag
- Throw error with method name if destroyed
- Used at start of all public methods

---

## Complete File Template

```javascript
/**
 * BaseLayer - Abstract base class for annotation layers
 *
 * Provides common interface and lifecycle management for all annotation layer types.
 * Subclasses must implement render() and update() abstract methods.
 *
 * @abstract
 */
class BaseLayer {
  /**
   * Creates a new BaseLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   * @throws {Error} If container is not a valid HTMLElement
   * @throws {Error} If viewport is missing required properties
   * @throws {Error} If instantiated directly (abstract class)
   */
  constructor(container, viewport) {
    // Validate parameters
    this._validateContainer(container);
    this._validateViewport(viewport);

    // Initialize core properties
    this.container = container;
    this.viewport = { ...viewport };
    this.annotations = [];
    this.currentTime = 0;
    this.isDestroyed = false;

    // Prevent direct instantiation
    if (new.target === BaseLayer) {
      throw new Error('BaseLayer is an abstract class and cannot be instantiated directly. Extend it with a concrete implementation.');
    }
  }

  /**
   * Sets the annotation data for this layer
   *
   * @param {Array} annotations - Array of annotation objects
   * @throws {Error} If called after layer is destroyed
   */
  setAnnotations(annotations) {
    this._checkDestroyed('setAnnotations');
    this.annotations = annotations || [];
  }

  /**
   * Updates the viewport dimensions
   *
   * @param {Object} viewport - New viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   * @throws {Error} If viewport is missing required properties
   * @throws {Error} If called after layer is destroyed
   */
  setViewport(viewport) {
    this._checkDestroyed('setViewport');
    this._validateViewport(viewport);
    this.viewport = { ...viewport };
  }

  /**
   * Updates the current timeline position
   *
   * @param {number} nowSec - Current timeline position in seconds
   * @throws {Error} If called after layer is destroyed
   */
  updateTime(nowSec) {
    this._checkDestroyed('updateTime');
    this.currentTime = nowSec;
  }

  /**
   * Destroys the layer and releases resources
   *
   * Safe to call multiple times (idempotent).
   * Subclasses must call super.destroy() after their own cleanup.
   */
  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.annotations = null;
    this.viewport = null;
    this.container = null;
    this.isDestroyed = true;
  }

  /**
   * Renders the layer content
   *
   * @abstract
   * @throws {Error} If not implemented by subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Updates the visual state of the layer
   *
   * @abstract
   * @throws {Error} If not implemented by subclass
   */
  update() {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Validates that container is a valid HTMLElement
   *
   * @private
   * @param {*} container - Value to validate
   * @throws {Error} If container is not a valid HTMLElement
   */
  _validateContainer(container) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('BaseLayer: container must be a valid HTMLElement');
    }
  }

  /**
   * Validates that viewport has required properties
   *
   * @private
   * @param {*} viewport - Value to validate
   * @throws {Error} If viewport is missing required properties
   */
  _validateViewport(viewport) {
    if (!viewport || typeof viewport !== 'object') {
      throw new Error('BaseLayer: viewport must be an object');
    }

    if (typeof viewport.width !== 'number' || viewport.width <= 0) {
      throw new Error('BaseLayer: viewport.width must be a positive number');
    }

    if (typeof viewport.height !== 'number' || viewport.height <= 0) {
      throw new Error('BaseLayer: viewport.height must be a positive number');
    }

    if (typeof viewport.scale !== 'number' || viewport.scale <= 0) {
      throw new Error('BaseLayer: viewport.scale must be a positive number');
    }
  }

  /**
   * Checks if layer is destroyed and throws error if so
   *
   * @private
   * @param {string} methodName - Name of method being called
   * @throws {Error} If layer is destroyed
   */
  _checkDestroyed(methodName) {
    if (this.isDestroyed) {
      throw new Error(`BaseLayer: Cannot call ${methodName}() on destroyed layer`);
    }
  }
}

export default BaseLayer;
```

---

## Error Messages Specification

### Error Message Catalog

All error messages must follow these exact formats:

**Constructor Errors:**
```javascript
'BaseLayer: container must be a valid HTMLElement'
'BaseLayer: viewport must be an object'
'BaseLayer: viewport.width must be a positive number'
'BaseLayer: viewport.height must be a positive number'
'BaseLayer: viewport.scale must be a positive number'
'BaseLayer is an abstract class and cannot be instantiated directly. Extend it with a concrete implementation.'
```

**Method Call Errors:**
```javascript
'BaseLayer: Cannot call setAnnotations() on destroyed layer'
'BaseLayer: Cannot call setViewport() on destroyed layer'
'BaseLayer: Cannot call updateTime() on destroyed layer'
```

**Abstract Method Errors:**
```javascript
'render() must be implemented by subclass'
'update() must be implemented by subclass'
```

---

## Testing Requirements

### Unit Tests to Create

**File:** `test/unit/BaseLayer.test.js`

**Test Cases:**

1. **Constructor Tests:**
   ```javascript
   // Should throw error when instantiated directly
   expect(() => new BaseLayer(container, viewport)).toThrow('abstract class');

   // Should throw error with invalid container
   expect(() => new TestLayer(null, viewport)).toThrow('valid HTMLElement');
   expect(() => new TestLayer('not-element', viewport)).toThrow('valid HTMLElement');

   // Should throw error with invalid viewport
   expect(() => new TestLayer(container, null)).toThrow('viewport must be an object');
   expect(() => new TestLayer(container, { width: -1 })).toThrow('positive number');
   expect(() => new TestLayer(container, { width: 100 })).toThrow('viewport.height');
   ```

2. **Property Initialization Tests:**
   ```javascript
   class TestLayer extends BaseLayer {
     render() {}
     update() {}
   }

   const layer = new TestLayer(container, viewport);
   expect(layer.container).toBe(container);
   expect(layer.viewport).toEqual(viewport);
   expect(layer.annotations).toEqual([]);
   expect(layer.currentTime).toBe(0);
   expect(layer.isDestroyed).toBe(false);
   ```

3. **setAnnotations() Tests:**
   ```javascript
   layer.setAnnotations([{ id: '1' }]);
   expect(layer.annotations).toEqual([{ id: '1' }]);

   layer.setAnnotations(null);
   expect(layer.annotations).toEqual([]);

   layer.destroy();
   expect(() => layer.setAnnotations([])).toThrow('destroyed layer');
   ```

4. **setViewport() Tests:**
   ```javascript
   const newViewport = { width: 800, height: 600, scale: 1.5 };
   layer.setViewport(newViewport);
   expect(layer.viewport).toEqual(newViewport);
   expect(layer.viewport).not.toBe(newViewport); // Should be cloned

   expect(() => layer.setViewport({ width: -1 })).toThrow('positive number');

   layer.destroy();
   expect(() => layer.setViewport(viewport)).toThrow('destroyed layer');
   ```

5. **updateTime() Tests:**
   ```javascript
   layer.updateTime(5.5);
   expect(layer.currentTime).toBe(5.5);

   layer.destroy();
   expect(() => layer.updateTime(0)).toThrow('destroyed layer');
   ```

6. **destroy() Tests:**
   ```javascript
   layer.destroy();
   expect(layer.isDestroyed).toBe(true);
   expect(layer.container).toBeNull();
   expect(layer.viewport).toBeNull();
   expect(layer.annotations).toBeNull();

   // Should be idempotent
   layer.destroy(); // Should not throw
   ```

7. **Abstract Method Tests:**
   ```javascript
   const layer = new TestLayer(container, viewport);
   expect(() => layer.render()).toThrow('must be implemented by subclass');
   expect(() => layer.update()).toThrow('must be implemented by subclass');
   ```

### Test Helper: TestLayer Class

```javascript
// Simple concrete implementation for testing BaseLayer
class TestLayer extends BaseLayer {
  render() {
    // Empty implementation for testing
  }

  update() {
    // Empty implementation for testing
  }
}
```

---

## Integration Points

### How Subclasses Should Extend BaseLayer

**Pattern for Subclass Implementation:**

```javascript
import BaseLayer from './BaseLayer.js';

class ConcreteLayer extends BaseLayer {
  constructor(container, viewport) {
    // ALWAYS call super first
    super(container, viewport);

    // Then initialize subclass-specific properties
    this.layerElement = document.createElement('div');
    this.container.appendChild(this.layerElement);
  }

  setViewport(viewport) {
    // Call super to update base properties
    super.setViewport(viewport);

    // Then perform subclass-specific viewport updates
    // (e.g., resize canvas, recalculate positions)
  }

  render() {
    // REQUIRED: Implement this method
    // Create/recreate DOM elements based on:
    // - this.annotations
    // - this.viewport
  }

  update() {
    // OPTIONAL: Implement if needed
    // Update visual state based on:
    // - this.currentTime
  }

  destroy() {
    // Clean up subclass-specific resources first
    if (this.layerElement && this.layerElement.parentNode) {
      this.layerElement.parentNode.removeChild(this.layerElement);
    }

    // ALWAYS call super.destroy() last
    super.destroy();
  }
}

export default ConcreteLayer;
```

---

## Architectural Principles

### Framework Independence

**Requirements:**
- Zero framework dependencies (React, Vue, Angular, etc.)
- Use only standard JavaScript ES6 features
- Use only standard DOM APIs
- No JSX syntax
- No framework-specific lifecycle hooks

**Verification:**
- File should have no import statements (self-contained)
- Should work in any JavaScript environment
- Can be tested with simple HTML + vanilla JS

### Separation of Concerns

**BaseLayer Responsibilities:**
- Define interface contract
- Manage common state (viewport, annotations, time)
- Provide lifecycle management
- Enforce implementation through abstract methods

**BaseLayer Does NOT:**
- Create any DOM elements (subclass responsibility)
- Render any visual content (subclass responsibility)
- Know about specific layer types (highlight, text, drawing)
- Manage animation loops (subclass responsibility)

### Object-Oriented Design

**Abstract Class Pattern:**
- Cannot be instantiated directly
- Must be extended by concrete implementations
- Defines required methods (abstract)
- Provides shared functionality (concrete methods)

**Encapsulation:**
- Public methods: setAnnotations, setViewport, updateTime, destroy, render, update
- Protected methods: _validateContainer, _validateViewport, _checkDestroyed
- Private state: properties managed internally

---

## Success Criteria

### Functional Requirements

✅ BaseLayer class is defined and exported
✅ Constructor validates parameters and initializes properties
✅ Cannot be instantiated directly (abstract class check)
✅ setAnnotations() stores annotation data
✅ setViewport() validates and stores viewport
✅ updateTime() stores current time
✅ destroy() cleans up and sets destroyed flag
✅ Abstract methods (render, update) throw errors
✅ Destroyed layer throws errors on method calls
✅ Validation methods provide clear error messages

### Code Quality Requirements

✅ Comprehensive JSDoc documentation for all methods
✅ Clear error messages for all failure cases
✅ Defensive programming (parameter validation, state checks)
✅ Idempotent operations where appropriate (destroy)
✅ No external dependencies
✅ ES6 class syntax with proper encapsulation
✅ Consistent naming conventions (camelCase for methods/properties)
✅ Private methods prefixed with underscore

### Architecture Requirements

✅ True abstract class (cannot be instantiated)
✅ Clean interface for subclasses
✅ Separation of concerns (base vs subclass responsibilities)
✅ Framework-agnostic (pure JavaScript)
✅ Extensible design (easy to add new layer types)

---

## Next Steps After Implementation

**After completing BaseLayer.js:**

1. **Verify file creation:**
   - File exists at `src/layers/BaseLayer.js`
   - File size approximately 150 lines
   - No syntax errors

2. **Run tests:**
   - Create and run unit tests
   - Verify all test cases pass
   - Check test coverage

3. **Document completion:**
   - Update project status
   - Note any deviations from spec
   - Document any decisions made

4. **Enable next steps:**
   - Step 2 (HighlightLayer) can now begin
   - Step 3 (TextLayer) can now begin
   - Step 4 (DrawingLayer) can now begin

5. **Summary file (after user confirmation):**
   - File: `Instructions/Summary/SystemPipeline_LayerConversion_Step1_BaseLayer_Summary.md`
   - Content: What was implemented, files created, deviations if any

---

## Notes

- This is a foundation class - take extra care with the interface design
- Error messages should be clear and helpful for debugging
- Validation should be strict to catch problems early
- Documentation should be comprehensive (this will be extended by many subclasses)
- Keep the implementation simple and focused on the contract
- Do NOT add features beyond what is specified here (YAGNI principle)

---
