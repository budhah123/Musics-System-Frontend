import React from 'react';
import { Link } from 'react-router-dom';
import { FaMusic, FaSignInAlt, FaUserPlus, FaPlay, FaHeart, FaDownload, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Same styling as landing page */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full mb-6 animate-float">
              <FaMusic className="text-4xl text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              Welcome back, {user?.name || user?.email}!
            </h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg">
              Ready to discover and enjoy your music collection? 
              Access your personalized music library and start listening.
            </p>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🚀 Quick Actions</h2>
              <p className="text-lg text-indigo-200">Get started with your music journey</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Link
                to="/user/musics"
                className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40 overflow-hidden relative"
              >
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="text-center relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FaPlay className="text-2xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-200 transition-colors duration-300">Music Library</h3>
                  <p className="text-indigo-200 mb-6 group-hover:text-indigo-100 transition-colors duration-300">
                    Browse, search, and play your favorite music tracks.
                    Discover new artists and categories.
                  </p>
                  <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    Start Listening
                  </div>
                </div>
              </Link>

              <Link
                to="/user/favorites"
                className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20 hover:border-white/40 overflow-hidden relative"
              >
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="text-center relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FaHeart className="text-2xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-200 transition-colors duration-300">Your Favorites</h3>
                  <p className="text-indigo-200 mb-6 group-hover:text-red-100 transition-colors duration-300">
                    View and manage your favorite music tracks.
                    Create your personal collection of loved songs.
                  </p>
                  <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                    View Favorites
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">📊 Your Music Stats</h2>
              <p className="text-lg text-indigo-200">Track your listening journey</p>
            </div>
            
            <div className="glass rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                  <FaMusic className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-indigo-300">0</div>
                  <div className="text-indigo-200 font-medium">Tracks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                  <FaHeart className="w-8 h-8 text-green-300 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-green-300">0</div>
                  <div className="text-indigo-200 font-medium">Favorites</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300">
                  <FaClock className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-300">0</div>
                  <div className="text-indigo-200 font-medium">Hours Listened</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Guest view
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Same styling as landing page */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 rounded-full mb-6 animate-float">
            <FaMusic className="text-4xl text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Welcome to Music System
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg">
            Discover amazing music, create playlists, and enjoy your favorite tracks.
            Join our community of music lovers today!
          </p>
        </div>

        {/* Action Buttons Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mb-10 section-header">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎯 Get Started</h2>
            <p className="text-lg text-indigo-200">Choose your path to musical discovery</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/user/login"
              className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
            >
              <FaSignInAlt className="text-xl group-hover:scale-110 transition-transform duration-300" />
              <span>Sign In</span>
            </Link>
            
            <Link
              to="/user/register"
              className="group bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-3"
            >
              <FaUserPlus className="text-xl group-hover:scale-110 transition-transform duration-300" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="mb-10 section-header">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">✨ Why Choose Us?</h2>
            <p className="text-lg text-indigo-200">Discover what makes our platform special</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <FaMusic className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Vast Music Library</h3>
              <p className="text-indigo-200">Access thousands of tracks across all categories</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <FaHeart className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Personalized Experience</h3>
              <p className="text-indigo-200">Create playlists and save your favorites</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <FaDownload className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Download & Stream</h3>
              <p className="text-indigo-200">Listen offline or stream your music anywhere</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 