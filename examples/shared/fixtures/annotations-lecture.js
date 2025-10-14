// Lecture annotations for react-audio-sync example
// Timed annotations synchronized with audio narration (30-60 seconds)

export const lectureAnnotations = [
  // 0-5s: Opening highlight on page 1
  {
    id: "lec-hl-1",
    type: "highlight",
    page: 1,
    start: 0,
    end: 5,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.15, w: 0.5, h: 0.03 }],
    style: { color: "rgba(255, 255, 0, 0.3)" }
  },

  // 5-10s: Explanation text box on page 1
  {
    id: "lec-txt-1",
    type: "text",
    page: 1,
    start: 5,
    end: 10,
    x: 0.6,
    y: 0.2,
    w: 0.35,
    h: 0.15,
    content: "Key concept: Introduction",
    style: { bg: "rgba(255, 255, 255, 0.95)", color: "#1f2937" }
  },

  // 10-15s: Secondary highlight on page 1
  {
    id: "lec-hl-2",
    type: "highlight",
    page: 1,
    start: 10,
    end: 15,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.4, w: 0.6, h: 0.03 }],
    style: { color: "rgba(100, 255, 100, 0.3)" }
  },

  // 15-20s: Highlight on page 2
  {
    id: "lec-hl-3",
    type: "highlight",
    page: 2,
    start: 15,
    end: 20,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.2, w: 0.5, h: 0.03 }],
    style: { color: "rgba(255, 165, 0, 0.3)" }
  },

  // 18-23s: Text box on page 2 (overlaps with previous)
  {
    id: "lec-txt-2",
    type: "text",
    page: 2,
    start: 18,
    end: 23,
    x: 0.15,
    y: 0.35,
    w: 0.4,
    h: 0.12,
    content: "Important detail to remember",
    style: { bg: "rgba(255, 248, 220, 0.95)", color: "#1f2937" }
  },

  // 23-28s: Another highlight on page 2
  {
    id: "lec-hl-4",
    type: "highlight",
    page: 2,
    start: 23,
    end: 28,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.5, w: 0.7, h: 0.03 }],
    style: { color: "rgba(255, 192, 203, 0.3)" }
  },

  // 28-33s: Highlight on page 3
  {
    id: "lec-hl-5",
    type: "highlight",
    page: 3,
    start: 28,
    end: 33,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.2, w: 0.55, h: 0.03 }],
    style: { color: "rgba(173, 216, 230, 0.3)" }
  },

  // 30-35s: Text box on page 3
  {
    id: "lec-txt-3",
    type: "text",
    page: 3,
    start: 30,
    end: 35,
    x: 0.6,
    y: 0.25,
    w: 0.35,
    h: 0.12,
    content: "Critical point",
    style: { bg: "rgba(255, 255, 255, 0.95)", color: "#dc2626" }
  },

  // 35-40s: Another highlight on page 3
  {
    id: "lec-hl-6",
    type: "highlight",
    page: 3,
    start: 35,
    end: 40,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.45, w: 0.6, h: 0.03 }],
    style: { color: "rgba(255, 230, 100, 0.35)" }
  },

  // 40-45s: Text on page 3
  {
    id: "lec-txt-4",
    type: "text",
    page: 3,
    start: 40,
    end: 45,
    x: 0.2,
    y: 0.6,
    w: 0.5,
    h: 0.1,
    content: "Remember this for later",
    style: { bg: "rgba(220, 252, 231, 0.95)", color: "#166534" }
  },

  // 45-50s: Highlight back on page 1 (if they navigate)
  {
    id: "lec-hl-7",
    type: "highlight",
    page: 1,
    start: 45,
    end: 50,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.6, w: 0.65, h: 0.03 }],
    style: { color: "rgba(200, 180, 255, 0.3)" }
  },

  // 48-53s: Final text box on page 1
  {
    id: "lec-txt-5",
    type: "text",
    page: 1,
    start: 48,
    end: 53,
    x: 0.15,
    y: 0.75,
    w: 0.4,
    h: 0.1,
    content: "Conclusion",
    style: { bg: "rgba(254, 249, 195, 0.95)", color: "#854d0e" }
  },

  // 50-55s: Final highlight on page 2
  {
    id: "lec-hl-8",
    type: "highlight",
    page: 2,
    start: 50,
    end: 55,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.7, w: 0.5, h: 0.03 }],
    style: { color: "rgba(147, 197, 253, 0.3)" }
  },

  // 53-58s: Summary text on page 3
  {
    id: "lec-txt-6",
    type: "text",
    page: 3,
    start: 53,
    end: 58,
    x: 0.2,
    y: 0.75,
    w: 0.6,
    h: 0.12,
    content: "Summary: Review all key points",
    style: { bg: "rgba(255, 255, 255, 0.95)", color: "#1f2937" }
  },

  // 55-60s: Final highlight on page 3
  {
    id: "lec-hl-9",
    type: "highlight",
    page: 3,
    start: 55,
    end: 60,
    mode: "quads",
    quads: [{ x: 0.1, y: 0.85, w: 0.7, h: 0.03 }],
    style: { color: "rgba(255, 100, 100, 0.3)" }
  }
];
