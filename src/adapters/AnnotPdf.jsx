// ============================================================================
// SECTION 1: IMPORTS
// ============================================================================

import { useRef, useEffect } from 'react';
import { AnnotationRenderer } from '../core/AnnotationRenderer.js';

// ============================================================================
// SECTION 2: JSDOC DOCUMENTATION
// ============================================================================

/**
 * AnnotPdf - Declarative React component for PDF annotation rendering
 *
 * A React wrapper around the AnnotationRenderer core engine that provides
 * a declarative, props-based API for rendering PDF documents with
 * timeline-synchronized annotations.
 *
 * Features:
 * - Automatic lifecycle management (initialization and cleanup)
 * - Declarative prop-to-method synchronization
 * - PDF rendering with pdf.js
 * - Timeline-synchronized annotation display
 * - Support for highlight, text, and ink annotations
 * - Page navigation and zoom control
 *
 * @component
 * @example
 * // Basic usage
 * <AnnotPdf
 *   pdfUrl="/document.pdf"
 *   page={1}
 *   scale={1.5}
 *   annotations={[]}
 *   currentTime={0}
 * />
 *
 * @example
 * // With audio synchronization
 * const [currentTime, setCurrentTime] = useState(0);
 *
 * <div>
 *   <AnnotPdf
 *     pdfUrl="/lecture.pdf"
 *     page={1}
 *     scale={1.5}
 *     annotations={annotations}
 *     currentTime={currentTime}
 *     onLoad={({ pageCount }) => console.log('Loaded:', pageCount)}
 *   />
 *   <audio
 *     src="/lecture.mp3"
 *     onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
 *     controls
 *   />
 * </div>
 *
 * @param {Object} props - Component props
 * @param {string} props.pdfUrl - PDF document URL (required)
 * @param {number} [props.page=1] - Current page number (1-indexed)
 * @param {number} [props.scale=1.5] - Zoom scale factor
 * @param {Array} [props.annotations=[]] - Array of annotation objects
 * @param {number} [props.currentTime=0] - Timeline position in seconds
 * @param {Function} [props.onLoad] - Callback when PDF loads: ({pageCount}) => void
 * @param {Function} [props.onError] - Callback on error: (error) => void
 * @param {Function} [props.onPageChange] - Callback when page changes: (page) => void
 * @param {string} [props.className] - CSS class for container div
 * @param {Object} [props.style] - Inline styles for container div
 * @param {Object} [props.canvasStyle] - Inline styles for canvas element
 * @returns {JSX.Element} PDF viewer component with annotation layers
 */

// ============================================================================
// SECTION 3: COMPONENT DEFINITION
// ============================================================================

function AnnotPdf({
  // Required props
  pdfUrl,

  // Optional props with defaults
  page = 1,
  scale = 1.5,
  annotations = [],
  currentTime = 0,

  // Callbacks
  onLoad,
  onError,
  onPageChange,

  // Styling
  className,
  style,
  canvasStyle
}) {

  // ==========================================================================
  // SECTION 4: REFS INITIALIZATION
  // ==========================================================================

  /**
   * Reference to the canvas element for PDF rendering
   * @type {React.RefObject<HTMLCanvasElement>}
   */
  const canvasRef = useRef(null);

  /**
   * Reference to the layer container div for annotation layers
   * @type {React.RefObject<HTMLDivElement>}
   */
  const layerContainerRef = useRef(null);

  /**
   * Reference to the AnnotationRenderer engine instance
   * Stored in ref to avoid triggering re-renders
   * @type {React.RefObject<AnnotationRenderer|null>}
   */
  const engineRef = useRef(null);

  // ==========================================================================
  // SECTION 5: ENGINE INITIALIZATION AND CLEANUP
  // ==========================================================================

  /**
   * Initialize AnnotationRenderer on component mount
   * Cleanup on component unmount
   */
  useEffect(() => {
    // Guard: Wait for DOM elements to be ready
    if (!canvasRef.current || !layerContainerRef.current) {
      return;
    }

    // Initialize engine
    try {
      engineRef.current = new AnnotationRenderer({
        canvasElement: canvasRef.current,
        container: layerContainerRef.current
      });
    } catch (error) {
      console.error('AnnotPdf: Failed to initialize renderer:', error);
      if (onError) {
        onError(error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []); // Empty deps - run once on mount

  // ==========================================================================
  // SECTION 6: PDF LOADING SYNCHRONIZATION
  // ==========================================================================

  /**
   * Load PDF document when pdfUrl prop changes
   * Handles async operation with cancellation support
   */
  useEffect(() => {
    // Guard: Engine must exist and pdfUrl must be valid
    if (!engineRef.current || !pdfUrl) {
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const result = await engineRef.current.loadPDF(pdfUrl);

        // Check if component unmounted during async operation
        if (cancelled) return;

        // Check if load was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to load PDF:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
          return;
        }

        // Call onLoad callback with pageCount from result
        if (onLoad) {
          onLoad({ pageCount: result.pageCount });
        }
      } catch (error) {
        if (cancelled) return;

        console.error('AnnotPdf: Failed to load PDF:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    loadPdf();

    // Cleanup: Prevent state updates if component unmounts during load
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, onLoad, onError]);

  // ==========================================================================
  // SECTION 7: PAGE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync page prop to engine.setPage() method
   */
  useEffect(() => {
    // Guard: Engine must exist and page must be valid
    if (!engineRef.current || !page || typeof page !== 'number') {
      return;
    }

    // Sync page to engine
    engineRef.current.setPage(page)
      .then((result) => {
        // Check if page change was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to set page:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
          return;
        }

        // Optional: Notify parent of successful page change
        if (onPageChange) {
          onPageChange(page);
        }
      })
      .catch((error) => {
        console.error('AnnotPdf: Failed to set page:', error);
        if (onError) {
          onError(error);
        }
      });
  }, [page, onPageChange, onError]);

  // ==========================================================================
  // SECTION 8: SCALE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync scale prop to engine.setScale() method
   */
  useEffect(() => {
    // Guard: Engine must exist and scale must be valid
    if (!engineRef.current || !scale || typeof scale !== 'number') {
      return;
    }

    // Sync scale to engine (async method)
    engineRef.current.setScale(scale)
      .then((result) => {
        // Check if scale change was successful
        if (!result.success) {
          console.error('AnnotPdf: Failed to set scale:', result.error);
          if (onError) {
            onError(new Error(result.error));
          }
        }
      })
      .catch((error) => {
        console.error('AnnotPdf: Failed to set scale:', error);
        if (onError) {
          onError(error);
        }
      });
  }, [scale, onError]);

  // ==========================================================================
  // SECTION 9: ANNOTATIONS SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync annotations prop to engine.setAnnotations() method
   */
  useEffect(() => {
    // Guard: Engine must exist
    if (!engineRef.current) {
      return;
    }

    // Sync annotations to engine (default to empty array)
    try {
      engineRef.current.setAnnotations(annotations || []);
    } catch (error) {
      console.error('AnnotPdf: Failed to set annotations:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [annotations, onError]);

  // ==========================================================================
  // SECTION 10: TIMELINE SYNCHRONIZATION
  // ==========================================================================

  /**
   * Sync currentTime prop to engine.setTime() method
   */
  useEffect(() => {
    // Guard: Engine must exist and currentTime must be defined
    if (!engineRef.current || currentTime === undefined || currentTime === null) {
      return;
    }

    // Sync timeline to engine
    try {
      engineRef.current.setTime(currentTime);
    } catch (error) {
      console.error('AnnotPdf: Failed to set time:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [currentTime, onError]);

  // ==========================================================================
  // SECTION 11: STYLING DEFINITIONS
  // ==========================================================================

  /**
   * Default container styles
   * Merged with user-provided styles (user styles override defaults)
   */
  const defaultContainerStyle = {
    position: 'relative',
    display: 'inline-block',
    lineHeight: 0, // Remove extra space below canvas
    ...style // User styles override defaults
  };

  /**
   * Default layer container styles
   * Positions layer div absolutely over canvas
   */
  const defaultLayerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allow clicks to pass through to canvas
    overflow: 'hidden'
  };

  /**
   * Default canvas styles
   * Merged with user-provided canvasStyle
   */
  const defaultCanvasStyle = {
    display: 'block',
    ...canvasStyle // User styles override defaults
  };

  // ==========================================================================
  // SECTION 12: JSX RETURN
  // ==========================================================================

  return (
    <div className={className} style={defaultContainerStyle}>
      <canvas ref={canvasRef} style={defaultCanvasStyle} />
      <div ref={layerContainerRef} style={defaultLayerStyle} />
    </div>
  );
}

// ============================================================================
// SECTION 13: EXPORT
// ============================================================================

export default AnnotPdf;
