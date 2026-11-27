import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MySky from './pages/MySky';
import Habits from './pages/Habits';
import HabitDetail from './pages/HabitDetail';
import WeeklyReport from './pages/WeeklyReport';
import Friends from './pages/Friends';
import FriendSky from './pages/FriendSky';
import Profile from './pages/Profile';
import StylePreview from './components/StylePreview';
import './index.css';

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">✦</div>
        <p style={{ color: 'var(--text-muted)' }}>Illuminating your sky...</p>
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/sky" replace /> : <Welcome />;
}

function OfflineBanner() {
  const { apiOffline, retryAuth } = useAuth();
  if (!apiOffline) return null;
  return (
    <div className="container" style={{ paddingBottom: 0 }}>
      <div
        role="alert"
        className="glass-card"
        style={{
          padding: '0.9rem 1.25rem',
          borderColor: 'var(--warning)',
          background: 'var(--warning-bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          ⚠️ <strong>Backend server unreachable:</strong> Cannot connect to the Constellate API right now. Please make sure the Django server is running.
        </span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={retryAuth}>
          Retry Connection
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {/* Universal Fixed Twinkling Starfield Background */}
      <Starfield />

      {/* Main Application Container */}
      <div className="app-wrapper">
        <Navbar />
        <OfflineBanner />

        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Sky Dashboard (Signature Home Page) */}
            <Route
              path="/sky"
              element={
                <ProtectedRoute>
                  <MySky />
                </ProtectedRoute>
              }
            />

            {/* Protected Habits Management & Calendar */}
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits/:id"
              element={
                <ProtectedRoute>
                  <HabitDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <WeeklyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends"
              element={
                <ProtectedRoute>
                  <Friends />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friends/:friendId/sky"
              element={
                <ProtectedRoute>
                  <FriendSky />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Design System Preview Showcase */}
            <Route path="/preview" element={<StylePreview />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
