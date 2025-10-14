import { useRef } from 'react';

function AudioPlayer({ onTimeUpdate, onDurationChange }) {
  const audioRef = useRef(null);

  // Handle audio time updates (fires ~4-10 times per second)
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  // Handle audio metadata loaded (get duration)
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      onDurationChange(audioRef.current.duration);
    }
  };

  return (
    <div style={{
      marginTop: '20px',
      width: '100%',
      maxWidth: '600px'
    }}>
      <audio
        ref={audioRef}
        src="/lecture.mp3"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        controls
        style={{
          width: '100%',
          outline: 'none'
        }}
      />
      <div style={{
        marginTop: '10px',
        fontSize: '13px',
        color: '#666',
        textAlign: 'center'
      }}>
        🎧 Audio synchronized with PDF annotations
      </div>
    </div>
  );
}

export default AudioPlayer;
