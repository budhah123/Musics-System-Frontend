import React, { useState, useEffect } from 'react';
import { fetchMusics } from '../../api/api';
import { FaPlay, FaClock, FaUser, FaMusic } from 'react-icons/fa';

export default function MusicGrid({ sectionType = 'trending', onMusicCardClick }) {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMusics = async () => {
      try {
        setLoading(true);
        const data = await fetchMusics();
        setMusics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch musics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMusics();
  }, []);

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    
    // If duration is already in MM:SS format, return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If duration is in seconds, convert to MM:SS
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSectionMusics = () => {
    if (!musics || musics.length === 0) return [];
    
    // For demo purposes, we'll show different music in each section
    // In a real app, this would be based on actual trending data, user preferences, etc.
    const totalMusics = musics.length;
    
    switch (sectionType) {
      case 'trending':
        // Show first 6 musics as trending
        return musics.slice(0, Math.min(6, totalMusics));
      case 'forYou':
        // Show next 6 musics as recommendations
        return musics.slice(6, Math.min(12, totalMusics));
      case 'others':
        // Show remaining musics
        return musics.slice(12);
      default:
        return musics.slice(0, 6);
    }
  };

  const sectionMusics = getSectionMusics();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-red-500/30">
          <p className="text-red-400 text-lg mb-4">Failed to load music: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!sectionMusics || sectionMusics.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
          <FaMusic className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
          <p className="text-indigo-200 text-lg">No music available in this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {sectionMusics.map((music, index) => (
        <div
          key={music.id || music._id}
          className="group cursor-pointer animate-fade-in transform transition-all duration-300 hover:scale-105"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={onMusicCardClick}
        >
          {/* Music Card */}
          <div className="music-card bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 border border-white/20 hover:border-white/40 overflow-hidden relative">
            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            
            {/* Thumbnail Container */}
            <div className="relative mb-4">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 group-hover:shadow-lg transition-all duration-300">
                {music.thumbnail ? (
                  <img
                    src={music.thumbnail}
                    alt={music.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/default-thumbnail.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                    <FaMusic className="w-12 h-12 text-white/80" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <FaPlay className="text-white text-lg ml-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Music Info */}
            <div className="space-y-3 relative z-10">
              {/* Title */}
              <div>
                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-indigo-200 transition-colors duration-300">
                  {music.title || 'Unknown Title'}
                </h3>
              </div>
              
              {/* Artist */}
              <div className="flex items-center space-x-2 text-indigo-200 text-xs">
                <FaUser className="text-indigo-400 flex-shrink-0" />
                <span className="line-clamp-1 font-medium">
                  {music.artist || 'Unknown Artist'}
                </span>
              </div>
              
              {/* Duration */}
              <div className="flex items-center space-x-2 text-indigo-200 text-xs">
                <FaClock className="text-indigo-400 flex-shrink-0" />
                <span className="font-medium">{formatDuration(music.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
