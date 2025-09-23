// ./layers/DrawingLayer.jsx
import React, { useEffect, useRef } from "react";

function DrawingLayer({ annos, viewport, nowSec }) {
  const canvasRef = useRef(null);
  const rafRef = useRef();

  // Setup canvas dimensions
  useEffect(() => {
    if (!canvasRef.current || !viewport) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(viewport.width * dpr);
    canvas.height = Math.round(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [viewport]);

  // Animate drawing strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport) return;

    const ctx = canvas.getContext("2d");
    let mounted = true;

    const draw = () => {
      if (!mounted) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each annotation
      for (const a of annos) {
        // Skip annotations that haven't started yet
        if (nowSec < a.start) continue;

        // Calculate elapsed time (capped at duration for persistence)
        const duration = a.end - a.start;
        const elapsed = Math.min(nowSec - a.start, duration);

        // Draw each stroke
        for (const stroke of (a.strokes || [])) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = stroke.color || "#1f2937";
          ctx.lineWidth = stroke.size || 3;
          ctx.beginPath();

          let started = false;

          // Draw points up to current time
          for (const point of stroke.points) {
            // Skip points that haven't been drawn yet
            if (point.t > elapsed) break;

            const x = point.x * viewport.width;
            const y = point.y * viewport.height;

            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }

          // Draw the stroke
          if (started) {
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      mounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [annos, viewport, nowSec]);

  if (!viewport) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
}

export default React.memo(DrawingLayer);
