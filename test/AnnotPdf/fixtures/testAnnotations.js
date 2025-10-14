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
