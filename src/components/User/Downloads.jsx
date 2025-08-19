import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaMusic, FaExclamationTriangle, FaSpinner, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaHeart, FaShare } from 'react-icons/fa';
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

  // Handle audio play/pause
  const handlePlayPause = (musicId) => {
    const audio = audioRefs.current[musicId];
    if (!audio) return;

    if (currentlyPlaying && currentlyPlaying !== musicId) {
      // Pause currently playing audio
      const currentAudio = audioRefs.current[currentlyPlaying];
      if (currentAudio) {
        currentAudio.pause();
        setAudioStates(prev => ({
          ...prev,
          [currentlyPlaying]: { ...prev[currentlyPlaying], isPlaying: false }
        }));
      }
    }

    if (audioStates[musicId]?.isPlaying) {
      audio.pause();
      setCurrentlyPlaying(null);
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], isPlaying: false }
      }));
    } else {
      audio.play();
      setCurrentlyPlaying(musicId);
      setAudioStates(prev => ({
        ...prev,
        [musicId]: { ...prev[musicId], isPlaying: true }
      }));
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
  };

  // Format time for display
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // No need to fetch music details separately - backend provides them
  // useEffect(() => {
  //   if (downloads.length > 0) {
  //     downloads.forEach(download => {
  //       if (!musicDetails[download.musicId] && !loadingDetails[download.musicId]) {
  //         fetchMusicDetails(download.musicId);
  //       }
  //     });
  //   }
  // }, [downloads, musicDetails, loadingDetails]);

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Downloads</h1>
            <p className="text-gray-600">Track your music download history</p>
          </div>
          
          <div className="text-center py-12">
            <FaMusic className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please login to view your downloads</p>
            <a
              href="/user/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Downloads</h1>
              <p className="text-gray-600">Track your music download history</p>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Skeleton loader for downloads */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <li key={i}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="ml-4">
                          <div className="bg-gray-200 h-4 w-32 rounded animate-pulse mb-2"></div>
                          <div className="bg-gray-200 h-3 w-24 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Downloads</h1>
            <p className="text-gray-600">Track your music download history</p>
          </div>
          
          <div className="text-center py-12">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Downloads</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchDownloads}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/user/musics"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Browse Music
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Downloads</h1>
            <p className="text-gray-600">Track your music download history and play your downloaded tracks</p>
          </div>
          <button
            onClick={fetchDownloads}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <FaDownload className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Downloads List */}
        {downloads.length === 0 ? (
          <div className="text-center py-12">
            <FaDownload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
            <p className="text-gray-500 mb-4">Start building your music library by downloading some tracks.</p>
            <div className="space-x-4">
              <a
                href="/user/musics"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Browse Music
              </a>
              <button
                onClick={fetchDownloads}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FaDownload className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {downloads.map((download) => {
              const music = download;
              const audioState = audioStates[music.musicId] || { isPlaying: false, currentTime: 0, duration: 0, volume: 1, isMuted: false };
              
              return (
                <div key={`${download.userId}-${download.musicId}-${download.downloadedAt}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                     {/* Music Info Header */}
                   <div className="p-4 border-b border-gray-100">
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
                           <FaMusic className="h-20 w-20 text-indigo-500" />
                         )}
                       </div>
                       <div className="ml-4 flex-1 min-w-0">
                         <h3 className="text-base font-semibold text-gray-900 truncate">
                           {music?.title || `Music ID: ${download.musicId}`}
                         </h3>
                         <p className="text-sm text-gray-500 truncate mb-1">
                           {music?.artist || 'Unknown Artist'}
                         </p>
                         <p className="text-xs text-gray-400 mb-2">
                           Duration: {formatTime(audioState.duration)}
                         </p>
                         
                         {/* Action Buttons */}
                         <div className="flex items-center space-x-3">
                           <button
                             className="text-gray-400 hover:text-red-500 transition-colors"
                             title="Add to favorites"
                           >
                             <FaHeart className="w-4 h-4" />
                           </button>
                           <button
                             className="text-gray-400 hover:text-blue-500 transition-colors"
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
                      ref={(el) => (audioRefs.current[music.musicId] = el)}
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
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{formatTime(audioState.currentTime)}</span>
                        <span>{formatTime(audioState.duration)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={audioState.duration || 0}
                        value={audioState.currentTime}
                        onChange={(e) => handleSeek(music.musicId, parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(audioState.currentTime / (audioState.duration || 1)) * 100}%, #e5e7eb ${(audioState.currentTime / (audioState.duration || 1)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                    </div>

                    {/* Volume Controls */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleMuteToggle(music.musicId)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
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
                        className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>


                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Download Count and Stats */}
        {downloads.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">
                Total downloads: <span className="font-semibold text-gray-900">{downloads.length}</span>
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
            border-radius: 50%;
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
