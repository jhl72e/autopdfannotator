function GenerationPanel({
  apiKey,
  onApiKeyChange,
  onGenerate,
  isGenerating,
  error,
  progress,
  generatedScript,
  generatedAnnotations
}) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>AI Generation</h2>

      {/* API Key Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '5px',
          color: '#374151'
        }}>
          OpenAI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}
        />
        <p style={{
          fontSize: '11px',
          color: '#6b7280',
          marginTop: '5px'
        }}>
          ⚠️ Key stored in memory only, not persisted
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !apiKey.trim()}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '14px',
          fontWeight: '500',
          backgroundColor: isGenerating ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isGenerating || !apiKey.trim() ? 'not-allowed' : 'pointer',
          marginBottom: '15px'
        }}
      >
        {isGenerating ? '생성 중...' : '애노테이션 생성'}
      </button>

      {/* Progress */}
      {progress && (
        <div style={{
          padding: '10px',
          backgroundColor: '#dbeafe',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#1e40af',
          marginBottom: '15px'
        }}>
          {progress}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fee2e2',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#991b1b',
          marginBottom: '15px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Generated Script */}
      {generatedScript && (
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#374151'
          }}>
            생성된 스크립트
          </h3>
          <div style={{
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#1f2937',
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {generatedScript}
          </div>
        </div>
      )}

      {/* Generated Annotations List */}
      {generatedAnnotations.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#374151'
          }}>
            생성된 애노테이션 ({generatedAnnotations.length}개)
          </h3>
          <div style={{
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {generatedAnnotations.map((anno, idx) => (
              <div
                key={anno.id}
                style={{
                  padding: '6px',
                  marginBottom: idx < generatedAnnotations.length - 1 ? '6px' : 0,
                  backgroundColor: '#f9fafb',
                  borderRadius: '3px'
                }}
              >
                <span style={{ fontWeight: '500', color: '#6b7280' }}>
                  {idx + 1}.
                </span>{' '}
                <span style={{
                  color: anno.type === 'highlight' ? '#f59e0b' :
                        anno.type === 'text' ? '#3b82f6' : '#10b981'
                }}>
                  {anno.type}
                </span>{' '}
                <span style={{ color: '#9ca3af' }}>
                  ({anno.start.toFixed(1)}s - {anno.end.toFixed(1)}s)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Warning */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        backgroundColor: '#fef3c7',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#92400e',
        lineHeight: '1.5'
      }}>
        <strong>🔒 보안 참고사항:</strong><br />
        • API 키는 메모리에만 저장되며 저장되지 않습니다<br />
        • OpenAI API로만 직접 전송됩니다<br />
        • 프로덕션 환경에서는 서버 측 API 프록시를 구현하세요
      </div>
    </div>
  );
}

export default GenerationPanel;
