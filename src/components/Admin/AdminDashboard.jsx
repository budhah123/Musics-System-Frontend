import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaMusic, FaChartBar, FaCog, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { fetchUsers, fetchMusics, deleteMusic, deleteUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMusic: 0,
    activeUsers: 0,
    totalPlaylists: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMusic, setRecentMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get admin authentication data
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');

  const { addToast } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // For admin dashboard, we can fetch data without authentication token
      // since this is an admin-only area
      const [usersData, musicData] = await Promise.all([
        fetchUsers(), // Don't pass token for admin dashboard
        fetchMusics()
      ]);

      // Normalize user data to ensure consistent field names
      const normalizedUsers = usersData.map(user => ({
        id: user.id || user._id || Math.random().toString(36).substr(2, 9),
        name: user.name || user.FullName || user.fullName || user.username || 'Unnamed User',
        email: user.email || 'No email',
        status: user.status || 'active',
        role: user.role || 'user',
        createdAt: user.createdAt || user.created_at || new Date().toISOString()
      }));

      // Calculate stats
      const activeUsers = normalizedUsers.filter(user => user.status === 'active').length;
      
      setStats({
        totalUsers: normalizedUsers.length,
        totalMusic: musicData.length,
        activeUsers: activeUsers,
        totalPlaylists: 0 // Placeholder - implement when playlist API is available
      });

      // Set recent users (last 3 registered users)
      setRecentUsers(normalizedUsers.slice(-3).reverse());

      // Set recent music (last 3 uploaded tracks)
      setRecentMusic(musicData.slice(-3).reverse());

    } catch (err) {
      console.error('AdminDashboard: Failed to load data:', err);
      setError(err.message);
      addToast(`Failed to load dashboard data: ${err.message}`, 'error');
      
      // Fallback to empty data
      setStats({ totalUsers: 0, totalMusic: 0, activeUsers: 0, totalPlaylists: 0 });
      setRecentUsers([]);
      setRecentMusic([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMusic = async (musicId) => {
    if (!window.confirm('Are you sure you want to delete this music track? This action cannot be undone.')) {
      return;
    }

    try {
      // Use admin token for admin operations
      await deleteMusic(adminToken, musicId);
      
      // Remove from local state
      setRecentMusic(prev => prev.filter(music => music.id !== musicId));
      setStats(prev => ({ ...prev, totalMusic: prev.totalMusic - 1 }));
      
      addToast('Music deleted successfully!', 'success');
    } catch (err) {
      console.error('AdminDashboard: Failed to delete music:', err);
      addToast(`Failed to delete music: ${err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Use admin token for admin operations
      await deleteUser(adminToken, userId);
      
      // Remove from local state
      setRecentUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      
      addToast('User deleted successfully!', 'success');
    } catch (err) {
      console.error('AdminDashboard: Failed to delete user:', err);
      addToast(`Failed to delete user: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-indigo-200">Manage your music system and users</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-300 mx-auto mb-4"></div>
            <p className="text-lg text-indigo-200">Loading dashboard data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="glass border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error Loading Dashboard</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <FaUsers className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Total Users</p>
                    <p className="text-2xl font-semibold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <FaMusic className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Total Music</p>
                    <p className="text-2xl font-semibold text-white">{stats.totalMusic}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <FaChartBar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Active Users</p>
                    <p className="text-2xl font-semibold text-white">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <FaCog className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Playlists</p>
                    <p className="text-2xl font-semibold text-white">{stats.totalPlaylists}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Users Management */}
              <div className="glass rounded-lg shadow">
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Users Management</h3>
                    <Link
                      to="/admin/users"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FaUsers className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentUsers.length > 0 ? (
                      recentUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user.name !== 'Unnamed User' ? user.name : 'User ' + user.id.substring(0, 6)}
                            </p>
                            <p className="text-sm text-indigo-200">{user.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status || 'active'}
                            </span>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer" 
                              title="Delete user"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-indigo-200">
                        <p>No users found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Music Management */}
              <div className="glass rounded-lg shadow">
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Music Management</h3>
                    <Link
                      to="/admin/musics"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <FaMusic className="mr-2 h-4 w-4" />
                      Manage Music
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentMusic.length > 0 ? (
                      recentMusic.map(music => (
                        <div key={music.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-white">{music.title || 'Untitled Track'}</p>
                            <p className="text-sm text-indigo-200">{music.artist || 'Unknown Artist'} • {music.genre || 'Unknown Genre'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:text-blue-300 cursor-pointer" title="Edit music">
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMusic(music.id)}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer" 
                              title="Delete music track"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-indigo-200">
                        <p>No music found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="glass rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-white mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-indigo-200">Database: Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-indigo-200">Storage: Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-indigo-200">API: Online</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 