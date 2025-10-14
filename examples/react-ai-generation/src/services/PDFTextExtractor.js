import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker (using local worker file)
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * PDF Text Extractor with Position Information
 *
 * Extracts text content from PDF pages with normalized coordinates
 * for accurate annotation placement by AI services.
 */
class PDFTextExtractor {
  constructor() {
    this.pdfDoc = null;
  }

  /**
   * Load PDF document
   * @param {string} pdfUrl - URL to PDF file
   * @returns {Promise<PDFDocumentProxy>}
   */
  async loadPDF(pdfUrl) {
    this.pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    return this.pdfDoc;
  }

  /**
   * Extract text with normalized position data
   * @param {number} pageNumber - Page number (1-indexed)
   * @returns {Promise<Object>} - Text data with positions
   */
  async extractPageTextWithPositions(pageNumber) {
    const page = await this.pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    // Group text items by lines
    const lines = [];
    let currentLine = [];
    let lastY = null;

    textContent.items.forEach(item => {
      const transform = item.transform;
      const x = transform[4] / viewport.width; // Normalize to 0-1
      const y = 1 - ((transform[5] + item.height) / viewport.height);
      const width = item.width / viewport.width;
      const height = item.height / viewport.height;

      const element = {
        text: item.str,
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        width: Number(width.toFixed(3)),
        height: Number(height.toFixed(3))
      };

      // Group items by vertical position (same line)
      if (lastY === null || Math.abs(transform[5] - lastY) < 5) {
        currentLine.push(element);
      } else {
        if (currentLine.length > 0) lines.push(currentLine);
        currentLine = [element];
      }
      lastY = transform[5];
    });

    if (currentLine.length > 0) lines.push(currentLine);

    // Format for AI consumption
    const formattedElements = [];
    const textWithPositions = [];

    lines.forEach(line => {
      // Sort line items left to right
      line.sort((a, b) => a.x - b.x);
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
        textWithPositions.push(
          `"${lineText}" at [x:${lineElement.x}, y:${lineElement.y}, w:${lineElement.width}, h:${lineElement.height}]`
        );
      }
    });

    return {
      fullText: formattedElements.map(el => el.text).join('\n'),
      elements: formattedElements,
      textWithPositions: textWithPositions.join('\n'),
      viewport: { width: viewport.width, height: viewport.height }
    };
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
