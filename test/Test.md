# Core Subsystem Tests

This directory contains test files for the core subsystems.

## Test Files

- `pdfrenderer-test.html` - Interactive test page for PDFRenderer
- `timelinesync-test.html` - Interactive test page for TimelineSync

## Running the Tests

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open a test page:**
   - PDFRenderer: `http://localhost:5173/test/pdfrenderer-test.html`
   - TimelineSync: `http://localhost:5173/test/timelinesync-test.html`

3. **Test the features:**

   **PDFRenderer:**
   - Click "Load PDF" to load the sample PDF
   - Use "Render Page 1" to render the first page
   - Navigate with "Previous Page" / "Next Page" buttons
   - Test different zoom levels
   - Use arrow keys for page navigation
   - Click "Destroy Renderer" to test cleanup

   **TimelineSync:**
   - Test discrete mode (Set Time buttons)
   - Add/remove multiple subscribers
   - Test temporary subscriber with unsubscribe function
   - Start/stop continuous sync simulation
   - Test error handling (invalid inputs, error-throwing subscribers)
   - Test change detection optimization
   - Test cleanup and recreation

## Expected Results

### ✅ PDFRenderer Tests

- PDF loads successfully with page count displayed
- Page renders to canvas with correct dimensions
- Page navigation works (Previous/Next)
- Zoom controls adjust scale correctly
- Canvas resizes appropriately for zoom levels
- Destroy cleans up resources

**Features Tested:**
- ✅ `loadDocument()` - PDF loading
- ✅ `renderPage()` - Page rendering
- ✅ `getPageCount()` - Page count retrieval
- ✅ `cancelRender()` - Render cancellation (implicit)
- ✅ `destroy()` - Resource cleanup
- ✅ Viewport calculation
- ✅ Canvas dimension setting
- ✅ Error handling

### ✅ TimelineSync Tests

- Discrete mode updates timeline correctly
- Multiple subscribers all receive notifications
- Unsubscribe function works correctly
- Continuous sync runs at ~60fps
- Error-throwing subscribers don't break others
- Invalid inputs throw appropriate errors
- Same time values skip notification
- Destroy cleans up all resources

**Features Tested:**
- ✅ `setTime()` - Discrete timeline updates
- ✅ `getCurrentTime()` - Get current position
- ✅ `subscribe()` - Add subscribers
- ✅ `unsubscribe()` - Remove subscribers
- ✅ `startContinuousSync()` - Continuous RAF loop
- ✅ `stopContinuousSync()` - Stop RAF loop
- ✅ `destroy()` - Resource cleanup
- ✅ Error isolation in notifySubscribers
- ✅ Change detection optimization
- ✅ Input validation

## Notes

**PDFRenderer:**
- Test uses `/pdfFile/sample.pdf` from the public folder
- Vite dev server serves files from the public directory at root
- PDF.js worker is loaded from `/pdf.worker.min.js` (also in public)

**TimelineSync:**
- Pure JavaScript test - no external dependencies
- Continuous sync uses simulated time (~60fps with RAF)
- All tests run independently in browser
- Check browser console for detailed error logs
