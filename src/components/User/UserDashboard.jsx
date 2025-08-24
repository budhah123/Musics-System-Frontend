import React, { useEffect, useState } from 'react';
import { fetchMusics, deleteMusic } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import MusicList from './MusicList';
import { FaMusic, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

export default function UserDashboard() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token, addToast } = useAuth();

  useEffect(() => {
    if (user && token) {
      loadMusics();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const loadMusics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await fetchMusics();
      
      if (!data || !Array.isArray(data)) {
        setMusics([]);
        setError('Invalid data received from server');
        return;
      }
      
      setMusics(data);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-indigo-300 mb-2">{musics.length}</div>
                <div className="text-indigo-200 font-medium">Total Tracks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-green-300 mb-2">
                  {musics.filter(m => m.category).length}
                </div>
                                  <div className="text-indigo-200 font-medium">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-purple-300 mb-2">
                  {musics.filter(m => m.artist).length}
                </div>
                <div className="text-indigo-200 font-medium">Artists</div>
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
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎵 Your Collection</h2>
              <p className="text-lg text-indigo-200">Discover, play, and manage your music tracks</p>
            </div>
            <MusicList 
              musics={musics} 
              onDelete={handleDeleteMusic} 
              userLoggedIn={user} 
            />
          </div>
        )}
      </div>
    </div>
  );
} 