import React from 'react';
import { FaCheck, FaPlus } from 'react-icons/fa';
// import { useMusicPlayer } from '../../context/MusicPlayerContext';

export default function MusicSelectionCard({ 
  music, 
  onSelection, 
  isSelected = false,
  showSelectionButton = true,
  showPlayButton = false,
  showFavoriteButton = false,
  showDownloadButton = false,
  className = ""
}) {
  // Remove music player context since we don't need play functionality on landing page
  // const { toggleTrackPlay, isTrackPlaying } = useMusicPlayer();
  // const isPlaying = isTrackPlaying(music.musicId || music.id || music._id);

  const handleSelection = (e) => {
    e.stopPropagation();
    if (onSelection) {
      onSelection(music.id || music._id);
    }
  };

  // Remove play functionality since it's not needed on landing page
  // const handlePlayPause = (e) => {
  //   e.stopPropagation();
  //   toggleTrackPlay(music);
  // };

  // These functions are kept for future implementation but not used on landing page
  // const handleFavorite = (e) => {
  //   e.stopPropagation();
  //   // TODO: Implement favorite functionality
  // };

  // const handleDownload = (e) => {
  //   e.stopPropagation();
  //   // TODO: Implement download functionality
  // };

  // Duration formatting removed since we're not displaying duration on landing page
  // const formatDuration = (duration) => {
  //   if (!duration) return '--:--';
  //   
  //   // If duration is already in MM:SS format, return as is
  //   if (typeof duration === 'string' && duration.includes(':')) {
  //     return duration;
  //   }
  //   
  //   // If duration is in seconds, convert to MM:SS
  //   const seconds = parseInt(duration);
  //   if (isNaN(seconds)) return '--:--';
  //   
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  // };

  return (
    <div className={`group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40 ${className}`}>
      {/* Thumbnail */}
      <div className="relative">
        {music?.thumbnail ? (
          <img
            src={music.thumbnail}
            alt={music.title || 'Music thumbnail'}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/default-thumbnail.svg';
              e.target.onerror = null;
            }}
          />
        ) : (
          <div className="w-full h-48 bg-indigo-900 flex items-center justify-center">
            <div className="h-20 w-20 text-indigo-400 text-center">
              <span className="text-4xl">🎵</span>
            </div>
          </div>
        )}
        
        {/* Play Button Overlay - Removed for landing page */}

        {/* Selection Button */}
        {showSelectionButton && (
          <div className="absolute top-2 left-2">
            <button
              onClick={handleSelection}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSelected
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
              }`}
              title={isSelected ? 'Selected' : 'Select Music'}
            >
              {isSelected ? (
                <FaCheck size={14} />
              ) : (
                <FaPlus size={14} />
              )}
            </button>
          </div>
        )}

        {/* Category Badge */}
        {music.category && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/80 text-white backdrop-blur-sm">
              {music.category}
            </span>
          </div>
        )}
      </div>

      {/* Music Info */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-200 transition-colors duration-300">
          {music?.title || `Music ID: ${music.id || music._id}`}
        </h3>
        <p className="text-indigo-200 mb-3 line-clamp-1">
          {music?.artist || 'Unknown Artist'}
        </p>
        
        {/* Duration - Removed for landing page to focus on selection */}
        {/* <div className="flex items-center space-x-2 text-indigo-200 text-xs mb-4">
          <span className="font-medium">{formatDuration(music.duration)}</span>
        </div> */}
        
        {/* Action Buttons - Simplified for landing page */}
        <div className="flex justify-center items-center pt-2">
          {/* Future: Add favorite and download buttons here when needed */}
        </div>
      </div>
    </div>
  );
}
