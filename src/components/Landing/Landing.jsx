import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCog, FaMusic, FaArrowRight } from 'react-icons/fa';
import MusicGrid from './MusicGrid';
import { useAuth } from '../../context/AuthContext';
import { getOrCreateDeviceId, isGuestUser, getUserId } from '../../utils/deviceUtils';
import { saveMusicSelection, removeMusicSelection, fetchSelectedMusics } from '../../api/api';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, addToast } = useAuth();
  const [selectedMusics, setSelectedMusics] = useState(new Set());

  // Initialize device ID for guest users and load existing selections
  useEffect(() => {
    if (isGuestUser()) {
      const deviceId = getOrCreateDeviceId();
      // Load existing selections for this device
      loadExistingSelections(null, deviceId);
    } else if (isAuthenticated && user) {
      // Load existing selections for logged-in user
      loadExistingSelections(getUserId(), null);
    }
  }, [isAuthenticated, user]);

  const loadExistingSelections = async (userId, deviceId) => {
    try {
      const selections = await fetchSelectedMusics(userId, deviceId);
      const selectionIds = new Set(selections.map(item => item.musicId));
      setSelectedMusics(selectionIds);
    } catch (error) {
      console.error('Failed to load existing selections:', error);
    }
  };

  const handleDashboardClick = (path) => {
    if (isAuthenticated && user) {
      // User is logged in, navigate to User Dashboard
      navigate('/user');
    } else {
      // User is a guest, redirect to Login page
      navigate('/user/login');
    }
  };

  const handleMusicCardClick = () => {
    navigate('/user/login');
  };

  const handleMusicSelection = async (musicId) => {
    try {
      const isCurrentlySelected = selectedMusics.has(musicId);
      
      if (isCurrentlySelected) {
        // Remove selection
        if (isAuthenticated && user) {
          await removeMusicSelection(musicId, getUserId());
          addToast('Music removed from your selection!', 'success');
        } else {
          const deviceId = getOrCreateDeviceId();
          await removeMusicSelection(musicId, null, deviceId);
          addToast('Music removed from your selection!', 'success');
        }
        
        // Update local state
        setSelectedMusics(prev => {
          const newSet = new Set(prev);
          newSet.delete(musicId);
          return newSet;
        });
      } else {
        // Add selection
        if (isAuthenticated && user) {
          await saveMusicSelection(musicId, getUserId());
          addToast('Music added to your selection!', 'success');
        } else {
          const deviceId = getOrCreateDeviceId();
          await saveMusicSelection(musicId, null, deviceId);
          addToast('Music added to your selection!', 'success');
        }
        
        // Update local state
        setSelectedMusics(prev => new Set([...prev, musicId]));
      }
    } catch (error) {
      console.error('Failed to handle music selection:', error);
      addToast(`Failed to ${isCurrentlySelected ? 'remove' : 'add'} music selection`, 'error');
    }
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
                <span>{isAuthenticated && user ? 'Go to Dashboard' : 'Go to Dashboard'}</span>
                <FaArrowRight size={16} className="ml-2" />
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
              onMusicSelection={handleMusicSelection}
              selectedMusics={selectedMusics}
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
              onMusicSelection={handleMusicSelection}
              selectedMusics={selectedMusics}
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
              onMusicSelection={handleMusicSelection}
              selectedMusics={selectedMusics}
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