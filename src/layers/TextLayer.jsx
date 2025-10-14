// ./layers/TextLayer.jsx
import React, { useMemo } from "react";
import { rectNormToAbs } from "../utils/coordinateUtils";

/**
 * @typedef {import('../types/annotations').TextAnnotation} TextAnnotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */

/**
 * Text Layer Component
 *
 * Renders text box annotations with progressive text reveal animation.
 * Displays text word by word based on timeline progression.
 *
 * @param {Object} props - Component props
 * @param {TextAnnotation[]} props.annos - Text annotations for current page
 * @param {Viewport} props.viewport - PDF viewport dimensions
 * @param {number} props.nowSec - Current timeline position in seconds
 * @returns {JSX.Element}
 */
function TextLayer({ annos, viewport, nowSec }) {
  const visibleAnnotations = useMemo(() => {
    if (!annos || !viewport) return [];

    return annos.filter(a => {
      // 시간 기반 가시성 체크 - 시작 시간 이후면 계속 표시
      return nowSec >= a.start;
    });
  }, [annos, viewport, nowSec]);

  // Function to calculate visible text based on progress
  const getVisibleText = (content, start, end, currentTime) => {
    if (currentTime < start) return "";
    if (currentTime >= end) return content;

    const progress = (currentTime - start) / (end - start);
    const words = content.split(' ');
    const visibleWordCount = Math.floor(progress * words.length);

    if (visibleWordCount === 0) return "";

    // Show words up to visibleWordCount and partial of the current word
    const visibleWords = words.slice(0, visibleWordCount);

    // Add partial of the next word if not at the end
    if (visibleWordCount < words.length) {
      const currentWordProgress = (progress * words.length) - visibleWordCount;
      const currentWord = words[visibleWordCount];
      const visibleCharCount = Math.floor(currentWordProgress * currentWord.length);

      if (visibleCharCount > 0) {
        visibleWords.push(currentWord.slice(0, visibleCharCount));
      }
    }

    return visibleWords.join(' ');
  };

  if (!viewport || visibleAnnotations.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {visibleAnnotations.map((a) => {
        const abs = rectNormToAbs(a, viewport);
        const visibleText = getVisibleText(a.content, a.start, a.end, nowSec);
        const fadeInProgress = Math.min(1, (nowSec - a.start) / 0.2); // 0.2초 동안 페이드인

        return (
          <div
            key={a.id}
            style={{
              position: "absolute",
              left: abs.left,
              top: abs.top,
              width: abs.width,
              height: abs.height,
              backgroundColor: a.style?.bg || "rgba(255,255,255,0.9)",
              borderRadius: "4px",
              padding: "8px",
              fontSize: "14px",
              lineHeight: "1.4",
              opacity: fadeInProgress,
              transition: "opacity 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              overflow: "hidden",
              wordWrap: "break-word",
              color: a.style?.color || "#1f2937",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {visibleText}
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(TextLayer);
