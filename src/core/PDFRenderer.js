/**
 * PDFRenderer - Framework-agnostic PDF rendering subsystem
 *
 * This module encapsulates all pdf.js operations including document loading,
 * page rendering, viewport calculations, and rendering task management.
 *
 * @module core/PDFRenderer
 */

import * as pdfjsLib from "pdfjs-dist";
import { calculateViewport } from "../utils/viewportUtils.js";

/**
 * PDFRenderer class
 *
 * Provides framework-agnostic PDF rendering capabilities.
 * Abstracts pdf.js complexity and provides clean interface for engine.
 *
 * @class
 * @example
 * const renderer = new PDFRenderer();
 * await renderer.loadDocument('/path/to/doc.pdf');
 * const result = await renderer.renderPage(1, canvasElement, 1.5);
 */
export class PDFRenderer {
  constructor() {
    /**
     * @private
     * @type {PDFDocumentProxy|null}
     */
    this.pdfDoc = null;

    /**
     * @private
     * @type {RenderTask|null}
     */
    this.renderTask = null;

    // Configure pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }

  /**
   * Load PDF document from URL
   *
   * @param {string} url - URL or path to PDF file
   * @returns {Promise<{success: boolean, pageCount?: number, error?: string}>}
   */
  async loadDocument(url) {
    try {
      if (!url || typeof url !== "string") {
        return {
          success: false,
          error: "Invalid PDF URL provided",
        };
      }

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;

      this.pdfDoc = pdf;

      return {
        success: true,
        pageCount: pdf.numPages,
      };
    } catch (err) {
      console.error("PDF loading error:", err);
      return {
        success: false,
        error: `Failed to load PDF: ${err.message}`,
      };
    }
  }

  /**
   * Render PDF page to canvas element
   *
   * @param {number} pageNum - Page number (1-indexed)
   * @param {HTMLCanvasElement} canvas - Canvas element to render to
   * @param {number} scale - Scale factor for rendering
   * @returns {Promise<{success: boolean, viewport?: Object, error?: string}>}
   */
  async renderPage(pageNum, canvas, scale) {
    try {
      if (!this.pdfDoc) {
        return {
          success: false,
          error: "No PDF document loaded",
        };
      }

      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        return {
          success: false,
          error: "Invalid canvas element provided",
        };
      }

      if (pageNum < 1 || pageNum > this.pdfDoc.numPages) {
        return {
          success: false,
          error: `Invalid page number: ${pageNum}. Document has ${this.pdfDoc.numPages} pages.`,
        };
      }

      // Cancel any in-progress rendering
      if (this.renderTask) {
        this.renderTask.cancel();
        this.renderTask = null;
      }

      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = calculateViewport(page, scale);

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) {
        return {
          success: false,
          error: "Failed to get canvas 2d context",
        };
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      this.renderTask = page.render(renderContext);
      await this.renderTask.promise;

      this.renderTask = null;

      return {
        success: true,
        viewport: viewport,
      };
    } catch (err) {
      if (err.name === "RenderingCancelledException") {
        console.log("Rendering cancelled");
        return {
          success: false,
          error: "Rendering was cancelled",
        };
      }

      console.error("Page rendering error:", err);
      return {
        success: false,
        error: `Failed to render page: ${err.message}`,
      };
    } finally {
      this.renderTask = null;
    }
  }

  /**
   * Get total number of pages in loaded PDF
   *
   * @returns {number} Page count, or 0 if no document loaded
   */
  getPageCount() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  /**
   * Cancel current rendering task if active
   *
   * @returns {void}
   */
  cancelRender() {
    if (this.renderTask) {
      try {
        this.renderTask.cancel();
      } catch (err) {
        console.log("Render cancellation error (ignored):", err);
      } finally {
        this.renderTask = null;
      }
    }
  }

  /**
   * Clean up resources and release references
   *
   * @returns {void}
   */
  destroy() {
    this.cancelRender();

    if (this.pdfDoc) {
      this.pdfDoc = null;
    }

    this.renderTask = null;
  }
}
