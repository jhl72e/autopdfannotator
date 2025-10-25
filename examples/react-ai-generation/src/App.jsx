import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfDisplay from './components/PdfDisplay.jsx';
import GenerationPanel from './components/GenerationPanel.jsx';
import TimelineControls from './components/TimelineControls.jsx';
import OpenAIService from './services/OpenAIService.js';
import PDFTextExtractor from './services/PDFTextExtractor.js';

// Configure PDF.js worker (call once at app startup)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function App() {
  // PDF state
  const [pdfUrl] = useState('/sample.pdf');
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [pageCount, setPageCount] = useState(0);

  // Generation state
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  // Generated content
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedAnnotations, setGeneratedAnnotations] = useState([]);

  // Timeline state
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play timeline simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= maxTime) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, maxTime]);

  // Calculate max time from annotations
  useEffect(() => {
    if (generatedAnnotations.length > 0) {
      const max = Math.max(...generatedAnnotations.map(a => a.end));
      setMaxTime(max);
    }
  }, [generatedAnnotations]);

  // PDF load callback
  const handleLoad = ({ pageCount }) => {
    setPageCount(pageCount);
  };

  // Generate annotations using OpenAI
  const handleGenerate = async () => {
    // Validate API key
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }
    if (!apiKey.startsWith('sk-')) {
      setError('올바른 OpenAI API 키 형식이 아닙니다. sk-로 시작해야 합니다.');
      return;
    }

    // Reset state
    setIsGenerating(true);
    setError('');
    setGeneratedScript('');
    setGeneratedAnnotations([]);
    setCurrentTime(0);
    setIsPlaying(false);

    try {
      // Step 1: Extract PDF text with positions
      setProgress('📄 PDF 텍스트 및 위치 정보 추출 중...');
      const extractor = new PDFTextExtractor();
      await extractor.loadPDF(pdfUrl);
      const textData = await extractor.extractPageTextWithPositions(page);

      if (!textData.fullText.trim()) {
        throw new Error('PDF에서 텍스트를 추출할 수 없습니다. 이미지 기반 PDF는 지원되지 않습니다.');
      }

      // Step 2: Generate script
      setProgress('✍️ 교육용 스크립트 생성 중...');
      const openai = new OpenAIService(apiKey);
      const script = await openai.generateScript(textData, page);
      setGeneratedScript(script);

      // Step 3: Generate annotations
      setProgress('🎨 위치 기반 애노테이션 생성 중...');
      let annotations = await openai.generateAnnotations(textData, script, page);

      // Fallback: Ensure minimum 3 annotations
      if (annotations.length < 3) {
        console.warn('Generated fewer than 3 annotations, adding defaults');
        annotations = ensureMinimumAnnotations(annotations, page);
      }

      setGeneratedAnnotations(annotations);
      setProgress('');
      console.log(`Generated ${annotations.length} annotations successfully`);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || '생성 중 오류가 발생했습니다.');
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Ensure minimum 3 annotations with defaults
  const ensureMinimumAnnotations = (annotations, pageNumber) => {
    const defaults = [
      {
        id: `default_${Date.now()}_1`,
        type: 'highlight',
        page: pageNumber,
        mode: 'quads',
        quads: [{ x: 0.1, y: 0.2, w: 0.3, h: 0.03 }],
        style: { color: 'rgba(255,230,100,0.35)' },
        start: 0,
        end: 5
      },
      {
        id: `default_${Date.now()}_2`,
        type: 'text',
        page: pageNumber,
        content: '중요 포인트',
        x: 0.6, y: 0.3, w: 0.2, h: 0.1,
        style: { bg: 'rgba(255,255,255,0.9)', color: '#1f2937' },
        start: 5,
        end: 10
      },
      {
        id: `default_${Date.now()}_3`,
        type: 'highlight',
        page: pageNumber,
        mode: 'quads',
        quads: [{ x: 0.1, y: 0.5, w: 0.4, h: 0.03 }],
        style: { color: 'rgba(180,255,180,0.35)' },
        start: 10,
        end: 15
      }
    ];

    const result = [...annotations];
    while (result.length < 3) {
      result.push(defaults[result.length]);
    }
    return result;
  };

  // Page navigation
  const handleNextPage = () => {
    if (page < pageCount) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  // Timeline controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };
  const handleSeek = (time) => setCurrentTime(time);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '10px' }}>React AI Generation Example</h1>
      <p style={{
        marginBottom: '20px',
        color: '#666',
        maxWidth: '800px',
        textAlign: 'center',
        fontSize: '14px'
      }}>
        AI-powered annotation generation with OpenAI GPT-4. Generate educational
        annotations dynamically from PDF content, then render with the core system.
      </p>

      {/* Main Layout: PDF Display + Control Panel */}
      <div style={{
        display: 'flex',
        gap: '30px',
        width: '100%',
        maxWidth: '1400px',
        alignItems: 'flex-start'
      }}>
        {/* Left: PDF Display */}
        <div>
          <PdfDisplay
            pdfUrl={pdfUrl}
            page={page}
            scale={scale}
            annotations={generatedAnnotations}
            currentTime={currentTime}
            onLoad={handleLoad}
            pageCount={pageCount}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        </div>

        {/* Right: Generation + Timeline Panel */}
        <div style={{ flex: 1, minWidth: '350px', maxWidth: '500px' }}>
          <GenerationPanel
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            error={error}
            progress={progress}
            generatedScript={generatedScript}
            generatedAnnotations={generatedAnnotations}
          />

          {generatedAnnotations.length > 0 && (
            <TimelineControls
              currentTime={currentTime}
              maxTime={maxTime}
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onSeek={handleSeek}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
