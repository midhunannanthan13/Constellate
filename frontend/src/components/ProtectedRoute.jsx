import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Prevents unauthorized access and preserves redirect state so the user
 * returns back to the intended page after authenticating.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">
          ✦
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Illuminating your sky...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Send visitor to Sign in and record current path to bring them back
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
