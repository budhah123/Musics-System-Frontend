import React, { useState } from 'react';

export default function MusicForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title || !artist || !category || !duration || !musicFile || !thumbnailFile) {
      setError('Please fill all fields and upload files');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      setError('Duration must be a positive number');
      return;
    }

    setLoading(true);
    try {
      await onCreate({ title, artist, category, duration, musicFile, thumbnailFile });
      setTitle('');
      setArtist('');
      setCategory('');
      setDuration('');
      setMusicFile(null);
      setThumbnailFile(null);
      e.target.reset();
    } catch (err) {
      setError(err.message || 'Failed to create music');
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-6 border rounded shadow bg-white"
      encType="multipart/form-data"
    >
      <h2 className="text-2xl font-bold mb-4">Add New Music</h2>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>
      )}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Song Title"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Artist</label>
        <input
          type="text"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Artist Name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Category</label>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Category"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Duration"
          min="1"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Music File (audio)</label>
        <input
          type="file"
          accept="audio/*"
          onChange={e => setMusicFile(e.target.files[0])}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Thumbnail Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setThumbnailFile(e.target.files[0])}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded w-full font-semibold"
      >
        {loading ? 'Adding...' : 'Add Music'}
      </button>
    </form>
  );
}
