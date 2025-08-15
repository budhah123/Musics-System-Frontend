import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCog, FaMusic, FaChartBar } from 'react-icons/fa';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Music Management System
          </h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            A comprehensive platform for managing music tracks, users, and administrative tasks.
            Choose your dashboard to get started.
          </p>
        </div>

        {/* Dashboard Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* User Dashboard */}
          <div 
            onClick={() => navigate('/user')}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-full mb-6">
                <FaUsers className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">User Dashboard</h2>
              <p className="text-indigo-200 mb-6">
                Access your music library, play tracks, and manage your personal collection.
                Login or register to get started.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-indigo-200">
                  <FaMusic className="mr-3 text-indigo-400" />
                  <span>Browse and play music</span>
                </div>
                <div className="flex items-center text-indigo-200">
                  <FaUsers className="mr-3 text-indigo-400" />
                  <span>User authentication</span>
                </div>
                <div className="flex items-center text-indigo-200">
                  <FaChartBar className="mr-3 text-indigo-400" />
                  <span>Personal music library</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Dashboard */}
          <div 
            onClick={() => navigate('/admin/login')}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 cursor-pointer hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500 rounded-full mb-6">
                <FaUserCog className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Admin Dashboard</h2>
              <p className="text-purple-200 mb-6">
                Manage users, upload music, and oversee the entire system.
                Admin authentication required for access.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-purple-200">
                  <FaUsers className="mr-3 text-purple-400" />
                  <span>User management</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <FaMusic className="mr-3 text-purple-400" />
                  <span>Music upload & management</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <FaChartBar className="mr-3 text-purple-400" />
                  <span>System analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-indigo-300">
            Built with React • Secure • Scalable
          </p>
        </div>
      </div>
    </div>
  );
} 