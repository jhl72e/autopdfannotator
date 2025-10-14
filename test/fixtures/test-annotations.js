/**
 * Test annotation data for validator testing
 */

// Valid annotations (should pass through unchanged)
export const validAnnotations = [
  {
    id: 'hl-1',
    type: 'highlight',
    page: 1,
    start: 0,
    end: 2,
    mode: 'quads',
    quads: [{ x: 0.1, y: 0.2, w: 0.8, h: 0.05 }],
    style: { color: 'rgba(255, 255, 0, 0.3)' }
  },
  {
    id: 'txt-1',
    type: 'text',
    page: 1,
    start: 2,
    end: 5,
    content: 'Test text',
    x: 0.1,
    y: 0.5,
    w: 0.3,
    h: 0.1,
    style: { bg: 'rgba(255, 255, 255, 0.9)', color: '#000000' }
  },
  {
    id: 'ink-1',
    type: 'ink',
    page: 1,
    start: 5,
    end: 8,
    strokes: [{
      color: '#FF0000',
      size: 3,
      points: [
        { t: 0, x: 0.1, y: 0.1 },
        { t: 0.5, x: 0.2, y: 0.2 },
        { t: 1, x: 0.3, y: 0.3 }
      ]
    }]
  }
];

// Invalid annotations (should be normalized with warnings)
export const invalidAnnotations = [
  {
    type: 'text',
    content: 'Missing fields'
    // Missing: id, page, start, end, x, y, w, h, style
  },
  {
    id: 'hl-bad',
    type: 'highlight',
    page: 1,
    start: 0,
    end: 2,
    mode: 'quads',
    quads: [{ x: 5, y: -1, w: 0.8, h: 0.05 }],  // Invalid coordinates
    style: { color: 'notacolor' }  // Invalid color
  },
  {
    id: 'txt-bad',
    type: 'text',
    page: -1,  // Invalid page
    start: 5,
    end: 2,    // End before start
    content: '',  // Empty content
    x: 'abc',  // Invalid coordinate
    y: 0.5,
    w: 0.3,
    h: 0.1,
    style: {}  // Missing colors
  }
];

// Critically invalid (should be skipped)
export const criticallyInvalidAnnotations = [
  { id: 'no-type' },  // Missing type field
  { id: 'bad-type', type: 'underline' },  // Unsupported type
  null,  // Null annotation
  'not an object'  // Not an object
];
