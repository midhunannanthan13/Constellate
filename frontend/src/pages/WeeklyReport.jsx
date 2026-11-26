import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi } from '../services/api';

export default function WeeklyReport() {
  const { tokens } = useAuth();
  const token = tokens?.access;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await reportsApi.weekly(token);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Could not load your Weekly Sky Report.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Written calm summary comparing this week vs last week
  const buildWrittenSummary = (data) => {
    if (!data) return '';
    const thisW = data.total_this_week || 0;
    const lastW = data.total_last_week || 0;
    const diff = thisW - lastW;

    const starWord = thisW === 1 ? 'star' : 'stars';
    if (thisW === 0 && lastW === 0) {
      return 'Your sky is calm and ready. Light your first star this week to begin your celestial report.';
    }
    if (diff > 0) {
      return `You lit ${thisW} ${starWord} this week, ${diff} more than last week. Your constellations are growing brighter.`;
    }
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      return `You lit ${thisW} ${starWord} this week, ${absDiff} fewer than last week. Every quiet evening is a chance to begin anew.`;
    }
    return `You lit ${thisW} ${starWord} this week, matching last week's steady rhythm.`;
  };

  if (loading) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', padding: '6rem 1.25rem' }}>
        <div className="brand-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }} aria-hidden="true">
          ✦
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Reading the Stars...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Summarizing your last 7 days from the celestial sky.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container fade-in" style={{ padding: '3rem 1.25rem', maxWidth: '540px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }} role="alert">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">⚠️</div>
          <h2 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Unable to Load Report</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={fetchReport}>
            Try Again ✦
          </button>
        </div>
      </div>
    );
  }

  // Empty state for new user with no habits or zero check-ins across both weeks
  if (!report?.has_habits) {
    return (
      <div className="container fade-in" style={{ padding: '3rem 1.25rem' }}>
        <div className="glass-card glow-violet" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
          <div style={{ fontSize: '3.25rem', color: 'var(--star-gold)', marginBottom: '1rem' }} aria-hidden="true">
            ✦
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.1rem', marginBottom: '0.75rem' }}>
            Weekly Sky Report
          </h1>
          <p style={{ maxWidth: '500px', margin: '0 auto 2rem', color: 'var(--text-muted)' }}>
            Once you create a habit star and record a few daily check-ins, your weekly patterns, streaks, and glowing bar chart will appear here.
          </p>
          <Link to="/habits" className="btn btn-primary btn-lg">
            Create Your First Habit Star ✦
          </Link>
        </div>
      </div>
    );
  }

  const dailyCheckins = report.daily_checkins || [];
  const maxDailyCount = Math.max(1, ...dailyCheckins.map((d) => d.count));
  const diffFromLastWeek = report.total_this_week - report.total_last_week;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Top Written Summary Glass Card */}
      <div className="glass-card glow-gold" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              📊 7-DAY CELESTIAL SUMMARY
            </span>
            <h1 className="text-gradient" style={{ marginBottom: '0.65rem' }}>
              Weekly Sky Report
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', maxWidth: '720px', lineHeight: '1.65' }}>
              {buildWrittenSummary(report)}
            </p>
          </div>

          <Link to="/sky" className="btn btn-secondary btn-sm">
            ← Back to My Sky
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid-bento">
        {/* Stat 1: Total Check-Ins This Week */}
        <div className="glass-card glow-gold col-span-4">
          <span className="badge badge-gold" style={{ marginBottom: '0.65rem' }}>★ STARS LIT THIS WEEK</span>
          <div style={{ fontSize: '2.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--star-gold)' }}>
            {report.total_this_week}
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {diffFromLastWeek > 0 ? (
              <span style={{ color: 'var(--success)' }}>▲ +{diffFromLastWeek} vs last week ({report.total_last_week})</span>
            ) : diffFromLastWeek < 0 ? (
              <span style={{ color: 'var(--warning)' }}>▼ {diffFromLastWeek} vs last week ({report.total_last_week})</span>
            ) : (
              <span>● Same as last week ({report.total_last_week})</span>
            )}
          </p>
        </div>

        {/* Stat 2: Best Current Streak */}
        <div className="glass-card glow-teal col-span-4">
          <span className="badge badge-teal" style={{ marginBottom: '0.65rem' }}>✦ BEST CURRENT STREAK</span>
          <div style={{ fontSize: '2.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--aurora-teal)' }}>
            {report.best_current_streak}{' '}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              {report.best_current_streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {report.best_current_streak >= 7
              ? '✨ 7-day constellation achieved!'
              : 'Keep lighting daily stars to reach 7 days.'}
          </p>
        </div>

        {/* Stat 3: Quietest Day (4 Weeks) */}
        <div className="glass-card glow-violet col-span-4">
          <span className="badge badge-violet" style={{ marginBottom: '0.65rem' }}>🌙 QUIETEST DAY (4 WKS)</span>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--aurora-violet)', marginTop: '0.35rem' }}>
            {report.quietest_day ? report.quietest_day.day_name : '—'}
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.45rem' }}>
            {report.quietest_day
              ? `${report.quietest_day.count} ${report.quietest_day.count === 1 ? 'check-in' : 'check-ins'} over the last 4 weeks`
              : 'No check-ins recorded in the last 4 weeks.'}
          </p>
        </div>

        {/* Glowing Bar Chart: Check-ins per day (last 7 days) */}
        <div className="glass-card glow-teal col-span-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>Daily Starlight (Last 7 Days)</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Number of habit check-ins recorded each day.
              </p>
            </div>
            <span className="badge badge-teal">7-Day Chart</span>
          </div>

          {/* Visual Glowing Bar Chart */}
          <div
            aria-hidden="true"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.75rem',
              alignItems: 'end',
              height: '200px',
              padding: '1.25rem 0.5rem 0.5rem',
              borderBottom: '1px solid var(--glass-border)',
            }}
          >
            {dailyCheckins.map((day) => {
              const heightPercent = day.count === 0 ? 6 : Math.max(16, Math.round((day.count / maxDailyCount) * 100));
              const isToday = day === dailyCheckins[dailyCheckins.length - 1];
              return (
                <div
                  key={day.date}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '0.45rem',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: day.count > 0 ? 'var(--text-primary)' : 'var(--text-dim)' }}>
                    {day.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPercent}%`,
                      borderRadius: '10px 10px 4px 4px',
                      background:
                        day.count > 0
                          ? isToday
                            ? 'linear-gradient(180deg, #FFD76A 0%, rgba(255, 215, 106, 0.35) 100%)'
                            : 'linear-gradient(180deg, #3EE6C3 0%, rgba(62, 230, 195, 0.25) 100%)'
                          : 'rgba(255, 255, 255, 0.06)',
                      boxShadow:
                        day.count > 0
                          ? isToday
                            ? '0 0 18px rgba(255, 215, 106, 0.45)'
                            : '0 0 14px rgba(62, 230, 195, 0.3)'
                          : 'none',
                      border: day.count > 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'height 0.4s ease',
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.75rem',
              paddingTop: '0.6rem',
              textAlign: 'center',
            }}
          >
            {dailyCheckins.map((day, idx) => {
              const isToday = idx === dailyCheckins.length - 1;
              return (
                <div key={day.date} style={{ fontSize: '0.78rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--star-gold)' : 'var(--text-muted)' }}>
                  {isToday ? 'Today' : day.day_name}
                </div>
              );
            })}
          </div>

          {/* Visually Hidden Accessible Table Alternative for Screen Readers */}
          <table className="sr-only">
            <caption>Check-ins per day for the last 7 days</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Day</th>
                <th scope="col">Check-ins</th>
              </tr>
            </thead>
            <tbody>
              {dailyCheckins.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.full_day_name}</td>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Most Consistent Habit Highlight Card */}
        <div className="glass-card glow-gold col-span-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-pink" style={{ marginBottom: '0.75rem' }}>✨ MOST CONSISTENT</span>
            {report.most_consistent_habit ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: report.most_consistent_habit.colour,
                      boxShadow: `0 0 10px ${report.most_consistent_habit.colour}`,
                    }}
                    aria-hidden="true"
                  />
                  <h3 style={{ fontSize: '1.35rem' }}>{report.most_consistent_habit.name}</h3>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Lit <strong>{report.most_consistent_habit.this_week_checkins}</strong> of{' '}
                  <strong>{report.most_consistent_habit.days_per_week_goal}</strong> goal days this week (
                  {report.most_consistent_habit.progress_percent}%).
                </p>
                <span className="badge badge-gold">
                  ★ {report.most_consistent_habit.current_streak}d current streak
                </span>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No check-ins this week yet</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  Check in on any habit today to crown your most consistent constellation.
                </p>
              </>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
            <Link to="/habits" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              Review All Habits →
            </Link>
          </div>
        </div>

        {/* Goal Progress Per Habit (Full Width Bento Card) */}
        <div className="glass-card col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>Goal Progress per Habit</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This week's check-ins compared against each habit's weekly target.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {report.habits_progress.map((habit) => (
              <div
                key={habit.id}
                style={{
                  padding: '1rem 1.15rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: habit.colour,
                        boxShadow: `0 0 8px ${habit.colour}`,
                      }}
                      aria-hidden="true"
                    />
                    <Link
                      to={`/habits/${habit.id}`}
                      style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '1rem' }}
                    >
                      {habit.name}
                    </Link>
                    {habit.progress_percent >= 100 && (
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        ✓ Goal Met
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Last week: {habit.last_week_checkins}
                    </span>
                    <strong style={{ color: habit.colour }}>
                      {habit.this_week_checkins} / {habit.days_per_week_goal} days ({habit.progress_percent}%)
                    </strong>
                  </div>
                </div>

                {/* Progress Track */}
                <div
                  role="progressbar"
                  aria-valuenow={habit.progress_percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${habit.name} weekly goal progress: ${habit.this_week_checkins} of ${habit.days_per_week_goal} days (${habit.progress_percent}%)`}
                  style={{
                    width: '100%',
                    height: '10px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${habit.progress_percent}%`,
                      height: '100%',
                      borderRadius: '999px',
                      background: habit.colour,
                      boxShadow: `0 0 12px ${habit.colour}`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
