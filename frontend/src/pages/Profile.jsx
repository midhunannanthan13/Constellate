import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { badgesApi } from '../services/api';
import usePageTitle from '../hooks/usePageTitle';

function formatReadableDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profile() {
  usePageTitle('Profile & Badges');
  const { user, tokens } = useAuth();
  const token = tokens?.access;

  const [badgesData, setBadgesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [celebratingNames, setCelebratingNames] = useState([]);

  const fetchBadges = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await badgesApi.list(token);
      setBadgesData(data);

      // Check for newly earned (unseen) badges
      const unseen = (data.badges || []).filter((b) => b.earned && b.is_new);
      if (unseen.length > 0) {
        setCelebratingNames(unseen.map((b) => b.name));
        // Mark them as seen on the server so the celebration never repeats
        const unseenTypes = unseen.map((b) => b.badge_type);
        await badgesApi.markSeen(token, unseenTypes).catch(() => {});
      }
    } catch (err) {
      setError(err.message || 'Could not load your profile badges.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleCopyCode = () => {
    if (user?.friend_code) {
      navigator.clipboard?.writeText(user.friend_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const badges = badgesData?.badges || [];
  const earnedCount = badgesData?.earned_count || 0;
  const totalCount = badgesData?.total_count || 4;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Celebration Toast for Newly Earned Badges */}
      {celebratingNames.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fade-in"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.35rem',
            background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.2), rgba(139, 124, 255, 0.2))',
            border: '1.5px solid var(--star-gold)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(255, 215, 106, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '1.6rem', color: 'var(--star-gold)' }} aria-hidden="true">★</span>
            <div>
              <strong style={{ color: 'var(--star-gold)', display: 'block', fontSize: '0.95rem' }}>
                New Celestial Badge Earned!
              </strong>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Congratulations — you unlocked: <strong>{celebratingNames.join(', ')}</strong>!
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCelebratingNames([])}
            aria-label="Dismiss badge celebration"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Header & Friend Code */}
      <div className="glass-card glow-gold" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.45rem' }}>
              ★ STARGAZER PROFILE
            </span>
            <h1 className="text-gradient">{user?.username}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {user?.email} • Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Today'}
            </p>
          </div>

          <div
            style={{
              padding: '0.9rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>
              Your Friend Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--star-gold)', fontWeight: 700, letterSpacing: '0.08em' }}>
                {user?.friend_code || 'STAR-LOADING'}
              </code>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyCode}
                aria-label="Copy my friend code"
              >
                {copiedCode ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Shelf */}
      <div className="glass-card glow-violet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.25rem' }}>Badge Shelf</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Milestones illuminated by your consistency across the night sky.
            </p>
          </div>
          <span className="badge badge-teal">
            ✦ {earnedCount} / {totalCount} Earned
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div className="brand-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} aria-hidden="true">✦</div>
            <p style={{ color: 'var(--text-muted)' }}>Polishing your badge shelf...</p>
          </div>
        )}

        {!loading && error && (
          <div role="alert" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>⚠️ {error}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={fetchBadges}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid-2">
            {badges.map((badge) => {
              const earnedDateText = formatReadableDate(badge.date_earned);
              const ariaLabel = badge.earned
                ? `${badge.name}, earned on ${earnedDateText}. ${badge.description}`
                : `${badge.name}, locked. ${badge.hint}`;

              return (
                <article
                  key={badge.badge_type}
                  tabIndex={0}
                  aria-label={ariaLabel}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    borderColor: badge.earned ? `${badge.colour}66` : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: badge.earned
                      ? badge.is_new
                        ? `0 0 32px ${badge.colour}55, inset 0 0 24px ${badge.colour}22`
                        : `0 8px 28px rgba(0, 0, 0, 0.35), 0 0 22px ${badge.colour}26`
                      : 'none',
                    background: badge.earned
                      ? `linear-gradient(135deg, ${badge.colour}18 0%, rgba(255, 255, 255, 0.05) 100%)`
                      : 'rgba(255, 255, 255, 0.025)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        aria-hidden="true"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          background: badge.earned ? `${badge.colour}28` : 'rgba(255, 255, 255, 0.05)',
                          color: badge.earned ? badge.colour : 'var(--text-dim)',
                          border: `1px solid ${badge.earned ? badge.colour : 'rgba(255, 255, 255, 0.12)'}`,
                          boxShadow: badge.earned ? `0 0 16px ${badge.colour}44` : 'none',
                          flexShrink: 0,
                        }}
                      >
                        {badge.earned ? badge.icon : '🔒'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {badge.name}
                        </h3>
                        {badge.is_new && (
                          <span className="badge badge-gold" style={{ fontSize: '0.68rem', marginTop: '0.25rem' }}>
                            ✨ NEWLY UNLOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`badge ${badge.earned ? 'badge-success' : ''}`}
                      style={
                        badge.earned
                          ? { whiteSpace: 'nowrap' }
                          : {
                              background: 'rgba(255, 255, 255, 0.06)',
                              color: 'var(--text-dim)',
                              borderColor: 'rgba(255, 255, 255, 0.12)',
                              whiteSpace: 'nowrap',
                            }
                      }
                    >
                      {badge.earned ? '✓ Earned' : '🔒 Locked'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {badge.earned ? badge.description : badge.hint}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: badge.earned ? badge.colour : 'var(--text-dim)', fontWeight: 600 }}>
                    {badge.earned ? `Earned on ${earnedDateText}` : 'Keep lighting daily stars to unlock'}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/sky" className="btn btn-secondary btn-sm">
            ← Back to My Sky
          </Link>
          <Link to="/habits" className="btn btn-primary btn-sm">
            Manage Habits ✦
          </Link>
        </div>
      </div>
    </div>
  );
}
