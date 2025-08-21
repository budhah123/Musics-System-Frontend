import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaMusic, FaExclamationTriangle, FaSpinner, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaShare, FaClock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useDownloads } from '../../context/DownloadsContext';
import axios from 'axios';

export default function Downloads() {
  const { user, isAuthenticated, addToast } = useAuth();
  const { 
    downloads, 
    loading, 
    error, 
    setDownloadsData, 
    setLoadingState, 
    setErrorState, 
    clearError 
  } = useDownloads();
  const [downloadingStates, setDownloadingStates] = useState({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioStates, setAudioStates] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDownloads();
    }
  }, [isAuthenticated, user]);

  // Initialize audio states for each download
  useEffect(() => {
    if (downloads.length > 0) {
      const newAudioStates = {};
      downloads.forEach(download => {
        newAudioStates[download.musicId] = {
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          volume: 1,
          isMuted: false
        };
      });
      setAudioStates(newAudioStates);
    }
  }, [downloads]);

  // Cleanup audio elements when component unmounts or downloads change
  useEffect(() => {
    return () => {
      // Pause all audio elements and clean up
      Object.keys(audioRefs.current).forEach(id => {
        if (audioRefs.current[id]) {
          audioRefs.current[id].pause();
          audioRefs.current[id].src = '';
        }
      });
      setCurrentlyPlaying(null);
    };
  }, [downloads]);

  // Final cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Ensure all audio is stopped when component unmounts
      Object.keys(audioRefs.current).forEach(id => {
        if (audioRefs.current[id]) {
          const audio = audioRefs.current[id];
          // Remove event listeners to prevent memory leaks
          audio.removeEventListener('play', () => {});
          audio.removeEventListener('pause', () => {});
          audio.pause();
          audio.src = '';
          audio.load();
        }
      });
      audioRefs.current = {};
      setCurrentlyPlaying(null);
    };
  }, []);

  // Helper function to pause all other audio elements
  const pauseAllOtherAudio = (excludeMusicId) => {
    Object.keys(audioRefs.current).forEach(id => {
      if (id !== excludeMusicId && audioRefs.current[id]) {
        const otherAudio = audioRefs.current[id];
        if (!otherAudio.paused) {
          otherAudio.pause();
          // Update the audio state to reflect that it's no longer playing
          setAudioStates(prev => ({
            ...prev,
            [id]: { ...prev[id], isPlaying: false }
          }));
        }
      }
    });
    
    // Also update the currentlyPlaying state if it was one of the paused audios
    if (currentlyPlaying && currentlyPlaying !== excludeMusicId) {
      setCurrentlyPlaying(null);
    }
  };

  // Helper function to reset all audio states
  const resetAllAudioStates = () => {
    setCurrentlyPlaying(null);
    setAudioStates(prev => {
      const newStates = {};
      Object.keys(prev).forEach(id => {
        newStates[id] = { ...prev[id], isPlaying: false, currentTime: 0 };
      });
      return newStates;
    });
  };

  // Handle audio play/pause
  const handlePlayPause = (musicId) => {
    const audio = audioRefs.current[musicId];
    if (!audio) return;

    // First, pause all other audio elements
    pauseAllOtherAudio(musicId);

    if (audioStates[musicId]?.isPlaying) {
      // Pause current audio
      audio.pause();
      setCurrentlyPlaying(null);
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], isPlaying: false }
      }));
    } else {
      // Play selected audio
      // Ensure the audio is properly loaded before playing
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA
        audio.load();
      }
      
      // Set the playing state before attempting to play
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], isPlaying: true }
      }));
      
      audio.play().then(() => {
        setCurrentlyPlaying(musicId);
      }).catch((error) => {
        console.error('Failed to play audio:', error);
        setAudioStates(prev => ({
          ...prev,
          [musicId]: { ...prev[musicId], isPlaying: false }
        }));
        setCurrentlyPlaying(null);
      });
    }
  };

  // Handle audio time update
  const handleTimeUpdate = (musicId) => {
    const audio = audioRefs.current[musicId];
    if (audio) {
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { 
          ...prev[musicId], 
          currentTime: audio.currentTime,
          duration: audio.duration || 0
        }
      }));
    }
  };

  // Handle seek
  const handleSeek = (musicId, newTime) => {
    const audio = audioRefs.current[musicId];
    if (audio) {
      audio.currentTime = newTime;
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], currentTime: newTime }
      }));
    }
  };

  // Handle volume change
  const handleVolumeChange = (musicId, newVolume) => {
    const audio = audioRefs.current[musicId];
    if (audio) {
      audio.volume = newVolume;
      setAudioStates(prev => ({ 
        ...prev,
        [musicId]: { ...prev[musicId], volume: newVolume }
      }));
    }
  };

  // Handle mute toggle
  const handleMuteToggle = (musicId) => {
    const audio = audioRefs.current[musicId];
    if (audio) {
      const newMutedState = !audioStates[musicId]?.isMuted;
      audio.muted = newMutedState;
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], isMuted: newMutedState }
      }));
    }
  };

  // Handle audio ended
  const handleAudioEnded = (musicId) => {
    setCurrentlyPlaying(null);
    setAudioStates(prev => ({
      ...prev,
      [musicId]: { ...prev[musicId], isPlaying: false, currentTime: 0 }
    }));
    
    // Also pause the audio element to ensure it's completely stopped
    const audio = audioRefs.current[musicId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchDownloads = async () => {
    try {
      setLoadingState(true);
      setErrorState(null);
      
      console.log('User object:', user); // Debug log
      const userId = user?.id || user?.userId;
      console.log('Using userId:', userId); // Debug log
      
      if (!userId) {
        throw new Error('User ID not available. Please try logging in again.');
      }
      
      const response = await fetch(`https://musics-system-2.onrender.com/downloads/users/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setDownloadsData([]);
          return;
        }
        throw new Error(`Failed to fetch downloads: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Downloads response:', data); // Debug log
      
      // Ensure data is an array and has the expected structure
      const downloadsArray = Array.isArray(data) ? data : [];
      
      // Log each download record to debug the structure
      downloadsArray.forEach((download, index) => {
        console.log(`Download ${index}:`, download);
        console.log(`Music ID: ${download.musicId}, User ID: ${download.userId}`);
      });
      
      setDownloadsData(downloadsArray);
      
      // Backend already provides music details, no need to fetch separately
      // Log the structure to verify what we're getting
      if (downloadsArray.length > 0) {
        downloadsArray.forEach((download, index) => {
          console.log(`Download ${index} full data:`, download);
        });
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      
      let errorMessage = 'Failed to fetch downloads';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No downloads found.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrorState(errorMessage);
    } finally {
      setLoadingState(false);
    }
  };

  const handleDownloadAgain = async (musicId, musicUrl) => {
    if (!musicUrl) {
      addToast('Music URL not available', 'error');
      return;
    }

    setDownloadingStates(prev => ({ ...prev, [musicId]: true }));
    
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
      const response = await axios.get(musicUrl, {
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
      // Find the download record to get the title
      const downloadRecord = downloads.find(d => d.musicId === musicId);
      const title = downloadRecord?.title || 'music';
      link.download = `${title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      window.URL.revokeObjectURL(url);
      
      // Add download to context for real-time updates
      // Note: addDownload function is available from DownloadsContext
      // but we don't need to call it here since we're just re-downloading
      
      // Show success toast
      addToast(`Successfully downloaded ${title}!`, 'success');
      
      // Reset downloading state after a delay
      setTimeout(() => {
        setDownloadingStates(prev => ({ ...prev, [musicId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      
      let errorMessage = 'Download failed. Please try again.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Download timed out. Please try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Music file not found. Please contact support.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast(errorMessage, 'error');
      setDownloadingStates(prev => ({ ...prev, [musicId]: false }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-red-300 text-lg mb-2">Authentication Required</h3>
              <p className="text-red-200 mb-6">Please login to view your downloads</p>
              <a
                href="/user/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-block"
              >
                Login
              </a>
            </div>
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
              <h3 className="text-indigo-200 text-lg mb-2">Loading Your Downloads</h3>
              <p className="text-indigo-300">Please wait while we fetch your download history...</p>
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
              <h3 className="text-red-300 text-lg mb-2">Error Loading Downloads</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchDownloads}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
                <a
                  href="/user/musics"
                  className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 border border-white/30"
                >
                  Browse Music
                </a>
              </div>
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-6 animate-float">
            <FaDownload className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            My Downloads
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg">
            Track your music download history and play your downloaded tracks
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Download Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-green-300 mb-2">{downloads.length}</div>
                <div className="text-indigo-200 font-medium">Total Downloads</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-indigo-300 mb-2">
                  {downloads.filter(d => d.genre).length}
                </div>
                <div className="text-indigo-200 font-medium">Genres</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-300 mb-2">
                  {downloads.filter(d => d.artist).length}
                </div>
                <div className="text-indigo-200 font-medium">Artists</div>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                <FaDownload className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <h3 className="text-indigo-200 text-lg mb-2">No downloads yet</h3>
                <p className="text-indigo-300 mb-6">Start building your music library by downloading some tracks.</p>
                <div className="space-x-4">
                  <a
                    href="/user/musics"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-block"
                  >
                    Browse Music
                  </a>
                  <button
                    onClick={fetchDownloads}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 border border-white/30 inline-block"
                  >
                    <FaDownload className="h-4 w-4 mr-2 inline" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎵 Your Downloaded Tracks</h2>
              <p className="text-lg text-indigo-200">Play, manage, and enjoy your downloaded music</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {downloads.map((download, index) => {
                const music = download;
                const audioState = audioStates[music.musicId] || { isPlaying: false, currentTime: 0, duration: 0, volume: 1, isMuted: false };
                
                return (
                  <div 
                    key={`${download.userId}-${download.musicId}-${download.downloadedAt}`} 
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Music Info Header */}
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center mb-3">
                        <div className="flex-shrink-0">
                          {music?.thumbnail ? (
                            <img
                              src={music.thumbnail}
                              alt={music.title || 'Music thumbnail'}
                              className="w-20 h-20 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.src = '/default-thumbnail.svg';
                                e.target.onerror = null;
                              }}
                            />
                          ) : (
                            <FaMusic className="h-20 w-20 text-indigo-400" />
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white truncate">
                            {music?.title || `Music ID: ${download.musicId}`}
                          </h3>
                          <p className="text-sm text-indigo-200 truncate mb-1">
                            {music?.artist || 'Unknown Artist'}
                          </p>
                          <p className="text-xs text-indigo-300 mb-2">
                            Duration: {formatTime(audioState.duration)}
                          </p>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-indigo-300 hover:text-red-400 transition-colors"
                              title="Add to favorites"
                            >
                              <FaHeart className="w-4 h-4" />
                            </button>
                            <button
                              className="text-indigo-300 hover:text-blue-400 transition-colors"
                              title="Share"
                            >
                              <FaShare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="p-4">
                      {/* Hidden audio element */}
                      <audio
                        ref={(el) => {
                          if (el) {
                            // Clean up any existing audio element
                            if (audioRefs.current[music.musicId]) {
                              audioRefs.current[music.musicId].pause();
                              audioRefs.current[music.musicId].src = '';
                            }
                            audioRefs.current[music.musicId] = el;
                            
                            // Ensure this audio element is properly initialized
                            el.volume = audioStates[music.musicId]?.volume || 1;
                            el.muted = audioStates[music.musicId]?.isMuted || false;
                            
                            // Add event listeners to ensure proper state management
                            el.addEventListener('play', () => {
                              // Ensure only this audio is playing
                              pauseAllOtherAudio(music.musicId);
                              setCurrentlyPlaying(music.musicId);
                              setAudioStates(prev => ({
                                ...prev,
                                [music.musicId]: { ...prev[music.musicId], isPlaying: true }
                              }));
                            });
                            
                            el.addEventListener('pause', () => {
                              if (currentlyPlaying === music.musicId) {
                                setCurrentlyPlaying(null);
                              }
                              setAudioStates(prev => ({
                                ...prev,
                                [music.musicId]: { ...prev[music.musicId], isPlaying: false }
                              }));
                            });
                          }
                        }}
                        src={music?.url}
                        onTimeUpdate={() => handleTimeUpdate(music.musicId)}
                        onEnded={() => handleAudioEnded(music.musicId)}
                        onLoadedMetadata={() => handleTimeUpdate(music.musicId)}
                        preload="metadata"
                      />

                      {/* Play/Pause Button */}
                      <div className="flex justify-center mb-4">
                        <button
                          onClick={() => handlePlayPause(music.musicId)}
                          disabled={!music?.url}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            !music?.url
                              ? 'bg-gray-300 cursor-not-allowed'
                              : audioState.isPlaying
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          }`}
                        >
                          {audioState.isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5 ml-1" />}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-indigo-300 mb-1">
                          <span>{formatTime(audioState.currentTime)}</span>
                          <span>{formatTime(audioState.duration)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={audioState.duration || 0}
                          value={audioState.currentTime}
                          onChange={(e) => handleSeek(music.musicId, parseFloat(e.target.value))}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(audioState.currentTime / (audioState.duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(audioState.currentTime / (audioState.duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                      </div>

                      {/* Volume Controls */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleMuteToggle(music.musicId)}
                          className="text-indigo-300 hover:text-indigo-200 transition-colors"
                        >
                          {audioState.isMuted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={audioState.isMuted ? 0 : audioState.volume}
                          onChange={(e) => handleVolumeChange(music.musicId, parseFloat(e.target.value))}
                          className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Download Again Button */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <button
                          onClick={() => handleDownloadAgain(music.musicId, music.url)}
                          disabled={downloadingStates[music.musicId]}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                            downloadingStates[music.musicId]
                              ? 'bg-blue-500 text-white cursor-wait'
                              : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
                          }`}
                        >
                          {downloadingStates[music.musicId] ? (
                            <div className="flex items-center justify-center">
                              <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                              Downloading...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <FaDownload className="w-4 h-4 mr-2" />
                              Download Again
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Download Count and Stats */}
        {downloads.length > 0 && (
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass rounded-lg p-4 inline-block border border-white/20">
              <p className="text-sm text-indigo-200">
                Total downloads: <span className="font-semibold text-white">{downloads.length}</span>
              </p>
            </div>
          </div>
        )}
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
