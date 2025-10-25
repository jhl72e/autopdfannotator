import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { lectureAnnotations } from '../../shared/fixtures/annotations-lecture.js';
import PdfDisplay from './components/PdfDisplay.jsx';
import AudioPlayer from './components/AudioPlayer.jsx';

// Configure PDF.js worker (call once at app startup)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  // State management
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pageCount, setPageCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // PDF load callback
  const handleLoad = ({ pageCount }) => {
    setPageCount(pageCount);
  };

  // Audio timeline callbacks
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (dur) => {
    setDuration(dur);
  };

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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '10px' }}>React Audio Sync Example</h1>
      <p style={{
        marginBottom: '20px',
        color: '#666',
        maxWidth: '700px',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        Timeline synchronization with HTML5 audio. Play the audio to see annotations
        appear and animate in sync with the narration.
      </p>

      {/* PDF Display with Controls */}
      <PdfDisplay
        pdfUrl="/lecture.pdf"
        page={page}
        scale={scale}
        annotations={lectureAnnotations}
        currentTime={currentTime}
        onLoad={handleLoad}
        pageCount={pageCount}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Audio Player */}
      <AudioPlayer
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
      />

      {/* Timeline Info */}
      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#999',
        fontFamily: 'monospace'
      }}>
        Time: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        maxWidth: '700px',
        fontSize: '13px',
        color: '#0369a1'
      }}>
        <strong>💡 How to use:</strong>
        <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
          <li>Press play on the audio player to start</li>
          <li>Watch annotations appear and animate in sync with audio</li>
          <li>Use the audio scrubber to jump to different times</li>
          <li>Navigate pages to see annotations on different slides</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
