import React, { useEffect, useState } from 'react';
import { fetchMusics, deleteMusic } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import MusicList from './MusicList';

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Authentication Required</p>
            <p className="text-sm">Please log in to access your music library.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Music Library</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email}! Browse and enjoy your music collection.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your music library...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md mx-auto">
              <p className="font-medium">Error Loading Music Library</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={loadMusics}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Music List */}
        {!loading && !error && (
          <MusicList 
            musics={musics} 
            onDelete={handleDeleteMusic} 
            userLoggedIn={true} 
          />
        )}
      </div>
    </div>
  );
} 