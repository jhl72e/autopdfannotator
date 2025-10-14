import { AnnotPdf } from '@ai-annotator/renderer';

function PdfDisplay({
  pdfUrl,
  page,
  scale,
  annotations,
  currentTime,
  onLoad,
  pageCount,
  onNextPage,
  onPrevPage,
  onZoomIn,
  onZoomOut
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <AnnotPdf
        pdfUrl={pdfUrl}
        page={page}
        scale={scale}
        annotations={annotations}
        currentTime={currentTime}
        onLoad={onLoad}
      />

      {/* Controls */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        alignItems: 'center'
      }}>
        {/* Page Navigation */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onPrevPage}
            disabled={page <= 1}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: page <= 1 ? '#e5e7eb' : '#3b82f6',
              color: page <= 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '100px', textAlign: 'center' }}>
            Page {page} of {pageCount}
          </span>
          <button
            onClick={onNextPage}
            disabled={page >= pageCount}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: page >= pageCount ? '#e5e7eb' : '#3b82f6',
              color: page >= pageCount ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: page >= pageCount ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onZoomOut}
            disabled={scale <= 0.5}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: scale <= 0.5 ? '#e5e7eb' : '#10b981',
              color: scale <= 0.5 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer'
            }}
          >
            Zoom Out
          </button>
          <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '80px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={scale >= 3.0}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: scale >= 3.0 ? '#e5e7eb' : '#10b981',
              color: scale >= 3.0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: scale >= 3.0 ? 'not-allowed' : 'pointer'
            }}
          >
            Zoom In
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfDisplay;
