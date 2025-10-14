import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import HighlightLayer from "../layers/HighlightLayer";
import TextLayer from "../layers/TextLayer";
import DrawingLayer from "../layers/DrawingLayer";
import { calculateViewport } from "../utils/viewportUtils";

/**
 * @typedef {import('../types/annotations').Annotation} Annotation
 * @typedef {import('../types/annotations').Viewport} Viewport
 */

// PDF.js worker 설정 - 로컬 파일 사용
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

/**
 * PDF Viewer with Annotation Overlay
 *
 * Renders PDF documents with dynamic annotation layers synchronized to timeline position.
 * Supports highlight, text, and ink annotations with progressive animations.
 *
 * @param {Object} props - Component props
 * @param {string} props.pdfUrl - URL to PDF document
 * @param {number} props.pageNum - Current page number (1-indexed)
 * @param {Function} [props.onPageChange] - Callback when page changes
 * @param {Function} [props.onPdfLoad] - Callback when PDF loads, receives {pageCount}
 * @param {Function} [props.onError] - Callback when error occurs
 * @param {number} [props.scale=1.5] - Zoom scale factor
 * @param {string} [props.className=""] - Additional CSS class
 * @param {Object} [props.style={}] - Additional inline styles
 * @param {Annotation[]} [props.annotations=[]] - Array of annotations to render
 * @param {number} [props.nowSec=0] - Current timeline position in seconds
 * @returns {JSX.Element}
 */
const PdfViewer = ({
  pdfUrl,
  pageNum,
  onPageChange,
  onPdfLoad,
  onError,
  scale = 1.5,
  className = "",
  style = {},
  annotations = [],
  nowSec,
}) => {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const renderTaskRef = useRef(null);
  const isRenderingRef = useRef(false);

  const parsedAnnos = {
    H: annotations.filter(
      (anno) => anno.type === "highlight" && anno.page === pageNum
    ),
    T: annotations.filter(
      (anno) => anno.type === "text" && anno.page == pageNum
    ),
    D: annotations.filter(
      (anno) => anno.type === "ink" && anno.page == pageNum
    ),
  };

  // PDF 로드
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        setPdfDoc(pdf);
        setPageCount(pdf.numPages);

        // PDF 로드 완료 콜백
        if (onPdfLoad) {
          onPdfLoad({
            pdfDoc: pdf,
            pageCount: pdf.numPages,
          });
        }
      } catch (err) {
        const errorMessage =
          "PDF를 로드하는 중 오류가 발생했습니다: " + err.message;
        setError(errorMessage);
        console.error("PDF 로드 오류:", err);

        // 에러 콜백
        if (onError) {
          onError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl, onPdfLoad, onError]);

  // 페이지 렌더링 - 안전한 렌더링 보장
  const renderPage = useCallback(async () => {
    // 렌더링 조건 체크
    if (!pdfDoc || !canvasRef.current || !pageNum || isRenderingRef.current) {
      console.log("렌더링 스킵:", {
        pdfDoc: !!pdfDoc,
        canvas: !!canvasRef.current,
        pageNum,
        isRendering: isRenderingRef.current,
      });
      return;
    }

    try {
      // 렌더링 시작 플래그 설정
      isRenderingRef.current = true;

      // 이전 렌더링 작업 취소
      if (renderTaskRef.current) {
        console.log("이전 렌더링 작업 취소");
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;

      // Canvas 유효성 재확인
      if (!canvas) {
        console.error("Canvas가 null");
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Canvas context를 가져올 수 없습니다");
        return;
      }

      const newViewport = calculateViewport(page, scale);

      // Canvas 크기 설정
      canvas.height = newViewport.height;
      canvas.width = newViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: newViewport,
      };

      // 렌더링 작업 시작
      renderTaskRef.current = page.render(renderContext);

      // 렌더링 완료 대기
      await renderTaskRef.current.promise;

      // 렌더링 완료 후 상태 업데이트
      setViewport(newViewport);
      setCurrentPage(page);

      console.log("페이지 렌더링 완료");
    } catch (err) {
      if (err.name === "RenderingCancelledException") {
        console.log("렌더링취소");
      } else {
        console.error("페이지 렌더링 오류:", err);
        if (onError) {
          onError(err);
        }
      }
    } finally {
      // 렌더링 완료 플래그 해제
      isRenderingRef.current = false;
      renderTaskRef.current = null;
    }
  }, [pdfDoc, pageNum, scale, onError]);

  // 페이지나 스케일이 변경될 때만 렌더링
  useEffect(() => {
    // 약간의 지연을 두어 DOM이 안정화되도록 함
    const timeoutId = setTimeout(() => {
      renderPage();
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [renderPage]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      isRenderingRef.current = false;
    };
  }, []);

  if (loading) {
    return <div>PDF 로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!pdfDoc) {
    return <div>PDF 파일을 찾을 수 없습니다.</div>;
  }

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        background: "#fff",
        width: viewport?.width ?? "auto",
        height: viewport?.height ?? "auto",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          border: "1px solid #ccc",
          maxWidth: "100%",
          height: "auto",
          display: "block",
        }}
      />
      {viewport && currentPage && (
        <>
          <HighlightLayer
            annos={parsedAnnos.H}
            viewport={viewport}
            nowSec={nowSec}
          />
          <TextLayer
            annos={parsedAnnos.T}
            viewport={viewport}
            nowSec={nowSec}
          />
          <DrawingLayer
            annos={parsedAnnos.D}
            viewport={viewport}
            nowSec={nowSec}
          />
        </>
      )}
    </div>
  );
};

export default PdfViewer;
