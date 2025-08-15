import React from 'react';
import { Link } from 'react-router-dom';
import { FaMusic, FaSignInAlt, FaUserPlus, FaPlay } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Welcome Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full mb-6">
              <FaMusic className="text-4xl text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to discover and enjoy your music collection? 
              Access your personalized music library and start listening.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Link
              to="/user/musics"
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
                  <FaPlay className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Music Library</h3>
                <p className="text-gray-600 mb-6">
                  Browse, search, and play your favorite music tracks.
                  Discover new artists and genres.
                </p>
                <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Start Listening
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-6">
                  <FaMusic className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Collection</h3>
                <p className="text-gray-600 mb-6">
                  View your personal music collection and listening history.
                  Organize your favorite tracks.
                </p>
                <div className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Music Stats</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">0</div>
                <div className="text-gray-600">Tracks</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-gray-600">Playlists</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-gray-600">Hours Listened</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full mb-6">
            <FaMusic className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Music System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover, organize, and enjoy your music collection. 
            Create an account to access your personalized music library.
          </p>
        </div>

        {/* Auth Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Login Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <FaSignInAlt className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Already have an account?</h3>
              <p className="text-gray-600 mb-6">
                Sign in to access your music library and continue where you left off.
              </p>
              <Link
                to="/user/login"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
                <FaUserPlus className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">New to Music System?</h3>
              <p className="text-gray-600 mb-6">
                Create a free account to start building your music collection and discover new tracks.
              </p>
              <Link
                to="/user/register"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Music System?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <FaMusic className="text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Extensive Library</h4>
              <p className="text-gray-600">Access thousands of tracks across all genres</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <FaPlay className="text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">High Quality</h4>
              <p className="text-gray-600">Stream music in high-quality audio formats</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <FaUserPlus className="text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h4>
              <p className="text-gray-600">Create playlists and organize your music</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 