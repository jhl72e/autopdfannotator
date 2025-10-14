/**
 * Framework Adapters
 *
 * This module exports framework-specific adapter components that wrap
 * the core AnnotationRenderer engine with declarative APIs.
 *
 * Each adapter provides a framework-native, declarative interface to the
 * imperative AnnotationRenderer API, handling lifecycle management and
 * prop synchronization automatically.
 *
 * @module adapters
 */

// ============================================================================
// React Adapter
// ============================================================================

/**
 * React component for declarative PDF annotation rendering
 * Wraps AnnotationRenderer with React hooks and props-based API
 */
export { default as AnnotPdf } from './AnnotPdf.jsx';

// ============================================================================
// Future Adapters (Placeholders)
// ============================================================================

// Vue 3 Composition API adapter (future implementation)
// export { default as VuePdfViewer } from './VuePdfViewer.vue';

// Svelte adapter (future implementation)
// export { default as SveltePdfViewer } from './SveltePdfViewer.svelte';

// Angular adapter (future implementation)
// export { default as AngularPdfViewer } from './AngularPdfViewer';

// Web Component adapter (future implementation)
// export { default as PdfViewerElement } from './PdfViewerElement.js';
