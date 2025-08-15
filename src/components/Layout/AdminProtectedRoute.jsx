import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminProtectedRoute({ children }) {
  // Check if admin is authenticated
  const adminUser = localStorage.getItem('adminUser');
  const adminToken = localStorage.getItem('adminToken');

  if (!adminUser || !adminToken) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  try {
    // Parse admin user data
    const adminData = JSON.parse(adminUser);
    
    // Verify userType is exactly "Admin"
    if (adminData.userType !== 'Admin') {
      // Clear invalid admin data and redirect to login
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }

    // Admin is authenticated and authorized
    return children;
  } catch (error) {
    // Invalid admin data, clear and redirect
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }
}
