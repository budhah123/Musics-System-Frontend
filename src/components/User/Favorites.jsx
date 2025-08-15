import React, { useEffect, useState } from 'react';
import { FaHeart, FaMusic, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import { fetchMusics } from '../../api/api';

export default function Favorites() {
  const { favorites, loading, error, removeFavorite, clearError } = useFavorites();
  const { user } = useAuth();
  const [musicData, setMusicData] = useState({});
  const [playingId, setPlayingId] = useState(null);
  const [audioRefs] = useState({});

  // Fetch music details for favorites
  useEffect(() => {
    const fetchMusicDetails = async () => {
      try {
        const allMusic = await fetchMusics();
        const musicMap = {};
        allMusic.forEach(music => {
          musicMap[music.id] = music;
        });
        setMusicData(musicMap);
      } catch (error) {
        console.error('Failed to fetch music details:', error);
      }
    };

    if (favorites.length > 0) {
      fetchMusicDetails();
    }
  }, [favorites]);

  const handlePlayPause = (musicId) => {
    if (playingId === musicId) {
      setPlayingId(null);
    } else {
      setPlayingId(musicId);
    }
  };

  const handleRemoveFavorite = async (musicId) => {
    const success = await removeFavorite(musicId);
    if (success) {
      // Stop playing if the removed music was playing
      if (playingId === musicId) {
        setPlayingId(null);
      }
    }
  };

  const getThumbnailUrl = (music) => {
    return music.thumbnailUrl || music.thumbnail || music.imageUrl || '/default-thumbnail.svg';
  };

  const getAudioUrl = (music) => {
    return music.audioUrl || music.audio || music.musicUrl || music.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <FaMusic className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Favorites</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={clearError}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-4">
              Start building your favorites collection by adding music from the music library.
            </p>
            <a
              href="/user/musics"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Browse Music Library
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length} favorite track{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const music = musicData[favorite.musicId];
            if (!music) return null;

            const thumbnailUrl = getThumbnailUrl(music);
            const audioUrl = getAudioUrl(music);
            const isPlaying = playingId === music.id;

            return (
              <div
                key={favorite.musicId}
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
                      e.target.onerror = null;
                    }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    {audioUrl ? (
                      <button
                        onClick={() => handlePlayPause(music.id)}
                        className="p-3 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 hover:scale-110 transition-all duration-200"
                        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${music.title || 'music'}`}
                      >
                        {isPlaying ? (
                          <FaPause size={20} className="text-gray-800" />
                        ) : (
                          <FaPlay size={20} className="text-gray-800" />
                        )}
                      </button>
                    ) : (
                      <div className="p-3 rounded-full bg-gray-400 cursor-not-allowed">
                        <FaPlay size={20} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Genre Badge */}
                  {music.genre && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {music.genre}
                      </span>
                    </div>
                  )}

                  {/* Favorite Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaHeart size={12} className="mr-1" />
                      Favorite
                    </span>
                  </div>
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
                  {audioUrl && (
                    <div className="mb-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <audio
                          ref={el => audioRefs[music.id] = el}
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
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {/* Remove from Favorites Button */}
                      <button
                        onClick={() => handleRemoveFavorite(music.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Remove from favorites"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    {/* Favorite Status */}
                    <div className="flex items-center text-red-500">
                      <FaHeart size={16} />
                      <span className="ml-1 text-sm font-medium">Favorited</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
