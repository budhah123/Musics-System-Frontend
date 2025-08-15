import React, { useState, useRef } from 'react';
import { FaPlay, FaPause, FaSearch, FaFilter, FaMusic, FaHeart, FaShare } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

export default function MusicList({ musics, userLoggedIn }) {
  // Ensure musics is always an array
  const safeMusics = Array.isArray(musics) ? musics : [];
  
  const { addFavorite, removeFavorite, isFavorite, error: favoritesError, clearError } = useFavorites();
  const { isAuthenticated } = useAuth();
  
  const [playingId, setPlayingId] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
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

  // Download functionality
  const handleDownload = (music) => {
    const audioUrl = getAudioUrl(music);
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `${music.title || 'music'}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      
      const matchesGenre = selectedGenre === 'all' || music.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        case 'genre':
          return (a.genre || '').localeCompare(b.genre || '');
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        default:
          return 0;
      }
    });

  // Get unique genres for filter
  const genres = ['all', ...new Set(safeMusics.map(music => music.genre).filter(Boolean))];

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

          {/* Genre Filter */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
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
              <option value="genre">Sort by Genre</option>
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
              className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
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
                    onClick={() => handlePlayIconClick(music)}
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

                {/* Genre Badge */}
                {music.genre && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {music.genre}
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
                      onClick={() => handleFavoriteToggle(music.id)}
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
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <FaShare size={16} />
                    </button>

                    {/* Stream Button */}
                    {audioUrl && (
                      <button 
                        onClick={() => handleStream(music)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        title="Stream in new tab"
                      >
                        <FaMusic size={16} />
                      </button>
                    )}

                    {/* Download Button */}
                    {audioUrl && (
                      <button 
                        onClick={() => handleDownload(music)}
                        className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                        title="Download music"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
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