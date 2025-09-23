import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function HighlightInputModal({
  isOpen,
  onClose,
  onSave,
  pdfUrl,
  pageNum = 1,
  scale = 1.5
}) {
  const pdfCanvasRef = useRef(null);
  const selectionCanvasRef = useRef(null);
  const [viewport, setViewport] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selections, setSelections] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [color, setColor] = useState("rgba(255,230,100,0.35)");
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [annotationId, setAnnotationId] = useState(`highlight_${Date.now()}`);

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

        // Setup selection canvas
        if (selectionCanvasRef.current) {
          selectionCanvasRef.current.width = vp.width;
          selectionCanvasRef.current.height = vp.height;
        }
      } catch (error) {
        console.error("Error loading PDF page:", error);
      }
    };

    loadPdfPage();
  }, [isOpen, pdfUrl, pageNum, scale]);

  // Clear selection canvas
  const clearSelectionCanvas = () => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Redraw all selections
  const redrawSelections = () => {
    clearSelectionCanvas();
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    selections.forEach(sel => {
      ctx.fillStyle = color;
      ctx.fillRect(
        sel.x * viewport.width,
        sel.y * viewport.height,
        sel.w * viewport.width,
        sel.h * viewport.height
      );
    });
  };

  // Get normalized coordinates
  const getNormalizedCoords = (e) => {
    const canvas = selectionCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  // Handle selection
  const handleMouseDown = (e) => {
    const coords = getNormalizedCoords(e);
    setIsSelecting(true);
    setStartPoint(coords);
    setCurrentSelection(null);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !startPoint) return;

    const coords = getNormalizedCoords(e);
    const selection = {
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      w: Math.abs(coords.x - startPoint.x),
      h: Math.abs(coords.y - startPoint.y)
    };

    setCurrentSelection(selection);

    // Draw current selection
    const canvas = selectionCanvasRef.current;
    const ctx = canvas.getContext("2d");

    // Redraw all previous selections
    redrawSelections();

    // Draw current selection
    ctx.fillStyle = color;
    ctx.fillRect(
      selection.x * viewport.width,
      selection.y * viewport.height,
      selection.w * viewport.width,
      selection.h * viewport.height
    );
  };

  const handleMouseUp = () => {
    if (!isSelecting || !currentSelection) {
      setIsSelecting(false);
      return;
    }

    // Only add if selection is significant
    if (currentSelection.w > 0.01 && currentSelection.h > 0.005) {
      setSelections([...selections, currentSelection]);
    }

    setIsSelecting(false);
    setCurrentSelection(null);
    setStartPoint(null);
  };

  // Add single line selection
  const addLineSelection = () => {
    const newSelection = {
      x: 0.1,
      y: 0.3 + (selections.length * 0.05),
      w: 0.3,
      h: 0.03
    };
    setSelections([...selections, newSelection]);
  };

  // Clear all selections
  const handleClear = () => {
    setSelections([]);
    clearSelectionCanvas();
  };

  // Save annotation
  const handleSave = () => {
    if (selections.length === 0) {
      alert("먼저 하이라이트할 영역을 선택해주세요!");
      return;
    }

    const annotation = {
      id: annotationId,
      type: "highlight",
      page: pageNum,
      mode: "quads",
      quads: selections.map(sel => ({
        x: sel.x,
        y: sel.y,
        w: sel.w,
        h: sel.h
      })),
      style: { color },
      start: startTime,
      end: startTime + duration
    };

    onSave(annotation);
    handleClose();
  };

  // Close modal
  const handleClose = () => {
    setSelections([]);
    setCurrentSelection(null);
    setIsSelecting(false);
    setStartPoint(null);
    setStartTime(0);
    setDuration(5);
    setAnnotationId(`highlight_${Date.now()}`);
    clearSelectionCanvas();
    onClose();
  };

  useEffect(() => {
    if (selections.length > 0 && viewport) {
      redrawSelections();
    }
  }, [selections, color, viewport]);

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
        <h2 style={{ marginTop: 0 }}>하이라이트 애노테이션 추가</h2>

        {/* Controls */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={addLineSelection}
            style={{
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            + 줄 추가
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

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            색상:
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ padding: "4px" }}
            >
              <option value="rgba(255,230,100,0.35)">노란색</option>
              <option value="rgba(180,255,180,0.35)">초록색</option>
              <option value="rgba(255,180,180,0.35)">빨간색</option>
              <option value="rgba(180,180,255,0.35)">파란색</option>
              <option value="rgba(255,180,255,0.35)">보라색</option>
            </select>
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
            선택된 영역: {selections.length}개
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
          <canvas
            ref={selectionCanvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              cursor: "crosshair"
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
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
            <li>PDF 위에서 드래그하여 하이라이트할 영역을 선택하세요</li>
            <li>여러 영역을 선택할 수 있습니다</li>
            <li>"줄 추가" 버튼으로 기본 줄 단위 선택을 추가할 수 있습니다</li>
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
            disabled={selections.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: selections.length > 0 ? "#3b82f6" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: selections.length > 0 ? "pointer" : "not-allowed"
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default HighlightInputModal;