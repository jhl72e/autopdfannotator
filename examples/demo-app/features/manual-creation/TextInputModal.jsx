import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function TextInputModal({
  isOpen,
  onClose,
  onSave,
  pdfUrl,
  pageNum = 1,
  scale = 1.5
}) {
  const pdfCanvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [viewport, setViewport] = useState(null);
  const [textAnnotations, setTextAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Default values for new annotation
  const [newText, setNewText] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("rgba(255,255,255,0.9)");
  const [textColor, setTextColor] = useState("#1f2937");
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);

  // Load PDF page
  useEffect(() => {
    if (!isOpen || !pdfCanvasRef.current) return;

    const loadPdfPage = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(pageNum);
        const canvas = pdfCanvasRef.current;
        const context = canvas.getContext("2d");

        const vp = page.getViewport({ scale });
        setViewport(vp);

        canvas.width = vp.width;
        canvas.height = vp.height;

        await page.render({
          canvasContext: context,
          viewport: vp
        }).promise;
      } catch (error) {
        console.error("Error loading PDF page:", error);
      }
    };

    loadPdfPage();
  }, [isOpen, pdfUrl, pageNum, scale]);

  // Add new text annotation
  const addTextAnnotation = () => {
    if (!newText.trim()) {
      alert("텍스트를 입력해주세요!");
      return;
    }

    const newAnnotation = {
      id: `text_${Date.now()}`,
      content: newText,
      x: 0.1 + (textAnnotations.length * 0.05), // Offset each new annotation
      y: 0.1 + (textAnnotations.length * 0.05),
      w: 0.25,
      h: 0.1,
      style: {
        bg: backgroundColor,
        color: textColor
      },
      start: startTime,
      end: startTime + duration
    };

    setTextAnnotations([...textAnnotations, newAnnotation]);
    setNewText("");
  };

  // Delete annotation
  const deleteAnnotation = (id) => {
    setTextAnnotations(textAnnotations.filter(a => a.id !== id));
    setSelectedAnnotation(null);
  };

  // Get normalized coordinates
  const getNormalizedCoords = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  // Handle annotation dragging
  const handleMouseDown = (e, annotation) => {
    e.preventDefault();
    e.stopPropagation();

    const coords = getNormalizedCoords(e);
    setSelectedAnnotation(annotation);
    setIsDragging(true);
    setDragOffset({
      x: coords.x - annotation.x,
      y: coords.y - annotation.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedAnnotation) return;

    const coords = getNormalizedCoords(e);
    const updatedAnnotations = textAnnotations.map(a => {
      if (a.id === selectedAnnotation.id) {
        return {
          ...a,
          x: Math.max(0, Math.min(1 - a.w, coords.x - dragOffset.x)),
          y: Math.max(0, Math.min(1 - a.h, coords.y - dragOffset.y))
        };
      }
      return a;
    });

    setTextAnnotations(updatedAnnotations);
    setSelectedAnnotation({
      ...selectedAnnotation,
      x: Math.max(0, Math.min(1 - selectedAnnotation.w, coords.x - dragOffset.x)),
      y: Math.max(0, Math.min(1 - selectedAnnotation.h, coords.y - dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle resize
  const handleResize = (annotation, direction, delta) => {
    const updatedAnnotations = textAnnotations.map(a => {
      if (a.id === annotation.id) {
        const newAnnotation = { ...a };

        switch (direction) {
          case 'width':
            newAnnotation.w = Math.max(0.05, Math.min(1 - a.x, a.w + delta));
            break;
          case 'height':
            newAnnotation.h = Math.max(0.03, Math.min(1 - a.y, a.h + delta));
            break;
        }

        return newAnnotation;
      }
      return a;
    });

    setTextAnnotations(updatedAnnotations);
  };

  // Update annotation content
  const updateAnnotationContent = (id, newContent) => {
    const updatedAnnotations = textAnnotations.map(a => {
      if (a.id === id) {
        return { ...a, content: newContent };
      }
      return a;
    });
    setTextAnnotations(updatedAnnotations);
  };

  // Clear all annotations
  const handleClear = () => {
    setTextAnnotations([]);
    setSelectedAnnotation(null);
  };

  // Save annotations
  const handleSave = () => {
    if (textAnnotations.length === 0) {
      alert("먼저 텍스트 애노테이션을 추가해주세요!");
      return;
    }

    textAnnotations.forEach(annotation => {
      const finalAnnotation = {
        ...annotation,
        type: "text",
        page: pageNum
      };
      onSave(finalAnnotation);
    });

    handleClose();
  };

  // Close modal
  const handleClose = () => {
    setTextAnnotations([]);
    setSelectedAnnotation(null);
    setNewText("");
    setStartTime(0);
    setDuration(5);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        width: "90%",
        maxWidth: "900px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column"
      }}>
        <h2 style={{ marginTop: 0 }}>텍스트 애노테이션 추가</h2>

        {/* Controls */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="텍스트 입력..."
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              flex: "1",
              minWidth: "200px"
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTextAnnotation();
              }
            }}
          />

          <button
            onClick={addTextAnnotation}
            style={{
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            + 텍스트 추가
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            모두 지우기
          </button>
        </div>

        {/* Style Controls */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            배경색:
            <select
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              style={{ padding: "4px" }}
            >
              <option value="rgba(255,255,255,0.9)">흰색</option>
              <option value="rgba(255,255,200,0.9)">노란색</option>
              <option value="rgba(200,255,200,0.9)">초록색</option>
              <option value="rgba(200,200,255,0.9)">파란색</option>
              <option value="rgba(255,200,200,0.9)">빨간색</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            글자색:
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            시작 시간(초):
            <input
              type="number"
              min="0"
              step="0.1"
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              style={{ width: "60px" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            지속 시간(초):
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "60px" }}
            />
          </label>

          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            추가된 텍스트: {textAnnotations.length}개
          </span>
        </div>

        {/* Canvas Container */}
        <div style={{
          position: "relative",
          flex: 1,
          overflow: "auto",
          border: "1px solid #ccc",
          borderRadius: "4px"
        }}>
          <canvas
            ref={pdfCanvasRef}
            style={{
              display: "block"
            }}
          />

          {/* Overlay for text annotations */}
          <div
            ref={overlayRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: viewport?.width || 0,
              height: viewport?.height || 0,
              cursor: isDragging ? "move" : "default"
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {viewport && textAnnotations.map(annotation => (
              <div
                key={annotation.id}
                style={{
                  position: "absolute",
                  left: annotation.x * viewport.width,
                  top: annotation.y * viewport.height,
                  width: annotation.w * viewport.width,
                  height: annotation.h * viewport.height,
                  backgroundColor: annotation.style.bg,
                  color: annotation.style.color,
                  padding: "8px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  cursor: "move",
                  border: selectedAnnotation?.id === annotation.id ? "2px solid #3b82f6" : "1px solid #ccc",
                  overflow: "hidden",
                  wordWrap: "break-word"
                }}
                onMouseDown={(e) => handleMouseDown(e, annotation)}
              >
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "100%"
                }}>
                  <textarea
                    value={annotation.content}
                    onChange={(e) => updateAnnotationContent(annotation.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      resize: "none",
                      color: "inherit",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      padding: 0,
                      outline: "none"
                    }}
                  />

                  {selectedAnnotation?.id === annotation.id && (
                    <>
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnnotation(annotation.id);
                        }}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ×
                      </button>

                      {/* Resize handles */}
                      <div
                        style={{
                          position: "absolute",
                          right: "-4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "8px",
                          height: "30px",
                          backgroundColor: "#3b82f6",
                          cursor: "ew-resize",
                          borderRadius: "2px"
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startX = e.clientX;
                          const startWidth = annotation.w;

                          const handleDrag = (e) => {
                            const delta = (e.clientX - startX) / viewport.width;
                            handleResize(annotation, 'width', delta);
                          };

                          const handleUp = () => {
                            document.removeEventListener('mousemove', handleDrag);
                            document.removeEventListener('mouseup', handleUp);
                          };

                          document.addEventListener('mousemove', handleDrag);
                          document.addEventListener('mouseup', handleUp);
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          bottom: "-4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "30px",
                          height: "8px",
                          backgroundColor: "#3b82f6",
                          cursor: "ns-resize",
                          borderRadius: "2px"
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const startY = e.clientY;

                          const handleDrag = (e) => {
                            const delta = (e.clientY - startY) / viewport.height;
                            handleResize(annotation, 'height', delta);
                          };

                          const handleUp = () => {
                            document.removeEventListener('mousemove', handleDrag);
                            document.removeEventListener('mouseup', handleUp);
                          };

                          document.addEventListener('mousemove', handleDrag);
                          document.addEventListener('mouseup', handleUp);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: "10px",
          padding: "10px",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          <strong>사용 방법:</strong>
          <ol style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li>텍스트를 입력하고 "텍스트 추가" 버튼을 클릭하세요</li>
            <li>추가된 텍스트 박스를 드래그하여 위치를 조정할 수 있습니다</li>
            <li>텍스트 박스를 선택하면 크기 조절 핸들이 나타납니다</li>
            <li>텍스트를 클릭하여 내용을 수정할 수 있습니다</li>
            <li>시작 시간과 지속 시간을 설정하세요</li>
            <li>"저장" 버튼을 클릭하여 애노테이션을 추가하세요</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "15px"
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={textAnnotations.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: textAnnotations.length > 0 ? "#3b82f6" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: textAnnotations.length > 0 ? "pointer" : "not-allowed"
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextInputModal;