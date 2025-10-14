function TimelineControls({
  currentTime,
  maxTime,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onSeek
}) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Timeline Simulation</h2>

      {/* Playback Controls */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <button
          onClick={isPlaying ? onPause : onPlay}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: isPlaying ? '#f59e0b' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={onReset}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ↺ Reset
        </button>
      </div>

      {/* Timeline Scrubber */}
      <input
        type="range"
        min={0}
        max={maxTime}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        step={0.1}
        style={{
          width: '100%',
          marginBottom: '10px'
        }}
      />

      {/* Time Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6b7280',
        fontFamily: 'monospace'
      }}>
        <span>{currentTime.toFixed(1)}s</span>
        <span>{maxTime.toFixed(1)}s</span>
      </div>

      {/* Info */}
      <p style={{
        marginTop: '12px',
        fontSize: '11px',
        color: '#6b7280',
        lineHeight: '1.5'
      }}>
        💡 Play to see annotations animate in sequence.
        No actual audio - timeline is simulated.
      </p>
    </div>
  );
}

export default TimelineControls;
