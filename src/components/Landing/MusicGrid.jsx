import React, { useState, useEffect } from 'react';
import { fetchMusics } from '../../api/api';
import { FaMusic } from 'react-icons/fa';
import MusicSelectionCard from '../Common/MusicSelectionCard';

export default function MusicGrid({ 
  sectionType = 'trending', 
  onMusicCardClick, 
  onMusicSelection, 
  selectedMusics = new Set() 
}) {
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
  //   if (isNaN(seconds)) return '----';
  //   
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = seconds % 60;
  //   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  // };

  const getSectionMusics = () => {
    if (!musics || musics.length === 0) return [];
    
    // For demo purposes, we'll show different music in each section
    // In a real app, this would be based on actual trending data, user preferences, etc.
    const totalMusics = musics.length;
    
    switch (sectionType) {
      case 'trending':
        // Show first 10 musics as trending (2 rows of 5)
        return musics.slice(0, Math.min(10, totalMusics));
      case 'forYou':
        // Show next 10 musics as recommendations (2 rows of 5)
        return musics.slice(10, Math.min(20, totalMusics));
      case 'others':
        // Show remaining musics
        return musics.slice(20);
      default:
        return musics.slice(0, 10);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {sectionMusics.map((music, index) => (
        <div
          key={music.id || music._id}
          className="animate-fade-in transform transition-all duration-300"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <MusicSelectionCard
            music={music}
            onSelection={onMusicSelection}
            isSelected={selectedMusics.has(music.id || music._id)}
            showSelectionButton={true}
            showPlayButton={false}
            showFavoriteButton={false}
            showDownloadButton={false}
          />
        </div>
      ))}
    </div>
  );
}
