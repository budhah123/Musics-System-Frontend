import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, requireAuth = true, redirectTo = '/user' }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is NOT required but user IS authenticated (e.g., prevent logged-in users from accessing login page)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/user/musics" replace />;
  }

  // User meets the requirements, render the protected content
  return children;
}

// Specific route protection components
export function RequireAuth({ children }) {
  return <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>;
}

export function RequireGuest({ children }) {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
} 