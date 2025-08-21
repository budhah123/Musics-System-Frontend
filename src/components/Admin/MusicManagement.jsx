import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaMusic, FaImage, FaPlay, FaPause } from 'react-icons/fa';
import { fetchMusics, createMusic, updateMusic, deleteMusic } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function MusicManagement() {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMusic, setEditingMusic] = useState(null);
  const [deletingMusicId, setDeletingMusicId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioRefs, useRef] = useState({});
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    genre: '',
    audioFile: null,
    thumbnailFile: null
  });
  const [uploading, setUploading] = useState(false);

  // Get admin authentication data
  const adminToken = localStorage.getItem('adminToken');

  const { addToast } = useAuth();

  useEffect(() => {
    loadMusics();
  }, []);

  const loadMusics = async () => {
    try {
      setLoading(true);
      const data = await fetchMusics();
      setMusics(data);
    } catch (err) {
      console.error('MusicManagement: Failed to load music:', err);
      setError(err.message);
      addToast(`Failed to load music: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (music) => {
    setEditingMusic({ ...music });
  };

  const handleCancelEdit = () => {
    setEditingMusic(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Use admin token for admin operations
      await updateMusic(adminToken, editingMusic.id, editingMusic);
      setMusics(musics.map(music => 
        music.id === editingMusic.id ? editingMusic : music
      ));
      setEditingMusic(null);
      addToast('Music updated successfully!', 'success');
    } catch (err) {
      addToast(`Failed to update music: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (musicId) => {
    if (!window.confirm('Are you sure you want to delete this music track? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingMusicId(musicId);
      
      // Use admin token for admin operations
      await deleteMusic(adminToken, musicId);
      
      // Remove from local state
      setMusics(musics.filter(music => music.id !== musicId));
      addToast('Music deleted successfully!', 'success');
    } catch (err) {
      console.error('MusicManagement: Failed to delete music:', err);
      addToast(`Failed to delete music: ${err.message}`, 'error');
    } finally {
      setDeletingMusicId(null);
    }
  };

  const handlePlayPause = (musicId) => {
    if (playingId === musicId) {
      setPlayingId(null);
    } else {
      setPlayingId(musicId);
    }
  };

  const getThumbnailUrl = (music) => {
    return music.thumbnailUrl || music.thumbnail || music.imageUrl || '/default-thumbnail.svg';
  };

  const getAudioUrl = (music) => {
    return music.audioUrl || music.audio || music.musicUrl || music.url;
  };

  const handleUploadFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setUploadForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setUploadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.artist || !uploadForm.audioFile) {
      addToast('Please fill in all required fields and select an audio file', 'error');
      return;
    }

    try {
      setUploading(true);
      
      // Use admin token for admin operations
      const newMusic = await createMusic(adminToken, {
        musicFile: uploadForm.audioFile,
        thumbnailFile: uploadForm.thumbnailFile,
        title: uploadForm.title,
        artist: uploadForm.artist,
        genre: uploadForm.genre,
        duration: null // We'll get this from the audio file later
      });
      
      // Add to local state
      setMusics(prev => [newMusic, ...prev]);
      
      // Reset form
      setUploadForm({
        title: '',
        artist: '',
        genre: '',
        audioFile: null,
        thumbnailFile: null
      });
      setShowUploadForm(false);
      
      addToast('Music uploaded successfully!', 'success');
    } catch (err) {
      console.error('MusicManagement: Failed to upload music:', err);
      addToast(`Failed to upload music: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      artist: '',
      genre: '',
      audioFile: null,
      thumbnailFile: null
    });
    setShowUploadForm(false);
  };

  const filteredMusics = musics.filter(music =>
    music.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Music Management</h1>
          <p className="text-indigo-200">Upload, edit, and manage music tracks</p>
        </div>

        {/* Search and Actions */}
        <div className="glass rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                <input
                  type="text"
                  placeholder="Search music by title, artist, or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {showUploadForm ? 'Cancel Upload' : 'Upload Music'}
            </button>
            <button 
              onClick={loadMusics}
              className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20"
            >
              <FaSearch className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="glass rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Upload New Music</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleUploadFormChange}
                    required
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter music title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Artist *
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={uploadForm.artist}
                    onChange={handleUploadFormChange}
                    required
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter artist name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    name="genre"
                    value={uploadForm.genre}
                    onChange={handleUploadFormChange}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter genre (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Audio File *
                  </label>
                  <input
                    type="file"
                    name="audioFile"
                    onChange={handleUploadFormChange}
                    accept="audio/*"
                    required
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-indigo-300 mt-1">Supported formats: MP3, WAV, AAC, OGG</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  name="thumbnailFile"
                  onChange={handleUploadFormChange}
                  accept="image/*"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-indigo-300 mt-1">Optional: JPG, PNG, GIF (max 5MB)</p>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                    uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload Music'}
                </button>
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="px-4 py-2 border border-white/30 rounded-md text-sm font-medium text-white bg-white/20 hover:bg-white/30"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="glass border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Music List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMusics.map(music => (
            <div key={music.id} className="glass rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={getThumbnailUrl(music)}
                  alt={music.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-thumbnail.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <button
                    onClick={() => handlePlayPause(music.id)}
                    className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all"
                  >
                    {playingId === music.id ? (
                      <FaPause className="h-6 w-6 text-gray-800" />
                    ) : (
                      <FaPlay className="h-6 w-6 text-gray-800" />
                    )}
                  </button>
                </div>
              </div>

              {/* Music Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {editingMusic?.id === music.id ? (
                      <input
                        type="text"
                        value={editingMusic.title || ''}
                        onChange={(e) => setEditingMusic({...editingMusic, title: e.target.value})}
                        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-2 py-1 text-sm text-white"
                      />
                    ) : (
                      music.title || 'Untitled'
                    )}
                  </h3>
                  <p className="text-sm text-indigo-200">
                    {editingMusic?.id === music.id ? (
                      <input
                        type="text"
                        value={editingMusic.artist || ''}
                        onChange={(e) => setEditingMusic({...editingMusic, artist: e.target.value})}
                        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-2 py-1 text-sm text-white"
                      />
                    ) : (
                      music.artist || 'Unknown Artist'
                    )}
                  </p>
                  <p className="text-xs text-indigo-300">
                    {editingMusic?.id === music.id ? (
                      <input
                        type="text"
                        value={editingMusic.genre || ''}
                        onChange={(e) => setEditingMusic({...editingMusic, genre: e.target.value})}
                        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded px-2 py-1 text-sm text-white"
                      />
                    ) : (
                      music.genre || 'Unknown Genre'
                    )}
                  </p>
                </div>

                {/* Audio Player */}
                {playingId === music.id && (
                  <div className="mb-3">
                    <audio
                      controls
                      className="w-full"
                      src={getAudioUrl(music)}
                      onEnded={() => setPlayingId(null)}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  {editingMusic?.id === music.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-indigo-300 hover:text-indigo-200 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(music)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(music.id)}
                    disabled={deletingMusicId === music.id}
                    className={`${
                      deletingMusicId === music.id
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-400 hover:text-red-300 cursor-pointer'
                    }`}
                    title="Delete music track"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMusics.length === 0 && (
          <div className="text-center py-12">
            {musics.length === 0 ? (
              <div>
                <p className="text-indigo-200 mb-2">No music found in the system.</p>
                <p className="text-sm text-indigo-300">Music tracks will appear here once they are uploaded.</p>
              </div>
            ) : (
              <p className="text-indigo-200">No music found matching your search criteria.</p>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-indigo-200">
            Showing {filteredMusics.length} of {musics.length} music tracks
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 border border-white/30 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20">
              Previous
            </button>
            <button className="px-3 py-2 border border-white/30 rounded-md text-sm font-medium text-white bg-white/10 hover:bg-white/20">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 