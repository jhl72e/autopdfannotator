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
      alignItems: 'center',
      gap: '15px'
    }}>
      {/* PDF Renderer */}
      <AnnotPdf
        pdfUrl={pdfUrl}
        page={page}
        scale={scale}
        annotations={annotations}
        currentTime={currentTime}
        onLoad={onLoad}
      />

      {/* Control Panel */}
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onPrevPage}
            disabled={page <= 1}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '100px',
            textAlign: 'center'
          }}>
            Page {page} of {pageCount}
          </span>
          <button
            onClick={onNextPage}
            disabled={page >= pageCount}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: page >= pageCount ? 'not-allowed' : 'pointer',
              opacity: page >= pageCount ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onZoomOut}
            disabled={scale <= 0.5}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
              opacity: scale <= 0.5 ? 0.5 : 1
            }}
          >
            Zoom Out
          </button>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={scale >= 3.0}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: scale >= 3.0 ? 'not-allowed' : 'pointer',
              opacity: scale >= 3.0 ? 0.5 : 1
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
