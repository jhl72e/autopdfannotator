// App.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import PdfViewer from "../../src/core/PdfViewer";
import DrawingInputModal from "./features/manual-creation/DrawingInputModal";
import HighlightInputModal from "./features/manual-creation/HighlightInputModal";
import TextInputModal from "./features/manual-creation/TextInputModal";
/*--------------------------------------AI Annotation System - Import--------------------------------------*/
import AIAnnotationGenerator from "./features/ai-generation/AIAnnotationGenerator";
/*--------------------------------------AI Annotation System - Import End--------------------------------------*/
import "./App.css";

export default function App() {
  const [pdfUrl, setPdfUrl] = useState("/pdfFile/test.pdf");
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [userDrawings, setUserDrawings] = useState([]);
  const [userHighlights, setUserHighlights] = useState([]);
  const [userTexts, setUserTexts] = useState([]);
  /*--------------------------------------AI Annotation System - State--------------------------------------*/
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [aiAnnotations, setAiAnnotations] = useState([]);
  const [aiScript, setAiScript] = useState("");
  /*--------------------------------------AI Annotation System - State End--------------------------------------*/

  const audioRef = useRef(null);
  const [nowSec, setNowSec] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTime = () => {
      setNowSec((prev) => {
        const newTime = el.currentTime;
        return Math.round(newTime * 100) / 100;
      });
    };

    el.addEventListener("timeupdate", onTime);

    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  const annotations = useMemo(
    () => [
      ...userDrawings,
      ...userHighlights,
      ...userTexts,
      /*--------------------------------------AI Annotation System - Annotations--------------------------------------*/
      ...aiAnnotations,
      /*--------------------------------------AI Annotation System - Annotations End--------------------------------------*/
    ],
    [userDrawings, userHighlights, userTexts, aiAnnotations]
  );

  // Handle saving drawing from modal
  const handleSaveDrawing = useCallback((drawing) => {
    setUserDrawings((prev) => [...prev, drawing]);
  }, []);

  // Handle saving highlight from modal
  const handleSaveHighlight = useCallback((highlight) => {
    setUserHighlights((prev) => [...prev, highlight]);
  }, []);

  // Handle saving text from modal
  const handleSaveText = useCallback((text) => {
    setUserTexts((prev) => [...prev, text]);
  }, []);

  /*--------------------------------------AI Annotation System - Handlers--------------------------------------*/
  // Handle AI generated content
  const handleAIGenerated = useCallback((data) => {
    setAiScript(data.script);
    setAiAnnotations(data.annotations);
    console.log("AI Generated Script:", data.script);
    console.log("AI Generated Annotations:", data.annotations);
  }, []);
  /*--------------------------------------AI Annotation System - Handlers End--------------------------------------*/

  // 콜백 함수들 메모이제이션
  const handlePdfLoad = useCallback(({ pageCount }) => {
    console.log("PDF 로드 완료:", pageCount, "페이지");
    setPageCount(pageCount);
  }, []);

  const handleError = useCallback((e) => {
    console.error("PDF 에러:", e);
  }, []);

  return (
    <div className="App">
      <h1>PDF Auto Annotator</h1>
      {/*-------------------------------------데이터 생성용 Modal-------------------------------------*/}
      {/* Modals */}
      <DrawingInputModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSave={handleSaveDrawing}
        pdfUrl={pdfUrl}
        pageNum={pageNum}
        scale={scale}
      />

      <HighlightInputModal
        isOpen={isHighlightModalOpen}
        onClose={() => setIsHighlightModalOpen(false)}
        onSave={handleSaveHighlight}
        pdfUrl={pdfUrl}
        pageNum={pageNum}
        scale={scale}
      />

      <TextInputModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSave={handleSaveText}
        pdfUrl={pdfUrl}
        pageNum={pageNum}
        scale={scale}
      />

      {/*--------------------------------------AI Annotation System - Modal--------------------------------------*/}
      <AIAnnotationGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onGenerate={handleAIGenerated}
        pdfUrl={pdfUrl}
        pageNum={pageNum}
      />
      {/*--------------------------------------AI Annotation System - Modal End--------------------------------------*/}

      {/*-------------------------------------데이터 생성용 Modal-------------------------------------*/}

      {/*-------------------------------------조작용 button-------------------------------------*/}
      {/* Controls */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setIsHighlightModalOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#eab308",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🖍 하이라이트 추가
        </button>

        <button
          onClick={() => setIsTextModalOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📝 텍스트 추가
        </button>

        <button
          onClick={() => setIsDrawingModalOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🎨 그림 추가
        </button>

        {/*--------------------------------------AI Annotation System - Button--------------------------------------*/}
        <button
          onClick={() => setIsAIGeneratorOpen(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🤖 AI 생성
        </button>
        {/*--------------------------------------AI Annotation System - Button End--------------------------------------*/}

        {(userHighlights.length > 0 ||
          userTexts.length > 0 ||
          userDrawings.length > 0) && (
          <span
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            추가된 애노테이션: 하이라이트 {userHighlights.length}개, 텍스트{" "}
            {userTexts.length}개, 그림 {userDrawings.length}개
            {/*--------------------------------------AI Annotation System - Count--------------------------------------*/}
            {aiAnnotations.length > 0 && `, AI ${aiAnnotations.length}개`}
            {/*--------------------------------------AI Annotation System - Count End--------------------------------------*/}
          </span>
        )}
      </div>

      {/*-------------------------------------조작용 button-------------------------------------*/}

      {/*-------------------------------------오디오 UI------------------------------------*/}
      {/* 오디오(타임라인 소스) */}
      <div style={{ marginBottom: 16 }}>
        <audio ref={audioRef} src="/audio/testAudio.mp3" controls />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          now: {nowSec.toFixed(2)}s
        </div>
        {/*--------------------------------------AI Annotation System - Script Display--------------------------------------*/}
        {aiScript && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              fontSize: "14px",
              maxWidth: "600px",
            }}
          >
            <strong>🎙 AI 생성 스크립트:</strong>
            <div style={{ marginTop: "5px" }}>{aiScript}</div>
          </div>
        )}
        {/*--------------------------------------AI Annotation System - Script Display End--------------------------------------*/}
      </div>
      {/*-------------------------------------오디오 UI-------------------------------------*/}

      {/*-------------------------------------실제 pdf Viewer 창 div-------------------------------------*/}
      {/* PDF 뷰어 */}
      <PdfViewer
        pdfUrl={pdfUrl}
        pageNum={pageNum}
        scale={scale}
        onPdfLoad={handlePdfLoad}
        onError={handleError}
        annotations={annotations}
        nowSec={nowSec}
      />

      {/*-------------------------------------실제 pdf Viewer 창 div-------------------------------------*/}
      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Page {pageNum} / {pageCount} · Zoom {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
