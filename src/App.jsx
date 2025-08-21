import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { DownloadsProvider } from './context/DownloadsContext';
import { ToastContainer } from './components/Common/Toast';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute, { RequireAuth, RequireGuest } from './components/Layout/ProtectedRoute';

// Landing and Navigation
import Landing from './components/Landing/Landing';

// User Dashboard Components
import Home from './components/User/Home';
import Login from './components/User/Login';
import Register from './components/User/Register';
import UserDashboard from './components/User/UserDashboard';
import Favorites from './components/User/Favorites';
import Downloads from './components/User/Downloads';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Admin Dashboard Components
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import UsersManagement from './components/Admin/UsersManagement';
import MusicManagement from './components/Admin/MusicManagement';
import AdminProtectedRoute from './components/Layout/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <DownloadsProvider>
          <Router>
          <div className="App min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Toast Notifications */}
            <ToastContainer />
            
            {/* Navigation */}
            <Navbar />
            
            {/* Routes */}
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Landing />} />
              
              {/* User Dashboard Routes */}
              <Route path="/user" element={<Home />} />
              <Route 
                path="/user/login" 
                element={
                  <RequireGuest>
                    <Login />
                  </RequireGuest>
                } 
              />
              <Route 
                path="/user/register" 
                element={
                  <RequireGuest>
                    <Register />
                  </RequireGuest>
                } 
              />
              <Route 
                path="/user/musics" 
                element={
                  <RequireAuth>
                    <ErrorBoundary>
                      <UserDashboard />
                    </ErrorBoundary>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/user/favorites" 
                element={
                  <RequireAuth>
                    <ErrorBoundary>
                      <Favorites />
                    </ErrorBoundary>
                  </RequireAuth>
                } 
              />
              <Route 
                path="/user/downloads" 
                element={
                  <RequireAuth>
                    <ErrorBoundary>
                      <Downloads />
                    </ErrorBoundary>
                  </RequireAuth>
                } 
              />
              
              {/* Admin Dashboard Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <AdminProtectedRoute>
                    <UsersManagement />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/admin/musics" 
                element={
                  <AdminProtectedRoute>
                    <MusicManagement />
                  </AdminProtectedRoute>
                } 
              />
              
              {/* Catch all route - redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
        </DownloadsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
