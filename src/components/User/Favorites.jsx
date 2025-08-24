import React, { useEffect, useState } from 'react';
import { FaHeart, FaMusic, FaTrash, FaPlay, FaPause, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { fetchUserFavorites, removeFromFavorites } from '../../api/api';

export default function Favorites() {
  const { user, token } = useAuth();
  const { toggleTrackPlay, isTrackPlaying } = useMusicPlayer();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorites from API on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) {
        setLoading(false);
        setError('User not authenticated. Please log in again.');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching favorites for user:', user.id);
        console.log('User object:', user);
        console.log('Token available:', !!token);
        
        const data = await fetchUserFavorites(user.id, token);
        console.log('Favorites data received:', data);
        
        // Handle different API response structures
        if (Array.isArray(data)) {
          setFavorites(data);
        } else if (data && data.favorites) {
          setFavorites(data.favorites);
        } else if (data && data.data) {
          setFavorites(data.data);
        } else {
          console.warn('Unexpected data structure:', data);
          setFavorites([]);
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setError(err.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id, token]);

  const handlePlayPause = (music) => {
    toggleTrackPlay(music);
  };

  const handleRemoveFavorite = async (musicId) => {
    try {
      console.log('Removing from favorites:', musicId);
      
      // Call the API to remove from favorites
      const result = await removeFromFavorites(user.id, musicId);
      console.log('Remove result:', result);
      
      if (result.success || result.message) {
        // Remove from local state
        setFavorites(prevFavorites => 
          prevFavorites.filter(fav => {
            const music = fav.music || fav;
            return music.id !== musicId;
          })
        );
        
        console.log('Successfully removed from favorites');
      } else {
        console.error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // You could show a toast notification here
    }
  };

  const getThumbnailUrl = (music) => {
    return music.thumbnailUrl || music.thumbnail || music.imageUrl || '/default-thumbnail.svg';
  };

  const getAudioUrl = (music) => {
    return music.audioUrl || music.audio || music.musicUrl || music.url;
  };

  // Format duration helper function
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

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
            <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-300 text-lg mb-2">Authentication Required</h3>
            <p className="text-red-200">Please log in to access your favorites.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <FaSpinner className="w-16 h-16 text-indigo-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-indigo-200 text-lg mb-2">Loading Your Favorites</h3>
              <p className="text-indigo-300">Please wait while we fetch your loved tracks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-red-300 text-lg mb-2">Error Loading Favorites</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Same styling as landing page */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 rounded-full mb-6 animate-float">
            <FaHeart className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Your Favorites
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg">
            All the music you love in one place. Your personal collection of favorite tracks.
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Favorites Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-red-300 mb-2">{favorites.length}</div>
                <div className="text-indigo-200 font-medium">Total Favorites</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-green-300 mb-2">
                  {favorites.filter(fav => {
                    const music = fav.music || fav;
                    return music.category;
                  }).length}
                </div>
                <div className="text-indigo-200 font-medium">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-300 mb-2">
                  {favorites.filter(fav => {
                    const music = fav.music || fav;
                    return music.artist;
                  }).length}
                </div>
                <div className="text-indigo-200 font-medium">Artists</div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites List Section */}
        {favorites.length === 0 ? (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <FaHeart className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-red-200 text-lg mb-2">No favorites yet</h3>
                <p className="text-indigo-300 mb-6">
                  Start building your collection by adding tracks to your favorites.
                </p>
                <a
                  href="/user/musics"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-block"
                >
                  Browse Music
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">❤️ Your Loved Tracks</h2>
              <p className="text-lg text-indigo-200">Play, manage, and enjoy your favorite music</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite, index) => {
                const music = favorite.music || favorite;
                const thumbnailUrl = getThumbnailUrl(music);
                const audioUrl = getAudioUrl(music);
                const isPlaying = isTrackPlaying(music.id);
                
                return (
                  <div 
                    key={`${favorite.userId}-${music.id}-${index}`} 
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      <img
                        src={thumbnailUrl}
                        alt={music.title || 'Music thumbnail'}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/default-thumbnail.svg';
                          e.target.onerror = null;
                        }}
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => handlePlayPause(music)}
                          disabled={!audioUrl}
                          className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 ${
                            !audioUrl ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          aria-label={`Play ${music.title || 'music'}`}
                          title={audioUrl ? `Play ${music.title || 'music'}` : 'No audio available'}
                        >
                          {isPlaying ? (
                            <FaPause className="text-white text-lg" />
                          ) : (
                            <FaPlay className="text-white text-lg ml-1" />
                          )}
                        </button>
                      </div>

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
                        {music.title || 'Untitled Track'}
                      </h3>
                      <p className="text-indigo-200 mb-3 line-clamp-1">
                        {music.artist || 'Unknown Artist'}
                      </p>
                      <p className="text-indigo-300 text-sm mb-4">
                        Duration: {formatDuration(music.duration)}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleRemoveFavorite(music.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                          title="Remove from favorites"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                        
                        {audioUrl && (
                          <button
                            onClick={() => handlePlayPause(music)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                              isPlaying
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                            }`}
                          >
                            {isPlaying ? 'Pause' : 'Play'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
