import React, { useState, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

export default function MusicList({ musics, onDelete, userLoggedIn }) {
  const [playingId, setPlayingId] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const audioRefs = useRef({});

  const handlePlayPause = (id) => {
    if (playingId === id) {
      // Pause current audio
      if (audioRefs.current[id]) {
        audioRefs.current[id].pause();
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      
      // Start new audio
      setPlayingId(id);
    }
  };

  const handlePlayIconClick = (music) => {
    const audioUrl = getAudioUrl(music);
    
    if (audioUrl) {
      // Show audio player if hidden
      if (!showAudioPlayer[music.id]) {
        setShowAudioPlayer(prev => ({
          ...prev,
          [music.id]: true
        }));
      }
      
      // Start playing the track
      setTimeout(() => {
        if (audioRefs.current[music.id]) {
          audioRefs.current[music.id].play();
          setPlayingId(music.id);
        }
      }, 100);
    } else {
      alert('No audio file available for this track');
    }
  };

  const handleDelete = async (musicId) => {
    if (!window.confirm('Are you sure you want to delete this music track?')) {
      return;
    }

    setDeletingId(musicId);
    setDeleteError('');

    try {
      await onDelete(musicId);
      // Success - the parent component will update the musics state
    } catch (error) {
      setDeleteError(`Failed to delete track: ${error.message}`);
      // Reset deleting state after a delay
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  const getThumbnailUrl = (music) => {
    // Check various possible thumbnail fields from Firestore
    if (music.thumbnailUrl) return music.thumbnailUrl;
    if (music.thumbnailFile) return music.thumbnailFile;
    if (music.thumbnail) return music.thumbnail;
    if (music.imageUrl) return music.imageUrl;
    if (music.image) return music.image;
    
    return null;
  };

  const getAudioUrl = (music) => {
    // Check various possible audio fields from Firestore
    
    if (music.musicUrl) {
      return music.musicUrl;
    }
    if (music.musicFile) {
      return music.musicFile;
    }
    if (music.audioUrl) {
      return music.audioUrl;
    }
    if (music.audio) {
      return music.audio;
    }
    if (music.file) {
      return music.file;
    }
    if (music.url) {
      return music.url;
    }
    
    return null;
  };

  if (musics.length === 0) {
    return <p className="text-center text-gray-600 mt-6">No musics found.</p>;
  }

  return (
    <div>
      {/* Error message */}
      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {deleteError}
        </div>
      )}

      <ul className="space-y-6 max-w-4xl mx-auto p-4">
        {musics.map((music) => {
          const thumbnailUrl = getThumbnailUrl(music);
          const audioUrl = getAudioUrl(music);
          const isAudioPlayerVisible = showAudioPlayer[music.id];
          const isDeleting = deletingId === music.id;

          return (
            <li
              key={music.id}
              className={`bg-white border border-gray-300 rounded-lg shadow-md p-6 flex items-center space-x-6 hover:shadow-xl transition ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-md shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={`${music.title} thumbnail`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="flex flex-col items-center justify-center text-gray-400"
                  style={{ display: thumbnailUrl ? 'none' : 'flex' }}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-center mt-1">No Image</span>
                </div>
              </div>

              {/* Info and Player */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-indigo-600 mb-1">{music.title}</h3>
                <p className="text-gray-700"><strong>Artist:</strong> {music.artist}</p>
                <p className="text-gray-700"><strong>Genre:</strong> {music.genre}</p>
                <p className="text-gray-700 mb-2"><strong>Duration:</strong> {music.duration} mins</p>

                {/* Audio player toggle button */}
                {audioUrl && (
                  <div className="mb-2">
                    <button
                      onClick={() => setShowAudioPlayer(prev => ({
                        ...prev,
                        [music.id]: !prev[music.id]
                      }))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 underline focus:outline-none"
                    >
                      {isAudioPlayerVisible ? 'Hide Audio Player' : 'Show Audio Player'}
                    </button>
                  </div>
                )}

                {/* Audio player */}
                {audioUrl && isAudioPlayerVisible && (
                  <audio
                    ref={el => audioRefs.current[music.id] = el}
                    src={audioUrl}
                    controls
                    className="w-full mt-2 rounded-md"
                    onPlay={() => setPlayingId(music.id)}
                    onPause={() => setPlayingId(null)}
                    onEnded={() => setPlayingId(null)}
                  />
                )}
              </div>

              {/* Play Icon Button - Triggers audio player and starts playback */}
              <button
                onClick={() => handlePlayIconClick(music)}
                disabled={!audioUrl || isDeleting}
                className={`p-2 rounded-lg border-2 border-indigo-600 hover:border-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-4 transition-all duration-200 ${
                  !audioUrl || isDeleting
                    ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                    : 'hover:scale-110 cursor-pointer bg-indigo-50 hover:bg-indigo-100'
                }`}
                aria-label={`Play ${music.title}`}
                title={audioUrl ? `Play ${music.title}` : 'No audio available'}
              >
                <FaPlay size={28} className={!audioUrl ? 'text-gray-400' : 'text-indigo-600'} />
              </button>

              {/* Delete Button for logged-in users */}
              {userLoggedIn && (
                <button
                  onClick={() => handleDelete(music.id)}
                  disabled={isDeleting}
                  className={`px-4 py-2 rounded shadow transition ${
                    isDeleting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
