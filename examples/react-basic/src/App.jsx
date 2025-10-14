import { useState } from 'react';
import { AnnotPdf } from '@ai-annotator/renderer';
import { sampleAnnotations } from '../../shared/fixtures/annotations-sample.js';
import Controls from './components/Controls.jsx';

function App() {
  // State management
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pageCount, setPageCount] = useState(0);

  // Page navigation handlers
  const handleNextPage = () => {
    if (page < pageCount) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Zoom control handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // PDF load callback
  const handleLoad = ({ pageCount }) => {
    setPageCount(pageCount);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '20px' }}>React Basic Example</h1>
      <p style={{
        marginBottom: '20px',
        color: '#666',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        Simplest React integration with static annotations.
        Use controls below to navigate and zoom.
      </p>

      <AnnotPdf
        pdfUrl="/sample.pdf"
        page={page}
        scale={scale}
        annotations={sampleAnnotations}
        onLoad={handleLoad}
      />

      <Controls
        page={page}
        pageCount={pageCount}
        scale={scale}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default App;
