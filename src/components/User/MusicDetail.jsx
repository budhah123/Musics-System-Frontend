import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchMusics, saveMusicSelection } from '../../api/api';
import { getOrCreateDeviceId, getUserId } from '../../utils/deviceUtils';
import { FaPlay, FaPause, FaHeart, FaArrowLeft, FaCheck } from 'react-icons/fa';

export default function MusicDetail() {
  const { musicId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, addToast } = useAuth();
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showPreviewMessage, setShowPreviewMessage] = useState(false);
  const audioRef = useRef(null);
  const previewTimerRef = useRef(null);

  useEffect(() => {
    loadMusicDetails();
    checkSelectionStatus();
    // Removed automatic API call to prevent double calls
    // handleAutoSelection();
  }, [musicId]);

  useEffect(() => {
    // Cleanup audio and timer on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const loadMusicDetails = async () => {
    try {
      setLoading(true);
      const allMusics = await fetchMusics();
      const foundMusic = allMusics.find(m => (m.id || m._id) === musicId);
      
      if (foundMusic) {
        setMusic(foundMusic);
        // Initialize audio element
        if (foundMusic.url) {
          audioRef.current = new Audio(foundMusic.url);
          audioRef.current.preload = 'metadata';
        }
      } else {
        addToast('Music not found', 'error');
        navigate('/user');
      }
    } catch (error) {
      console.error('Failed to load music details:', error);
      addToast('Failed to load music details', 'error');
      navigate('/user');
    } finally {
      setLoading(false);
    }
  };

  const checkSelectionStatus = async () => {
    try {
      const userId = getUserId();
      const deviceId = !isAuthenticated ? getOrCreateDeviceId() : null;
      
      // Call API to check if music is already selected
      const response = await fetch(`https://musics-system-2.onrender.com/selection-musics?${userId ? `userId=${userId}` : `deviceId=${deviceId}`}`);
      
      if (response.ok) {
        const selections = await response.json();
        const isAlreadySelected = selections.some(selection => 
          selection.musicId === musicId || selection.id === musicId
        );
        setIsSelected(isAlreadySelected);
      }
    } catch (error) {
      console.error('Failed to check selection status:', error);
      // Don't show error toast for status check
    }
  };

  const handleSelection = async () => {
    // Don't call API if already selected
    if (isSelected) {
      return;
    }

    try {
      const userId = getUserId();
      const deviceId = !isAuthenticated ? getOrCreateDeviceId() : null;
      
      await saveMusicSelection(musicId, userId, deviceId);
      setIsSelected(true);
      addToast('Music added to your selection!', 'success');
    } catch (error) {
      console.error('Failed to save music selection:', error);
      addToast('Failed to save music selection', 'error');
    }
  };

  const handlePlayPreview = () => {
    if (!audioRef.current || !music?.url) {
      addToast('Audio not available', 'error');
      return;
    }

    setIsPlaying(true);
    setShowPreviewMessage(false);
    
    // Start playing from beginning
    audioRef.current.currentTime = 0;
    audioRef.current.play();

    // Set 4-second timer
    previewTimerRef.current = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setShowPreviewMessage(true);
        
        // Auto-hide message after 5 seconds
        setTimeout(() => setShowPreviewMessage(false), 5000);
      }
    }, 4000);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p className="text-indigo-200 text-lg">Loading music details...</p>
        </div>
      </div>
    );
  }

  if (!music) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Music not found</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-indigo-200 hover:text-white transition-colors duration-300 mb-6"
          >
            <FaArrowLeft size={20} />
            <span className="text-lg font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Music Detail Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Album Art */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative group">
                {music.thumbnail ? (
                  <img
                    src={music.thumbnail}
                    alt={music.title || 'Music thumbnail'}
                    className="w-80 h-80 object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/default-thumbnail.svg';
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-80 h-80 bg-indigo-900 rounded-2xl flex items-center justify-center">
                    <span className="text-8xl">🎵</span>
                  </div>
                )}
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg">
                      <FaCheck size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Music Info and Controls */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Music Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">
                  {music.title || `Music ID: ${music.id || music._id}`}
                </h1>
                <p className="text-2xl text-indigo-200 mb-2">
                  {music.artist || 'Unknown Artist'}
                </p>
                {music.category && (
                  <span className="inline-block px-3 py-1 bg-indigo-500/80 text-white text-sm rounded-full backdrop-blur-sm">
                    {music.category}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={isPlaying ? handlePause : handlePlayPreview}
                  disabled={!music?.url}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  } ${
                    !music?.url ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <FaPause size={20} />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <FaPlay size={20} />
                      <span>Play Preview (4s)</span>
                    </>
                  )}
                </button>

                {/* Selection Button */}
                <button
                  onClick={handleSelection}
                  disabled={isSelected}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
                    isSelected
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <FaCheck size={20} />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <FaHeart size={20} />
                      <span>Add to Selection</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Message */}
              {showPreviewMessage && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <p className="text-yellow-200 font-medium text-lg">
                        Preview Ended
                      </p>
                      <p className="text-yellow-300">
                        You can only play 4 seconds. Please login or subscribe to play full music!
                      </p>
                    </div>
                  </div>
                </div>
              )}

                             {/* Additional Info */}
               <div className="pt-6 border-t border-white/20">
                 <p className="text-indigo-300 text-sm">
                   This is a preview version. Full access requires login or subscription.
                 </p>
                 <p className="text-indigo-300 text-sm mt-2">
                   💡 Click "Add to Selection" to save this music to your collection.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
