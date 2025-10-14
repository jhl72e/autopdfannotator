/*--------------------------------------AI Annotation System - AI Generator Component--------------------------------------*/

import React, { useState, useCallback } from "react";
import OpenAIService from "./openaiService";
import PDFTextExtractor from "./pdfTextExtractor";

/**
 * AI Annotation Generator Component
 * Generates educational scripts and annotations using OpenAI
 * Completely modular and detachable from core PDF viewer
 */
function AIAnnotationGenerator({
  isOpen,
  onClose,
  onGenerate,
  pdfUrl,
  pageNum = 1
}) {
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedAnnotations, setGeneratedAnnotations] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [positionData, setPositionData] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  /**
   * Extract text from current PDF page
   */
  const extractPDFText = useCallback(async () => {
    const extractor = new PDFTextExtractor();
    try {
      setProgress("PDF 텍스트 및 위치 정보 추출 중...");
      await extractor.loadPDF(pdfUrl);
      const textData = await extractor.extractPageTextWithPositions(pageNum);
      setExtractedText(textData.fullText);
      setPositionData(textData.textWithPositions);

      // Log position data for debugging
      console.log("Extracted text with positions:", textData.textWithPositions);

      extractor.destroy();
      return textData; // Return full data object including positions
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw error;
    }
  }, [pdfUrl, pageNum]);

  /**
   * Generate script and annotations
   */
  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError("OpenAI API 키를 입력해주세요.");
      return;
    }

    // Basic API key validation
    if (!apiKey.startsWith('sk-')) {
      setError("올바른 OpenAI API 키 형식이 아닙니다. API 키는 'sk-'로 시작해야 합니다.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedScript("");
    setGeneratedAnnotations([]);

    try {
      const openai = new OpenAIService(apiKey);

      // Step 1: Extract PDF text with positions
      const pdfTextData = await extractPDFText();

      if (!pdfTextData || !pdfTextData.fullText) {
        throw new Error("PDF에서 텍스트를 추출할 수 없습니다.");
      }

      // Step 2: Generate educational script
      setProgress("교육용 스크립트 생성 중...");
      const script = await openai.generateScript(pdfTextData, pageNum);
      setGeneratedScript(script);

      // Step 3: Generate annotations with position data
      setProgress("위치 기반 애노테이션 생성 중...");
      const annotations = await openai.generateAnnotations(pdfTextData, script, pageNum);

      // Ensure we have at least 3 annotations
      if (annotations.length < 3) {
        console.warn("Generated less than 3 annotations, using default annotations");
        // Add default annotations if less than 3 were generated
        const defaults = [
          {
            id: `ai_default_${Date.now()}_1`,
            type: "highlight",
            page: pageNum,
            mode: "quads",
            quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.03 }],
            style: { color: "rgba(255,230,100,0.35)" },
            start: 0,
            end: 5
          },
          {
            id: `ai_default_${Date.now()}_2`,
            type: "text",
            page: pageNum,
            content: "중요 포인트",
            x: 0.6,
            y: 0.3,
            w: 0.2,
            h: 0.1,
            style: { bg: "rgba(255,255,255,0.9)", color: "#1f2937" },
            start: 5,
            end: 10
          },
          {
            id: `ai_default_${Date.now()}_3`,
            type: "highlight",
            page: pageNum,
            mode: "quads",
            quads: [{ x: 0.1, y: 0.5, w: 0.4, h: 0.03 }],
            style: { color: "rgba(180,255,180,0.35)" },
            start: 10,
            end: 15
          }
        ];

        while (annotations.length < 3) {
          annotations.push(defaults[annotations.length]);
        }
      }

      setGeneratedAnnotations(annotations);
      setProgress("생성 완료!");

    } catch (error) {
      console.error("Generation error:", error);

      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('Authentication failed')) {
        errorMessage = "인증 실패: API 키를 확인해주세요. OpenAI 대시보드에서 유효한 키인지 확인하세요.";
      } else if (error.message.includes('Rate limit')) {
        errorMessage = "요청 한도 초과: 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes('Model not found')) {
        errorMessage = "모델을 찾을 수 없습니다. API 키가 GPT-3.5 이상을 지원하는지 확인하세요.";
      } else if (error.message.includes('fetch')) {
        errorMessage = "네트워크 오류: 인터넷 연결을 확인해주세요.";
      }

      setError(`생성 중 오류 발생: ${errorMessage}`);
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Apply generated content
   */
  const handleApply = () => {
    if (generatedAnnotations.length > 0) {
      onGenerate({
        script: generatedScript,
        annotations: generatedAnnotations
      });
      handleClose();
    }
  };

  /**
   * Close modal
   */
  const handleClose = () => {
    setApiKey("");
    setGeneratedScript("");
    setGeneratedAnnotations([]);
    setExtractedText("");
    setError("");
    setProgress("");
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
        maxWidth: "800px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        overflow: "auto"
      }}>
        <h2 style={{ marginTop: 0 }}>🤖 AI 애노테이션 생성기</h2>

        {/* API Key Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "5px",
            fontWeight: "bold"
          }}>
            OpenAI API Key:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        {/* Current Page Info */}
        <div style={{
          padding: "10px",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          <strong>현재 페이지:</strong> {pageNum}페이지
          {extractedText && (
            <>
              <div style={{ marginTop: "10px", fontSize: "12px", color: "#6b7280" }}>
                <strong>추출된 텍스트:</strong> {extractedText.substring(0, 100)}...
              </div>
              {positionData && (
                <details style={{ marginTop: "5px", fontSize: "11px", color: "#6b7280" }}>
                  <summary style={{ cursor: "pointer" }}>텍스트 위치 정보 보기</summary>
                  <pre style={{
                    maxHeight: "100px",
                    overflow: "auto",
                    backgroundColor: "white",
                    padding: "5px",
                    marginTop: "5px",
                    borderRadius: "4px"
                  }}>
                    {positionData.substring(0, 500)}
                    {positionData.length > 500 && '...'}
                  </pre>
                </details>
              )}
            </>
          )}
        </div>

        {/* Progress/Error Display */}
        {progress && (
          <div style={{
            padding: "10px",
            backgroundColor: "#dbeafe",
            borderRadius: "4px",
            marginBottom: "20px",
            color: "#1e40af"
          }}>
            ⏳ {progress}
          </div>
        )}

        {error && (
          <div style={{
            padding: "10px",
            backgroundColor: "#fee2e2",
            borderRadius: "4px",
            marginBottom: "20px",
            color: "#dc2626"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generated Script Display */}
        {generatedScript && (
          <div style={{ marginBottom: "20px" }}>
            <h3>📝 생성된 스크립트:</h3>
            <div style={{
              padding: "10px",
              backgroundColor: "#f9fafb",
              borderRadius: "4px",
              border: "1px solid #e5e7eb",
              maxHeight: "150px",
              overflow: "auto"
            }}>
              {generatedScript}
            </div>
          </div>
        )}

        {/* Generated Annotations Display */}
        {generatedAnnotations.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3>🎯 생성된 애노테이션: ({generatedAnnotations.length}개)</h3>
            <div style={{
              padding: "10px",
              backgroundColor: "#f9fafb",
              borderRadius: "4px",
              border: "1px solid #e5e7eb",
              maxHeight: "150px",
              overflow: "auto"
            }}>
              {generatedAnnotations.map((anno, idx) => (
                <div key={idx} style={{
                  padding: "5px",
                  marginBottom: "5px",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  fontSize: "12px"
                }}>
                  <strong>{anno.type}</strong>
                  {" - "}
                  시작: {anno.start}s, 종료: {anno.end}s
                  {anno.type === 'text' && ` - "${anno.content}"`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: "auto",
          padding: "10px",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          <strong>사용 방법:</strong>
          <ol style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li>OpenAI API 키를 입력하세요</li>
            <li>"생성" 버튼을 클릭하면 AI가 PDF 내용을 분석합니다</li>
            <li>교육용 스크립트와 3개 이상의 애노테이션이 자동 생성됩니다</li>
            <li>"적용" 버튼을 클릭하여 생성된 내용을 사용하세요</li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end"
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
            onClick={handleGenerate}
            disabled={isGenerating || !apiKey}
            style={{
              padding: "10px 20px",
              backgroundColor: isGenerating || !apiKey ? "#9ca3af" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isGenerating || !apiKey ? "not-allowed" : "pointer"
            }}
          >
            {isGenerating ? "생성 중..." : "생성"}
          </button>

          <button
            onClick={handleApply}
            disabled={generatedAnnotations.length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: generatedAnnotations.length === 0 ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: generatedAnnotations.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAnnotationGenerator;

/*--------------------------------------AI Annotation System - AI Generator Component End--------------------------------------*/