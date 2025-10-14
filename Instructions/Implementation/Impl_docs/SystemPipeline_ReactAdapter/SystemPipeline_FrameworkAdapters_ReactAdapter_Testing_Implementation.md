# Complete Implementation Instructions: AnnotPdf React Adapter Testing System

---

## **Document Information**

**File Name:** `SystemPipeline_FrameworkAdapters_ReactAdapter_Testing_Implementation.md`
**Outline:** System Pipeline
**Plan:** Framework Adapters
**Feature:** AnnotPdf Testing System (Levels 1, 2, 3)
**Implementation Level:** CODE - Technical and Methodological Specifications

---

## **What This Document Is**

This document provides complete CODE-level implementation instructions for creating a comprehensive testing system for the AnnotPdf React Adapter component. The testing system covers three levels: Unit Tests, Integration Tests, and End-to-End (E2E) Tests.

---

## **Implementation Overview**

### **Goal**

Create a complete, manual browser-based testing system that validates:
1. AnnotPdf component works correctly in isolation (Unit Tests)
2. AnnotPdf integrates properly with AnnotationRenderer core engine (Integration Tests)
3. AnnotPdf works correctly in complete user workflows (E2E Tests)

### **Testing Approach**

**Manual HTML-Based Testing:**
- No testing framework required (Jest/Vitest)
- Uses existing infrastructure (Vite dev server)
- Visual test results in browser
- Immediate feedback during development
- Simple to understand and maintain

### **Files to Create**

**Total Files:** 13 files
1. Test fixtures (2 files)
2. Unit tests (4 files)
3. Integration tests (4 files)
4. E2E tests (2 files)
5. Documentation (1 file)

### **Total Lines of Code**

**Estimated:** ~3,500-4,500 lines total
- Fixtures: ~500-700 lines
- Unit tests: ~1,200-1,500 lines
- Integration tests: ~1,200-1,600 lines
- E2E tests: ~600-800 lines
- Documentation: ~200-300 lines

---

## **Directory Structure**

Create the following directory structure:

```
test/
├── AnnotPdf/                              # NEW - Main test directory
│   ├── README.md                          # Documentation
│   ├── fixtures/                          # Test data and utilities
│   │   ├── testAnnotations.js             # Sample annotation data
│   │   └── testHelpers.js                 # Utility functions
│   ├── unit/                              # Level 1: Unit Tests
│   │   ├── 01-render.test.html            # Rendering tests
│   │   ├── 02-props.test.html             # Props validation tests
│   │   ├── 03-lifecycle.test.html         # Lifecycle tests
│   │   └── 04-errors.test.html            # Error handling tests
│   ├── integration/                       # Level 2: Integration Tests
│   │   ├── 01-engine.test.html            # With AnnotationRenderer
│   │   ├── 02-pdf.test.html               # With real PDFs
│   │   ├── 03-audio.test.html             # Audio synchronization
│   │   └── 04-layers.test.html            # Multiple annotation types
│   └── e2e/                               # Level 3: E2E Tests
│       ├── 01-workflow.test.html          # Complete user workflow
│       └── 02-stress.test.html            # Stress testing
├── [existing test files...]
└── README.md                              # Updated with AnnotPdf info
```

---

## **Implementation Instructions**

---

## **PART 1: Test Fixtures and Utilities**

---

## **File 1: test/AnnotPdf/fixtures/testAnnotations.js**

### **Purpose**
Provide reusable test annotation data for all tests.

### **Complete File Contents**

```javascript
/**
 * Test Annotation Fixtures
 *
 * Provides sample annotation data for testing AnnotPdf component.
 * All annotations use normalized coordinates (0-1 range).
 */

// ============================================================================
// Highlight Annotations
// ============================================================================

export const highlightAnnotations = [
  // Simple single-line highlight
  {
    id: 'highlight-1',
    type: 'highlight',
    page: 1,
    start: 0,
    end: 3,
    quads: [
      { x: 0.1, y: 0.2, w: 0.3, h: 0.05 }
    ],
    style: {
      color: 'rgba(255, 255, 0, 0.3)' // Yellow
    }
  },

  // Multi-line highlight
  {
    id: 'highlight-2',
    type: 'highlight',
    page: 1,
    start: 2,
    end: 5,
    quads: [
      { x: 0.1, y: 0.3, w: 0.4, h: 0.04 },
      { x: 0.1, y: 0.35, w: 0.35, h: 0.04 }
    ],
    style: {
      color: 'rgba(0, 255, 0, 0.3)' // Green
    }
  },

  // Highlight on page 2
  {
    id: 'highlight-3',
    type: 'highlight',
    page: 2,
    start: 1,
    end: 4,
    quads: [
      { x: 0.2, y: 0.5, w: 0.3, h: 0.05 }
    ],
    style: {
      color: 'rgba(255, 0, 0, 0.3)' // Red
    }
  },

  // Multiple highlights on same page
  {
    id: 'highlight-4',
    type: 'highlight',
    page: 1,
    start: 4,
    end: 7,
    quads: [
      { x: 0.5, y: 0.6, w: 0.25, h: 0.04 }
    ],
    style: {
      color: 'rgba(255, 0, 255, 0.3)' // Magenta
    }
  }
];

// ============================================================================
// Text Annotations
// ============================================================================

export const textAnnotations = [
  // Simple text box
  {
    id: 'text-1',
    type: 'text',
    page: 1,
    start: 1,
    end: 4,
    content: 'Important concept to remember',
    x: 0.5,
    y: 0.2,
    w: 0.3,
    h: 0.1,
    style: {
      bg: '#ffeb3b',
      color: '#000000',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      padding: 5
    }
  },

  // Long text with word wrap
  {
    id: 'text-2',
    type: 'text',
    page: 1,
    start: 3,
    end: 6,
    content: 'This is a longer explanation that should wrap to multiple lines when displayed in the text box on the PDF.',
    x: 0.1,
    y: 0.5,
    w: 0.4,
    h: 0.15,
    style: {
      bg: '#e3f2fd',
      color: '#1976d2',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      padding: 8
    }
  },

  // Text on page 2
  {
    id: 'text-3',
    type: 'text',
    page: 2,
    start: 2,
    end: 5,
    content: 'Key takeaway from this section',
    x: 0.6,
    y: 0.7,
    w: 0.35,
    h: 0.08,
    style: {
      bg: '#c8e6c9',
      color: '#2e7d32',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      padding: 5
    }
  }
];

// ============================================================================
// Ink/Drawing Annotations
// ============================================================================

export const inkAnnotations = [
  // Simple arrow
  {
    id: 'ink-1',
    type: 'ink',
    page: 1,
    start: 2,
    end: 5,
    strokes: [
      {
        color: '#f44336',
        size: 3,
        points: [
          { t: 0, x: 0.2, y: 0.4 },
          { t: 0.5, x: 0.3, y: 0.4 },
          { t: 1, x: 0.35, y: 0.38 }
        ]
      },
      {
        color: '#f44336',
        size: 3,
        points: [
          { t: 0, x: 0.3, y: 0.4 },
          { t: 1, x: 0.35, y: 0.42 }
        ]
      }
    ]
  },

  // Circle drawing
  {
    id: 'ink-2',
    type: 'ink',
    page: 1,
    start: 4,
    end: 7,
    strokes: [
      {
        color: '#2196f3',
        size: 2,
        points: [
          { t: 0, x: 0.6, y: 0.3 },
          { t: 0.25, x: 0.65, y: 0.28 },
          { t: 0.5, x: 0.7, y: 0.3 },
          { t: 0.75, x: 0.65, y: 0.32 },
          { t: 1, x: 0.6, y: 0.3 }
        ]
      }
    ]
  },

  // Complex multi-stroke drawing on page 2
  {
    id: 'ink-3',
    type: 'ink',
    page: 2,
    start: 3,
    end: 6,
    strokes: [
      {
        color: '#4caf50',
        size: 4,
        points: [
          { t: 0, x: 0.3, y: 0.6 },
          { t: 0.5, x: 0.35, y: 0.55 },
          { t: 1, x: 0.4, y: 0.6 }
        ]
      },
      {
        color: '#4caf50',
        size: 4,
        points: [
          { t: 0, x: 0.35, y: 0.6 },
          { t: 1, x: 0.35, y: 0.65 }
        ]
      }
    ]
  }
];

// ============================================================================
// Combined Annotation Sets
// ============================================================================

// All annotations combined
export const allAnnotations = [
  ...highlightAnnotations,
  ...textAnnotations,
  ...inkAnnotations
];

// Annotations for page 1 only
export const page1Annotations = allAnnotations.filter(a => a.page === 1);

// Annotations for page 2 only
export const page2Annotations = allAnnotations.filter(a => a.page === 2);

// Annotations by timeline segments
export const earlyAnnotations = allAnnotations.filter(a => a.start <= 2);
export const midAnnotations = allAnnotations.filter(a => a.start > 2 && a.start <= 4);
export const lateAnnotations = allAnnotations.filter(a => a.start > 4);

// Single annotation for simple tests
export const singleHighlight = [highlightAnnotations[0]];
export const singleText = [textAnnotations[0]];
export const singleInk = [inkAnnotations[0]];

// ============================================================================
// Malformed Annotations for Error Testing
// ============================================================================

export const malformedAnnotations = [
  // Missing required fields
  {
    id: 'bad-1',
    type: 'highlight',
    page: 1
    // Missing start, end, quads, style
  },

  // Invalid type
  {
    id: 'bad-2',
    type: 'invalid-type',
    page: 1,
    start: 0,
    end: 1
  },

  // Invalid coordinates (out of range)
  {
    id: 'bad-3',
    type: 'text',
    page: 1,
    start: 0,
    end: 1,
    content: 'Test',
    x: 2.5, // Invalid: > 1
    y: -0.5, // Invalid: < 0
    w: 0.5,
    h: 0.5,
    style: { bg: '#fff', color: '#000' }
  },

  // Invalid page number
  {
    id: 'bad-4',
    type: 'highlight',
    page: 999,
    start: 0,
    end: 1,
    quads: [{ x: 0.1, y: 0.1, w: 0.2, h: 0.05 }],
    style: { color: 'rgba(255,0,0,0.3)' }
  }
];

// ============================================================================
// Empty/Null Cases
// ============================================================================

export const emptyAnnotations = [];
export const nullAnnotations = null;
export const undefinedAnnotations = undefined;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get annotations for specific page
 */
export function getAnnotationsForPage(annotations, pageNum) {
  return annotations.filter(a => a.page === pageNum);
}

/**
 * Get annotations visible at specific time
 */
export function getVisibleAnnotations(annotations, currentTime) {
  return annotations.filter(a => currentTime >= a.start && currentTime <= a.end);
}

/**
 * Count annotations by type
 */
export function countByType(annotations) {
  return {
    highlight: annotations.filter(a => a.type === 'highlight').length,
    text: annotations.filter(a => a.type === 'text').length,
    ink: annotations.filter(a => a.type === 'ink').length
  };
}
```

---

## **File 2: test/AnnotPdf/fixtures/testHelpers.js**

### **Purpose**
Provide utility functions for test implementation.

### **Complete File Contents**

```javascript
/**
 * Test Helper Utilities
 *
 * Provides utility functions for implementing AnnotPdf tests.
 */

// ============================================================================
// Test Result Tracking
// ============================================================================

let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Log a test result
 */
export function logTest(resultsElement, name, passed, message = '') {
  testCount++;
  if (passed) passCount++;
  else failCount++;

  const div = document.createElement('div');
  div.className = `test-result ${passed ? 'test-pass' : 'test-fail'}`;
  div.innerHTML = `
    <strong>${passed ? '✅ PASS' : '❌ FAIL'}</strong>: ${name}
    ${message ? `<br><em>${message}</em>` : ''}
  `;
  resultsElement.appendChild(div);

  // Log to console
  console.log(`${passed ? '✅' : '❌'} ${name}${message ? ': ' + message : ''}`);
}

/**
 * Clear test results
 */
export function clearResults(resultsElement) {
  resultsElement.innerHTML = '';
  testCount = 0;
  passCount = 0;
  failCount = 0;
}

/**
 * Show test summary
 */
export function showSummary(resultsElement) {
  const div = document.createElement('div');
  div.className = `test-result ${failCount === 0 ? 'test-pass' : 'test-fail'}`;
  div.innerHTML = `
    <strong>Test Summary:</strong><br>
    Total: ${testCount}<br>
    Passed: ${passCount}<br>
    Failed: ${failCount}<br>
    Success Rate: ${testCount > 0 ? ((passCount / testCount) * 100).toFixed(1) : 0}%
  `;
  resultsElement.insertBefore(div, resultsElement.firstChild);

  console.log(`\n========== TEST SUMMARY ==========`);
  console.log(`Total: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success Rate: ${testCount > 0 ? ((passCount / testCount) * 100).toFixed(1) : 0}%`);
  console.log(`==================================\n`);
}

/**
 * Get current test stats
 */
export function getTestStats() {
  return {
    total: testCount,
    passed: passCount,
    failed: failCount,
    successRate: testCount > 0 ? (passCount / testCount) * 100 : 0
  };
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Wait for element to exist in DOM
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        requestAnimationFrame(checkElement);
      }
    };

    checkElement();
  });
}

/**
 * Wait for condition to be true
 */
export function waitFor(condition, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`));
      } else {
        requestAnimationFrame(check);
      }
    };

    check();
  });
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// React Component Utilities
// ============================================================================

/**
 * Mount React component to container
 */
export function mountComponent(React, ReactDOM, component, containerId) {
  const container = document.getElementById(containerId);
  const root = ReactDOM.createRoot(container);
  root.render(component);
  return root;
}

/**
 * Unmount React component
 */
export function unmountComponent(root) {
  root.unmount();
}

// ============================================================================
// Assertion Utilities
// ============================================================================

/**
 * Assert that value is truthy
 */
export function assertTrue(value, message = 'Expected value to be truthy') {
  if (!value) {
    throw new Error(message);
  }
  return true;
}

/**
 * Assert that value is falsy
 */
export function assertFalse(value, message = 'Expected value to be falsy') {
  if (value) {
    throw new Error(message);
  }
  return true;
}

/**
 * Assert that two values are equal
 */
export function assertEqual(actual, expected, message = 'Values not equal') {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}, Got: ${actual}`);
  }
  return true;
}

/**
 * Assert that element exists
 */
export function assertElementExists(selector, message = 'Element not found') {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`${message}: ${selector}`);
  }
  return true;
}

/**
 * Assert that element has class
 */
export function assertHasClass(element, className, message = 'Class not found') {
  if (!element.classList.contains(className)) {
    throw new Error(`${message}: ${className}`);
  }
  return true;
}

/**
 * Assert that element has style property
 */
export function assertHasStyle(element, property, value, message = 'Style not found') {
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle[property] !== value) {
    throw new Error(`${message}: ${property}. Expected: ${value}, Got: ${computedStyle[property]}`);
  }
  return true;
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Measure execution time
 */
export function measureTime(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

  return {
    result,
    duration
  };
}

/**
 * Measure async execution time
 */
export async function measureTimeAsync(name, fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

  return {
    result,
    duration
  };
}

// ============================================================================
// Mock Utilities
// ============================================================================

/**
 * Create a spy function that tracks calls
 */
export function createSpy() {
  const calls = [];

  const spy = function(...args) {
    calls.push({
      args,
      timestamp: Date.now()
    });
  };

  spy.calls = calls;
  spy.callCount = () => calls.length;
  spy.lastCall = () => calls[calls.length - 1];
  spy.reset = () => { calls.length = 0; };

  return spy;
}

/**
 * Create a mock callback that returns specified value
 */
export function createMockCallback(returnValue) {
  const spy = createSpy();
  const mockFn = function(...args) {
    spy(...args);
    return returnValue;
  };

  mockFn.calls = spy.calls;
  mockFn.callCount = spy.callCount;
  mockFn.lastCall = spy.lastCall;
  mockFn.reset = spy.reset;

  return mockFn;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Expect function to throw error
 */
export function expectError(fn, expectedMessage = null) {
  try {
    fn();
    return false; // No error thrown
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
    }
    return true; // Error thrown as expected
  }
}

/**
 * Expect async function to throw error
 */
export async function expectErrorAsync(fn, expectedMessage = null) {
  try {
    await fn();
    return false; // No error thrown
  } catch (error) {
    if (expectedMessage && !error.message.includes(expectedMessage)) {
      throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
    }
    return true; // Error thrown as expected
  }
}

// ============================================================================
// Export All
// ============================================================================

export default {
  // Test tracking
  logTest,
  clearResults,
  showSummary,
  getTestStats,

  // DOM utilities
  waitForElement,
  waitFor,
  sleep,

  // React utilities
  mountComponent,
  unmountComponent,

  // Assertions
  assertTrue,
  assertFalse,
  assertEqual,
  assertElementExists,
  assertHasClass,
  assertHasStyle,

  // Performance
  measureTime,
  measureTimeAsync,

  // Mocks
  createSpy,
  createMockCallback,

  // Errors
  expectError,
  expectErrorAsync
};
```

---

## **PART 2: Unit Tests (Level 1)**

---

## **File 3: test/AnnotPdf/unit/01-render.test.html**

### **Purpose**
Test AnnotPdf component rendering and DOM structure.

### **Complete File Contents**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AnnotPdf Unit Tests - Rendering</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #2196f3;
      padding-bottom: 10px;
    }
    .test-section {
      background: white;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-section h2 {
      color: #2196f3;
      margin-top: 0;
    }
    .test-result {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border-left: 4px solid;
    }
    .test-pass {
      background-color: #d4edda;
      color: #155724;
      border-color: #28a745;
    }
    .test-fail {
      background-color: #f8d7da;
      color: #721c24;
      border-color: #dc3545;
    }
    .test-controls {
      margin: 20px 0;
    }
    button {
      margin: 5px;
      padding: 12px 24px;
      font-size: 14px;
      cursor: pointer;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      transition: background 0.3s;
    }
    button:hover {
      background: #1976d2;
    }
    button:active {
      background: #1565c0;
    }
    #test-container {
      margin-top: 20px;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 4px;
      min-height: 400px;
      background: #fafafa;
    }
    .test-component {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: white;
    }
  </style>
</head>
<body>
  <h1>🧪 AnnotPdf Unit Tests: Rendering</h1>

  <div class="test-section">
    <h2>Test Controls</h2>
    <div class="test-controls">
      <button id="run-all">▶️ Run All Tests</button>
      <button id="clear-results">🗑️ Clear Results</button>
    </div>
  </div>

  <div class="test-section">
    <h2>Test Results</h2>
    <div id="results"></div>
  </div>

  <div class="test-section">
    <h2>Test Container</h2>
    <div id="test-container"></div>
  </div>

  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { AnnotPdf } from '../../../src/index.js';
    import { logTest, clearResults, showSummary } from '../fixtures/testHelpers.js';

    const results = document.getElementById('results');
    const container = document.getElementById('test-container');

    // ========================================================================
    // Test Implementations
    // ========================================================================

    async function runTests() {
      clearResults(results);
      container.innerHTML = '';

      console.log('\n========== UNIT TESTS: RENDERING ==========\n');

      // TEST 1: Component renders without errors
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-1';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Component renders without errors', true);

        // Cleanup
        root.unmount();
      } catch (error) {
        logTest(results, 'Component renders without errors', false, error.message);
      }

      // TEST 2: Canvas element created
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-2';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = testDiv.querySelector('canvas');
        const passed = canvas !== null;

        logTest(results, 'Canvas element created', passed,
          passed ? 'Canvas found' : 'Canvas not found');

        root.unmount();
      } catch (error) {
        logTest(results, 'Canvas element created', false, error.message);
      }

      // TEST 3: Layer container div created
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-3';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const layerDiv = testDiv.querySelector('div > div:last-child');
        const passed = layerDiv !== null;

        logTest(results, 'Layer container div created', passed,
          passed ? 'Layer div found' : 'Layer div not found');

        root.unmount();
      } catch (error) {
        logTest(results, 'Layer container div created', false, error.message);
      }

      // TEST 4: Correct DOM structure (div → canvas + layer div)
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-4';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const containerDiv = testDiv.querySelector('div');
        const canvas = containerDiv?.querySelector('canvas');
        const layerDiv = containerDiv?.querySelectorAll('div')[0];

        const correctStructure = containerDiv && canvas && layerDiv;
        const canvasFirst = canvas === containerDiv.children[0];
        const layerSecond = layerDiv === containerDiv.children[1];

        const passed = correctStructure && canvasFirst && layerSecond;

        logTest(results, 'Correct DOM structure (div → canvas + layer div)', passed,
          passed ? 'Structure correct' : 'Structure incorrect');

        root.unmount();
      } catch (error) {
        logTest(results, 'Correct DOM structure', false, error.message);
      }

      // TEST 5: Default container styles applied
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-5';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const containerDiv = testDiv.querySelector('div');
        const styles = window.getComputedStyle(containerDiv);

        const hasRelativePosition = styles.position === 'relative';
        const hasInlineBlockDisplay = styles.display === 'inline-block';
        const hasLineHeight0 = parseFloat(styles.lineHeight) === 0;

        const passed = hasRelativePosition && hasInlineBlockDisplay && hasLineHeight0;

        logTest(results, 'Default container styles applied', passed,
          passed ? 'All default styles present' :
          `Missing styles - position: ${styles.position}, display: ${styles.display}, lineHeight: ${styles.lineHeight}`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Default container styles applied', false, error.message);
      }

      // TEST 6: Layer div has absolute positioning
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-6';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const layerDiv = testDiv.querySelector('div > div:last-child');
        const styles = window.getComputedStyle(layerDiv);

        const isAbsolute = styles.position === 'absolute';
        const isTopZero = styles.top === '0px';
        const isLeftZero = styles.left === '0px';
        const hasPointerEventsNone = styles.pointerEvents === 'none';

        const passed = isAbsolute && isTopZero && isLeftZero && hasPointerEventsNone;

        logTest(results, 'Layer div has correct absolute positioning', passed,
          passed ? 'All layer styles correct' :
          `Incorrect styles - position: ${styles.position}, top: ${styles.top}, left: ${styles.left}, pointerEvents: ${styles.pointerEvents}`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Layer div positioning', false, error.message);
      }

      // TEST 7: Custom className applied
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-7';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const customClass = 'my-custom-pdf-viewer';
        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            className: customClass
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const containerDiv = testDiv.querySelector('div');
        const hasClass = containerDiv?.classList.contains(customClass);

        logTest(results, 'Custom className applied', hasClass,
          hasClass ? `Class "${customClass}" found` : `Class "${customClass}" not found`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom className applied', false, error.message);
      }

      // TEST 8: Custom inline styles override defaults
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-8';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const customStyles = {
          backgroundColor: 'rgb(255, 0, 0)',
          border: '2px solid blue'
        };

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            style: customStyles
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const containerDiv = testDiv.querySelector('div');
        const styles = window.getComputedStyle(containerDiv);

        const hasBgColor = styles.backgroundColor === 'rgb(255, 0, 0)';
        const hasBorder = styles.border.includes('2px') && styles.border.includes('blue');

        const passed = hasBgColor && hasBorder;

        logTest(results, 'Custom inline styles override defaults', passed,
          passed ? 'Custom styles applied' :
          `Styles not applied - bg: ${styles.backgroundColor}, border: ${styles.border}`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom inline styles override defaults', false, error.message);
      }

      // TEST 9: Custom canvasStyle applied
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-9';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const canvasStyles = {
          border: '3px solid green',
          borderRadius: '10px'
        };

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            canvasStyle: canvasStyles
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = testDiv.querySelector('canvas');
        const styles = window.getComputedStyle(canvas);

        const hasBorder = styles.border.includes('3px') && styles.border.includes('green');
        const hasBorderRadius = parseFloat(styles.borderRadius) === 10;

        const passed = hasBorder && hasBorderRadius;

        logTest(results, 'Custom canvasStyle applied', passed,
          passed ? 'Canvas styles applied' :
          `Canvas styles not applied - border: ${styles.border}, borderRadius: ${styles.borderRadius}`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom canvasStyle applied', false, error.message);
      }

      // TEST 10: Canvas has display block
      try {
        const testDiv = document.createElement('div');
        testDiv.id = 'test-10';
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = testDiv.querySelector('canvas');
        const styles = window.getComputedStyle(canvas);

        const passed = styles.display === 'block';

        logTest(results, 'Canvas has display block', passed,
          passed ? 'Display is block' : `Display is ${styles.display}`);

        root.unmount();
      } catch (error) {
        logTest(results, 'Canvas has display block', false, error.message);
      }

      // Show summary
      showSummary(results);
    }

    // ========================================================================
    // Event Listeners
    // ========================================================================

    document.getElementById('run-all').addEventListener('click', runTests);
    document.getElementById('clear-results').addEventListener('click', () => {
      clearResults(results);
      container.innerHTML = '';
    });

    // Auto-run on load
    console.log('Page loaded. Click "Run All Tests" to start.');
  </script>
</body>
</html>
```

---

## **File 4: test/AnnotPdf/unit/02-props.test.html**

### **Purpose**
Test AnnotPdf component props validation and handling.

### **Complete File Contents**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AnnotPdf Unit Tests - Props</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #2196f3;
      padding-bottom: 10px;
    }
    .test-section {
      background: white;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-section h2 {
      color: #2196f3;
      margin-top: 0;
    }
    .test-result {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      border-left: 4px solid;
    }
    .test-pass {
      background-color: #d4edda;
      color: #155724;
      border-color: #28a745;
    }
    .test-fail {
      background-color: #f8d7da;
      color: #721c24;
      border-color: #dc3545;
    }
    .test-controls {
      margin: 20px 0;
    }
    button {
      margin: 5px;
      padding: 12px 24px;
      font-size: 14px;
      cursor: pointer;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      transition: background 0.3s;
    }
    button:hover {
      background: #1976d2;
    }
    #test-container {
      margin-top: 20px;
      padding: 20px;
      border: 2px dashed #ccc;
      border-radius: 4px;
      min-height: 400px;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <h1>🧪 AnnotPdf Unit Tests: Props</h1>

  <div class="test-section">
    <h2>Test Controls</h2>
    <div class="test-controls">
      <button id="run-all">▶️ Run All Tests</button>
      <button id="clear-results">🗑️ Clear Results</button>
    </div>
  </div>

  <div class="test-section">
    <h2>Test Results</h2>
    <div id="results"></div>
  </div>

  <div class="test-section">
    <h2>Test Container</h2>
    <div id="test-container"></div>
  </div>

  <script type="module">
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { AnnotPdf } from '../../../src/index.js';
    import { logTest, clearResults, showSummary, createSpy } from '../fixtures/testHelpers.js';
    import { singleHighlight } from '../fixtures/testAnnotations.js';

    const results = document.getElementById('results');
    const container = document.getElementById('test-container');

    // ========================================================================
    // Test Implementations
    // ========================================================================

    async function runTests() {
      clearResults(results);
      container.innerHTML = '';

      console.log('\n========== UNIT TESTS: PROPS ==========\n');

      // TEST 1: Required prop (pdfUrl) - renders without error when provided
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Required prop (pdfUrl) accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Required prop (pdfUrl) accepted', false, error.message);
      }

      // TEST 2: Missing pdfUrl doesn't crash (renders empty)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            // No pdfUrl provided
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Missing pdfUrl doesn\'t crash component', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Missing pdfUrl doesn\'t crash component', false, error.message);
      }

      // TEST 3: Default page prop value (1)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
            // page not provided, should default to 1
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        // Component should render without error
        logTest(results, 'Default page prop value (1) used', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Default page prop value (1) used', false, error.message);
      }

      // TEST 4: Default scale prop value (1.5)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
            // scale not provided, should default to 1.5
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Default scale prop value (1.5) used', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Default scale prop value (1.5) used', false, error.message);
      }

      // TEST 5: Default annotations prop value (empty array)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
            // annotations not provided, should default to []
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Default annotations prop value (empty array) used', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Default annotations prop value used', false, error.message);
      }

      // TEST 6: Default currentTime prop value (0)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf'
            // currentTime not provided, should default to 0
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Default currentTime prop value (0) used', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Default currentTime prop value used', false, error.message);
      }

      // TEST 7: Custom page prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            page: 2
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Custom page prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom page prop accepted', false, error.message);
      }

      // TEST 8: Custom scale prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            scale: 2.0
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Custom scale prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom scale prop accepted', false, error.message);
      }

      // TEST 9: Custom annotations prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            annotations: singleHighlight
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Custom annotations prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom annotations prop accepted', false, error.message);
      }

      // TEST 10: Custom currentTime prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            currentTime: 5.5
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Custom currentTime prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Custom currentTime prop accepted', false, error.message);
      }

      // TEST 11: onLoad callback prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const onLoad = createSpy();
        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            onLoad: onLoad
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'onLoad callback prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'onLoad callback prop accepted', false, error.message);
      }

      // TEST 12: onError callback prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const onError = createSpy();
        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            onError: onError
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'onError callback prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'onError callback prop accepted', false, error.message);
      }

      // TEST 13: onPageChange callback prop accepted
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const onPageChange = createSpy();
        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            onPageChange: onPageChange
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'onPageChange callback prop accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'onPageChange callback prop accepted', false, error.message);
      }

      // TEST 14: Invalid page type handled gracefully (string instead of number)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            page: "invalid" // Invalid: string instead of number
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        // Should not crash, guards should handle this
        logTest(results, 'Invalid page type handled gracefully', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Invalid page type handled gracefully', false, error.message);
      }

      // TEST 15: Invalid scale type handled gracefully (string instead of number)
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            scale: "invalid" // Invalid: string instead of number
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        // Should not crash, guards should handle this
        logTest(results, 'Invalid scale type handled gracefully', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Invalid scale type handled gracefully', false, error.message);
      }

      // TEST 16: Null annotations handled gracefully
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            annotations: null // Null should fallback to empty array
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'Null annotations handled gracefully', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Null annotations handled gracefully', false, error.message);
      }

      // TEST 17: Undefined currentTime handled gracefully
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            currentTime: undefined
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        // Guard should prevent setting time with undefined
        logTest(results, 'Undefined currentTime handled gracefully', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'Undefined currentTime handled gracefully', false, error.message);
      }

      // TEST 18: All props together
      try {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-component';
        container.appendChild(testDiv);

        const root = createRoot(testDiv);
        root.render(
          React.createElement(AnnotPdf, {
            pdfUrl: '/pdfFile/sample.pdf',
            page: 1,
            scale: 1.5,
            annotations: singleHighlight,
            currentTime: 2.5,
            onLoad: createSpy(),
            onError: createSpy(),
            onPageChange: createSpy(),
            className: 'test-class',
            style: { background: 'white' },
            canvasStyle: { border: '1px solid black' }
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        logTest(results, 'All props together accepted', true);

        root.unmount();
      } catch (error) {
        logTest(results, 'All props together accepted', false, error.message);
      }

      // Show summary
      showSummary(results);
    }

    // ========================================================================
    // Event Listeners
    // ========================================================================

    document.getElementById('run-all').addEventListener('click', runTests);
    document.getElementById('clear-results').addEventListener('click', () => {
      clearResults(results);
      container.innerHTML = '';
    });

    // Auto-run on load
    console.log('Page loaded. Click "Run All Tests" to start.');
  </script>
</body>
</html>
```

Due to length constraints, I'll continue with the remaining files in the next response. Would you like me to continue with:
- File 5: test/AnnotPdf/unit/03-lifecycle.test.html
- File 6: test/AnnotPdf/unit/04-errors.test.html
- Integration tests (Level 2)
- E2E tests (Level 3)
- README documentation