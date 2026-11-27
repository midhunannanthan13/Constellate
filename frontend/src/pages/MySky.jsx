import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skyApi, habitsApi } from '../services/api';
import NightSky from '../components/NightSky';
import usePageTitle from '../hooks/usePageTitle';

export default function MySky() {
  usePageTitle('My Sky');
  const { user, tokens } = useAuth();
  const token = tokens?.access;

  const [skyData, setSkyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);

  // Toast notification for 7-day constellation celebration
  const [toastMessage, setToastMessage] = useState(null);

  const fetchSky = useCallback(async () => {
    if (!token) return;
    try {
      const data = await skyApi.get(token);
      setSkyData(data);

      // Check for any 7-day completed constellations to celebrate
      const completed = data.habits?.filter((h) => h.is_constellation_complete);
      if (completed?.length > 0 && !sessionStorage.getItem('constellation_celebrated')) {
        setToastMessage(`✦ Constellation Formed! 7-day streak achieved for ${completed[0].name}!`);
        sessionStorage.setItem('constellation_celebrated', 'true');
        setTimeout(() => setToastMessage(null), 6000);
      }
    } catch (err) {
      setError(err.message || 'Could not load your night sky.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSky();
  }, [fetchSky]);

  const handleCopyFriendCode = () => {
    const code = skyData?.user?.friend_code || user?.friend_code;
    if (code) {
      navigator.clipboard?.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCheckinToggle = async (habit) => {
    if (!token) return;
    setCheckingInId(habit.id);

    try {
      if (habit.is_checked_today) {
        await habitsApi.uncheck(token, habit.id);
      } else {
        const res = await habitsApi.checkin(token, habit.id);
        if (res.newly_earned_badges && res.newly_earned_badges.length > 0) {
          const badgeNames = res.newly_earned_badges.map((b) => b.name).join(', ');
          setToastMessage(`★ Badge Unlocked: ${badgeNames}! Visit your Profile to view your Badge Shelf.`);
          setTimeout(() => setToastMessage(null), 6000);
        } else if (res.current_streak === 7) {
          setToastMessage(`✦ Constellation Formed! 7-day streak achieved for ${habit.name}!`);
          setTimeout(() => setToastMessage(null), 6000);
        }
      }
      await fetchSky();
    } catch (err) {
      setError(err.message || 'Check-in failed.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setTimeout(() => setCheckingInId(null), 800);
    }
  };

  const habits = skyData?.habits || [];
  const totalStarsCount = habits.reduce((acc, h) => acc + (h.checkins?.length || 0), 0);
  const completedConstellations = habits.filter((h) => h.is_constellation_complete);

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Toast Notification for 7-Day Constellation Completion */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fade-in"
          style={{
            position: 'fixed',
            top: '5rem',
            right: '1.5rem',
            zIndex: 1000,
            background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.2), rgba(139, 124, 255, 0.2))',
            border: '1.5px solid var(--star-gold)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(255, 215, 106, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: 'var(--text-primary)',
          }}
        >
          <span style={{ fontSize: '1.6rem', color: 'var(--star-gold)' }} aria-hidden="true">★</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--star-gold)', fontSize: '0.95rem' }}>CELESTIAL MILESTONE</div>
            <div style={{ fontSize: '0.9rem' }}>{toastMessage}</div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setToastMessage(null)}
            style={{ padding: '0.2rem 0.5rem', marginLeft: '0.5rem' }}
            aria-label="Dismiss milestone alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sky Header */}
      <div className="glass-card glow-gold" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>✦ SIGNATURE NIGHT SKY</span>
            <h1 className="text-gradient">My Night Sky</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Your habits, written in stars. Every check-in illuminates a star and draws a celestial bond.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-teal" title="Active habit constellations">
              ★ {habits.length} {habits.length === 1 ? 'Constellation' : 'Constellations'}
            </span>
            <span className="badge badge-gold" title="Total illuminated check-in stars">
              ✦ {totalStarsCount} Stars Lit
            </span>
            {completedConstellations.length > 0 && (
              <span className="badge badge-pink" title="7-day completed constellations">
                ✨ {completedConstellations.length} Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error)',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Main Layout: Sky Canvas (Left/Center) + Side Panel (Right) */}
      <div className="sky-layout-grid">
        {/* Left Column: Interactive Night Sky */}
        <div style={{ minWidth: 0 }}>
          {loading ? (
            <div className="glass-card" style={{ height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="brand-icon" style={{ fontSize: '2.5rem', display: 'inline-block', marginBottom: '0.75rem' }} aria-hidden="true">
                  ✦
                </span>
                <p style={{ color: 'var(--text-muted)' }}>Charting your celestial night sky...</p>
              </div>
            </div>
          ) : habits.length === 0 ? (
            /* Calm Empty State */
            <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ fontSize: '3.5rem', color: 'var(--star-gold)', marginBottom: '1.25rem' }} aria-hidden="true">
                ✦
              </div>
              <h2 style={{ marginBottom: '0.75rem' }}>Your night sky is waiting for its first star</h2>
              <p style={{ maxWidth: '480px', margin: '0 auto 1.75rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Create your first habit star to start drawing constellations across your personal cosmic horizon.
              </p>
              <Link to="/habits" className="btn btn-primary btn-lg">
                Create Your First Habit Star ✦
              </Link>
            </div>
          ) : (
            <>
              <NightSky
                habits={habits}
                onCheckinToggle={handleCheckinToggle}
                checkingInId={checkingInId}
              />

              <div className="sky-tip-bar">
                <span>✦ Tap any star to inspect or check in — 7 days in a row completes a constellation.</span>
                <Link to="/habits" className="sky-tip-link">
                  Manage Habits →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Friend Code & "Today" Quick Check-In Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Unique Friend Code Card */}
          <div className="glass-card glow-teal" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
              Your Star Friend Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <code
                style={{
                  fontSize: '1.15rem',
                  fontFamily: 'monospace',
                  color: 'var(--star-gold)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                {skyData?.user?.friend_code || user?.friend_code || 'STAR-LOADING'}
              </code>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyFriendCode}
                aria-label="Copy your star friend code"
              >
                {copiedCode ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
              Share this code so friends can visit your celestial night sky.
            </p>
          </div>

          {/* "Today" Quick Panel */}
          <div className="glass-card glow-gold" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Today's Check-Ins</h3>
              <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                {habits.filter((h) => h.is_checked_today).length} / {habits.length} Done
              </span>
            </div>

            {habits.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active habits. Light your first star from the Habits page.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: habit.colour,
                          boxShadow: `0 0 6px ${habit.colour}`,
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {habit.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          ★ {habit.current_streak}d streak
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${habit.is_checked_today ? 'btn-teal' : 'btn-outline'}`}
                      onClick={() => handleCheckinToggle(habit)}
                      disabled={checkingInId === habit.id}
                      aria-label={`${habit.name}: ${habit.is_checked_today ? 'Checked in today. Click to un-check.' : 'Click to check in for today.'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {habit.is_checked_today ? '✓ Done' : '✦ Light'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Reader Accessible Sky Overview List */}
      <section className="sr-only" aria-label="Screen reader night sky summary">
        <h2>Night Sky Overview</h2>
        <ul>
          {habits.map((h) => (
            <li key={h.id}>
              Habit: {h.name}, {h.current_streak} day current streak, best streak {h.best_streak} days,{' '}
              {h.is_checked_today ? 'checked in today' : 'not checked in today'},{' '}
              {h.is_constellation_complete ? '7-day constellation complete' : 'constellation in progress'}.
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
