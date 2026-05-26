import React, { useState } from 'react';

export const InteractiveTranscription = ({ text, duration, onTimeClick, audioRef, isPlaying }) => {
  const [hoveredTime, setHoveredTime] = useState(null);

  // Estimate timestamps for words based on duration and position
  const estimateTimestamp = (wordIndex, totalWords) => {
    if (!duration || duration === 0 || !totalWords) return 0;
    return (wordIndex / totalWords) * duration;
  };

  const words = text.split(/\s+/);
  const totalWords = words.length;

  const handleWordClick = (index) => {
    const estimatedTime = estimateTimestamp(index, totalWords);
    if (onTimeClick) {
      onTimeClick(estimatedTime);
    }
    // Also seek the audio player if available
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = estimatedTime;
      if (!isPlaying) {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-cyan-950/40 to-teal-950/30 border border-cyan-400/60 rounded-lg p-6">
      <h4 className="text-sm font-bold text-teal-300 mb-4 uppercase tracking-widest">
        📝 Interactive Transcription (Click words to jump)
      </h4>
      
      <div className="bg-cyan-950/50 border border-cyan-500/40 rounded-lg p-5 min-h-[120px] max-h-[300px] overflow-y-auto">
        <div className="flex flex-wrap gap-2 leading-8">
          {words.map((word, index) => {
            const timestamp = estimateTimestamp(index, totalWords);
            const isHovered = hoveredTime === index;

            return (
              <div key={index} className="relative group inline-block">
                <button
                  onClick={() => handleWordClick(index)}
                  onMouseEnter={() => setHoveredTime(index)}
                  onMouseLeave={() => setHoveredTime(null)}
                  className={`px-2 py-1 rounded transition-all duration-200 font-medium text-sm ${
                    isHovered
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/50 scale-110'
                      : 'bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/40'
                  }`}
                  title={`Click to jump to ${formatTime(timestamp)}`}
                >
                  {word}
                </button>

                {isHovered && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-cyan-400 rounded text-xs text-cyan-300 whitespace-nowrap shadow-lg z-10">
                    ⏱️ {formatTime(timestamp)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-cyan-400/70">
          💡 Tip: Click any word to jump the audio player to that point
        </p>
        <span className="text-xs text-cyan-300 bg-cyan-950/50 px-3 py-1 rounded">
          {words.length} words • ~{formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
