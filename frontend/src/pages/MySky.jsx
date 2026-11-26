import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function MySky() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyFriendCode = () => {
    if (user?.friend_code) {
      navigator.clipboard?.writeText(user.friend_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Sky Header Banner */}
      <div className="glass-card glow-gold" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              ✦ PERSONAL NIGHT SKY
            </span>
            <h1 className="text-gradient">Welcome, {user?.username}!</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              Your celestial habit sky is illuminated and connected to local MySQL.
            </p>
          </div>

          {/* Unique Friend Code Badge */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Star Friend Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code
                style={{
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  color: 'var(--star-gold)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                }}
              >
                {user?.friend_code || 'STAR-LOADING'}
              </code>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyFriendCode}
                aria-label="Copy my friend code"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <span className="badge badge-teal">
            <span aria-hidden="true">●</span> Authenticated via JWT
          </span>
          <span className="badge badge-violet">
            <span aria-hidden="true">★</span> Unique Profile Active
          </span>
          <span className="badge badge-success">
            <span aria-hidden="true">✓</span> MySQL Database Synced
          </span>
        </div>
      </div>

      {/* Account Details & Quick Overview Card */}
      <div className="grid-2">
        <div className="glass-card glow-teal">
          <h3 style={{ marginBottom: '1rem' }}>Celestial Account Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Username:</span>
              <strong>{user?.username}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Friend Code:</span>
              <span style={{ color: 'var(--star-gold)', fontWeight: 600 }}>{user?.friend_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member Since:</span>
              <span>{user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Today'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card glow-violet">
          <h3 style={{ marginBottom: '0.75rem' }}>Stage 4 Preview: Habits & Constellations</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Authentication is now complete! In Stage 4, you will create habits (habits table), track daily check-ins (check_ins table), and compute automatic 7-day streaks.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/preview" className="btn btn-outline btn-sm">
              View Design System Showcase ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
