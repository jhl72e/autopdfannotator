# SystemPipeline_LayerConversion_Step3_TextLayer_Implementation

---

## What This Document Is

This implementation document specifies the CODE-level technical details for converting the React TextLayer component to a framework-agnostic JavaScript class. TextLayer renders text box annotations with progressive word-by-word reveal animation.

---

## Purpose

Convert the existing React TextLayer component to a pure JavaScript class that:

- Extends BaseLayer abstract class
- Renders text box annotations with backgrounds
- Implements progressive word-by-word text reveal (typing effect)
- Text appears immediately when typing starts (no fade-in)
- Maintains exact visual behavior from React version (minus fade-in)
- Removes all React dependencies

---

## Context in Overall Plan

**Big Picture:**

- **Outline:** Dynamic PDF Annotation Renderer System
- **Plan:** Layer Conversion (React to Framework-Agnostic)
- **Current Step:** Step 3 of 6 - TextLayer Conversion

**This Step's Role:**

- Second concrete layer implementation extending BaseLayer
- Demonstrates simpler animation pattern (no RAF needed)
- Provides text reveal animation with character-level precision

**Dependencies:**

- Step 1: BaseLayer (completed ✅)
- `src/utils/coordinateUtils.js` (existing)

**Enables:**

- Step 5: LayerManager integration (requires all layers)

---

## Current React Implementation Analysis

**File:** `src/layers/TextLayer.jsx` (112 lines)

**Key Features:**

- Renders text box annotations with background
- Progressive word-by-word text reveal (typing effect)
- Partial character reveal for current word
- Immediate visibility when typing starts (no fade-in)
- Visibility filtering based on start time

**React Patterns Used:**

- `useMemo` for filtering visible annotations (lines 23-30)
- Helper function `getVisibleText()` for calculating visible content (lines 33-58)
- JSX rendering for text boxes (lines 64-108)
- `React.memo` for performance optimization (line 111)

**Text Reveal Algorithm:**

- Calculate progress between start and end times
- Split content into words
- Calculate visible word count from progress
- Calculate partial character count for current word
- Join visible words with spaces
- Simulates real-time typing effect

**Visibility Control:**

- Filter annotations where `nowSec >= annotation.start`
- Show immediately at start time (no fade-in, just typing)
- Remain visible after end time
- Text box appears instantly, content types in progressively

---

## File to Create

**File Path:** `/Users/hyungry72/fclab/pdfAutoAnnotator/src/layers/TextLayer.js`

**Estimated Lines:** ~180 lines

**File Type:** ES6 JavaScript module

---

## Class Structure

### Class Declaration and Imports

```javascript
import BaseLayer from "./BaseLayer.js";
import { rectNormToAbs } from "../utils/coordinateUtils.js";

/**
 * TextLayer - Renders text annotations with progressive reveal
 *
 * Extends BaseLayer to render text box annotations with progressive
 * word-by-word text reveal animation (typing effect). Text appears
 * immediately and types in character by character, simulating real-time typing.
 *
 * @extends BaseLayer
 */
class TextLayer extends BaseLayer {
  // Implementation details below
}

export default TextLayer;
```

---

## Constructor Specification

### Constructor Implementation

```javascript
/**
 * Creates a new TextLayer instance
 *
 * @param {HTMLElement} container - Parent DOM element for layer content
 * @param {Object} viewport - Initial viewport dimensions
 * @param {number} viewport.width - Viewport width in pixels
 * @param {number} viewport.height - Viewport height in pixels
 * @param {number} viewport.scale - PDF scale/zoom level
 */
constructor(container, viewport) {
  // Call parent constructor first
  super(container, viewport);

  // Create layer container element
  this.layerElement = document.createElement('div');
  this.layerElement.style.position = 'absolute';
  this.layerElement.style.inset = '0';
  this.layerElement.style.pointerEvents = 'none';
  this.layerElement.style.zIndex = '30';

  // Append to parent container
  this.container.appendChild(this.layerElement);

  // Initialize element storage (Map of id -> element)
  this.textElements = new Map();
}
```

**Property Mapping from React:**

- JSX container → `this.layerElement`
- No refs needed (React rendering → direct DOM manipulation)
- `getVisibleText` function → class method `_getVisibleText()`

**Key Differences from HighlightLayer:**

- No RAF ID (simpler animation)
- Use textElements instead of elements (clearer naming)
- zIndex: 30 (above highlights which are 25)

---

## render() Method Specification

### Method Signature

```javascript
/**
 * Renders text box elements for all annotations
 *
 * Creates DOM structure for each text annotation. Creates text box divs
 * with proper positioning and styling. Initially hidden (visibility
 * controlled by updateTime).
 *
 * This method is idempotent - safe to call multiple times.
 */
render() {
  // Implementation below
}
```

### Implementation Details

```javascript
render() {
  // Clear existing elements
  this.layerElement.innerHTML = '';
  this.textElements.clear();

  // Process each annotation
  this.annotations.forEach((annotation) => {
    // Convert normalized coordinates to absolute pixels
    const abs = rectNormToAbs(annotation, this.viewport);

    // Create text box div
    const textBox = document.createElement('div');

    // Set positioning
    textBox.style.position = 'absolute';
    textBox.style.left = `${abs.left}px`;
    textBox.style.top = `${abs.top}px`;
    textBox.style.width = `${abs.width}px`;
    textBox.style.height = `${abs.height}px`;

    // Set background and border
    textBox.style.backgroundColor = annotation.style?.bg || 'rgba(255,255,255,0.9)';
    textBox.style.borderRadius = '4px';
    textBox.style.padding = '8px';

    // Set text styling
    textBox.style.fontSize = '14px';
    textBox.style.lineHeight = '1.4';
    textBox.style.color = annotation.style?.color || '#1f2937';
    textBox.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // Set layout
    textBox.style.display = 'flex';
    textBox.style.alignItems = 'center';
    textBox.style.justifyContent = 'flex-start';
    textBox.style.overflow = 'hidden';
    textBox.style.wordWrap = 'break-word';

    // Initially hidden (will be shown/updated in updateTime)
    textBox.style.display = 'none';

    // Append to layer
    this.layerElement.appendChild(textBox);

    // Store reference
    this.textElements.set(annotation.id, {
      element: textBox,
      annotation: annotation
    });
  });
}
```

**Key Styling Details:**

1. **Position:**

   - Absolute positioning with pixel values
   - Uses rectNormToAbs for coordinate conversion

2. **Background:**

   - Default: `rgba(255,255,255,0.9)` (white with transparency)
   - Custom: `annotation.style.bg` if provided
   - Border radius: 4px for rounded corners

3. **Text:**

   - Font size: 14px
   - Line height: 1.4 (comfortable reading)
   - Default color: `#1f2937` (dark gray)
   - Custom color: `annotation.style.color` if provided
   - System font stack for native appearance

4. **Layout:**

   - Flexbox for vertical centering
   - Left-aligned text (flex-start)
   - Word wrapping enabled
   - Overflow hidden

5. **Initial State:**
   - Display none (hidden until start time)
   - Will appear instantly when start time is reached
   - No opacity transition needed

---

## updateTime() Method Specification

### Method Signature

```javascript
/**
 * Updates text box visibility and content based on timeline position
 *
 * Shows/hides text boxes based on start time. Calculates visible text
 * for progressive reveal (typing effect). Text appears immediately when
 * start time is reached and types in progressively.
 *
 * @param {number} nowSec - Current timeline position in seconds
 */
updateTime(nowSec) {
  // Implementation below
}
```

### Implementation Details

```javascript
updateTime(nowSec) {
  // Call parent implementation
  super.updateTime(nowSec);

  // Update each text element
  this.textElements.forEach(({ element, annotation }) => {
    // Check if annotation should be visible
    if (nowSec < annotation.start) {
      // Before start time - hide
      element.style.display = 'none';
    } else {
      // After start time - show
      element.style.display = 'flex';

      // Calculate visible text
      const visibleText = this._getVisibleText(
        annotation.content,
        annotation.start,
        annotation.end,
        nowSec
      );

      // Update text content (typing effect)
      element.textContent = visibleText;
    }
  });
}
```

**Key Logic:**

1. **Visibility Control:**

   - Before start: `display: none`
   - At/after start: `display: flex`

2. **Text Reveal (Typing Effect):**

   - Use `_getVisibleText()` helper method
   - Updates element.textContent directly
   - No RAF needed (simpler than HighlightLayer)
   - Text box appears instantly, content types in progressively

3. **Performance:**
   - Direct DOM updates (no RAF overhead)
   - Only updates when updateTime is called
   - Efficient for text content changes

---

## \_getVisibleText() Helper Method

### Method Signature

```javascript
/**
 * Calculates visible text based on progress between start and end times
 *
 * Implements word-by-word reveal with partial character reveal for
 * the current word being typed.
 *
 * @private
 * @param {string} content - Full text content
 * @param {number} start - Start time in seconds
 * @param {number} end - End time in seconds
 * @param {number} currentTime - Current timeline position in seconds
 * @returns {string} Visible portion of text
 */
_getVisibleText(content, start, end, currentTime) {
  // Implementation below
}
```

### Implementation Details

```javascript
_getVisibleText(content, start, end, currentTime) {
  // Before start - no text visible
  if (currentTime < start) {
    return "";
  }

  // After end - full text visible
  if (currentTime >= end) {
    return content;
  }

  // During animation - calculate progress
  const progress = (currentTime - start) / (end - start);

  // Split into words
  const words = content.split(' ');

  // Calculate visible word count
  const visibleWordCount = Math.floor(progress * words.length);

  // No words visible yet
  if (visibleWordCount === 0) {
    return "";
  }

  // Get complete visible words
  const visibleWords = words.slice(0, visibleWordCount);

  // Add partial of the next word if not at the end
  if (visibleWordCount < words.length) {
    // Calculate progress within current word
    const currentWordProgress = (progress * words.length) - visibleWordCount;

    // Get current word being typed
    const currentWord = words[visibleWordCount];

    // Calculate visible character count
    const visibleCharCount = Math.floor(currentWordProgress * currentWord.length);

    // Add partial word if any characters are visible
    if (visibleCharCount > 0) {
      visibleWords.push(currentWord.slice(0, visibleCharCount));
    }
  }

  // Join words with spaces
  return visibleWords.join(' ');
}
```

**Algorithm Breakdown:**

1. **Edge Cases:**

   - `currentTime < start` → return ""
   - `currentTime >= end` → return full content
   - Handles both boundary conditions

2. **Progress Calculation:**

   ```
   progress = (currentTime - start) / (end - start)
   ```

   - Range: 0.0 to 1.0
   - Represents completion percentage

3. **Word Count:**

   ```
   visibleWordCount = floor(progress * totalWords)
   ```

   - How many complete words to show
   - Examples:
     - progress=0.25, 10 words → 2 words visible
     - progress=0.5, 10 words → 5 words visible

4. **Partial Word:**

   ```
   currentWordProgress = (progress * totalWords) - visibleWordCount
   ```

   - Fractional part after floor
   - Represents progress within current word
   - Examples:
     - progress=0.25, 10 words → 2.5 - 2 = 0.5 (50% of 3rd word)

5. **Character Count:**

   ```
   visibleCharCount = floor(currentWordProgress * currentWord.length)
   ```

   - How many characters of current word to show
   - Examples:
     - 0.5 progress, "hello" → 2 chars → "he"
     - 0.8 progress, "hello" → 4 chars → "hell"

6. **Assembly:**
   - Slice complete words: `words.slice(0, visibleWordCount)`
   - Add partial word: `currentWord.slice(0, visibleCharCount)`
   - Join with spaces: `visibleWords.join(' ')`

**Example Execution:**

Content: "Hello world from text"
Duration: 4 seconds (start=0, end=4)

| Time | Progress | Words | Partial | Result                  |
| ---- | -------- | ----- | ------- | ----------------------- |
| 0.0s | 0.00     | 0     | -       | ""                      |
| 1.0s | 0.25     | 1     | -       | "Hello"                 |
| 1.5s | 0.375    | 1     | "wo"    | "Hello wo"              |
| 2.0s | 0.50     | 2     | -       | "Hello world"           |
| 3.0s | 0.75     | 3     | -       | "Hello world from"      |
| 4.0s | 1.00     | 4     | -       | "Hello world from text" |

---

## update() Method Specification

### Method Implementation

```javascript
/**
 * Updates the visual state of the layer
 *
 * Not used by TextLayer - updateTime handles all updates directly.
 * Implemented to satisfy BaseLayer contract.
 */
update() {
  // Not used - updateTime handles updates directly
}
```

**Note:** Unlike HighlightLayer which uses RAF, TextLayer doesn't need a separate update loop. The updateTime() method directly updates the DOM.

---

## destroy() Method Specification

### Method Implementation

```javascript
/**
 * Destroys the layer and releases all resources
 *
 * Clears element storage, removes DOM elements, and calls parent cleanup.
 */
destroy() {
  // Clear element storage
  this.textElements.clear();
  this.textElements = null;

  // Remove layer element from DOM
  if (this.layerElement && this.layerElement.parentNode) {
    this.layerElement.parentNode.removeChild(this.layerElement);
  }
  this.layerElement = null;

  // Call parent destroy
  super.destroy();
}
```

**Cleanup Steps:**

1. Clear textElements Map
2. Remove layer element from DOM
3. Clear references
4. Call parent destroy (sets isDestroyed flag)

**Note:** Simpler than HighlightLayer - no RAF to cancel.

---

## Complete File Template

```javascript
import BaseLayer from "./BaseLayer.js";
import { rectNormToAbs } from "../utils/coordinateUtils.js";

/**
 * TextLayer - Renders text annotations with progressive reveal
 *
 * Extends BaseLayer to render text box annotations with progressive
 * word-by-word text reveal animation (typing effect). Text appears
 * immediately and types in character by character, simulating real-time typing.
 *
 * @extends BaseLayer
 */
class TextLayer extends BaseLayer {
  /**
   * Creates a new TextLayer instance
   *
   * @param {HTMLElement} container - Parent DOM element for layer content
   * @param {Object} viewport - Initial viewport dimensions
   * @param {number} viewport.width - Viewport width in pixels
   * @param {number} viewport.height - Viewport height in pixels
   * @param {number} viewport.scale - PDF scale/zoom level
   */
  constructor(container, viewport) {
    super(container, viewport);

    // Create layer container element
    this.layerElement = document.createElement("div");
    this.layerElement.style.position = "absolute";
    this.layerElement.style.inset = "0";
    this.layerElement.style.pointerEvents = "none";
    this.layerElement.style.zIndex = "30";

    this.container.appendChild(this.layerElement);

    // Initialize element storage
    this.textElements = new Map();
  }

  /**
   * Renders text box elements for all annotations
   *
   * Creates DOM structure for each text annotation. Creates text box divs
   * with proper positioning and styling. Initially hidden (visibility
   * controlled by updateTime).
   */
  render() {
    // Clear existing elements
    this.layerElement.innerHTML = "";
    this.textElements.clear();

    // Process each annotation
    this.annotations.forEach((annotation) => {
      // Convert normalized coordinates to absolute pixels
      const abs = rectNormToAbs(annotation, this.viewport);

      // Create text box div
      const textBox = document.createElement("div");

      // Set positioning
      textBox.style.position = "absolute";
      textBox.style.left = `${abs.left}px`;
      textBox.style.top = `${abs.top}px`;
      textBox.style.width = `${abs.width}px`;
      textBox.style.height = `${abs.height}px`;

      // Set background and border
      textBox.style.backgroundColor =
        annotation.style?.bg || "rgba(255,255,255,0.9)";
      textBox.style.borderRadius = "4px";
      textBox.style.padding = "8px";

      // Set text styling
      textBox.style.fontSize = "14px";
      textBox.style.lineHeight = "1.4";
      textBox.style.color = annotation.style?.color || "#1f2937";
      textBox.style.fontFamily = "system-ui, -apple-system, sans-serif";

      // Set layout
      textBox.style.display = "flex";
      textBox.style.alignItems = "center";
      textBox.style.justifyContent = "flex-start";
      textBox.style.overflow = "hidden";
      textBox.style.wordWrap = "break-word";

      // Initially hidden
      textBox.style.display = "none";

      // Append to layer
      this.layerElement.appendChild(textBox);

      // Store reference
      this.textElements.set(annotation.id, {
        element: textBox,
        annotation: annotation,
      });
    });
  }

  /**
   * Updates text box visibility and content based on timeline position
   *
   * Shows/hides text boxes based on start time. Calculates visible text
   * for progressive reveal (typing effect). Text appears immediately when
   * start time is reached and types in progressively.
   *
   * @param {number} nowSec - Current timeline position in seconds
   */
  updateTime(nowSec) {
    super.updateTime(nowSec);

    // Update each text element
    this.textElements.forEach(({ element, annotation }) => {
      // Check if annotation should be visible
      if (nowSec < annotation.start) {
        // Before start time - hide
        element.style.display = "none";
      } else {
        // After start time - show
        element.style.display = "flex";

        // Calculate visible text
        const visibleText = this._getVisibleText(
          annotation.content,
          annotation.start,
          annotation.end,
          nowSec
        );

        // Update text content (typing effect)
        element.textContent = visibleText;
      }
    });
  }

  /**
   * Calculates visible text based on progress between start and end times
   *
   * Implements word-by-word reveal with partial character reveal for
   * the current word being typed.
   *
   * @private
   * @param {string} content - Full text content
   * @param {number} start - Start time in seconds
   * @param {number} end - End time in seconds
   * @param {number} currentTime - Current timeline position in seconds
   * @returns {string} Visible portion of text
   */
  _getVisibleText(content, start, end, currentTime) {
    // Before start - no text visible
    if (currentTime < start) {
      return "";
    }

    // After end - full text visible
    if (currentTime >= end) {
      return content;
    }

    // During animation - calculate progress
    const progress = (currentTime - start) / (end - start);

    // Split into words
    const words = content.split(" ");

    // Calculate visible word count
    const visibleWordCount = Math.floor(progress * words.length);

    // No words visible yet
    if (visibleWordCount === 0) {
      return "";
    }

    // Get complete visible words
    const visibleWords = words.slice(0, visibleWordCount);

    // Add partial of the next word if not at the end
    if (visibleWordCount < words.length) {
      // Calculate progress within current word
      const currentWordProgress = progress * words.length - visibleWordCount;

      // Get current word being typed
      const currentWord = words[visibleWordCount];

      // Calculate visible character count
      const visibleCharCount = Math.floor(
        currentWordProgress * currentWord.length
      );

      // Add partial word if any characters are visible
      if (visibleCharCount > 0) {
        visibleWords.push(currentWord.slice(0, visibleCharCount));
      }
    }

    // Join words with spaces
    return visibleWords.join(" ");
  }

  /**
   * Updates the visual state of the layer
   *
   * Not used by TextLayer - updateTime handles all updates directly.
   */
  update() {
    // Not used - updateTime handles updates directly
  }

  /**
   * Destroys the layer and releases all resources
   *
   * Clears element storage, removes DOM elements, and calls parent cleanup.
   */
  destroy() {
    // Clear element storage
    this.textElements.clear();
    this.textElements = null;

    // Remove layer element from DOM
    if (this.layerElement && this.layerElement.parentNode) {
      this.layerElement.parentNode.removeChild(this.layerElement);
    }
    this.layerElement = null;

    // Call parent destroy
    super.destroy();
  }
}

export default TextLayer;
```

---

## Annotation Data Format

### Expected Annotation Structure

```javascript
{
  id: 'string',              // Unique identifier
  type: 'text',              // Must be 'text'
  page: number,              // Page number (1-indexed)
  start: number,             // Start time in seconds
  end: number,               // End time in seconds
  content: 'string',         // Text content to display
  x: number,                 // Normalized x position (0-1)
  y: number,                 // Normalized y position (0-1)
  w: number,                 // Normalized width (0-1)
  h: number,                 // Normalized height (0-1)
  style: {
    bg: 'string',            // Background color (CSS color)
    color: 'string'          // Text color (CSS color)
  }
}
```

### Example Annotations

```javascript
// Basic text annotation with default colors
{
  id: 'txt-1',
  type: 'text',
  page: 1,
  start: 2.0,
  end: 5.0,
  content: 'This is an important note about the content',
  x: 0.1,
  y: 0.3,
  w: 0.4,
  h: 0.15,
  style: {
    bg: 'rgba(255,255,255,0.9)',
    color: '#1f2937'
  }
}

// Text annotation with custom styling
{
  id: 'txt-2',
  type: 'text',
  page: 1,
  start: 6.0,
  end: 9.0,
  content: 'Key point to remember',
  x: 0.5,
  y: 0.6,
  w: 0.3,
  h: 0.1,
  style: {
    bg: 'rgba(255,250,205,0.95)',  // Light yellow
    color: '#000000'
  }
}
```

---

## Testing Requirements

### Unit Tests to Create

**File:** `test/unit/TextLayer.test.js`

**Test Cases:**

1. **Constructor Tests:**

   ```javascript
   // Should extend BaseLayer
   // Should create layer element with correct styles
   // Should append layer element to container
   // Should initialize textElements Map
   // Should set zIndex to 30
   ```

2. **render() Tests:**

   ```javascript
   // Should create text box for each annotation
   // Should use rectNormToAbs for coordinate conversion
   // Should apply default background color when not specified
   // Should apply custom background color when provided
   // Should apply default text color when not specified
   // Should apply custom text color when provided
   // Should set initial display to none
   // Should set initial opacity to 0
   // Should be idempotent (safe to call multiple times)
   // Should clear previous elements on re-render
   ```

3. **updateTime() Tests:**

   ```javascript
   // Should call super.updateTime()
   // Should hide text box before start time
   // Should show text box at start time (instantly, no fade)
   // Should update text content with visible text (typing effect)
   // Should handle multiple annotations
   ```

4. **\_getVisibleText() Tests:**

   ```javascript
   // Should return empty string before start time
   // Should return full text after end time
   // Should return partial text during animation
   // Should reveal words progressively
   // Should reveal characters within current word
   // Should handle single word content
   // Should handle empty content
   // Should handle progress = 0
   // Should handle progress = 1
   // Should calculate word count correctly
   // Should calculate character count correctly
   ```

5. **destroy() Tests:**

   ```javascript
   // Should clear textElements Map
   // Should remove layer element from DOM
   // Should call parent destroy
   ```

6. **Integration Tests:**
   ```javascript
   // Should work with setAnnotations + render + updateTime flow
   // Should work with viewport changes (setViewport + render)
   // Should animate text reveal smoothly (typing effect)
   // Should appear instantly when start time is reached
   ```

### Manual Test Page

**File:** `test/manual/TextLayer-test.html`

**Test Scenarios:**

- Single text annotation
- Multiple text annotations
- Long text with many words
- Short text (single word)
- Different background colors
- Different text colors
- Timeline scrubbing (watch text typing effect)
- Instant appearance at start time (no fade-in)
- Viewport scaling

---

## Performance Considerations

### No RequestAnimationFrame Needed

**Rationale:**

- Text updates are discrete (word/character changes)
- No smooth transform animations required
- Direct DOM updates on updateTime() calls are sufficient
- Simpler than HighlightLayer's continuous animation

### DOM Optimization

**Strategies:**

- Use textContent (faster than innerHTML)
- Update only visibility and content properties
- Direct display toggle (no transition overhead)
- Map for O(1) element lookups

### Memory Management

**Cleanup:**

- Clear Map on render (prevents memory leaks)
- Remove DOM elements on destroy
- Clear all references on destroy
- No RAF to manage (simpler lifecycle)

---

## Coordinate Conversion

### Using rectNormToAbs

```javascript
import { rectNormToAbs } from "../utils/coordinateUtils.js";

// Text annotation has x, y, w, h properties
const annotation = {
  x: 0.1,
  y: 0.3,
  w: 0.4,
  h: 0.15,
};

// Convert to absolute pixels
const abs = rectNormToAbs(annotation, this.viewport);
// Returns: { left: 80, top: 180, width: 320, height: 90 }
//   (assuming viewport: { width: 800, height: 600 })

// Apply to DOM element
textBox.style.left = `${abs.left}px`;
textBox.style.top = `${abs.top}px`;
textBox.style.width = `${abs.width}px`;
textBox.style.height = `${abs.height}px`;
```

---

## Architectural Principles

### Framework Independence

**Requirements Met:**

- No React imports
- No JSX syntax
- No React hooks (useMemo)
- Standard DOM APIs only
- No framework-specific lifecycle

**Verification:**

- Import only BaseLayer and coordinateUtils
- Can run in any JavaScript environment
- No framework dependencies

### Separation of Concerns

**Responsibilities:**

- Create and manage text box DOM elements
- Calculate visible text based on timeline
- Apply fade-in animation
- Handle own lifecycle
- Clean up own resources

**Does NOT Handle:**

- Annotation data management (parent's job)
- Viewport calculation (parent's job)
- Page filtering (parent's job)
- Other layer types (sibling layers)

### BaseLayer Contract

**Implements:**

- `constructor(container, viewport)` - calls super, initializes
- `render()` - creates DOM elements
- `updateTime(nowSec)` - updates visibility and content
- `update()` - not used, empty implementation
- `destroy()` - cleans up resources

**Uses from BaseLayer:**

- `this.container` - parent element
- `this.viewport` - current dimensions
- `this.annotations` - current data
- `this.currentTime` - timeline position
- `this.isDestroyed` - destroyed state

---

## Success Criteria

### Functional Requirements

✅ Renders text box annotations correctly
✅ Progressive word-by-word text reveal (typing effect)
✅ Partial character reveal for current word
✅ Instant appearance at start time (no fade-in)
✅ Visibility control based on start time
✅ Coordinate conversion using rectNormToAbs
✅ Default colors with custom color support
✅ Proper cleanup on destroy

### Code Quality Requirements

✅ Extends BaseLayer correctly
✅ Calls super() in constructor
✅ Implements required abstract methods
✅ Comprehensive JSDoc documentation
✅ No React dependencies
✅ Standard DOM APIs only
✅ Proper resource management (Map, DOM)
✅ Clear and maintainable code

### Animation Requirements

✅ Smooth text reveal (word by word typing effect)
✅ Character-level precision for current word
✅ Correct progress calculation
✅ Instant appearance at start time (no fade delay)
✅ Text persists after end time
✅ Multiple text boxes animate independently

### Architecture Requirements

✅ Framework-agnostic pure JavaScript
✅ Follows BaseLayer contract
✅ Separation of concerns
✅ No coupling to other layers
✅ Can be tested independently
✅ Matches React version behavior exactly

---

## Visual Behavior Preservation

### Exact Match Required

The JavaScript version must produce **identical visual output** to the React version:

1. **Positioning:** Exact pixel-perfect positioning
2. **Text Reveal:** Same word-by-word progression (typing effect)
3. **Character Reveal:** Same partial word behavior
4. **Instant Appearance:** Text box appears immediately at start time (no fade-in)
5. **Colors:** Same default and custom colors
6. **Typography:** Same fonts, sizes, line heights
7. **Layout:** Same flexbox centering and alignment

### Verification Method

- Compare side-by-side with React version (minus fade-in)
- Same test annotations produce same visuals
- Same timeline scrubbing behavior
- Same text reveal timing (typing effect)
- Instant appearance at start time

---

## Comparison: TextLayer vs HighlightLayer

### Similarities

- Both extend BaseLayer
- Both use rectNormToAbs for coordinates
- Both have render() and updateTime() methods
- Both manage their own DOM elements
- Both clean up on destroy()

### Key Differences

| Aspect              | HighlightLayer     | TextLayer             |
| ------------------- | ------------------ | --------------------- |
| **Animation**       | RAF loop           | Direct updates        |
| **Complexity**      | More complex (RAF) | Simpler (no RAF)      |
| **Update Pattern**  | Continuous (60fps) | On-demand             |
| **Element Storage** | `elements` Map     | `textElements` Map    |
| **RAF Management**  | Yes (`rafId`)      | No                    |
| **zIndex**          | 25                 | 30 (above highlights) |
| **Content Type**    | Shapes (quads)     | Text content          |
| **Animation Type**  | Transform (scaleX) | Content change        |

### Learning from HighlightLayer

- Constructor pattern (super, create element, append)
- render() pattern (clear, iterate, create, store)
- destroy() pattern (cleanup, remove, call super)
- Map usage for element storage
- Coordinate conversion approach

---

## Next Steps After Implementation

**After completing TextLayer.js:**

1. **Verify file creation:**

   - File exists at `src/layers/TextLayer.js`
   - File size approximately 180 lines
   - No syntax errors
   - Imports BaseLayer and coordinateUtils

2. **Run tests:**

   - Create and run unit tests
   - Create and run manual test page
   - Verify text reveal is smooth
   - Compare visually with React version

3. **Document completion:**

   - Note any deviations from spec
   - Document any decisions made
   - Update progress tracking

4. **Enable next steps:**

   - Step 4 (DrawingLayer) can proceed in parallel
   - Step 5 (LayerManager) requires Steps 2-4 complete

5. **Summary file (after user confirmation):**
   - File: `Instructions/Summary/SystemPipeline_LayerConversion_Step3_TextLayer_Summary.md`

---

## Notes

- Simpler than HighlightLayer - no RAF needed
- Text reveal algorithm is the core complexity
- Character-level precision requires careful calculation
- Typing effect simulates real-time user input
- Visual output must match React version (minus fade-in)
- Test edge cases: single word, empty content, zero duration
- Performance is good - no continuous animation overhead
- No fade-in means immediate responsiveness at start time

---
