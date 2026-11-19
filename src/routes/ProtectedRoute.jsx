import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-soft border border-light-blue-200">
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to correct dashboard
    if (profile.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'faculty_coordinator') return <Navigate to="/faculty" replace />;
    if (profile.role === 'student_coordinator') return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
