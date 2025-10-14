/**
 * @ai-annotator/renderer - Public API
 *
 * Single entry point for the Dynamic PDF Annotation Renderer library.
 * Exports all core subsystems, layers, utilities, and types.
 *
 * @module @ai-annotator/renderer
 */

// ============================================================================
// Core Rendering Engine
// ============================================================================

// Import statements
import { AnnotationRenderer } from './core/AnnotationRenderer.js';
import { PDFRenderer } from './core/PDFRenderer.js';
import { LayerManager } from './core/LayerManager.js';
import { TimelineSync } from './core/TimelineSync.js';

// Export statements
export { AnnotationRenderer };
export { PDFRenderer };
export { LayerManager };
export { TimelineSync };

// ============================================================================
// Annotation Layers
// ============================================================================

// Framework-agnostic layer classes
// BaseLayer: Abstract base class for creating custom layers
// HighlightLayer, TextLayer, DrawingLayer: Built-in layer implementations

import BaseLayer from './layers/BaseLayer.js';
import HighlightLayer from './layers/HighlightLayer.js';
import TextLayer from './layers/TextLayer.js';
import DrawingLayer from './layers/DrawingLayer.js';

export { BaseLayer };
export { HighlightLayer };
export { TextLayer };
export { DrawingLayer };

// ============================================================================
// Utilities
// ============================================================================

import * as coordinateUtils from './utils/coordinateUtils.js';
import * as viewportUtils from './utils/viewportUtils.js';

export { coordinateUtils };
export { viewportUtils };

// Future: colorUtils, validators
// import * as colorUtils from './utils/colorUtils.js';
// export { colorUtils };

// ============================================================================
// Type Definitions & Validators
// ============================================================================

// Type definitions in src/types/annotations.js

/**
 * Type Validators - Optional data normalization
 *
 * Import separately to use defensive normalization for annotation data.
 * These validators are standalone utilities that do not modify the core system.
 */
export { normalizeAnnotationArray } from './types/validators.js';

// Namespace export for all validator utilities
export * as TypeValidators from './types/index.js';

// ============================================================================
// Framework Adapters
// ============================================================================
// Declarative framework-specific wrappers for AnnotationRenderer
// These provide idiomatic APIs for React, Vue, and other frameworks

/**
 * React adapter component for declarative PDF annotation rendering
 * @see {@link AnnotPdf}
 */
export { AnnotPdf } from './adapters/index.js';

// Future framework adapters will be exported here:
// export { VuePdfViewer } from './adapters/index.js';
// export { SveltePdfViewer } from './adapters/index.js';

// ============================================================================
// Package Metadata
// ============================================================================

/**
 * Library version
 * @constant {string}
 */
export const VERSION = '0.1.0';

/**
 * Library name
 * @constant {string}
 */
export const LIB_NAME = '@ai-annotator/renderer';
