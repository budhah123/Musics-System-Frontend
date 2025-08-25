import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaSearch, FaFilter, FaMusic, FaHeart, FaShare, FaDownload } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { useDownloads } from '../../context/DownloadsContext';
import axios from 'axios';

export default function MusicList({ musics, userLoggedIn }) {
  const navigate = useNavigate();
  // Ensure musics is always an array
  const safeMusics = Array.isArray(musics) ? musics : [];
  
  const { addFavorite, removeFavorite, isFavorite, error: favoritesError, clearError } = useFavorites();
  const { isAuthenticated, user, addToast } = useAuth();
  const { addDownload } = useDownloads();
  
  const [playingId, setPlayingId] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const audioRefs = useRef({});

  const handlePlayPause = (musicId) => {
    if (playingId === musicId) {
      setPlayingId(null);
    } else {
      setPlayingId(musicId);
    }
  };

  const handlePlayIconClick = (music) => {
    setShowAudioPlayer(prev => ({
      ...prev,
      [music.id]: !prev[music.id]
    }));
    
    if (!showAudioPlayer[music.id]) {
      // Start playing when showing the player
      setTimeout(() => {
        setPlayingId(music.id);
      }, 100);
    }
  };

  const handleMusicCardClick = (music) => {
    // Navigate to music detail page
    navigate(`/music/${music.id}`);
  };

  // Download functionality
  const [downloadStates, setDownloadStates] = useState({});
  const [downloadError, setDownloadError] = useState(null);

     const handleDownload = async (music) => {
     if (!isAuthenticated) {
       setDownloadError('Please login to download music');
       return;
     }

     if (!user?.id && !user?.userId) {
       setDownloadError('User ID not available. Please try logging in again.');
       return;
     }

    const musicId = music.id;
    setDownloadStates(prev => ({ ...prev, [musicId]: 'downloading' }));
    setDownloadError(null);

    try {
             // Step 1: Save download record
       const downloadResponse = await fetch('https://musics-system-2.onrender.com/downloads', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           userId: user?.id || user?.userId,
           musicId: musicId
         })
       });

             if (!downloadResponse.ok) {
         if (downloadResponse.status === 400) {
           throw new Error('Invalid request data. Please try again or contact support.');
         }
         throw new Error(`Failed to save download: ${downloadResponse.status}`);
       }

      // Step 2: Download the actual music file using Axios blob
      const audioUrl = getAudioUrl(music);
      if (!audioUrl) {
        throw new Error('No audio URL available for this track');
      }

      const response = await axios.get(audioUrl, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'audio/mpeg' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${music.title || 'music'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(url);
      
             // Add download to context for real-time updates
       addDownload({
         userId: user?.id || user?.userId,
         musicId: musicId
       });
      
      // Show success toast
      addToast(`Successfully downloaded ${music.title || 'music track'}!`, 'success');
      
      setDownloadStates(prev => ({ ...prev, [musicId]: 'success' }));
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setDownloadStates(prev => ({ ...prev, [musicId]: null }));
      }, 2000);

    } catch (error) {
      console.error('Download failed:', error);
      
             let errorMessage = 'Download failed. Please try again.';
       if (error.code === 'ECONNABORTED') {
         errorMessage = 'Download timed out. Please try again.';
       } else if (error.response?.status === 400) {
         errorMessage = 'Invalid request data. Please try again or contact support.';
       } else if (error.response?.status === 404) {
         errorMessage = 'Music file not found. Please contact support.';
       } else if (error.response?.status >= 500) {
         errorMessage = 'Server error. Please try again later.';
       } else if (error.message) {
         errorMessage = error.message;
       }
      
      setDownloadError(errorMessage);
      setDownloadStates(prev => ({ ...prev, [musicId]: 'error' }));
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setDownloadStates(prev => ({ ...prev, [musicId]: null }));
      }, 3000);
    }
  };

  // Stream functionality - open in new tab
  const handleStream = (music) => {
    const audioUrl = getAudioUrl(music);
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    }
  };

  const getThumbnailUrl = (music) => {
    return music.thumbnailUrl || music.thumbnail || music.imageUrl || '/default-thumbnail.svg';
  };

  const getAudioUrl = (music) => {
    return music.audioUrl || music.audio || music.musicUrl || music.url;
  };

  // Filter and sort music
  const filteredAndSortedMusics = safeMusics
    .filter(music => {
      const matchesSearch = 
        music.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        music.artist?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || music.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

  // Get unique categories for filter
  const categories = ['all', ...new Set(safeMusics.map(music => music.category).filter(Boolean))];

  // Handle favorite toggle
  const handleFavoriteToggle = async (musicId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      if (isFavorite(musicId)) {
        const success = await removeFavorite(musicId);
        if (!success) {
          // Error is already handled by the context
          return;
        }
      } else {
        const success = await addFavorite(musicId);
        if (!success) {
          // Error is already handled by the context
          return;
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (safeMusics.length === 0) {
    return (
      <div className="text-center py-12">
        <FaMusic className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No music found</h3>
        <p className="text-gray-500 mb-4">Start building your music library by adding some tracks.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Error message for favorites */}
      {favoritesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaHeart className="text-red-400 mr-2" />
              <p className="text-red-800">{favoritesError}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

             {/* Error message for downloads */}
       {downloadError && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <FaDownload className="text-red-400 mr-2" />
               <div>
                 <p className="text-red-800 font-medium">{downloadError}</p>
                 {downloadError.includes('400') || downloadError.includes('Invalid request') && (
                   <p className="text-red-600 text-sm mt-1">
                     This might be a temporary issue. Please try again or contact support if the problem persists.
                   </p>
                 )}
               </div>
             </div>
             <button
               onClick={() => setDownloadError(null)}
               className="text-red-400 hover:text-red-600 text-lg font-bold"
               title="Dismiss error"
             >
               ×
             </button>
           </div>
         </div>
       )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search music..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="title">Sort by Title</option>
              <option value="artist">Sort by Artist</option>
              <option value="category">Sort by Category</option>
              <option value="duration">Sort by Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredAndSortedMusics.length} of {safeMusics.length} tracks
      </div>

      {/* Music Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedMusics.map((music) => {
          const thumbnailUrl = getThumbnailUrl(music);
          const audioUrl = getAudioUrl(music);
          const isAudioPlayerVisible = showAudioPlayer[music.id];
          // Removed isDeleting state

          return (
            <div
              key={music.id}
              onClick={() => handleMusicCardClick(music)}
              className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={thumbnailUrl}
                  alt={music.title || 'Music thumbnail'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-thumbnail.svg';
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayIconClick(music);
                    }}
                    disabled={!audioUrl}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      !audioUrl
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-white bg-opacity-90 hover:bg-opacity-100 hover:scale-110'
                    }`}
                    aria-label={`Play ${music.title || 'music'}`}
                    title={audioUrl ? `Play ${music.title || 'music'}` : 'No audio available'}
                  >
                    <FaPlay size={20} className={!audioUrl ? 'text-gray-600' : 'text-gray-800'} />
                  </button>
                </div>

                {/* Category Badge */}
                {music.category && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {music.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Music Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {music.title || 'Untitled Track'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {music.artist || 'Unknown Artist'}
                </p>
                
                {/* Duration */}
                {music.duration && (
                  <p className="text-xs text-gray-500 mb-3">
                    Duration: {music.duration}
                  </p>
                )}

                {/* Audio Player */}
                {isAudioPlayerVisible && (
                  <div className="mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {audioUrl ? (
                        <audio
                          ref={el => audioRefs.current[music.id] = el}
                          controls
                          className="w-full"
                          src={audioUrl}
                          onPlay={() => setPlayingId(music.id)}
                          onPause={() => setPlayingId(null)}
                          onEnded={() => setPlayingId(null)}
                          onError={(e) => {
                            console.error('Audio error for music:', music.id, e);
                          }}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Audio not available for this track</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {/* Favorite Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(music.id);
                      }}
                      disabled={!isAuthenticated}
                      className={`p-2 transition-colors ${
                        isAuthenticated 
                          ? isFavorite(music.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title={isAuthenticated ? (isFavorite(music.id) ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
                    >
                      <FaHeart size={16} />
                    </button>
                    
                    {/* Share Button */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <FaShare size={16} />
                    </button>

                    {/* Stream Button */}
                    {audioUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStream(music);
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Stream in new tab"
                      >
                        <FaMusic size={16} />
                      </button>
                    )}

                    {/* Download Button */}
                    {audioUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(music);
                        }}
                        disabled={!isAuthenticated || downloadStates[music.id] === 'downloading'}
                        className={`p-2 transition-colors ${
                          !isAuthenticated 
                            ? 'text-gray-300 cursor-not-allowed'
                            : downloadStates[music.id] === 'downloading'
                            ? 'text-blue-500 cursor-wait'
                            : downloadStates[music.id] === 'success'
                            ? 'text-green-500'
                            : downloadStates[music.id] === 'error'
                            ? 'text-red-500'
                            : 'text-gray-400 hover:text-purple-500'
                        }`}
                        title={
                          !isAuthenticated 
                            ? 'Login to download music'
                            : downloadStates[music.id] === 'downloading'
                            ? 'Downloading...'
                            : 'Download music'
                        }
                      >
                        {downloadStates[music.id] === 'downloading' ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : downloadStates[music.id] === 'success' ? (
                          <FaDownload size={16} />
                        ) : downloadStates[music.id] === 'error' ? (
                          <FaDownload size={16} />
                        ) : (
                          <FaDownload size={16} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Delete Button for logged-in users */}
                  {/* Removed - Users cannot delete music */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results Message */}
      {filteredAndSortedMusics.length === 0 && (
        <div className="text-center py-12">
          <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No music found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
} 