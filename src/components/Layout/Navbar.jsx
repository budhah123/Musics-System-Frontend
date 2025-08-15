import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaMusic, FaHome, FaSignOutAlt, FaUser, FaUserCog, FaHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is authenticated as admin
  const isAdminAuthenticated = () => {
    const adminUser = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    if (adminUser && adminToken) {
      try {
        const adminData = JSON.parse(adminUser);
        return adminData.userType === 'Admin';
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const isUserDashboard = location.pathname.startsWith('/user');
  const isAdminDashboard = location.pathname.startsWith('/admin');

  // Don't show navbar on landing page
  if (isLandingPage) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaMusic className="text-2xl text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">
                {isAdminDashboard ? 'Admin Dashboard' : 'Music System'}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isUserDashboard && (
              <>
                <Link
                  to="/user"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaHome className="inline mr-2" />
                  Home
                </Link>
                <Link
                  to="/user/musics"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaMusic className="inline mr-2" />
                  Music Library
                </Link>
                <Link
                  to="/user/favorites"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaHeart className="inline mr-2" />
                  Favorites
                </Link>
              </>
            )}

            {isAdminDashboard && (
              <>
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaHome className="inline mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaUser className="inline mr-2" />
                  Users
                </Link>
                <Link
                  to="/admin/musics"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaMusic className="inline mr-2" />
                  Music
                </Link>
              </>
            )}
          </div>

          {/* User Menu / Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && isUserDashboard ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : isAdminDashboard ? (
              <div className="flex items-center space-x-4">
                {isAdminAuthenticated() ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <FaUserCog className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {JSON.parse(localStorage.getItem('adminUser'))?.name || 'Admin'}
                      </span>
                    </div>
                    <button
                      onClick={handleAdminLogout}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600 flex items-center">
                      <FaUserCog className="mr-2" />
                      Admin Access Required
                    </span>
                    <Link
                      to="/admin/login"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Login
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/user"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  User Dashboard
                </Link>
                <Link
                  to="/admin"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isUserDashboard && (
            <>
              <Link
                to="/user"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaHome className="inline mr-2" />
                Home
              </Link>
              <Link
                to="/user/musics"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaMusic className="inline mr-2" />
                Music Library
              </Link>
              <Link
                to="/user/favorites"
                className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaHeart className="inline mr-2" />
                Favorites
              </Link>
            </>
          )}

          {isAdminDashboard && (
            <>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaHome className="inline mr-2" />
                Dashboard
              </Link>
              <Link
                to="/admin/users"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaUser className="inline mr-2" />
                Users
              </Link>
              <Link
                to="/admin/musics"
                className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                <FaMusic className="inline mr-2" />
                Music
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
