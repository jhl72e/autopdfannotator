# AnnotPdf Test Suite

Comprehensive manual browser-based testing system for the AnnotPdf React Adapter component.

## Overview

This test suite validates that the AnnotPdf component:
1. Works correctly in isolation (Unit Tests)
2. Integrates properly with AnnotationRenderer core engine (Integration Tests)
3. Works correctly in complete user workflows (E2E Tests)

## Test Structure

```
test/AnnotPdf/
├── README.md                          # This file
├── fixtures/                          # Test data and utilities
│   ├── testAnnotations.js             # Sample annotation data
│   └── testHelpers.js                 # Utility functions
├── unit/                              # Level 1: Unit Tests
│   ├── 01-render.test.html            # Component rendering tests
│   ├── 02-props.test.html             # Props validation tests
│   ├── 03-lifecycle.test.html         # Lifecycle tests
│   └── 04-errors.test.html            # Error handling tests
├── integration/                       # Level 2: Integration Tests
│   ├── 01-engine.test.html            # AnnotationRenderer integration
│   ├── 02-pdf.test.html               # PDF rendering integration
│   ├── 03-audio.test.html             # Audio/timeline synchronization
│   └── 04-layers.test.html            # Multiple annotation types
└── e2e/                               # Level 3: End-to-End Tests
    ├── 01-workflow.test.html          # Complete user workflows
    └── 02-stress.test.html            # Performance and stress testing
```

## Running Tests

### Prerequisites

1. Start the Vite development server:
   ```bash
   npm run dev
   ```

2. Ensure sample PDF files are available at:
   - `/pdfFile/sample.pdf`
   - `/pdfFile/sample2.pdf` (optional, for document switching tests)

### Running Individual Test Files

Open any test HTML file in your browser through the dev server:

**Unit Tests:**
- http://localhost:5173/test/AnnotPdf/unit/01-render.test.html
- http://localhost:5173/test/AnnotPdf/unit/02-props.test.html
- http://localhost:5173/test/AnnotPdf/unit/03-lifecycle.test.html
- http://localhost:5173/test/AnnotPdf/unit/04-errors.test.html

**Integration Tests:**
- http://localhost:5173/test/AnnotPdf/integration/01-engine.test.html
- http://localhost:5173/test/AnnotPdf/integration/02-pdf.test.html
- http://localhost:5173/test/AnnotPdf/integration/03-audio.test.html
- http://localhost:5173/test/AnnotPdf/integration/04-layers.test.html

**E2E Tests:**
- http://localhost:5173/test/AnnotPdf/e2e/01-workflow.test.html
- http://localhost:5173/test/AnnotPdf/e2e/02-stress.test.html

### Running Tests

1. Open a test file in your browser
2. Click "▶️ Run All Tests" button
3. Watch the results appear in real-time
4. Check console for detailed logs

### Visual Verification

Many tests include visual components rendered in the "Test Container" section. You can verify:
- PDF rendering quality
- Annotation positioning
- Animation smoothness
- Layout correctness

## Test Levels

### Level 1: Unit Tests

**Purpose:** Test AnnotPdf component in isolation without actual PDF rendering.

**Coverage:**
- Component mounting and unmounting
- DOM structure creation
- Props acceptance and defaults
- Style application (className, style, canvasStyle)
- Lifecycle methods
- Error handling and edge cases
- Graceful degradation with invalid inputs

**Files:** 4 test files, ~40+ individual test cases

### Level 2: Integration Tests

**Purpose:** Test AnnotPdf with real PDF documents and the AnnotationRenderer engine.

**Coverage:**
- AnnotationRenderer engine initialization
- PDF loading and rendering to canvas
- Layer management system
- Page navigation with real PDFs
- Zoom and scale operations
- Timeline synchronization
- All three annotation types (highlight, text, ink)
- Viewport calculations

**Files:** 4 test files, ~30+ individual test cases

### Level 3: End-to-End Tests

**Purpose:** Test complete user workflows from start to finish.

**Coverage:**
- Educational content playback scenario
- Interactive presentation scenario
- Document switching workflow
- Error recovery workflow
- Performance under load
- Memory stability during long sessions
- Rapid user interactions

**Files:** 2 test files, ~20+ individual test scenarios

## Test Fixtures

### testAnnotations.js

Provides sample annotation data:
- `highlightAnnotations` - 4 highlight examples
- `textAnnotations` - 3 text box examples
- `inkAnnotations` - 3 drawing examples
- `allAnnotations` - All combined
- `malformedAnnotations` - Invalid data for error testing
- Helper functions for filtering and counting

### testHelpers.js

Provides utility functions:
- `logTest()` - Log test results
- `clearResults()` - Clear test output
- `showSummary()` - Display test statistics
- `sleep()` - Async delay
- `waitFor()` - Wait for condition
- `createSpy()` - Create spy functions for callbacks
- `measureTimeAsync()` - Measure execution time

## Test Results

Each test file displays:
- ✅ **PASS** - Green background, test succeeded
- ❌ **FAIL** - Red background, test failed with error message
- **Test Summary** - Total, Passed, Failed, Success Rate

Console logs provide additional details for debugging.

## Expected Behavior

### Unit Tests
- All tests should pass
- No actual PDF loading occurs
- Fast execution (< 5 seconds total)

### Integration Tests
- Most tests should pass if PDF files are available
- PDF loading tests may take 2-3 seconds
- Visual verification possible in test container

### E2E Tests
- All workflow scenarios should complete
- Stress tests should complete within time limits
- Some visual lag is acceptable under high load

## Troubleshooting

### Tests fail with "PDF not found"
- Ensure dev server is running
- Check that `/pdfFile/sample.pdf` exists and is accessible
- Verify the PDF path in test files matches your setup

### Tests timeout or hang
- Increase timeout values in test files
- Check browser console for errors
- Ensure sufficient system resources

### Visual artifacts in tests
- This is normal during rapid updates in stress tests
- Check that final state is correct after test completes

### onLoad callback not called
- PDF may be taking longer to load
- Increase wait time in tests
- Check PDF file is valid

## Performance Benchmarks

**Expected performance (approximate):**
- Unit tests: < 5 seconds total
- Integration tests: 15-30 seconds total (depends on PDF loading)
- E2E workflow tests: 30-60 seconds total
- E2E stress tests: 30-90 seconds total

**Note:** Times vary based on:
- System performance
- PDF file size
- Browser rendering speed
- Network latency (if PDFs are remote)

## Adding New Tests

### To add a unit test:
1. Create new test case in appropriate unit test file
2. Use `logTest()` to report results
3. Follow existing test patterns

### To add an integration test:
1. Choose appropriate integration test file
2. Include visual verification div if needed
3. Allow sufficient time for PDF loading

### To add an E2E scenario:
1. Add to workflow or stress test file
2. Break into logical steps
3. Include realistic timing delays
4. Test happy path and error cases

## Best Practices

1. **Always run unit tests first** - Fast feedback on component basics
2. **Run integration tests for deep verification** - Validates engine integration
3. **Run E2E tests before releases** - Ensures complete workflows work
4. **Check visual output** - Not all issues show up in pass/fail status
5. **Review console logs** - Additional debugging information available
6. **Test in multiple browsers** - Chrome, Firefox, Safari have different behaviors

## Notes

- These are **manual tests** requiring visual inspection
- Automated testing frameworks (Jest/Vitest) are not used
- Tests run in real browser environment
- No mocking - uses actual PDF.js and rendering engine
- Results may vary slightly between runs due to timing

## Support

For issues or questions about tests:
1. Check browser console for detailed errors
2. Verify all prerequisites are met
3. Try tests in different browser
4. Check that PDF files are accessible
5. Review test code for expected behavior

---

**Last Updated:** 2025-10-14
**Test Coverage:** Unit (4 files), Integration (4 files), E2E (2 files)
**Total Test Cases:** 90+ individual tests and scenarios
