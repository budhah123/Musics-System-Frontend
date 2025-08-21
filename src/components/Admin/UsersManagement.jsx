import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { fetchUsers, updateUser, deleteUser, registerUser } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });

  // Get admin authentication data
  const adminToken = localStorage.getItem('adminToken');

  const { addToast } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // For admin management, we can fetch users without authentication token
      const data = await fetchUsers();
      
      // Validate and normalize user data
      const normalizedUsers = data.map(user => ({
        id: user.id || user._id || Math.random().toString(36).substr(2, 9),
        name: user.name || user.FullName || user.fullName || user.username || 'Unnamed User',
        email: user.email || 'No email',
        status: user.status || 'active',
        role: user.role || 'user',
        createdAt: user.createdAt || user.created_at || new Date().toISOString()
      }));
      
      setUsers(normalizedUsers);
    } catch (err) {
      console.error('UsersManagement: Failed to load users:', err);
      setError(err.message);
      addToast(`Failed to load users: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setShowPassword({ ...showPassword, [user.id]: false });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    try {
      // Use admin token for admin operations
      await updateUser(adminToken, editingUser.id, editingUser);
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
      addToast('User updated successfully!', 'success');
    } catch (err) {
      addToast(`Failed to update user: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingUserId(userId);
      // Use admin token for admin operations
      await deleteUser(adminToken, userId);
      setUsers(users.filter(user => user.id !== userId));
      addToast('User deleted successfully!', 'success');
    } catch (err) {
      addToast(`Failed to delete user: ${err.message}`, 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!createForm.fullname || !createForm.email || !createForm.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setCreatingUser(true);
      
      // Call the registerUser API endpoint
      const newUser = await registerUser(createForm.fullname, createForm.email, createForm.password);
      
      // Add the new user to the local state
      const normalizedUser = {
        id: newUser.id || newUser._id || Math.random().toString(36).substr(2, 9),
        name: newUser.name || newUser.FullName || newUser.fullName || createForm.fullname,
        email: newUser.email || createForm.email,
        status: createForm.status,
        role: createForm.role,
        createdAt: newUser.createdAt || newUser.created_at || new Date().toISOString()
      };
      
      setUsers(prev => [normalizedUser, ...prev]);
      
      // Reset form and hide it
      setCreateForm({
        fullname: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active'
      });
      setShowCreateForm(false);
      
      addToast('User created successfully!', 'success');
    } catch (err) {
      console.error('UsersManagement: Failed to create user:', err);
      addToast(`Failed to create user: ${err.message}`, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const resetCreateForm = () => {
    setCreateForm({
      fullname: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active'
    });
    setShowCreateForm(false);
  };

  const filteredUsers = users.filter(user =>
    (user.name || user.FullName || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="text-indigo-200">Manage system users and their permissions</p>
        </div>

        {/* Search and Actions */}
        <div className="glass rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              {showCreateForm ? 'Cancel' : 'Add User'}
            </button>
            <button 
              onClick={loadUsers}
              className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20"
            >
              <FaSearch className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <div className="glass rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.fullname}
                    onChange={(e) => handleCreateFormChange('fullname', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => handleCreateFormChange('email', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => handleCreateFormChange('password', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white placeholder-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Role
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => handleCreateFormChange('role', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user" className="bg-indigo-900 text-white">User</option>
                    <option value="admin" className="bg-indigo-900 text-white">Admin</option>
                    <option value="moderator" className="bg-indigo-900 text-white">Moderator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => handleCreateFormChange('status', e.target.value)}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active" className="bg-indigo-900 text-white">Active</option>
                    <option value="inactive" className="bg-indigo-900 text-white">Inactive</option>
                    <option value="suspended" className="bg-indigo-900 text-white">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                    creatingUser
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="glass rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-200 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-200 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {(user.name || user.FullName || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {editingUser?.id === user.id ? (
                              <input
                                type="text"
                                value={editingUser.name || ''}
                                onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                className="border border-white/30 rounded px-2 py-1 text-sm bg-white/20 text-white"
                                placeholder="Enter user name"
                              />
                            ) : (
                              user.name !== 'Unnamed User' ? user.name : 'User ' + user.id.substring(0, 6)
                            )}
                          </div>
                          <div className="text-sm text-indigo-200">
                            {editingUser?.id === user.id ? (
                              <input
                                type="email"
                                value={editingUser.email || ''}
                                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                className="border border-white/30 rounded px-2 py-1 text-sm bg-white/20 text-white"
                                placeholder="Enter email"
                              />
                            ) : (
                              user.email
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.status || 'active'}
                          onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                          className="border border-white/30 rounded px-2 py-1 text-sm bg-white/20 text-white"
                        >
                          <option value="active" className="bg-indigo-900 text-white">Active</option>
                          <option value="inactive" className="bg-indigo-900 text-white">Inactive</option>
                          <option value="suspended" className="bg-indigo-900 text-white">Suspended</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-200">
                      {editingUser?.id === user.id ? (
                        <select
                          value={editingUser.role || 'user'}
                          onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                          className="border border-white/30 rounded px-2 py-1 text-sm bg-white/20 text-white"
                        >
                          <option value="user" className="bg-indigo-900 text-white">User</option>
                          <option value="admin" className="bg-indigo-900 text-white">Admin</option>
                          <option value="moderator" className="bg-indigo-900 text-white">Moderator</option>
                        </select>
                      ) : (
                        user.role || 'user'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser?.id === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-400 hover:text-green-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-indigo-300 hover:text-indigo-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingUserId === user.id}
                            className={`${
                              deletingUserId === user.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-red-400 hover:text-red-300'
                            }`}
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              {users.length === 0 ? (
                <div>
                  <p className="text-indigo-200 mb-2">No users found in the system.</p>
                  <p className="text-sm text-indigo-300">Users will appear here once they register.</p>
                </div>
              ) : (
                <p className="text-indigo-200">No users found matching your search criteria.</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-indigo-200">
            Showing {filteredUsers.length} of {users.length} users
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