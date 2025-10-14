// ./layers/HighlightLayer.jsx
import React, { useEffect, useRef } from "react";
import { rectNormToAbs } from "../utils/coordinateUtils";

/**
 * @typedef {import('../types/annotations').HighlightAnnotation} HighlightAnnotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */

/**
 * Highlight Layer Component
 *
 * Renders highlight annotations with progressive reveal animation.
 * Uses scaleX transform to animate from left to right based on timeline.
 *
 * @param {Object} props - Component props
 * @param {HighlightAnnotation[]} props.annos - Highlight annotations for current page
 * @param {Viewport} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position in seconds
 * @returns {JSX.Element}
 */
function HighlightLayer({ annos, viewport, nowSec }) {
  const containerRef = useRef(null);
  const rafRef = useRef();
  const elementsRef = useRef(new Map());

  // Create DOM elements when annotations or viewport change
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing elements
    container.innerHTML = '';
    elementsRef.current.clear();

    annos.forEach((a) => {
      if (a.mode !== "quads" || !a.quads?.length) return;

      const totalW = a.quads.reduce((s, q) => s + q.w, 0);

      a.quads.forEach((q, idx) => {
        const abs = rectNormToAbs(q, viewport);
        const prevW = a.quads.slice(0, idx).reduce((s, qq) => s + qq.w, 0);
        const segStart = prevW / totalW;
        const segEnd = (prevW + q.w) / totalW;

        // Create wrapper div
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = `${abs.left}px`;
        wrapper.style.top = `${abs.top}px`;
        wrapper.style.width = `${abs.width}px`;
        wrapper.style.height = `${abs.height}px`;
        wrapper.style.overflow = 'hidden';
        wrapper.style.borderRadius = '2px';

        // Create highlight div
        const highlight = document.createElement('div');
        highlight.style.width = '100%';
        highlight.style.height = '100%';
        highlight.style.background = a?.style?.color ?? 'rgba(255,230,100,0.35)';
        highlight.style.outline = '1px solid rgba(255,200,0,0.6)';
        highlight.style.transformOrigin = 'left center';
        highlight.style.transform = 'scaleX(0)';
        highlight.style.willChange = 'transform';

        wrapper.appendChild(highlight);
        container.appendChild(wrapper);

        // Store reference for animation
        const key = `${a.id}-${idx}`;
        elementsRef.current.set(key, {
          element: highlight,
          wrapper: wrapper,
          annotation: a,
          segStart,
          segEnd
        });
      });
    });
  }, [annos, viewport]);

  // Animate highlights based on nowSec
  useEffect(() => {
    let mounted = true;

    const animate = () => {
      if (!mounted) return;

      elementsRef.current.forEach(({ element, wrapper, annotation, segStart, segEnd }) => {
        // Hide wrapper if time hasn't reached start
        if (nowSec < annotation.start) {
          wrapper.style.display = 'none';
        } else {
          wrapper.style.display = 'block';

          // Calculate progress (clamped to 1 after end time)
          const p = Math.max(
            0,
            Math.min(1, (nowSec - annotation.start) / Math.max(1e-6, annotation.end - annotation.start))
          );

          const lp = Math.max(
            0,
            Math.min(1, (p - segStart) / Math.max(1e-6, segEnd - segStart))
          );

          element.style.transform = `scaleX(${lp})`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [nowSec]);  // Remove annos and viewport from deps

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 25,
      }}
    />
  );
}

export default React.memo(HighlightLayer);
