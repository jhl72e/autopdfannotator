import { AnnotationRenderer } from '@ai-annotator/renderer';
import { sampleAnnotations } from '../../shared/fixtures/annotations-sample.js';

// ============================================================================
// State Variables (Manual State Management)
// ============================================================================

let currentPage = 1;
let currentScale = 1.5;
let pageCount = 0;
let renderer = null;

// ============================================================================
// DOM Element References
// ============================================================================

let canvas = null;
let layerContainer = null;
let prevButton = null;
let nextButton = null;
let zoomInButton = null;
let zoomOutButton = null;
let pageDisplay = null;
let zoomDisplay = null;

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Vanilla JS Example] Initializing...');

  // Get DOM element references
  canvas = document.getElementById('pdf-canvas');
  layerContainer = document.getElementById('layer-container');
  prevButton = document.getElementById('prev-page');
  nextButton = document.getElementById('next-page');
  zoomInButton = document.getElementById('zoom-in');
  zoomOutButton = document.getElementById('zoom-out');
  pageDisplay = document.getElementById('page-display');
  zoomDisplay = document.getElementById('zoom-display');

  // Validate all elements exist
  if (!canvas || !layerContainer) {
    console.error('[Vanilla JS Example] Required DOM elements not found');
    return;
  }

  // Create renderer instance
  try {
    renderer = new AnnotationRenderer({
      canvasElement: canvas,
      container: layerContainer
    });
    console.log('[Vanilla JS Example] Renderer initialized');
  } catch (error) {
    console.error('[Vanilla JS Example] Failed to initialize renderer:', error);
    alert('Failed to initialize PDF renderer. Check console for details.');
    return;
  }

  // Load PDF document
  try {
    const result = await renderer.loadPDF('/sample.pdf');
    if (result.success) {
      pageCount = result.pageCount;
      console.log(`[Vanilla JS Example] PDF loaded: ${pageCount} pages`);
      updatePageDisplay();
    } else {
      console.error('[Vanilla JS Example] Failed to load PDF:', result.error);
      alert('Failed to load PDF. Check console for details.');
      return;
    }
  } catch (error) {
    console.error('[Vanilla JS Example] Error loading PDF:', error);
    alert('Error loading PDF. Check console for details.');
    return;
  }

  // Render first page
  try {
    await renderer.setPage(currentPage);
    await renderer.setScale(currentScale);
    renderer.setAnnotations(sampleAnnotations);
    console.log('[Vanilla JS Example] First page rendered');
  } catch (error) {
    console.error('[Vanilla JS Example] Error rendering page:', error);
    alert('Error rendering page. Check console for details.');
    return;
  }

  // Attach event listeners
  attachEventListeners();

  // Update initial UI state
  updatePageDisplay();
  updateZoomDisplay();
  updateButtonStates();

  console.log('[Vanilla JS Example] Initialization complete');
});

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle previous page button click
 */
async function handlePrevPage() {
  if (currentPage > 1) {
    currentPage--;
    console.log(`[Vanilla JS Example] Navigate to page ${currentPage}`);
    await renderer.setPage(currentPage);
    updatePageDisplay();
    updateButtonStates();
  }
}

/**
 * Handle next page button click
 */
async function handleNextPage() {
  if (currentPage < pageCount) {
    currentPage++;
    console.log(`[Vanilla JS Example] Navigate to page ${currentPage}`);
    await renderer.setPage(currentPage);
    updatePageDisplay();
    updateButtonStates();
  }
}

/**
 * Handle zoom in button click
 */
async function handleZoomIn() {
  if (currentScale < 3.0) {
    currentScale = Math.min(currentScale + 0.25, 3.0);
    console.log(`[Vanilla JS Example] Zoom in to ${Math.round(currentScale * 100)}%`);
    await renderer.setScale(currentScale);
    updateZoomDisplay();
    updateButtonStates();
  }
}

/**
 * Handle zoom out button click
 */
async function handleZoomOut() {
  if (currentScale > 0.5) {
    currentScale = Math.max(currentScale - 0.25, 0.5);
    console.log(`[Vanilla JS Example] Zoom out to ${Math.round(currentScale * 100)}%`);
    await renderer.setScale(currentScale);
    updateZoomDisplay();
    updateButtonStates();
  }
}

// ============================================================================
// Event Listener Attachment
// ============================================================================

/**
 * Attach event listeners to all interactive elements
 */
function attachEventListeners() {
  if (prevButton) prevButton.addEventListener('click', handlePrevPage);
  if (nextButton) nextButton.addEventListener('click', handleNextPage);
  if (zoomInButton) zoomInButton.addEventListener('click', handleZoomIn);
  if (zoomOutButton) zoomOutButton.addEventListener('click', handleZoomOut);

  console.log('[Vanilla JS Example] Event listeners attached');
}

// ============================================================================
// UI Update Functions
// ============================================================================

/**
 * Update page display text
 */
function updatePageDisplay() {
  if (pageDisplay) {
    pageDisplay.textContent = `Page ${currentPage} of ${pageCount}`;
  }
}

/**
 * Update zoom display text
 */
function updateZoomDisplay() {
  if (zoomDisplay) {
    zoomDisplay.textContent = `${Math.round(currentScale * 100)}%`;
  }
}

/**
 * Update button disabled states based on current values
 */
function updateButtonStates() {
  // Page navigation buttons
  if (prevButton) {
    prevButton.disabled = currentPage <= 1;
  }
  if (nextButton) {
    nextButton.disabled = currentPage >= pageCount;
  }

  // Zoom buttons
  if (zoomOutButton) {
    zoomOutButton.disabled = currentScale <= 0.5;
  }
  if (zoomInButton) {
    zoomInButton.disabled = currentScale >= 3.0;
  }
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clean up renderer before page unload
 */
window.addEventListener('beforeunload', () => {
  if (renderer) {
    console.log('[Vanilla JS Example] Cleaning up renderer');
    renderer.destroy();
    renderer = null;
  }
});
