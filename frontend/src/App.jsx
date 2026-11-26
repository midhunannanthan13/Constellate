import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import StylePreview from './components/StylePreview';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      {/* Universal Fixed Twinkling Starfield Background */}
      <Starfield />

      {/* Main Application Container */}
      <div className="app-wrapper">
        <Navbar />

        <main id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Sky Dashboard */}
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
