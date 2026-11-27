import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Welcome() {
  usePageTitle('Welcome');
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container fade-in" style={{ padding: '3.5rem 1.25rem' }}>
      <div className="glass-card glow-gold" style={{ textAlign: 'center', padding: '3.5rem 2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-gold">✦ CONSTELLATE</span>
          <span className="badge badge-teal">ASTRONOMICAL HABIT TRACKER</span>
        </div>

        <h1 className="text-gradient" style={{ marginBottom: '1rem' }}>
          Your habits, written in stars.
        </h1>

        <p style={{ maxWidth: '640px', margin: '0 auto 2.5rem', fontSize: '1.15rem', lineHeight: '1.7' }}>
          Transform daily consistency into a personal night sky. Every daily check-in lights a star.
          Seven days in a row connects them with glowing celestial lines to form your constellation.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to="/sky" className="btn btn-primary btn-lg">
              Enter Your Night Sky ({user?.username}) ✦
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Create Your Sky — Free ✦
              </Link>
              <Link to="/signin" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-card glass-card-interactive glow-gold">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">★</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Stars & Constellations</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Active habits glow as individual stars. Complete a 7-day streak to connect them and bring your habit's constellation to life.
          </p>
        </div>

        <div className="glass-card glass-card-interactive glow-teal">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">👥</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Friends' Sky</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Exchange private friend codes to visit friends' skies read-only. Celebrate their milestones without social noise.
          </p>
        </div>

        <div className="glass-card glass-card-interactive glow-violet">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">📊</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Weekly Sky Report</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Comprehensive database analytics highlighting your most consistent habits, quietest days, and weekly celestial streaks.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/preview" className="btn btn-outline btn-sm">
          Explore Aurora Night Design System Showcase ↗
        </Link>
      </div>
    </div>
  );
}
