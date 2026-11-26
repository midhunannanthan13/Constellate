import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { habitsApi } from '../services/api';

export default function MySky() {
  const { user, tokens } = useAuth();
  const token = tokens?.access;
  const [copied, setCopied] = useState(false);
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);

  useEffect(() => {
    if (!token) return;
    habitsApi
      .list(token)
      .then((data) => setHabits(data || []))
      .catch(() => setHabits([]))
      .finally(() => setLoadingHabits(false));
  }, [token]);

  const copyFriendCode = () => {
    if (user?.friend_code) {
      navigator.clipboard?.writeText(user.friend_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickCheckin = async (habit) => {
    try {
      if (habit.is_checked_today) {
        await habitsApi.uncheck(token, habit.id);
      } else {
        await habitsApi.checkin(token, habit.id);
      }
      const updated = await habitsApi.list(token);
      setHabits(updated);
    } catch (err) {
      console.error(err);
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

      {/* Habits in Sky Overview */}
      <div className="glass-card glow-teal" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Your Active Habit Stars</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Check in daily to build your 7-day constellations.
            </p>
          </div>
          <Link to="/habits" className="btn btn-primary btn-sm">
            Manage All Habits →
          </Link>
        </div>

        {loadingHabits ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading stars...</p>
        ) : habits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No habit stars in your sky yet.
            </p>
            <Link to="/habits" className="btn btn-primary btn-sm">
              Light Your First Star ✦
            </Link>
          </div>
        ) : (
          <div className="grid-2">
            {habits.map((h) => (
              <div
                key={h.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1.25rem',
                  borderColor: `${h.colour}33`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: h.colour,
                        boxShadow: `0 0 8px ${h.colour}`,
                      }}
                      aria-hidden="true"
                    />
                    <strong style={{ fontSize: '1.1rem' }}>{h.name}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span className="badge badge-gold" style={{ padding: '0.15rem 0.5rem' }}>
                      ★ Streak: {h.current_streak}d
                    </span>
                    <span className="badge badge-teal" style={{ padding: '0.15rem 0.5rem' }}>
                      Goal: {h.days_per_week_goal}d/wk
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${h.is_checked_today ? 'btn-teal' : 'btn-outline'}`}
                    onClick={() => handleQuickCheckin(h)}
                    aria-label={`Toggle check-in for ${h.name}`}
                  >
                    {h.is_checked_today ? '✓ Done' : '✦ Check-in'}
                  </button>
                  <Link to={`/habits/${h.id}`} className="btn btn-secondary btn-sm" aria-label={`View ${h.name} details`}>
                    Strip →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <h3 style={{ marginBottom: '0.75rem' }}>Habits & Constellations Ready</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Your habit management system and 30-day calendar strips are fully live. Add, edit, check in, and view streaks on your Habits page.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/habits" className="btn btn-primary btn-sm">
              Go to Habits Page ✦
            </Link>
            <Link to="/preview" className="btn btn-outline btn-sm">
              Design System Showcase ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
