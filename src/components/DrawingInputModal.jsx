import React, { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function DrawingInputModal({
  isOpen,
  onClose,
  onSave,
  pdfUrl,
  pageNum = 1,
  scale = 1.5
}) {
  const canvasRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(10); // Default 10 seconds
  const [annotationId, setAnnotationId] = useState(`drawing_${Date.now()}`);
  const [viewport, setViewport] = useState(null);
  const [color, setColor] = useState("#ef4444");
  const [strokeSize, setStrokeSize] = useState(3);
  const [annotationStartTime, setAnnotationStartTime] = useState(0);

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

        // Setup drawing canvas
        if (canvasRef.current) {
          canvasRef.current.width = vp.width;
          canvasRef.current.height = vp.height;
        }
      } catch (error) {
        console.error("Error loading PDF page:", error);
      }
    };

    loadPdfPage();
  }, [isOpen, pdfUrl, pageNum, scale]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Redraw all strokes
  const redrawStrokes = useCallback(() => {
    clearCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    strokes.forEach(stroke => {
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      stroke.points.forEach((point, idx) => {
        if (idx === 0) {
          ctx.moveTo(point.x * viewport.width, point.y * viewport.height);
        } else {
          ctx.lineTo(point.x * viewport.width, point.y * viewport.height);
        }
      });

      ctx.stroke();
    });
  }, [strokes, viewport, clearCanvas]);

  // Get normalized coordinates
  const getNormalizedCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  // Handle drawing
  const handleMouseDown = (e) => {
    if (!isRecording) return;

    setIsDrawing(true);
    const coords = getNormalizedCoords(e);
    const currentTime = (Date.now() - startTime) / 1000;

    const newStroke = {
      color,
      size: strokeSize,
      points: [{ ...coords, t: currentTime }]
    };

    setCurrentStroke(newStroke);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentStroke || !isRecording) return;

    const coords = getNormalizedCoords(e);
    const currentTime = (Date.now() - startTime) / 1000;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, { ...coords, t: currentTime }]
    };

    setCurrentStroke(updatedStroke);

    // Draw current stroke
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const lastPoint = currentStroke.points[currentStroke.points.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastPoint.x * viewport.width, lastPoint.y * viewport.height);
    ctx.lineTo(coords.x * viewport.width, coords.y * viewport.height);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    setStrokes([...strokes, currentStroke]);
    setCurrentStroke(null);
  };

  // Start recording
  const startRecording = () => {
    setIsRecording(true);
    setStartTime(Date.now());
    setStrokes([]);
    clearCanvas();
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    const actualDuration = startTime ? (Date.now() - startTime) / 1000 : duration;
    setDuration(actualDuration);
  };

  // Save annotation
  const handleSave = () => {
    if (strokes.length === 0) {
      alert("먼저 그림을 그려주세요!");
      return;
    }

    const annotation = {
      id: annotationId,
      type: "ink",
      page: pageNum,
      strokes: strokes,
      start: annotationStartTime,
      end: annotationStartTime + duration
    };

    onSave(annotation);
    handleClose();
  };

  // Close modal
  const handleClose = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setIsRecording(false);
    setIsDrawing(false);
    setAnnotationStartTime(0);
    setAnnotationId(`drawing_${Date.now()}`);
    clearCanvas();
    onClose();
  };

  // Clear all drawings
  const handleClear = () => {
    setStrokes([]);
    clearCanvas();
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
        <h2 style={{ marginTop: 0 }}>그림 애노테이션 추가</h2>

        {/* Controls */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: "8px 16px",
              backgroundColor: isRecording ? "#ef4444" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {isRecording ? "⏹ 녹화 중지" : "⏺ 녹화 시작"}
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
            지우기
          </button>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            색상:
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isRecording}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            굵기:
            <input
              type="range"
              min="1"
              max="10"
              value={strokeSize}
              onChange={(e) => setStrokeSize(Number(e.target.value))}
              disabled={isRecording}
            />
            {strokeSize}px
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            시작 시간(초):
            <input
              type="number"
              min="0"
              step="0.1"
              value={annotationStartTime}
              style={{ width: "60px" }}
              onChange={(e) => setAnnotationStartTime(Number(e.target.value))}
            />
          </label>

          {isRecording && (
            <span style={{ color: "#ef4444", fontWeight: "bold" }}>
              ⏱ {((Date.now() - startTime) / 1000).toFixed(1)}초
            </span>
          )}
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
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              cursor: isRecording ? "crosshair" : "default",
              pointerEvents: isRecording ? "auto" : "none"
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
            <li>색상과 굵기를 선택하세요</li>
            <li>"녹화 시작" 버튼을 클릭하세요</li>
            <li>PDF 위에 그림을 그리세요</li>
            <li>"녹화 중지" 버튼을 클릭하세요</li>
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
            disabled={strokes.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: strokes.length > 0 ? "#3b82f6" : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: strokes.length > 0 ? "pointer" : "not-allowed"
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default DrawingInputModal;