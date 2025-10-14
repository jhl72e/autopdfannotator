/*--------------------------------------AI Annotation System - PDF Text Extractor--------------------------------------*/

/**
 * PDF Text Extraction Utility
 * Extracts text content from PDF pages for AI processing
 * Completely modular and detachable from core viewer
 */

import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

class PDFTextExtractor {
  constructor() {
    this.pdfDoc = null;
  }

  /**
   * Load PDF document
   */
  async loadPDF(pdfUrl) {
    try {
      this.pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      return this.pdfDoc;
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw error;
    }
  }

  /**
   * Extract text from a specific page
   */
  async extractPageText(pageNumber) {
    if (!this.pdfDoc) {
      throw new Error('PDF document not loaded');
    }

    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();

      // Combine text items into a single string
      const textItems = textContent.items;
      let fullText = '';
      let lastY = null;

      textItems.forEach(item => {
        // Add line breaks when Y position changes significantly
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          fullText += '\n';
        }
        fullText += item.str + ' ';
        lastY = item.transform[5];
      });

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  }

  /**
   * Extract text with position information for precise annotation placement
   */
  async extractPageTextWithPositions(pageNumber) {
    if (!this.pdfDoc) {
      throw new Error('PDF document not loaded');
    }

    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent();

      // Group text items by lines based on Y position
      const lines = [];
      let currentLine = [];
      let lastY = null;
      const yThreshold = 5; // Threshold for grouping items into lines

      textContent.items.forEach(item => {
        const transform = item.transform;
        const x = transform[4] / viewport.width; // Normalize to 0-1
        const y = 1 - ((transform[5] + item.height) / viewport.height); // Normalize from top
        const width = item.width / viewport.width;
        const height = item.height / viewport.height;

        const element = {
          text: item.str,
          x: Number(x.toFixed(3)),
          y: Number(y.toFixed(3)),
          width: Number(width.toFixed(3)),
          height: Number(height.toFixed(3))
        };

        // Group into lines based on Y position
        if (lastY === null || Math.abs(transform[5] - lastY) < yThreshold) {
          currentLine.push(element);
        } else {
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
          currentLine = [element];
        }
        lastY = transform[5];
      });

      // Add the last line
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // Create formatted text with positions for AI
      const formattedElements = [];
      const textWithPositions = [];

      lines.forEach(line => {
        // Sort line items by X position
        line.sort((a, b) => a.x - b.x);

        // Combine text in the same line
        const lineText = line.map(item => item.text).join(' ').trim();
        if (lineText) {
          const firstItem = line[0];
          const lastItem = line[line.length - 1];

          const lineElement = {
            text: lineText,
            x: firstItem.x,
            y: firstItem.y,
            width: (lastItem.x + lastItem.width) - firstItem.x,
            height: firstItem.height
          };

          formattedElements.push(lineElement);

          // Create human-readable position description
          textWithPositions.push(
            `"${lineText}" at [x:${lineElement.x}, y:${lineElement.y}, w:${lineElement.width}, h:${lineElement.height}]`
          );
        }
      });

      return {
        fullText: formattedElements.map(el => el.text).join('\n'),
        elements: formattedElements,
        textWithPositions: textWithPositions.join('\n'),
        viewport: {
          width: viewport.width,
          height: viewport.height
        }
      };
    } catch (error) {
      console.error('Error extracting text with positions:', error);
      throw error;
    }
  }

  /**
   * Get total page count
   */
  getPageCount() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
  }
}

export default PDFTextExtractor;

/*--------------------------------------AI Annotation System - PDF Text Extractor End--------------------------------------*/