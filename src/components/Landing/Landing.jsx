import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCog, FaMusic } from 'react-icons/fa';
import MusicGrid from './MusicGrid';

export default function Landing() {
  const navigate = useNavigate();

  const handleDashboardClick = (path) => {
    navigate(path);
  };

  const handleMusicCardClick = () => {
    navigate('/user/login');
  };

  // Debug: Check if icons are imported
  console.log('Icons imported:', { FaUsers, FaUserCog, FaMusic });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Top Navigation Bar */}
      <nav className="nav-glass shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side - App Brand */}
            <div className="flex items-center space-x-3 group">
              <FaMusic size={32} className="text-3xl text-white group-hover:scale-110 transition-transform duration-300 animate-float" />
              <span className="text-2xl font-bold text-white group-hover:text-indigo-200 transition-colors duration-300">
                Musics App
              </span>
            </div>

            {/* Right Side - Dashboard Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDashboardClick('/user')}
                className="btn-hover bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <FaUsers size={20} className="text-lg" />
                <span>User Dashboard</span>
              </button>
              
              <button
                onClick={() => handleDashboardClick('/admin/login')}
                className="btn-hover bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <FaUserCog size={20} className="text-lg" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-2xl animate-fade-in">
            Discover Amazing Music
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto drop-shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Explore our curated collection of trending tracks and personalized recommendations
          </p>
        </div>

        {/* Music Sections */}
        <div className="space-y-20">
          {/* Trending Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🔥 Trending Now</h2>
              <p className="text-lg text-indigo-200">The hottest tracks everyone's listening to</p>
            </div>
            <MusicGrid 
              sectionType="trending" 
              onMusicCardClick={handleMusicCardClick}
            />
          </section>

          {/* For You Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎯 For You</h2>
              <p className="text-lg text-indigo-200">Personalized recommendations just for you</p>
            </div>
            <MusicGrid 
              sectionType="forYou" 
              onMusicCardClick={handleMusicCardClick}
            />
          </section>

          {/* Others Section */}
          <section className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="mb-10 section-header">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">🎵 More Music</h2>
              <p className="text-lg text-indigo-200">Explore our complete music library</p>
            </div>
            <MusicGrid 
              sectionType="others" 
              onMusicCardClick={handleMusicCardClick}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-24">
          <p className="text-indigo-300 drop-shadow-lg">
            Built with React • Secure • Scalable
          </p>
        </div>
      </div>
    </div>
  );
} 