// Sample annotations for react-basic example
// Static annotations (start: 0, end: 0) with no timeline

export const sampleAnnotations = [
  // Highlight annotation on first page
  {
    id: "hl-1",
    type: "highlight",
    page: 1,
    start: 0,
    end: 0,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.15, w: 0.6, h: 0.03 }],
    style: { color: "rgba(255, 255, 0, 0.3)" }
  },

  // Text annotation on first page
  {
    id: "txt-1",
    type: "text",
    page: 1,
    start: 0,
    end: 0,
    x: 0.15,
    y: 0.25,
    w: 0.4,
    h: 0.1,
    content: "Important concept here",
    style: { bg: "rgba(255, 255, 255, 0.95)", color: "#000" }
  },

  // Another highlight on first page
  {
    id: "hl-2",
    type: "highlight",
    page: 1,
    start: 0,
    end: 0,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.4, w: 0.5, h: 0.03 }],
    style: { color: "rgba(100, 255, 100, 0.3)" }
  },

  // Text annotation on second page
  {
    id: "txt-2",
    type: "text",
    page: 2,
    start: 0,
    end: 0,
    x: 0.6,
    y: 0.2,
    w: 0.35,
    h: 0.12,
    content: "Key point to remember",
    style: { bg: "rgba(255, 248, 220, 0.95)", color: "#1f2937" }
  },

  // Highlight on second page
  {
    id: "hl-3",
    type: "highlight",
    page: 2,
    start: 0,
    end: 0,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.5, w: 0.7, h: 0.03 }],
    style: { color: "rgba(255, 165, 0, 0.3)" }
  },

  // Text annotation on third page
  {
    id: "txt-3",
    type: "text",
    page: 3,
    start: 0,
    end: 0,
    x: 0.2,
    y: 0.3,
    w: 0.5,
    h: 0.15,
    content: "Summary and conclusion",
    style: { bg: "rgba(173, 216, 230, 0.95)", color: "#000" }
  },

  // Final highlight on third page
  {
    id: "hl-4",
    type: "highlight",
    page: 3,
    start: 0,
    end: 0,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.6, w: 0.6, h: 0.03 }],
    style: { color: "rgba(255, 192, 203, 0.3)" }
  }
];
