import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { habitsApi } from '../services/api';

const AURORA_COLORS = [
  { hex: '#FFD76A', name: 'Star Gold' },
  { hex: '#3EE6C3', name: 'Aurora Teal' },
  { hex: '#8B7CFF', name: 'Aurora Violet' },
  { hex: '#FF7AC6', name: 'Aurora Pink' },
  { hex: '#4ADE80', name: 'Aurora Green' },
  { hex: '#60A5FA', name: 'Celestial Blue' },
];

export default function Habits() {
  const { tokens } = useAuth();
  const token = tokens?.access;

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badgeToast, setBadgeToast] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    colour: '#FFD76A',
    days_per_week_goal: 7,
  });

  const fetchHabits = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await habitsApi.list(token, { archived: showArchived });
      setHabits(data);
    } catch (err) {
      setError(err.message || 'Could not load your habits.');
    } finally {
      setLoading(false);
    }
  }, [token, showArchived]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormData({ name: '', colour: '#FFD76A', days_per_week_goal: 7 });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      colour: habit.colour,
      days_per_week_goal: habit.days_per_week_goal,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Please give your habit star a name.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      if (editingHabit) {
        await habitsApi.update(token, editingHabit.id, formData);
      } else {
        await habitsApi.create(token, formData);
      }
      setIsModalOpen(false);
      fetchHabits();
    } catch (err) {
      setModalError(err.message || 'Failed to save habit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArchive = async (habit) => {
    try {
      await habitsApi.archive(token, habit.id);
      fetchHabits();
    } catch (err) {
      setError(err.message || 'Could not update habit.');
    }
  };

  const handleDeleteHabit = async (habit) => {
    if (window.confirm(`Are you sure you want to extinguish '${habit.name}' and all its stars?`)) {
      try {
        await habitsApi.delete(token, habit.id);
        fetchHabits();
      } catch (err) {
        setError(err.message || 'Could not delete habit.');
      }
    }
  };

  const handleQuickCheckinToggle = async (habit) => {
    try {
      if (habit.is_checked_today) {
        await habitsApi.uncheck(token, habit.id);
      } else {
        const res = await habitsApi.checkin(token, habit.id);
        if (res.newly_earned_badges && res.newly_earned_badges.length > 0) {
          const names = res.newly_earned_badges.map((b) => b.name).join(', ');
          setBadgeToast(`★ Badge Unlocked: ${names}!`);
          setTimeout(() => setBadgeToast(null), 6000);
        }
      }
      fetchHabits();
    } catch (err) {
      setError(err.message || 'Could not update check-in.');
    }
  };

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header bar */}
      <div className="glass-card glow-gold" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.4rem' }}>✦ HABIT CONSTELLATIONS</span>
            <h1 className="text-gradient">Your Habits</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Manage your daily celestial routines. Every active habit is a star in your night sky.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${showArchived ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setShowArchived((prev) => !prev)}
              aria-pressed={showArchived}
            >
              {showArchived ? '★ View Active Habits' : '📦 View Archived'}
            </button>
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              <span>✦</span> New Habit
            </button>
          </div>
        </div>
      </div>

      {/* Badge Toast Banner */}
      {badgeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fade-in"
          style={{
            padding: '0.9rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.2), rgba(139, 124, 255, 0.2))',
            border: '1.5px solid var(--star-gold)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>
            <strong style={{ color: 'var(--star-gold)' }}>{badgeToast}</strong> —{' '}
            <Link to="/profile" style={{ color: 'var(--aurora-teal)', fontWeight: 600 }}>
              View Badge Shelf →
            </Link>
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setBadgeToast(null)}
            aria-label="Dismiss badge notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '0.85rem 1rem',
            background: 'var(--error-bg)',
            border: '1px solid rgba(255, 107, 129, 0.4)',
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

      {/* Loading State */}
      {loading && (
        <div className="grid-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card" style={{ height: '170px', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="brand-icon" style={{ fontSize: '1.5rem', animationDuration: '1.2s' }} aria-hidden="true">✦</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && habits.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', color: 'var(--star-gold)', marginBottom: '1rem' }} aria-hidden="true">
            ✦
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>
            {showArchived ? 'No archived habits' : 'No habits illuminated yet'}
          </h2>
          <p style={{ maxWidth: '520px', margin: '0 auto 1.75rem', color: 'var(--text-muted)' }}>
            {showArchived
              ? 'You do not have any archived habits stored in the celestial archives.'
              : 'Begin creating your personal constellation. Add your first habit star to start lighting your night sky.'}
          </p>
          {!showArchived && (
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              Create Your First Habit Star ✦
            </button>
          )}
        </div>
      )}

      {/* Habits Grid */}
      {!loading && habits.length > 0 && (
        <div className="grid-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="glass-card glass-card-interactive"
              style={{
                borderColor: `${habit.colour}33`,
                boxShadow: `var(--glass-shadow), 0 0 20px ${habit.colour}15`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: habit.colour,
                        boxShadow: `0 0 10px ${habit.colour}`,
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{habit.name}</h2>
                  </div>

                  <span
                    className="badge"
                    style={{
                      background: `${habit.colour}22`,
                      color: habit.colour,
                      borderColor: `${habit.colour}44`,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Goal: {habit.days_per_week_goal} {habit.days_per_week_goal === 1 ? 'day' : 'days'} per week
                  </span>
                </div>

                {/* Streaks & Stats */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span className="badge badge-gold" title="Current uninterrupted streak">
                    <span aria-hidden="true">★</span> Current: {habit.current_streak} {habit.current_streak === 1 ? 'day' : 'days'}
                  </span>
                  <span className="badge badge-teal" title="Best historical streak">
                    <span aria-hidden="true">✦</span> Best: {habit.best_streak} {habit.best_streak === 1 ? 'day' : 'days'}
                  </span>
                  <span className="badge badge-violet">
                    Total: {habit.total_checkins} check-ins
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                {/* Full-width single-line Today Check-in Toggle Button */}
                <button
                  type="button"
                  className={`btn btn-sm ${habit.is_checked_today ? 'btn-teal' : 'btn-outline'}`}
                  onClick={() => handleQuickCheckinToggle(habit)}
                  aria-label={`${habit.name}: ${habit.is_checked_today ? 'Checked in today. Click to un-check.' : 'Click to check in today'}`}
                  style={{ width: '100%', whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}
                >
                  <span aria-hidden="true">{habit.is_checked_today ? '✓' : '✦'}</span>
                  <span>{habit.is_checked_today ? 'Checked In Today' : 'Check In Today'}</span>
                </button>

                {/* Evenly spaced secondary actions grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(84px, 1fr))',
                    gap: '0.5rem',
                  }}
                >
                  <Link
                    to={`/habits/${habit.id}`}
                    className="btn btn-secondary btn-sm"
                    aria-label={`View 30-day calendar strip for ${habit.name}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Calendar ↗
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(habit)}
                    aria-label={`Edit ${habit.name}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleToggleArchive(habit)}
                    aria-label={habit.archived ? `Restore ${habit.name}` : `Archive ${habit.name}`}
                    title={habit.archived ? 'Restore to sky' : 'Archive habit'}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {habit.archived ? 'Restore' : 'Archive'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteHabit(habit)}
                    aria-label={`Delete ${habit.name}`}
                    title="Delete permanently"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Create / Edit Habit Glass Modal --- */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="habit-modal-title"
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
          <div className="glass-card glow-gold" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 id="habit-modal-title" style={{ fontSize: '1.5rem' }}>
                {editingHabit ? 'Edit Habit Star' : 'Light a New Habit Star'}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div
                role="alert"
                style={{
                  padding: '0.75rem',
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--error)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit}>
              {/* Name */}
              <div className="form-group">
                <label htmlFor="habit-modal-name" className="form-label">
                  Habit Star Name
                  <span className="required-mark" aria-hidden="true">*</span>
                </label>
                <input
                  id="habit-modal-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Daily Meditation, 30 Min Reading, Python Code..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              {/* Aurora Color Picker */}
              <div className="form-group">
                <label className="form-label">Star Celestial Color</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                  {AURORA_COLORS.map((c) => {
                    const isSelected = formData.colour.toUpperCase() === c.hex.toUpperCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, colour: c.hex })}
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          justifyContent: 'flex-start',
                          border: isSelected ? `2px solid ${c.hex}` : '1px solid var(--glass-border)',
                          background: isSelected ? `${c.hex}22` : 'var(--glass-bg)',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: c.hex,
                            boxShadow: `0 0 6px ${c.hex}`,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Days Per Week Goal */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="habit-modal-goal" className="form-label">
                  Weekly Frequency Goal ({formData.days_per_week_goal} days / week)
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                    const isSelected = formData.days_per_week_goal === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormData({ ...formData, days_per_week_goal: num })}
                        className={`btn btn-sm ${isSelected ? 'btn-teal' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '0.5rem 0' }}
                        aria-pressed={isSelected}
                      >
                        {num}d
                      </button>
                    );
                  })}
                </div>
                <span className="form-helper" style={{ marginTop: '0.4rem' }}>
                  {formData.days_per_week_goal === 7 ? 'Full week consistency constellation target' : `${formData.days_per_week_goal} days target per week`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingHabit ? 'Save Changes' : 'Light Star ✦'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
