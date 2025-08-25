import React, { useEffect, useState } from 'react';
import { fetchMusics, deleteMusic, fetchSelectedMusics } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import MusicList from './MusicList';
import { FaMusic, FaExclamationTriangle, FaSpinner, FaHeart, FaPlay, FaDownload } from 'react-icons/fa';
import { getUserId } from '../../utils/deviceUtils';

export default function UserDashboard() {
  const [musics, setMusics] = useState([]);
  const [selectedMusics, setSelectedMusics] = useState([]);
  const [otherMusics, setOtherMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, token, addToast } = useAuth();

  useEffect(() => {
    if (user && token) {
      loadMusics();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  // Refresh selected musics when user changes
  useEffect(() => {
    if (user && token && musics.length > 0) {
      refreshSelectedMusics();
    }
  }, [user, token, musics.length]);

  const loadMusics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all musics
      const allMusics = await fetchMusics();
      
      if (!allMusics || !Array.isArray(allMusics)) {
        setMusics([]);
        setError('Invalid data received from server');
        return;
      }
      
      setMusics(allMusics);
      
      // Load selected musics for the user
      const userId = getUserId();
      console.log('UserDashboard: Loading musics for userId:', userId);
      
      if (userId) {
        try {
          setSelectedLoading(true);
          console.log('UserDashboard: Fetching selected musics from API...');
          const selectedData = await fetchSelectedMusics(userId);
          console.log('UserDashboard: Selected musics API response:', selectedData);
          
          if (selectedData && Array.isArray(selectedData)) {
            const selectedIds = new Set(selectedData.map(item => item.musicId || item.id));
            console.log('UserDashboard: Selected music IDs:', Array.from(selectedIds));
            
            // Separate selected and other musics
            const selected = allMusics.filter(music => {
              const musicId = music.id || music._id;
              const isSelected = selectedIds.has(musicId);
              console.log(`Music ${musicId} (${music.title}) - Selected: ${isSelected}`);
              return isSelected;
            });
            const others = allMusics.filter(music => !selectedIds.has(music.id || music._id));
            
            console.log('UserDashboard: Filtered selected musics:', selected.length);
            console.log('UserDashboard: Filtered other musics:', others.length);
            
            setSelectedMusics(selected);
            setOtherMusics(others);
          } else {
            console.warn('UserDashboard: Invalid selected musics data format:', selectedData);
            setSelectedMusics([]);
            setOtherMusics(allMusics);
          }
        } catch (selectedErr) {
          console.error('UserDashboard: Failed to load selected musics:', selectedErr);
          addToast(`Failed to load selected musics: ${selectedErr.message}`, 'error');
          // If we can't load selected musics, treat all as other musics
          setSelectedMusics([]);
          setOtherMusics(allMusics);
        } finally {
          setSelectedLoading(false);
        }
      } else {
        console.warn('UserDashboard: No userId found, treating all musics as other musics');
        setSelectedMusics([]);
        setOtherMusics(allMusics);
      }
    } catch (err) {
      setError(err.message || 'Failed to load music library');
      addToast(`Failed to load music: ${err.message}`, 'error');
      setMusics([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMusic = async (id) => {
    try {
      await deleteMusic(token, id);
      // Remove the deleted music from state immediately
      setMusics(prevMusics => prevMusics.filter(music => music.id !== id));
      addToast('Music deleted successfully!', 'success');
    } catch (err) {
      addToast(`Failed to delete music: ${err.message}`, 'error');
      throw err; // Re-throw so the MusicList component can handle the error
    }
  };

  const refreshSelectedMusics = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      setSelectedLoading(true);
      console.log('UserDashboard: Refreshing selected musics...');
      const selectedData = await fetchSelectedMusics(userId);
      console.log('UserDashboard: Refreshed selected musics:', selectedData);
      
      if (selectedData && Array.isArray(selectedData)) {
        const selectedIds = new Set(selectedData.map(item => item.musicId || item.id));
        const selected = musics.filter(music => selectedIds.has(music.id || music._id));
        const others = musics.filter(music => !selectedIds.has(music.id || music._id));
        
        setSelectedMusics(selected);
        setOtherMusics(others);
        addToast('Selected musics refreshed!', 'success');
      }
    } catch (error) {
      console.error('UserDashboard: Failed to refresh selected musics:', error);
      addToast(`Failed to refresh selected musics: ${error.message}`, 'error');
    } finally {
      setSelectedLoading(false);
    }
  };

  // Don't render if user is not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
            <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-300 text-lg mb-2">Authentication Required</h3>
            <p className="text-red-200">Please log in to access your music library.</p>
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full mb-6 animate-float">
            <FaMusic className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Your Music Library
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg">
            Welcome back, {user?.name || user?.email}! Browse and enjoy your personal music collection.
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Library Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-indigo-300 mb-2">{musics.length}</div>
                <div className="text-indigo-200 font-medium">Total Tracks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-green-300 mb-2">
                  {selectedMusics.length}
                </div>
                <div className="text-indigo-200 font-medium">Selected Tracks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-300 mb-2">
                  {musics.filter(m => m.artist).length}
                </div>
                <div className="text-indigo-200 font-medium">Artists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-blue-300 mb-2">
                  {selectedLoading ? '...' : '✓'}
                </div>
                <div className="text-indigo-200 font-medium">API Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <FaSpinner className="w-16 h-16 text-indigo-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-indigo-200 text-lg mb-2">Loading Your Music Library</h3>
              <p className="text-indigo-300">Please wait while we fetch your collection...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-red-300 text-lg mb-2">Error Loading Music Library</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={loadMusics}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Music List Section */}
        {!loading && !error && (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {/* For You Section */}
            <div className="mb-16">
              <div className="mb-10 section-header">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎯 For You</h2>
                    <p className="text-lg text-indigo-200">Your selected music tracks</p>
                  </div>
                  <button
                    onClick={refreshSelectedMusics}
                    disabled={selectedLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 flex items-center space-x-2"
                  >
                    {selectedLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {selectedLoading ? (
                <div className="text-center py-16">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                    <FaSpinner className="w-16 h-16 text-indigo-300 mx-auto mb-4 animate-spin" />
                    <h3 className="text-indigo-200 text-lg mb-2">Loading Your Selections</h3>
                    <p className="text-indigo-300">Fetching your selected music from the server...</p>
                  </div>
                </div>
              ) : selectedMusics.length > 0 ? (
                <MusicList 
                  musics={selectedMusics} 
                  onDelete={handleDeleteMusic} 
                  userLoggedIn={user} 
                />
              ) : (
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-4">🎯 No Selected Music Yet</h3>
                    <p className="text-indigo-200 mb-6">Start selecting music from the landing page to see your personalized collection here!</p>
                    <a
                      href="/"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl inline-block"
                    >
                      Go to Landing Page
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Other Musics Section */}
            <div>
              <div className="mb-10 section-header">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎵 Other Musics</h2>
                <p className="text-lg text-indigo-200">Explore and discover more music</p>
              </div>
              <MusicList 
                musics={otherMusics} 
                onDelete={handleDeleteMusic} 
                userLoggedIn={user} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 