import React, { useEffect, useState } from 'react';
import MusicList from './MusicList';
import MusicForm from './MusicForm';
import { fetchMusics, createMusic, deleteMusic, testBackendConnection, testMusicsEndpoint } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { token, user } = useAuth();

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadMusics() {
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchMusics();
      setMusics(data);
    } catch (err) {
      setError(err.message || 'Failed to load musics');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMusics();
  }, []);

  async function handleCreateMusic(musicData) {
    setError('');
    try {
      await createMusic(token, musicData);
      await loadMusics();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteMusic(id) {
    setError('');
    try {
      console.log('Dashboard: Attempting to delete music with ID:', id);
      console.log('Dashboard: Using token:', token ? 'Token present' : 'No token');
      
      await deleteMusic(token, id);
      console.log('Dashboard: Delete successful, reloading musics...');
      
      // Remove the deleted music from state immediately for better UX
      setMusics(prevMusics => prevMusics.filter(music => music.id !== id));
      
      // Optionally reload from server to ensure consistency
      // await loadMusics();
    } catch (err) {
      console.error('Dashboard: Delete failed:', err);
      setError(`Delete failed: ${err.message}`);
      
      // Keep the music in the list if delete failed
      // This prevents the item from disappearing on error
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {user && <MusicForm onCreate={handleCreateMusic} />}
      <h2 className="text-3xl font-bold mb-4">Musics</h2>
      
      {/* Debug section for troubleshooting */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Debug Backend Connection</h3>
        <div className="space-x-2">
          <button
            onClick={async () => {
              const isHealthy = await testBackendConnection();
              alert(`Backend health: ${isHealthy ? 'OK' : 'Failed'}`);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Test Backend Health
          </button>
          <button
            onClick={async () => {
              const isWorking = await testMusicsEndpoint();
              alert(`Musics endpoint: ${isWorking ? 'OK' : 'Failed'}`);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            Test Musics Endpoint
          </button>
          <button
            onClick={() => {
              console.log('Current token:', token);
              console.log('Current user:', user);
              alert(`Token: ${token ? 'Present' : 'Missing'}, User: ${user ? 'Logged in' : 'Not logged in'}`);
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
          >
            Check Auth Status
          </button>
        </div>
      </div>
      
      {loading && <p>Loading musics...</p>}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>
      )}
      {!loading && (
        <MusicList musics={musics} onDelete={handleDeleteMusic} userLoggedIn={!!user} />
      )}
    </div>
  );
}
