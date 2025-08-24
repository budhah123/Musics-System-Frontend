import React, { useState, useEffect } from 'react';
import { FaDownload, FaMusic, FaExclamationTriangle, FaSpinner, FaPlay, FaPause, FaHeart, FaShare } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useDownloads } from '../../context/DownloadsContext';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
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
  const { toggleTrackPlay, isTrackPlaying } = useMusicPlayer();
  const [downloadingStates, setDownloadingStates] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDownloads();
    }
  }, [isAuthenticated, user]);

  // Handle audio play/pause
  const handlePlayPause = (music) => {
    toggleTrackPlay(music);
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
                  {downloads.filter(d => d.category).length}
                </div>
                                  <div className="text-indigo-200 font-medium">Categories</div>
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
                const isPlaying = isTrackPlaying(music.musicId);
                
                return (
                  <div 
                    key={`${download.userId}-${download.musicId}-${download.downloadedAt}`} 
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
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
                          <FaMusic className="h-20 w-20 text-indigo-400" />
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => handlePlayPause(music)}
                          disabled={!music?.url}
                          className={`w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 ${
                            !music?.url ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                          aria-label={`Play ${music.title || 'music'}`}
                          title={music?.url ? `Play ${music.title || 'music'}` : 'No audio available'}
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
                        {music?.title || `Music ID: ${download.musicId}`}
                      </h3>
                      <p className="text-indigo-200 mb-3 line-clamp-1">
                        {music?.artist || 'Unknown Artist'}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-between items-center mb-4">
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
                        
                        {music?.url && (
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

                      {/* Download Again Button */}
                      <div className="pt-4 border-t border-white/20">
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
    </div>
  );
}
