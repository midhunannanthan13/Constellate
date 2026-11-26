import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { habitsApi } from '../services/api';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const token = tokens?.access;

  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Note dialog state for checking in with a note
  const [activeDateModal, setActiveDateModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchHabitDetail = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const data = await habitsApi.get(token, id);
      setHabit(data);
    } catch (err) {
      setError(err.message || 'Could not load habit details.');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchHabitDetail();
  }, [fetchHabitDetail]);

  // Construct the last 30 days array up to today using local timezone
  const generateLast30Days = useCallback(() => {
    const days = [];
    const today = new Date();
    // Normalize to midnight local time
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      const isToday = i === 0;

      // Find matching checkin in habit's last 30 days records
      const checkinRecord = habit?.last_30_days_checkins?.find(
        (c) => c.date === dateStr
      );

      days.push({
        date: d,
        dateStr,
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
        isChecked: !!checkinRecord,
        checkin: checkinRecord || null,
      });
    }
    return days;
  }, [habit]);

  const thirtyDays = generateLast30Days();

  const handleDayClick = async (day) => {
    if (day.isChecked) {
      // Un-check
      try {
        await habitsApi.uncheck(token, habit.id, { date: day.dateStr });
        setActionSuccess(`Star un-checked for ${day.dateStr}`);
        setTimeout(() => setActionSuccess(''), 2500);
        fetchHabitDetail();
      } catch (err) {
        setError(err.message || 'Could not remove check-in.');
      }
    } else {
      // Open dialog to allow adding note or instant check-in
      setActiveDateModal(day);
      setNoteText('');
    }
  };

  const handleModalCheckIn = async (e) => {
    e.preventDefault();
    if (!activeDateModal) return;

    setModalSubmitting(true);
    try {
      await habitsApi.checkin(token, habit.id, {
        date: activeDateModal.dateStr,
        note: noteText.trim() || undefined,
      });
      setActiveDateModal(null);
      setActionSuccess(`Star illuminated for ${activeDateModal.dateStr}!`);
      setTimeout(() => setActionSuccess(''), 2500);
      fetchHabitDetail();
    } catch (err) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setModalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
        <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">
          ✦
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Charting celestial constellation...</p>
      </div>
    );
  }

  if (error && !habit) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--error)' }}>Habit Not Found</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>{error}</p>
          <Link to="/habits" className="btn btn-primary">
            ← Return to Habits
          </Link>
        </div>
      </div>
    );
  }

  const checkedCountInLast30 = thirtyDays.filter((d) => d.isChecked).length;
  const completionPercent = Math.round((checkedCountInLast30 / 30) * 100);

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Back button & Title Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/habits" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back to All Habits
        </Link>
      </div>

      <div
        className="glass-card"
        style={{
          borderColor: `${habit.colour}44`,
          boxShadow: `var(--glass-shadow), 0 0 24px ${habit.colour}18`,
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #FFFFFF, ${habit.colour})`,
                boxShadow: `0 0 16px ${habit.colour}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#070B1A',
                fontWeight: 700,
              }}
              aria-hidden="true"
            >
              ✦
            </div>
            <div>
              <span className="badge" style={{ background: `${habit.colour}22`, color: habit.colour, marginBottom: '0.35rem' }}>
                Goal: {habit.days_per_week_goal} days / week
              </span>
              <h1 style={{ fontSize: '2rem' }}>{habit.name}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className={`btn ${habit.is_checked_today ? 'btn-teal' : 'btn-primary'}`}
              onClick={() => {
                const todayDay = thirtyDays.find((d) => d.isToday);
                if (todayDay) handleDayClick(todayDay);
              }}
            >
              <span>{habit.is_checked_today ? '✓' : '✦'}</span>
              <span>{habit.is_checked_today ? 'Checked In Today' : 'Check In Today'}</span>
            </button>
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
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--success-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span aria-hidden="true">✓</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Streak Bento Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card glow-gold">
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>CURRENT STREAK</span>
          <div style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--star-gold)' }}>
            {habit.current_streak} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {habit.current_streak >= 7
              ? '✦ 7-Day Constellation Formed!'
              : `${7 - habit.current_streak} more consecutive days to complete constellation.`}
          </p>
        </div>

        <div className="glass-card glow-teal">
          <span className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>BEST STREAK</span>
          <div style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--aurora-teal)' }}>
            {habit.best_streak} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>Longest historical streak for this celestial routine.</p>
        </div>

        <div className="glass-card glow-violet">
          <span className="badge badge-violet" style={{ marginBottom: '0.5rem' }}>30-DAY DENSITY</span>
          <div style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--aurora-violet)' }}>
            {completionPercent}%
          </div>
          <p style={{ fontSize: '0.85rem' }}>{checkedCountInLast30} of 30 days illuminated.</p>
        </div>
      </div>

      {/* --- 30-Day Calendar Strip --- */}
      <div className="glass-card glow-gold" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>30-Day Constellation Strip</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Click any star cell to illuminate or un-check that day.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: habit.colour, boxShadow: `0 0 6px ${habit.colour}` }} />
              Checked In
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.3)' }} />
              Missed / Unchecked
            </span>
          </div>
        </div>

        {/* Calendar Grid Cells */}
        <div
          role="grid"
          aria-label={`30-day check-in history for ${habit.name}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gap: '0.65rem',
          }}
        >
          {thirtyDays.map((day) => {
            const label = `${day.monthName} ${day.dayOfMonth} (${day.dayOfWeek}): ${
              day.isChecked ? 'Checked in' : 'Not checked in'
            }${day.checkin?.note ? `. Note: ${day.checkin.note}` : ''}. Click to ${day.isChecked ? 'un-check' : 'check in'}.`;

            return (
              <button
                key={day.dateStr}
                type="button"
                role="gridcell"
                tabIndex={0}
                onClick={() => handleDayClick(day)}
                aria-label={label}
                title={label}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.65rem 0.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: day.isChecked
                    ? `1.5px solid ${habit.colour}`
                    : day.isToday
                    ? '1.5px dashed var(--aurora-teal)'
                    : '1px solid var(--glass-border)',
                  background: day.isChecked
                    ? `${habit.colour}1a`
                    : day.isToday
                    ? 'rgba(62, 230, 195, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all var(--anim-duration-fast) var(--anim-ease)',
                }}
              >
                {/* Day label */}
                <span style={{ fontSize: '0.65rem', color: day.isToday ? 'var(--aurora-teal)' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                  {day.isToday ? 'Today' : day.dayOfWeek}
                </span>

                {/* Day number */}
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                  {day.dayOfMonth}
                </span>

                {/* Star icon indicator */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: day.isChecked ? '#070B1A' : 'var(--text-dim)',
                    background: day.isChecked ? habit.colour : 'transparent',
                    boxShadow: day.isChecked ? `0 0 10px ${habit.colour}` : 'none',
                    border: day.isChecked ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                  aria-hidden="true"
                >
                  {day.isChecked ? '✦' : '·'}
                </div>

                {/* Note dot indicator if a note was recorded */}
                {day.checkin?.note && (
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: 'var(--star-gold)',
                      marginTop: '0.2rem',
                    }}
                    title={`Note: ${day.checkin.note}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Check-In Modal with Reflection Note --- */}
      {activeDateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-dialog-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(7, 11, 26, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div className="glass-card glow-teal" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 id="checkin-dialog-title" style={{ marginBottom: '0.5rem' }}>
              Light Star for {activeDateModal.monthName} {activeDateModal.dayOfMonth}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Confirm your check-in for <strong>{habit.name}</strong>. You can optionally record a short reflection.
            </p>

            <form onSubmit={handleModalCheckIn}>
              <div className="form-group">
                <label htmlFor="checkin-note-input" className="form-label">
                  Daily Reflection Note (Optional)
                </label>
                <input
                  id="checkin-note-input"
                  type="text"
                  maxLength={280}
                  className="form-input"
                  placeholder="e.g. Read 2 chapters of Cosmos; felt focused."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveDateModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Lighting Star...' : 'Confirm Check-In ✦'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
