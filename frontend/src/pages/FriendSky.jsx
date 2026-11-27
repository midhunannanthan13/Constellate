import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendsApi } from '../services/api';
import NightSky from '../components/NightSky';

export default function FriendSky() {
  const { friendId } = useParams();
  const { tokens } = useAuth();
  const token = tokens?.access;

  const [skyData, setSkyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFriendSky = useCallback(async () => {
    if (!token || !friendId) return;
    setLoading(true);
    setError('');
    try {
      const data = await friendsApi.getFriendSky(token, friendId);
      setSkyData(data);
    } catch (err) {
      setError(err.message || "Could not load this friend's sky.");
    } finally {
      setLoading(false);
    }
  }, [token, friendId]);

  useEffect(() => {
    fetchFriendSky();
  }, [fetchFriendSky]);

  if (loading) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', padding: '6rem 1.25rem' }}>
        <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">✦</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Visiting Friend's Sky...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Aligning their constellations in read-only view.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container fade-in" style={{ padding: '3rem 1.25rem', maxWidth: '540px' }}>
        <div className="glass-card" role="alert" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }} aria-hidden="true">🔒</div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--error)', marginBottom: '0.65rem' }}>
            Sky Not Accessible
          </h1>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>{error}</p>
          <Link to="/friends" className="btn btn-primary">
            ← Back to Friends
          </Link>
        </div>
      </div>
    );
  }

  const friend = skyData?.friend;
  const habits = skyData?.habits || [];
  const totalStars = habits.reduce((acc, h) => acc + (h.checkins?.length || 0), 0);
  const completedCount = habits.filter((h) => h.is_constellation_complete).length;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Clear Read-Only Banner */}
      <div className="glass-card glow-violet" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="badge badge-violet">👁 READ-ONLY VIEW</span>
              <span className="badge badge-teal">★ {habits.length} Constellations</span>
              <span className="badge badge-gold">✦ {totalStars} Stars Lit</span>
              {completedCount > 0 && (
                <span className="badge badge-pink">✨ {completedCount} Completed</span>
              )}
            </div>
            <h1 className="text-gradient" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)' }}>
              You are viewing {friend?.username}'s sky
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Tap any star to inspect {friend?.username}'s habit streak. Friend skies are read-only.
            </p>
          </div>

          <Link to="/friends" className="btn btn-secondary btn-sm">
            ← Back to Friends
          </Link>
        </div>
      </div>

      {/* Friend's Night Sky */}
      {habits.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
          <div style={{ fontSize: '3rem', color: 'var(--aurora-violet)', marginBottom: '1rem' }} aria-hidden="true">✦</div>
          <h2 style={{ marginBottom: '0.6rem' }}>{friend?.username}'s sky is quiet</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
            {friend?.username} hasn't lit any active habit stars yet.
          </p>
          <Link to="/friends" className="btn btn-outline btn-sm">
            ← Return to Friends
          </Link>
        </div>
      ) : (
        <NightSky habits={habits} readOnly={true} />
      )}

      {/* Screen Reader Accessible Overview */}
      <section className="sr-only" aria-label={`${friend?.username}'s night sky summary`}>
        <h2>{friend?.username}'s Constellations</h2>
        <ul>
          {habits.map((h) => (
            <li key={h.id}>
              Habit: {h.name}, {h.current_streak} day current streak, best streak {h.best_streak} days,{' '}
              {h.is_checked_today ? 'checked in today' : 'not checked in today'}.
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
