import React from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { useMusicPlayer } from '../../context/MusicPlayerContext';

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    showPlayer,
    togglePlay,
    stop,
    seek,
    setVolumeLevel,
    toggleMute,
    handleNext,
    handlePrevious,
    formatTime
  } = useMusicPlayer();

  if (!showPlayer || !currentTrack) {
    return null;
  }

  const getThumbnailUrl = (music) => {
    return music.thumbnailUrl || music.thumbnail || music.imageUrl || '/default-thumbnail.svg';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <img
              src={getThumbnailUrl(currentTrack)}
              alt={currentTrack.title || 'Music thumbnail'}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = '/default-thumbnail.svg';
                e.target.onerror = null;
              }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-semibold truncate">
                {currentTrack.title || 'Unknown Track'}
              </h4>
              <p className="text-indigo-200 text-sm truncate">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="text-white hover:text-indigo-300 transition-colors p-2"
              title="Previous Track"
            >
              <FaStepBackward className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4 ml-1" />}
            </button>
            
            <button
              onClick={handleNext}
              className="text-white hover:text-indigo-300 transition-colors p-2"
              title="Next Track"
            >
              <FaStepForward className="w-4 h-4" />
            </button>
            
            <button
              onClick={stop}
              className="text-white hover:text-red-400 transition-colors p-2"
              title="Stop"
            >
              <FaStop className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 mx-8 min-w-0">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-indigo-300 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <span className="text-xs text-indigo-300 w-12 text-left">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMute}
              className="text-white hover:text-indigo-300 transition-colors p-2"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              title="Volume"
            />
          </div>
        </div>
      </div>

      {/* Custom CSS for slider styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #6366f1;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 0;
            background: #6366f1;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
      }} />
    </div>
  );
}
