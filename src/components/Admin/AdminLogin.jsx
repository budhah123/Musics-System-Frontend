import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addToast } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, try to login with the credentials
      const loginResponse = await fetch('https://musics-system-2.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || 'Login failed');
      }

      // If login is successful, fetch user details to check userType
      const usersResponse = await fetch('https://musics-system-2.onrender.com/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token || loginData.accessToken}`
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const usersData = await usersResponse.json();
      
      // Find the current user by email
      const currentUser = usersData.find(user => 
        user.email === formData.email.trim()
      );

      if (!currentUser) {
        throw new Error('User not found');
      }

      // Check if userType is exactly "Admin"
      if (currentUser.userType !== 'Admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store admin authentication data
      localStorage.setItem('adminUser', JSON.stringify({
        id: currentUser.id || currentUser._id,
        email: currentUser.email,
        name: currentUser.name || currentUser.FullName || currentUser.fullName,
        userType: currentUser.userType,
        token: loginData.token || loginData.accessToken
      }));

      localStorage.setItem('adminToken', loginData.token || loginData.accessToken);

      addToast('Admin login successful!', 'success');
      navigate('/admin');
      
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error.message || 'Admin authentication failed');
      addToast(error.message || 'Admin authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-500/20 border border-purple-400/30">
            <FaUserShield className="h-6 w-6 text-purple-300" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-indigo-200">
            Enter your admin credentials to continue
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-indigo-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-white/30 rounded-md leading-5 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:placeholder-white/70 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-indigo-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-white/30 rounded-md leading-5 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:placeholder-white/70 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-indigo-300 hover:text-indigo-200" />
                  ) : (
                    <FaEye className="h-5 w-5 text-indigo-300 hover:text-indigo-200" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-lg border border-red-500/30 text-red-300 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-purple-400/50 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Sign in as Admin'
              )}
            </button>
          </div>

          {/* Back to Landing */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-purple-200 text-sm font-medium"
            >
              ← Back to Landing Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
