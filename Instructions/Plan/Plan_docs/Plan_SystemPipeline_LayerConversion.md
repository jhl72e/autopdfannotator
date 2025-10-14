# Layer Conversion Plan

---

## What This Document Is

This plan describes HOW to convert the three existing React layer components (HighlightLayer, TextLayer, DrawingLayer) into framework-agnostic JavaScript classes that inherit from a common BaseLayer abstract class. This conversion completes the framework independence of the rendering system.

---

## Purpose

Remove React dependency from annotation layer rendering by converting React components to pure JavaScript classes. Create a BaseLayer abstract class that defines a common interface for all layer types. Enable LayerManager to directly instantiate and manage layer instances without framework coupling.

---

## Current State Analysis

### Existing React Layers

**Files:**
- `src/layers/HighlightLayer.jsx` (139 lines)
- `src/layers/TextLayer.jsx` (112 lines)
- `src/layers/DrawingLayer.jsx` (125 lines)

**Current Architecture:**

```
LayerManager (Data Provider Pattern)
├── Manages annotation data
├── Filters annotations by page
├── Routes annotations by type
└── Stores viewport and timeline state

React Components (separate from core)
├── HighlightLayer.jsx - receives data via props
├── TextLayer.jsx - receives data via props
└── DrawingLayer.jsx - receives data via props
```

**Current Dependencies:**
- All layers import React, useEffect, useRef, useMemo
- All layers use JSX syntax for rendering
- All layers rely on React lifecycle for updates
- LayerManager cannot instantiate layers (Data Provider Pattern workaround)

**Current Functionality:**
- **HighlightLayer:** Renders rectangular highlights with scaleX animation using requestAnimationFrame
- **TextLayer:** Renders text boxes with word-by-word reveal using React re-renders
- **DrawingLayer:** Renders canvas strokes progressively using requestAnimationFrame

---

## Target Architecture

### Framework-Agnostic Layer Classes

**Files to Create:**
- `src/layers/BaseLayer.js` (abstract base class)
- `src/layers/HighlightLayer.js` (pure JS implementation)
- `src/layers/TextLayer.js` (pure JS implementation)
- `src/layers/DrawingLayer.js` (pure JS implementation)

**Target Architecture:**

```
LayerManager (Direct Instantiation Pattern)
├── Instantiates layer instances in constructor
├── Calls layer.setAnnotations(annos)
├── Calls layer.setViewport(viewport)
├── Calls layer.updateTime(nowSec)
└── Manages layer lifecycle

BaseLayer (Abstract Class)
├── Defines common interface
├── Provides shared lifecycle management
└── Enforces implementation contract

Layer Instances (HighlightLayer, TextLayer, DrawingLayer)
├── Extend BaseLayer
├── Implement required abstract methods
├── Manage their own DOM/Canvas elements
└── Handle their own animation loops
```

**Target Dependencies:**
- Zero React dependencies in layer classes
- Pure JavaScript with standard DOM APIs
- Can run in any JavaScript environment

---

## Architectural Principles

### Framework Independence

**Pure JavaScript Classes:**
- Use ES6 class syntax with no framework dependencies
- Use standard DOM APIs for element creation and manipulation
- Use native Canvas APIs for drawing operations
- Use requestAnimationFrame for animations

**No JSX or React Hooks:**
- Replace useEffect with class methods
- Replace useRef with class properties
- Replace useMemo with instance methods
- Replace JSX with document.createElement()

### Separation of Concerns

**Each Layer Is Autonomous:**
- Manages its own DOM elements or canvas
- Handles its own animation loops
- Controls its own rendering lifecycle
- Cleans up its own resources

**LayerManager Coordinates:**
- Instantiates layer instances once
- Propagates state changes to all layers
- Does not manage layer internals
- Handles layer lifecycle at system level

### Lifecycle Management

**Initialization:**
- Constructor receives container element and initial viewport
- Layer creates its own DOM structure
- Layer initializes internal state

**Updates:**
- setAnnotations() receives new annotation data
- setViewport() receives new viewport dimensions
- updateTime() receives new timeline position

**Cleanup:**
- destroy() cancels animations
- destroy() removes DOM elements
- destroy() clears references

---

## BaseLayer Abstract Class Design

### Purpose

Provide a common interface and shared functionality for all annotation layer types. Define the contract that all layer implementations must follow. Encapsulate common lifecycle patterns.

### File Location

`src/layers/BaseLayer.js`

### Class Structure

**Abstract Class:**
- Cannot be instantiated directly
- Must be extended by concrete layer classes
- Enforces implementation of required methods

**Properties:**
- `container` - Parent DOM element for layer content
- `viewport` - Current PDF viewport dimensions
- `annotations` - Current annotation data for this layer
- `currentTime` - Current timeline position in seconds
- `isDestroyed` - Flag indicating if layer is destroyed

### Public Methods

**Constructor:**
```
constructor(container, viewport)
```
- Receives parent container element
- Receives initial viewport dimensions
- Initializes layer state
- Subclasses call super() then initialize their specific elements

**setAnnotations(annotations):**
```
setAnnotations(annotations)
```
- Receives array of annotations for this layer type
- Stores annotations in instance property
- Triggers render update if needed
- Subclasses override to implement specific filtering or processing

**setViewport(viewport):**
```
setViewport(viewport)
```
- Receives new viewport dimensions (width, height, scale)
- Updates instance viewport property
- Triggers layout recalculation
- Subclasses override to resize elements or canvas

**updateTime(nowSec):**
```
updateTime(nowSec)
```
- Receives current timeline position in seconds
- Updates currentTime property
- Triggers animation update
- Subclasses override to implement specific animation logic

**destroy():**
```
destroy()
```
- Cancels any active animations
- Removes DOM elements
- Clears references
- Sets isDestroyed flag
- Subclasses override to clean up specific resources

### Abstract Methods

**render():**
```
render() // abstract - must be implemented by subclasses
```
- Creates or recreates DOM elements
- Called when annotations or viewport change
- Subclasses implement to build their specific DOM structure

**update():**
```
update() // abstract - must be implemented by subclasses
```
- Updates visual state based on current time
- Called during animation loops
- Subclasses implement to update transforms, styles, or canvas

### Protected/Internal Methods

**_validateContainer(container):**
- Validates container is a DOM element
- Throws error if invalid

**_validateViewport(viewport):**
- Validates viewport has required properties
- Throws error if invalid

### Shared Functionality

**Error Handling:**
- Validate constructor parameters
- Check isDestroyed before operations
- Provide clear error messages

**State Management:**
- Store viewport, annotations, currentTime
- Track destroyed state
- Provide getters for state inspection

---

## HighlightLayer Conversion Plan

### Current React Implementation Analysis

**File:** `src/layers/HighlightLayer.jsx`

**Key Features:**
- Renders multiple rectangular highlight regions (quads)
- Progressive reveal animation using scaleX transform
- Left-to-right animation based on timeline
- Multi-line highlight support with segment timing
- requestAnimationFrame for smooth 60fps animation

**React Patterns Used:**
- useRef for container and RAF ID
- useRef for Map storing element references
- useEffect for DOM creation when annos/viewport change
- useEffect for animation loop when nowSec changes
- React.memo for performance optimization

**Animation Logic:**
- Calculate total width across all quads
- Calculate per-quad timing segments (segStart, segEnd)
- Calculate global progress from annotation start/end times
- Calculate local progress for each quad segment
- Apply scaleX transform to each highlight element

### Conversion Strategy

**Class Structure:**

Create `src/layers/HighlightLayer.js` extending BaseLayer.

**Property Mapping:**
- `containerRef` → `this.layerElement` (created in constructor)
- `rafRef` → `this.rafId` (number, animation frame ID)
- `elementsRef` → `this.elements` (Map of element data)

**Method Mapping:**
- First useEffect → `render()` method
- Second useEffect → `updateTime()` method
- Cleanup functions → `destroy()` method

**DOM Creation:**
- Constructor creates layer container div
- render() clears and recreates highlight elements
- Each quad gets wrapper div + highlight div
- Store element references in this.elements Map

**Animation Loop:**
- updateTime() starts RAF loop if not already running
- Animation callback updates all element transforms
- Loop continues until destroyed or time hasn't changed
- Cleanup cancels RAF in destroy()

### Key Rendering Logic Preservation

**Quad Processing:**
- Maintain exact quad iteration and timing calculation
- Preserve segStart/segEnd calculation logic
- Keep wrapper + highlight nested structure

**Transform Animation:**
- Keep scaleX transform with transformOrigin left
- Maintain exact progress calculation formulas
- Preserve clamping logic for progress values

**Visibility Control:**
- Hide wrapper when nowSec < annotation.start
- Show wrapper when nowSec >= annotation.start
- Maintain display: none/block toggling

**Performance:**
- Keep willChange: transform hint
- Maintain RAF loop for smooth animation
- Preserve element reuse strategy

### Implementation Approach

**Constructor:**
```javascript
constructor(container, viewport) {
  super(container, viewport);
  this.layerElement = document.createElement('div');
  // Set layer styles (position: absolute, inset: 0, zIndex: 25)
  container.appendChild(this.layerElement);
  this.elements = new Map();
  this.rafId = null;
}
```

**render() Method:**
```javascript
render() {
  // Clear existing elements
  this.layerElement.innerHTML = '';
  this.elements.clear();

  // Create elements for each annotation's quads
  this.annotations.forEach(a => {
    // Calculate total width
    // For each quad:
    //   - Calculate abs position from normalized coords
    //   - Calculate segStart, segEnd
    //   - Create wrapper and highlight divs
    //   - Set styles and transforms
    //   - Store in elements Map
  });
}
```

**updateTime(nowSec) Method:**
```javascript
updateTime(nowSec) {
  super.updateTime(nowSec);

  // Cancel existing RAF if running
  if (this.rafId) cancelAnimationFrame(this.rafId);

  // Start animation loop
  const animate = () => {
    if (this.isDestroyed) return;

    this.elements.forEach(({ element, wrapper, annotation, segStart, segEnd }) => {
      // Calculate progress
      // Update wrapper visibility
      // Update element scaleX transform
    });

    this.rafId = requestAnimationFrame(animate);
  };

  animate();
}
```

**destroy() Method:**
```javascript
destroy() {
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
  this.elements.clear();
  if (this.layerElement && this.layerElement.parentNode) {
    this.layerElement.parentNode.removeChild(this.layerElement);
  }
  super.destroy();
}
```

---

## TextLayer Conversion Plan

### Current React Implementation Analysis

**File:** `src/layers/TextLayer.jsx`

**Key Features:**
- Renders text box annotations with background
- Progressive word-by-word text reveal
- Partial character reveal for current word
- Fade-in animation when annotation starts
- Visibility filtering based on start time

**React Patterns Used:**
- useMemo for filtering visible annotations
- Helper function getVisibleText() for calculating visible content
- JSX rendering for text boxes
- React re-renders trigger visual updates

**Animation Logic:**
- Filter annotations where nowSec >= start time
- Calculate progress between start and end times
- Calculate visible word count from progress
- Calculate partial character count for current word
- Apply fade-in opacity based on elapsed time

### Conversion Strategy

**Class Structure:**

Create `src/layers/TextLayer.js` extending BaseLayer.

**Property Mapping:**
- JSX container → `this.layerElement` (created in constructor)
- No refs needed (React rendering → direct DOM manipulation)
- getVisibleText function → class method

**Method Mapping:**
- useMemo filtering → `setAnnotations()` or `updateTime()` filtering
- JSX rendering → `render()` creating DOM elements
- Component re-render → `updateTime()` updating element content

**DOM Creation:**
- Constructor creates layer container div
- render() creates text box divs for visible annotations
- Each text box is a positioned div with background
- Store element references for efficient updates

**Animation Loop:**
- updateTime() iterates through annotation elements
- Calculate visible text for each based on current time
- Update textContent directly
- Update opacity for fade-in effect
- No RAF needed (simpler than HighlightLayer)

### Key Rendering Logic Preservation

**Visibility Filtering:**
- Show annotations where nowSec >= annotation.start
- Hide annotations where nowSec < annotation.start
- Maintain visibility after end time

**Text Reveal Algorithm:**
- Preserve exact word counting logic
- Keep character-by-character partial word reveal
- Maintain progress calculation formulas
- Preserve clamping and edge case handling

**Styling:**
- Keep exact positioning calculations
- Maintain background color, border radius, padding
- Preserve font family, size, line height
- Keep flex layout for centering

**Fade-In Animation:**
- Calculate fade-in progress over 0.2 seconds
- Apply opacity based on elapsed time since start
- Maintain transition timing

### Implementation Approach

**Constructor:**
```javascript
constructor(container, viewport) {
  super(container, viewport);
  this.layerElement = document.createElement('div');
  // Set layer styles (position: absolute, inset: 0, zIndex: 30)
  container.appendChild(this.layerElement);
  this.textElements = new Map();
}
```

**render() Method:**
```javascript
render() {
  // Clear existing elements
  this.layerElement.innerHTML = '';
  this.textElements.clear();

  // Create text box elements for all annotations
  this.annotations.forEach(a => {
    const textBox = document.createElement('div');
    // Calculate absolute position from normalized coords
    // Set all styles (position, dimensions, colors, fonts)
    // Initially hidden (will be shown/updated in updateTime)
    this.layerElement.appendChild(textBox);
    this.textElements.set(a.id, { element: textBox, annotation: a });
  });
}
```

**updateTime(nowSec) Method:**
```javascript
updateTime(nowSec) {
  super.updateTime(nowSec);

  this.textElements.forEach(({ element, annotation }) => {
    // Check if annotation should be visible
    if (nowSec < annotation.start) {
      element.style.display = 'none';
    } else {
      element.style.display = 'flex';

      // Calculate visible text
      const visibleText = this._getVisibleText(
        annotation.content,
        annotation.start,
        annotation.end,
        nowSec
      );

      // Update text content
      element.textContent = visibleText;

      // Calculate and apply fade-in opacity
      const fadeProgress = Math.min(1, (nowSec - annotation.start) / 0.2);
      element.style.opacity = fadeProgress;
    }
  });
}
```

**_getVisibleText() Helper Method:**
```javascript
_getVisibleText(content, start, end, currentTime) {
  // Port exact logic from React component
  if (currentTime < start) return "";
  if (currentTime >= end) return content;

  const progress = (currentTime - start) / (end - start);
  const words = content.split(' ');
  const visibleWordCount = Math.floor(progress * words.length);

  if (visibleWordCount === 0) return "";

  const visibleWords = words.slice(0, visibleWordCount);

  if (visibleWordCount < words.length) {
    const currentWordProgress = (progress * words.length) - visibleWordCount;
    const currentWord = words[visibleWordCount];
    const visibleCharCount = Math.floor(currentWordProgress * currentWord.length);

    if (visibleCharCount > 0) {
      visibleWords.push(currentWord.slice(0, visibleCharCount));
    }
  }

  return visibleWords.join(' ');
}
```

**destroy() Method:**
```javascript
destroy() {
  this.textElements.clear();
  if (this.layerElement && this.layerElement.parentNode) {
    this.layerElement.parentNode.removeChild(this.layerElement);
  }
  super.destroy();
}
```

---

## DrawingLayer Conversion Plan

### Current React Implementation Analysis

**File:** `src/layers/DrawingLayer.jsx`

**Key Features:**
- Renders ink/drawing annotations on HTML canvas
- Progressive stroke drawing point by point
- Multiple strokes per annotation with different colors/sizes
- Device pixel ratio handling for crisp rendering
- requestAnimationFrame for smooth animation

**React Patterns Used:**
- useRef for canvas element
- useRef for RAF ID
- useEffect for canvas dimension setup
- useEffect for drawing animation loop
- React.memo for performance

**Animation Logic:**
- Clear canvas every frame
- For each annotation after start time:
  - Calculate elapsed time (capped at duration)
  - For each stroke:
    - Draw points where point.t <= elapsed
    - Use lineTo/moveTo for path drawing
  - Stroke the complete path

### Conversion Strategy

**Class Structure:**

Create `src/layers/DrawingLayer.js` extending BaseLayer.

**Property Mapping:**
- `canvasRef` → `this.canvasElement` (created in constructor)
- `rafRef` → `this.rafId` (number, animation frame ID)
- Canvas context → `this.ctx` (stored after setup)

**Method Mapping:**
- First useEffect (canvas setup) → `setViewport()` method
- Second useEffect (drawing loop) → `updateTime()` method
- Cleanup functions → `destroy()` method

**Canvas Setup:**
- Constructor creates canvas element
- setViewport() sets canvas dimensions with DPR scaling
- Canvas appended to container in constructor

**Drawing Loop:**
- updateTime() starts RAF loop
- Draw callback clears canvas and redraws all strokes
- Check elapsed time for each annotation
- Draw only points that should be visible
- Loop continues until destroyed

### Key Rendering Logic Preservation

**Canvas Dimension Handling:**
- Maintain device pixel ratio scaling
- Keep canvas.width/height vs style.width/height pattern
- Preserve ctx.setTransform() for DPR scaling

**Stroke Drawing Algorithm:**
- Keep exact point iteration logic
- Preserve elapsed time calculation
- Maintain point.t comparison for visibility
- Keep lineTo/moveTo path building

**Styling:**
- Maintain lineCap: round, lineJoin: round
- Preserve strokeStyle, lineWidth assignments
- Keep default values for missing properties

**Performance:**
- Maintain RAF loop for 60fps rendering
- Keep clearRect for full canvas clearing
- Preserve efficient path building

### Implementation Approach

**Constructor:**
```javascript
constructor(container, viewport) {
  super(container, viewport);
  this.canvasElement = document.createElement('canvas');
  // Set canvas styles (position: absolute, inset: 0, zIndex: 40)
  container.appendChild(this.canvasElement);
  this.ctx = this.canvasElement.getContext('2d');
  this.rafId = null;

  // Initial canvas setup
  this._setupCanvas();
}
```

**setViewport(viewport) Method:**
```javascript
setViewport(viewport) {
  super.setViewport(viewport);
  this._setupCanvas();
}

_setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  this.canvasElement.width = Math.round(this.viewport.width * dpr);
  this.canvasElement.height = Math.round(this.viewport.height * dpr);
  this.canvasElement.style.width = `${this.viewport.width}px`;
  this.canvasElement.style.height = `${this.viewport.height}px`;
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
```

**updateTime(nowSec) Method:**
```javascript
updateTime(nowSec) {
  super.updateTime(nowSec);

  // Cancel existing RAF
  if (this.rafId) cancelAnimationFrame(this.rafId);

  // Start drawing loop
  const draw = () => {
    if (this.isDestroyed) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // Draw each annotation
    for (const a of this.annotations) {
      if (nowSec < a.start) continue;

      const duration = a.end - a.start;
      const elapsed = Math.min(nowSec - a.start, duration);

      // Draw each stroke
      for (const stroke of (a.strokes || [])) {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = stroke.color || '#1f2937';
        this.ctx.lineWidth = stroke.size || 3;
        this.ctx.beginPath();

        let started = false;

        for (const point of stroke.points) {
          if (point.t > elapsed) break;

          const x = point.x * this.viewport.width;
          const y = point.y * this.viewport.height;

          if (!started) {
            this.ctx.moveTo(x, y);
            started = true;
          } else {
            this.ctx.lineTo(x, y);
          }
        }

        if (started) {
          this.ctx.stroke();
        }
      }
    }

    this.rafId = requestAnimationFrame(draw);
  };

  draw();
}
```

**destroy() Method:**
```javascript
destroy() {
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
  this.ctx = null;
  if (this.canvasElement && this.canvasElement.parentNode) {
    this.canvasElement.parentNode.removeChild(this.canvasElement);
  }
  super.destroy();
}
```

---

## LayerManager Integration

### Current Data Provider Pattern

**Current Approach:**
- LayerManager stores annotation data categorized by type
- LayerManager provides getter methods for layer data
- React layer components remain separate from core
- Parent component renders React layers with data from LayerManager

**Current LayerManager Methods:**
- `setAnnotations(annos)` - filters and categorizes annotations
- `setViewport(viewport)` - stores viewport for layers
- `updateTimeline(nowSec)` - stores current time
- `getLayerData()` - returns data object for React rendering

**Limitations:**
- Cannot instantiate layer instances (React component limitation)
- Data Provider Pattern is a workaround for framework coupling
- Indirect communication through data passing
- React parent component required for layer rendering

### Target Direct Instantiation Pattern

**New Approach:**
- LayerManager instantiates layer class instances in constructor
- LayerManager calls layer methods directly
- No React dependency in LayerManager
- Layers are autonomous objects managed by LayerManager

**New LayerManager Responsibilities:**
- Create layer instances on initialization
- Route annotation data to appropriate layers
- Propagate viewport changes to all layers
- Propagate timeline updates to all layers
- Destroy layer instances on cleanup

### Implementation Changes

**File:** `src/core/LayerManager.js`

**Import Layer Classes:**
```javascript
import HighlightLayer from '../layers/HighlightLayer.js';
import TextLayer from '../layers/TextLayer.js';
import DrawingLayer from '../layers/DrawingLayer.js';
```

**Constructor Modifications:**
```javascript
constructor(container, viewport) {
  this.container = container;
  this.viewport = viewport;
  this.annotations = [];
  this.currentTime = 0;

  // Instantiate layer instances
  this.layers = {
    highlight: new HighlightLayer(container, viewport),
    text: new TextLayer(container, viewport),
    drawing: new DrawingLayer(container, viewport)
  };
}
```

**setAnnotations(annos) Modifications:**
```javascript
setAnnotations(annos) {
  this.annotations = annos || [];

  // Filter annotations by current page (assume page filtering done externally)
  // Categorize by type
  const byType = {
    highlight: [],
    text: [],
    ink: []
  };

  for (const a of this.annotations) {
    if (a.type === 'highlight') byType.highlight.push(a);
    else if (a.type === 'text') byType.text.push(a);
    else if (a.type === 'ink') byType.ink.push(a);
  }

  // Pass annotations to layers
  this.layers.highlight.setAnnotations(byType.highlight);
  this.layers.text.setAnnotations(byType.text);
  this.layers.drawing.setAnnotations(byType.ink);

  // Trigger render on all layers
  this.layers.highlight.render();
  this.layers.text.render();
  this.layers.drawing.render();
}
```

**setViewport(viewport) Modifications:**
```javascript
setViewport(viewport) {
  this.viewport = viewport;

  // Propagate to all layers
  this.layers.highlight.setViewport(viewport);
  this.layers.text.setViewport(viewport);
  this.layers.drawing.setViewport(viewport);

  // Trigger render on all layers (viewport change requires re-layout)
  this.layers.highlight.render();
  this.layers.text.render();
  this.layers.drawing.render();
}
```

**updateTimeline(nowSec) Modifications:**
```javascript
updateTimeline(nowSec) {
  this.currentTime = nowSec;

  // Propagate time update to all layers
  this.layers.highlight.updateTime(nowSec);
  this.layers.text.updateTime(nowSec);
  this.layers.drawing.updateTime(nowSec);
}
```

**destroy() Modifications:**
```javascript
destroy() {
  // Destroy all layer instances
  this.layers.highlight.destroy();
  this.layers.text.destroy();
  this.layers.drawing.destroy();

  // Clear references
  this.layers = null;
  this.annotations = null;
  this.viewport = null;
  this.container = null;
}
```

**Remove getLayerData() Method:**
- No longer needed with direct instantiation
- Data Provider Pattern eliminated

### Benefits of Direct Instantiation

**Simplified Architecture:**
- Direct method calls instead of data passing
- No intermediate data structures
- Clear responsibility boundaries

**True Framework Independence:**
- LayerManager imports JS classes, not React components
- No dependency on React rendering lifecycle
- Can be tested without React

**Better Encapsulation:**
- Layers manage their own internals
- LayerManager doesn't need to know layer implementation details
- Clear public interface through BaseLayer contract

**Easier Testing:**
- Can instantiate and test layers independently
- Can mock layer instances in LayerManager tests
- Integration testing without React complexity

---

## Implementation Sequence

### Overview

Six sequential steps building from abstract base to full integration. Each step can be tested independently before proceeding. Preserve React layers throughout for coexistence and rollback capability.

### Step 1: Create BaseLayer Abstract Class

**Goal:** Establish common interface and shared functionality for all layers.

**File to Create:**
- `src/layers/BaseLayer.js` (~150 lines)

**Implementation Tasks:**
1. Define BaseLayer class with constructor
2. Implement common properties (container, viewport, annotations, currentTime, isDestroyed)
3. Implement concrete methods (setAnnotations, setViewport, updateTime, destroy)
4. Define abstract methods (render, update) with throw statements
5. Add validation helpers (_validateContainer, _validateViewport)
6. Add comprehensive JSDoc documentation

**Testing:**
- Create simple test extending BaseLayer
- Verify abstract methods throw errors
- Verify concrete methods work correctly
- Test validation logic

**Dependencies:** None

**Success Criteria:**
- BaseLayer class is defined and documented
- Abstract methods throw appropriate errors
- Validation works correctly
- Can be extended by subclasses

---

### Step 2: Convert HighlightLayer to JavaScript

**Goal:** Create framework-agnostic HighlightLayer preserving all functionality.

**File to Create:**
- `src/layers/HighlightLayer.js` (~200 lines)

**Implementation Tasks:**
1. Create HighlightLayer class extending BaseLayer
2. Implement constructor (create layer element, initialize Map)
3. Implement render() method (DOM creation logic from first useEffect)
4. Implement updateTime() method (animation logic from second useEffect)
5. Implement destroy() method (cleanup RAF, clear elements)
6. Port quad processing and timing calculation logic
7. Port scaleX animation logic
8. Add JSDoc documentation

**Testing:**
- Create standalone test HTML page
- Load PDF and render sample highlights
- Verify progressive animation works correctly
- Test viewport changes and re-rendering
- Verify cleanup works (no memory leaks)

**Dependencies:**
- Step 1 (BaseLayer)
- coordinateUtils.js (existing)

**Success Criteria:**
- HighlightLayer renders quads correctly
- ScaleX animation is smooth and accurate
- Multi-line highlights work properly
- No React dependencies
- Proper cleanup on destroy()

---

### Step 3: Convert TextLayer to JavaScript

**Goal:** Create framework-agnostic TextLayer preserving all functionality.

**File to Create:**
- `src/layers/TextLayer.js` (~180 lines)

**Implementation Tasks:**
1. Create TextLayer class extending BaseLayer
2. Implement constructor (create layer element, initialize Map)
3. Implement render() method (create text box elements)
4. Implement updateTime() method (update visible text and opacity)
5. Implement _getVisibleText() helper method
6. Port text reveal algorithm exactly
7. Port fade-in animation logic
8. Add JSDoc documentation

**Testing:**
- Create standalone test HTML page
- Load PDF and render sample text annotations
- Verify word-by-word reveal works correctly
- Test fade-in animation timing
- Verify positioning accuracy
- Verify cleanup works

**Dependencies:**
- Step 1 (BaseLayer)
- coordinateUtils.js (existing)

**Success Criteria:**
- TextLayer renders text boxes correctly
- Word-by-word reveal is accurate
- Fade-in animation works smoothly
- Text positioning matches PDF coordinates
- No React dependencies
- Proper cleanup on destroy()

---

### Step 4: Convert DrawingLayer to JavaScript

**Goal:** Create framework-agnostic DrawingLayer preserving all functionality.

**File to Create:**
- `src/layers/DrawingLayer.js` (~170 lines)

**Implementation Tasks:**
1. Create DrawingLayer class extending BaseLayer
2. Implement constructor (create canvas, get context)
3. Implement setViewport() override (canvas dimension setup with DPR)
4. Implement updateTime() method (drawing loop with RAF)
5. Implement destroy() method (cleanup RAF, remove canvas)
6. Port stroke drawing algorithm exactly
7. Port point timing logic
8. Add JSDoc documentation

**Testing:**
- Create standalone test HTML page
- Load PDF and render sample ink annotations
- Verify progressive stroke drawing works
- Test canvas scaling with DPR
- Verify stroke colors and sizes
- Verify cleanup works

**Dependencies:**
- Step 1 (BaseLayer)

**Success Criteria:**
- DrawingLayer renders strokes correctly
- Progressive drawing is smooth
- Canvas scaling handles DPR properly
- Multiple strokes per annotation work
- No React dependencies
- Proper cleanup on destroy()

---

### Step 5: Update LayerManager Integration

**Goal:** Refactor LayerManager to directly instantiate and manage layer instances.

**File to Modify:**
- `src/core/LayerManager.js` (modify existing ~216 lines)

**Implementation Tasks:**
1. Import new layer classes (HighlightLayer, TextLayer, DrawingLayer)
2. Modify constructor to instantiate layer instances
3. Refactor setAnnotations() to call layer.setAnnotations() and layer.render()
4. Refactor setViewport() to call layer.setViewport() and layer.render()
5. Refactor updateTimeline() to call layer.updateTime()
6. Add layer lifecycle management in destroy()
7. Remove getLayerData() method (Data Provider Pattern eliminated)
8. Update JSDoc documentation

**Testing:**
- Test LayerManager instantiation
- Test annotation routing to correct layers
- Test viewport propagation
- Test timeline updates
- Test destroy() cleanup
- Integration test with AnnotationRenderer

**Dependencies:**
- Steps 2, 3, 4 (all layer implementations)

**Success Criteria:**
- LayerManager instantiates all layers successfully
- Annotation routing works correctly
- Viewport changes propagate to layers
- Timeline updates trigger layer animations
- Destroy cleans up all layers
- Data Provider Pattern completely removed
- No React dependencies in LayerManager

---

### Step 6: Update Public API Exports

**Goal:** Update src/index.js to export new layer classes and BaseLayer.

**File to Modify:**
- `src/index.js` (modify existing ~91 lines)

**Implementation Tasks:**
1. Import BaseLayer from './layers/BaseLayer.js'
2. Update layer imports to point to .js files instead of .jsx
3. Export BaseLayer in layers section
4. Update layer exports (HighlightLayer, TextLayer, DrawingLayer) to .js versions
5. Update JSDoc comments if needed
6. Update VERSION if appropriate

**Testing:**
- Test import { BaseLayer } from '@ai-annotator/renderer'
- Test import { HighlightLayer, TextLayer, DrawingLayer } from '@ai-annotator/renderer'
- Verify all exports resolve correctly
- Test namespace import (import * as Renderer)

**Dependencies:**
- Step 1 (BaseLayer)
- Steps 2, 3, 4 (layer implementations)

**Success Criteria:**
- BaseLayer exported successfully
- Layer classes export correctly (.js versions)
- No import errors
- Public API remains clean and organized
- Documentation accurate

---

## Data Flow and Communication

### Initialization Flow

```
AnnotationRenderer.constructor()
  └─> LayerManager.constructor(container, viewport)
      ├─> new HighlightLayer(container, viewport)
      │   └─> Creates layer element, appends to container
      ├─> new TextLayer(container, viewport)
      │   └─> Creates layer element, appends to container
      └─> new DrawingLayer(container, viewport)
          └─> Creates canvas element, appends to container
```

### Annotation Update Flow

```
AnnotationRenderer.setAnnotations(annos)
  └─> LayerManager.setAnnotations(annos)
      ├─> Filter and categorize by type
      ├─> highlightLayer.setAnnotations(highlightAnnos)
      │   └─> Stores annotations
      ├─> textLayer.setAnnotations(textAnnos)
      │   └─> Stores annotations
      ├─> drawingLayer.setAnnotations(inkAnnos)
      │   └─> Stores annotations
      ├─> highlightLayer.render()
      │   └─> Creates DOM elements for quads
      ├─> textLayer.render()
      │   └─> Creates DOM elements for text boxes
      └─> drawingLayer.render()
          └─> No-op or canvas preparation
```

### Viewport Update Flow

```
AnnotationRenderer.setScale(scale) or setPage(page)
  └─> PDFRenderer.renderPage(page, canvas, scale)
      └─> Returns viewport
          └─> LayerManager.setViewport(viewport)
              ├─> highlightLayer.setViewport(viewport)
              │   └─> Stores viewport
              ├─> textLayer.setViewport(viewport)
              │   └─> Stores viewport
              ├─> drawingLayer.setViewport(viewport)
              │   └─> Resizes canvas with DPR scaling
              ├─> highlightLayer.render()
              │   └─> Recalculates absolute positions
              ├─> textLayer.render()
              │   └─> Recalculates absolute positions
              └─> drawingLayer.render()
                  └─> Clears canvas (will redraw on next updateTime)
```

### Timeline Update Flow

```
AnnotationRenderer.setTime(nowSec)
  └─> TimelineSync.setTime(nowSec)
      └─> Notifies subscribers
          └─> AnnotationRenderer._handleTimeUpdate(nowSec)
              └─> LayerManager.updateTimeline(nowSec)
                  ├─> highlightLayer.updateTime(nowSec)
                  │   └─> Starts RAF loop, updates scaleX transforms
                  ├─> textLayer.updateTime(nowSec)
                  │   └─> Updates visible text and opacity
                  └─> drawingLayer.updateTime(nowSec)
                      └─> Starts RAF loop, redraws canvas
```

### Cleanup Flow

```
AnnotationRenderer.destroy()
  └─> LayerManager.destroy()
      ├─> highlightLayer.destroy()
      │   ├─> Cancels RAF
      │   ├─> Clears elements Map
      │   └─> Removes layer element from DOM
      ├─> textLayer.destroy()
      │   ├─> Clears textElements Map
      │   └─> Removes layer element from DOM
      └─> drawingLayer.destroy()
          ├─> Cancels RAF
          ├─> Clears canvas context reference
          └─> Removes canvas element from DOM
```

### Layer-to-LayerManager Communication

**Primarily One-Way:**
- LayerManager calls layer methods (setAnnotations, setViewport, updateTime)
- Layers do not call back to LayerManager
- Layers are autonomous and self-contained

**Potential Future Extension:**
- Layers could emit events (error, loadComplete, etc.)
- LayerManager could subscribe to layer events
- Not implemented in this phase (YAGNI principle)

---

## Coexistence Strategy

### Parallel File Structure

**React Layers (preserved):**
- `src/layers/HighlightLayer.jsx` - remains unchanged
- `src/layers/TextLayer.jsx` - remains unchanged
- `src/layers/DrawingLayer.jsx` - remains unchanged

**JavaScript Layers (new):**
- `src/layers/BaseLayer.js` - new abstract base class
- `src/layers/HighlightLayer.js` - framework-agnostic version
- `src/layers/TextLayer.js` - framework-agnostic version
- `src/layers/DrawingLayer.js` - framework-agnostic version

**Benefits:**
- Original React components remain functional
- Can test both versions side-by-side
- Easy rollback if issues discovered
- Gradual migration path
- Zero risk to existing demo app

### Export Management

**src/index.js Updates:**

Before:
```javascript
export { default as HighlightLayer } from './layers/HighlightLayer.jsx';
export { default as TextLayer } from './layers/TextLayer.jsx';
export { default as DrawingLayer } from './layers/DrawingLayer.jsx';
```

After:
```javascript
export { default as BaseLayer } from './layers/BaseLayer.js';
export { default as HighlightLayer } from './layers/HighlightLayer.js';
export { default as TextLayer } from './layers/TextLayer.js';
export { default as DrawingLayer } from './layers/DrawingLayer.js';
```

**Impact:**
- Public API now exports JS versions by default
- React versions accessible via direct import if needed
- Consumers using public API get framework-agnostic versions

### Testing During Transition

**Independent Testing:**
- Test each JS layer with standalone HTML pages
- Compare behavior to React versions visually
- Verify animation timing matches exactly

**Integration Testing:**
- Test LayerManager with new layer classes
- Test full AnnotationRenderer pipeline
- Compare to original PdfViewer.jsx behavior

**Coexistence Testing:**
- Verify both .jsx and .js files can coexist without conflicts
- Test that imports resolve correctly
- Ensure no accidental cross-contamination

### Rollback Capability

**If Issues Discovered:**
1. Revert src/index.js exports to point to .jsx files
2. Revert LayerManager.js to Data Provider Pattern version
3. Delete new .js layer files if needed
4. Original functionality fully intact

**Risk Mitigation:**
- Commit after each step for granular rollback
- Keep comprehensive test suite
- Document any behavior differences immediately

### Final Cleanup (Future)

**After Full Validation:**
- Remove .jsx layer files
- Clean up any React-specific test code
- Update documentation to remove React references
- Announce breaking change for direct .jsx imports

**Not Done in This Phase:**
- Keep coexistence for safety
- Remove in future major version
- Allow ecosystem time to adopt

---

## Success Criteria

### Functional Requirements

**Layer Rendering:**
- ✅ HighlightLayer renders rectangular regions correctly
- ✅ TextLayer renders text boxes correctly
- ✅ DrawingLayer renders canvas strokes correctly
- ✅ All layers position annotations accurately using viewport coordinates

**Animation Performance:**
- ✅ HighlightLayer scaleX animation is smooth at 60fps
- ✅ TextLayer word reveal updates without stuttering
- ✅ DrawingLayer stroke animation is smooth at 60fps
- ✅ Timeline synchronization maintains consistent frame timing

**State Management:**
- ✅ Layers update correctly when annotations change
- ✅ Layers reposition correctly when viewport changes
- ✅ Layers animate correctly when timeline updates
- ✅ Layer state remains consistent across updates

**Lifecycle Management:**
- ✅ Layers initialize correctly on construction
- ✅ Layers clean up resources on destroy()
- ✅ No memory leaks from RAF loops or DOM elements
- ✅ Destroyed layers cannot be used (error on method calls)

---

### Code Quality

**Framework Independence:**
- ✅ Zero React imports in any layer class
- ✅ Zero JSX syntax in any layer class
- ✅ Only standard DOM and Canvas APIs used
- ✅ Can be used in vanilla JavaScript environment

**Object-Oriented Design:**
- ✅ BaseLayer provides clear abstract interface
- ✅ All layers extend BaseLayer correctly
- ✅ Abstract methods implemented in all subclasses
- ✅ Proper use of super() calls

**Code Organization:**
- ✅ Each layer class in separate file
- ✅ BaseLayer defines common functionality
- ✅ No code duplication across layer classes
- ✅ Clear separation of concerns

**Documentation:**
- ✅ Comprehensive JSDoc for all classes
- ✅ Method parameters and return types documented
- ✅ Complex algorithms explained with comments
- ✅ Public API documented in BaseLayer

**Error Handling:**
- ✅ Constructor parameters validated
- ✅ Method calls on destroyed layers throw errors
- ✅ Invalid data handled gracefully
- ✅ Clear error messages for debugging

**Resource Management:**
- ✅ All DOM elements removed on destroy()
- ✅ All RAF loops canceled on destroy()
- ✅ All references cleared on destroy()
- ✅ No lingering event listeners

---

### Architecture

**BaseLayer Contract:**
- ✅ BaseLayer defines consistent interface for all layers
- ✅ All required methods defined (abstract and concrete)
- ✅ Shared functionality centralized in base class
- ✅ Subclasses follow consistent patterns

**LayerManager Integration:**
- ✅ LayerManager instantiates layers directly
- ✅ Data Provider Pattern completely removed
- ✅ LayerManager calls layer methods directly
- ✅ Clear ownership and lifecycle management

**Separation of Concerns:**
- ✅ Each layer manages only its own rendering
- ✅ Layers don't know about each other
- ✅ LayerManager coordinates but doesn't control internals
- ✅ AnnotationRenderer orchestrates high-level flow

**Extensibility:**
- ✅ Easy to add new layer types by extending BaseLayer
- ✅ LayerManager can easily manage new layer types
- ✅ No hardcoded dependencies on specific layer implementations
- ✅ Public API exposes BaseLayer for consumer extensions

**Testability:**
- ✅ Each layer can be tested independently
- ✅ LayerManager can be tested with mock layers
- ✅ No React dependencies in test environment
- ✅ Simple HTML test pages sufficient for validation

---

### Integration

**AnnotationRenderer Compatibility:**
- ✅ AnnotationRenderer works with new LayerManager
- ✅ No changes needed to AnnotationRenderer
- ✅ Full pipeline works end-to-end
- ✅ No regressions in existing functionality

**Public API:**
- ✅ src/index.js exports all layer classes
- ✅ BaseLayer exported for consumer use
- ✅ No breaking changes to existing exports
- ✅ Clear documentation of new exports

**Coexistence:**
- ✅ React layer files coexist without conflicts
- ✅ No import resolution errors
- ✅ Original demo app unaffected (uses PdfViewer.jsx)
- ✅ Gradual migration path available

**Utilities Integration:**
- ✅ Layers use existing coordinateUtils correctly
- ✅ Layers use existing viewportUtils if needed
- ✅ No duplication of utility functions
- ✅ Consistent coordinate system usage

---

## Technical Specifications

### BaseLayer Interface Contract

**Required Constructor Signature:**
```javascript
constructor(container, viewport)
```
- `container`: HTMLElement - parent container for layer content
- `viewport`: Object - { width: number, height: number, scale: number }

**Required Public Methods:**

```javascript
setAnnotations(annotations)
```
- `annotations`: Array - annotation objects for this layer type
- Must store annotations and prepare for rendering
- Should not trigger render automatically (controlled by parent)

```javascript
setViewport(viewport)
```
- `viewport`: Object - { width: number, height: number, scale: number }
- Must store viewport and recalculate dimensions
- Should not trigger render automatically (controlled by parent)

```javascript
updateTime(nowSec)
```
- `nowSec`: Number - current timeline position in seconds
- Must update currentTime property
- Must trigger animation updates
- Should use RAF for smooth animation

```javascript
render()
```
- No parameters
- Must create or recreate DOM elements based on current annotations and viewport
- Should be idempotent (safe to call multiple times)
- Must handle empty annotations array gracefully

```javascript
destroy()
```
- No parameters
- Must cancel any active animations (RAF)
- Must remove all DOM elements
- Must clear all references
- Must set isDestroyed flag
- Must be safe to call multiple times

**Required Abstract Methods (subclass must implement):**

```javascript
render() // Create/recreate DOM structure
update() // Update visual state (may not be used by all layers)
```

**Required Properties:**

```javascript
this.container    // HTMLElement
this.viewport     // { width, height, scale }
this.annotations  // Array
this.currentTime  // Number (seconds)
this.isDestroyed  // Boolean
```

---

### Layer Class Structure Template

```javascript
import BaseLayer from './BaseLayer.js';

class ExampleLayer extends BaseLayer {
  constructor(container, viewport) {
    super(container, viewport);

    // Create layer-specific elements
    this.layerElement = document.createElement('div');
    // Set styles...
    this.container.appendChild(this.layerElement);

    // Initialize layer-specific state
    this.elements = new Map();
    this.rafId = null;
  }

  render() {
    // Clear existing elements
    this.layerElement.innerHTML = '';
    this.elements.clear();

    // Create elements for each annotation
    this.annotations.forEach(annotation => {
      // Create and configure elements
      // Store references in this.elements
    });
  }

  updateTime(nowSec) {
    super.updateTime(nowSec);

    // Cancel existing animation
    if (this.rafId) cancelAnimationFrame(this.rafId);

    // Start animation loop
    const animate = () => {
      if (this.isDestroyed) return;

      // Update element transforms/styles/content

      this.rafId = requestAnimationFrame(animate);
    };

    animate();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.elements.clear();

    if (this.layerElement && this.layerElement.parentNode) {
      this.layerElement.parentNode.removeChild(this.layerElement);
    }

    super.destroy();
  }

  // Layer-specific helper methods
  _helperMethod() {
    // ...
  }
}

export default ExampleLayer;
```

---

### RequestAnimationFrame Management

**Pattern for RAF in Layers:**

```javascript
updateTime(nowSec) {
  super.updateTime(nowSec);

  // Cancel previous RAF if exists
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
  }

  // Start new animation loop
  const animate = () => {
    // Always check destroyed state first
    if (this.isDestroyed) return;

    // Perform animation updates
    // ...

    // Schedule next frame
    this.rafId = requestAnimationFrame(animate);
  };

  // Start loop
  animate();
}

destroy() {
  // Cancel RAF before any other cleanup
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  // Other cleanup...

  super.destroy();
}
```

**Key Points:**
- Cancel previous RAF before starting new one (prevents multiple loops)
- Check isDestroyed at start of animate callback
- Store RAF ID for cleanup
- Cancel RAF first in destroy() method

---

### Resource Cleanup Patterns

**DOM Element Cleanup:**

```javascript
destroy() {
  // Clear any element collections
  if (this.elements) {
    this.elements.clear();
    this.elements = null;
  }

  // Remove layer element from DOM
  if (this.layerElement && this.layerElement.parentNode) {
    this.layerElement.parentNode.removeChild(this.layerElement);
  }
  this.layerElement = null;

  super.destroy();
}
```

**Canvas Cleanup:**

```javascript
destroy() {
  // Cancel animation first
  if (this.rafId) {
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  // Clear context reference
  this.ctx = null;

  // Remove canvas from DOM
  if (this.canvasElement && this.canvasElement.parentNode) {
    this.canvasElement.parentNode.removeChild(this.canvasElement);
  }
  this.canvasElement = null;

  super.destroy();
}
```

**General Principles:**
- Cancel animations before removing elements
- Clear collections and maps
- Remove elements from DOM
- Clear references to enable garbage collection
- Call super.destroy() last

---

### Coordinate Conversion

**Using coordinateUtils:**

```javascript
import { rectNormToAbs } from '../utils/coordinateUtils.js';

render() {
  this.annotations.forEach(annotation => {
    // annotation has normalized coordinates (0-1 range)
    // { x: 0.5, y: 0.3, w: 0.2, h: 0.1 }

    // Convert to absolute pixel coordinates
    const abs = rectNormToAbs(annotation, this.viewport);
    // abs = { left: 250px, top: 180px, width: 100px, height: 60px }

    // Apply to DOM element
    element.style.left = abs.left + 'px';
    element.style.top = abs.top + 'px';
    element.style.width = abs.width + 'px';
    element.style.height = abs.height + 'px';
  });
}
```

**For Canvas (manual conversion):**

```javascript
updateTime(nowSec) {
  // annotation.point has normalized coordinates
  // { x: 0.5, y: 0.3 }

  // Convert to canvas pixels
  const canvasX = annotation.point.x * this.viewport.width;
  const canvasY = annotation.point.y * this.viewport.height;

  this.ctx.lineTo(canvasX, canvasY);
}
```

---

### Device Pixel Ratio Handling (Canvas)

**Pattern for DPR Scaling:**

```javascript
_setupCanvas() {
  const dpr = window.devicePixelRatio || 1;

  // Set canvas buffer size (high resolution)
  this.canvasElement.width = Math.round(this.viewport.width * dpr);
  this.canvasElement.height = Math.round(this.viewport.height * dpr);

  // Set canvas display size (CSS pixels)
  this.canvasElement.style.width = `${this.viewport.width}px`;
  this.canvasElement.style.height = `${this.viewport.height}px`;

  // Scale context to account for DPR
  this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Now drawing at 1:1 CSS pixels works correctly
  // this.ctx.lineTo(100, 100) draws at CSS pixel (100, 100)
}
```

**Key Points:**
- canvas.width/height = buffer resolution (high for crisp rendering)
- canvas.style.width/height = display size (CSS pixels)
- ctx.setTransform() scales coordinate system to match CSS pixels
- Draw using CSS pixel coordinates, canvas handles DPR automatically

---

## Notes

This plan converts React layer components to framework-agnostic JavaScript classes, completing the framework independence of the rendering system. The conversion preserves all existing functionality while removing React dependencies. The BaseLayer abstract class provides a clean interface for current and future layer types. The direct instantiation pattern simplifies the architecture and eliminates the Data Provider Pattern workaround. Coexistence with React layers provides safety and rollback capability during transition.

The plan follows the architectural principles established in the Core System Construction plan: framework-agnostic core, separation of concerns, minimal coupling, and clean public APIs.

---
