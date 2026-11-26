import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Deterministic pseudo-random number generator from a string seed.
 * Ensures star positions never shift or jitter between renders.
 */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    return (h >>> 0) / 4294967296;
  };
}

// Convert YYYY-MM-DD to local midnight timestamp for exact day diffing
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function NightSky({
  habits = [],
  onCheckinToggle,
  onHabitClick,
  checkingInId = null,
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [selectedStarHabit, setSelectedStarHabit] = useState(null);

  // Resize observer to maintain crisp responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        // Maintain a pleasing astronomical 16:10 or 16:9 ratio
        const w = clientWidth || 900;
        const h = Math.max(Math.min(w * 0.65, 680), 460);
        setDimensions({ width: w, height: h });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute deterministic constellation layout for each habit
  const constellationData = useMemo(() => {
    const { width, height } = dimensions;
    const count = habits.length;
    if (count === 0) return [];

    // Region centers for each habit based on count
    const centers = [];
    if (count === 1) {
      centers.push({ x: width * 0.5, y: height * 0.48 });
    } else if (count === 2) {
      centers.push({ x: width * 0.32, y: height * 0.48 });
      centers.push({ x: width * 0.68, y: height * 0.48 });
    } else if (count === 3) {
      centers.push({ x: width * 0.28, y: height * 0.4 });
      centers.push({ x: width * 0.72, y: height * 0.4 });
      centers.push({ x: width * 0.5, y: height * 0.7 });
    } else {
      // Orbital distribution around sky
      const rx = width * 0.35;
      const ry = height * 0.3;
      const cx = width * 0.5;
      const cy = height * 0.5;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        centers.push({
          x: cx + Math.cos(angle) * rx,
          y: cy + Math.sin(angle) * ry,
        });
      }
    }

    return habits.map((habit, habitIndex) => {
      const center = centers[habitIndex] || { x: width * 0.5, y: height * 0.5 };
      const rng = hashSeed(`habit_${habit.id}_pos`);

      // Sort check-ins chronologically
      const sortedCheckins = [...(habit.checkins || [])].sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      // Home star properties
      const streak = habit.current_streak || 0;
      const homeRadius = Math.min(8 + streak * 0.85, 18);

      // Compute positions of check-in stars relative to home star
      const stars = sortedCheckins.map((checkin, idx) => {
        const starRng = hashSeed(`${habit.id}_${checkin.date}`);
        const baseAngle = (idx / Math.max(sortedCheckins.length, 1)) * Math.PI * 2;
        const jitterAngle = (starRng() - 0.5) * 0.4;
        const angle = baseAngle + jitterAngle;

        // Spread stars in an organic celestial cluster
        const dist = 32 + (idx % 7) * 14 + starRng() * 18;

        const x = Math.max(30, Math.min(width - 30, center.x + Math.cos(angle) * dist));
        const y = Math.max(30, Math.min(height - 30, center.y + Math.sin(angle) * dist));

        return {
          id: checkin.id,
          date: checkin.date,
          note: checkin.note,
          x,
          y,
          radius: 3.5 + (idx % 3) * 0.5,
        };
      });

      // Compute consecutive connecting lines
      const lines = [];
      for (let i = 1; i < stars.length; i++) {
        const prev = stars[i - 1];
        const curr = stars[i];

        const tPrev = parseLocalDate(prev.date);
        const tCurr = parseLocalDate(curr.date);
        const dayDiff = Math.round((tCurr - tPrev) / ONE_DAY_MS);

        // Connect only if days are strictly consecutive (1 day gap)
        if (dayDiff === 1) {
          lines.push({
            id: `line_${prev.date}_${curr.date}`,
            x1: prev.x,
            y1: prev.y,
            x2: curr.x,
            y2: curr.y,
          });
        }
      }

      // If home star is active, connect the most recent checkin to the home star
      if (stars.length > 0) {
        const lastStar = stars[stars.length - 1];
        lines.push({
          id: `line_home_${habit.id}`,
          x1: lastStar.x,
          y1: lastStar.y,
          x2: center.x,
          y2: center.y,
          isHomeBond: true,
        });
      }

      return {
        habit,
        center,
        homeRadius,
        stars,
        lines,
        isComplete: habit.is_constellation_complete,
      };
    });
  }, [habits, dimensions]);

  return (
    <div
      ref={containerRef}
      className="glass-card"
      style={{
        position: 'relative',
        padding: 0,
        overflow: 'hidden',
        minHeight: '480px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 0 80px rgba(16, 26, 58, 0.4)',
        background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(16, 26, 58, 0.4) 0%, rgba(7, 11, 26, 0.95) 100%)',
      }}
      aria-label="Interactive Night Sky Constellations Canvas"
    >
      {/* Background celestial grid lines / ambient aura */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="nebulaAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B7CFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#070B1A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#nebulaAura)" />
      </svg>

      {/* Interactive Constellations SVG Layer */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Shimmer filter for 7-day completed constellations */}
          <filter id="constellationShimmer" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {constellationData.map(({ habit, center, homeRadius, stars, lines, isComplete }) => {
          const isPulseTarget = checkingInId === habit.id;

          return (
            <g
              key={habit.id}
              className={`constellation-group ${isComplete ? 'constellation-completed' : ''}`}
            >
              {/* Constellation Lines */}
              {lines.map((line) => (
                <line
                  key={line.id}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={habit.colour}
                  strokeWidth={line.isHomeBond ? 1.8 : 1.4}
                  strokeOpacity={line.isHomeBond ? 0.8 : 0.6}
                  strokeDasharray={line.isHomeBond ? '3 3' : 'none'}
                  style={{
                    filter: `drop-shadow(0 0 6px ${habit.colour})`,
                    transition: 'all 0.5s ease',
                  }}
                />
              ))}

              {/* Check-in Stars */}
              {stars.map((star) => {
                const label = `${habit.name} check-in on ${star.date}${star.note ? `: ${star.note}` : ''}`;
                return (
                  <circle
                    key={star.id}
                    cx={star.x}
                    cy={star.y}
                    r={star.radius}
                    fill={habit.colour}
                    role="button"
                    tabIndex={0}
                    aria-label={label}
                    onClick={() => setSelectedStarHabit(habit)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedStarHabit(habit);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      filter: `drop-shadow(0 0 4px ${habit.colour})`,
                      transition: 'transform 0.2s ease',
                    }}
                    className="celestial-star"
                  />
                );
              })}

              {/* Home Star (Brightest anchor star) */}
              <g
                role="button"
                tabIndex={0}
                aria-label={`Home star for ${habit.name}. Streak: ${habit.current_streak} days. Best: ${habit.best_streak} days. ${habit.is_checked_today ? 'Checked in today.' : 'Pending check-in.'}`}
                onClick={() => setSelectedStarHabit(habit)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedStarHabit(habit);
                  }
                }}
                style={{ cursor: 'pointer' }}
                className={`home-star-group ${isPulseTarget ? 'star-pulse-active' : ''}`}
              >
                {/* Soft outer aura */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={homeRadius * 2.2}
                  fill={habit.colour}
                  opacity={isComplete ? 0.25 : 0.12}
                  style={{
                    filter: `drop-shadow(0 0 16px ${habit.colour})`,
                    animation: isComplete ? 'starPulse 2.5s infinite ease-in-out' : 'none',
                  }}
                />

                {/* Core home star */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={homeRadius}
                  fill={`url(#starGrad_${habit.id})`}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  strokeOpacity={0.6}
                  style={{ filter: `drop-shadow(0 0 8px ${habit.colour})` }}
                />

                {/* Gradient definition for star */}
                <defs>
                  <radialGradient id={`starGrad_${habit.id}`} cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor={habit.colour} />
                    <stop offset="100%" stopColor={habit.colour} stopOpacity="0.8" />
                  </radialGradient>
                </defs>

                {/* Habit Label Text below Home Star */}
                <text
                  x={center.x}
                  y={center.y + homeRadius + 18}
                  textAnchor="middle"
                  fill="#EAF0FF"
                  fontSize="12"
                  fontFamily="'Sora', sans-serif"
                  fontWeight="600"
                  letterSpacing="0.04em"
                  style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {habit.name}
                </text>

                {/* Streak Badge under label */}
                <text
                  x={center.x}
                  y={center.y + homeRadius + 32}
                  textAnchor="middle"
                  fill={habit.colour}
                  fontSize="10"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                  style={{
                    textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  ★ {habit.current_streak}d streak
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* --- Star Popover Glass Card --- */}
      {selectedStarHabit && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="popover-habit-name"
          className="glass-card fade-in"
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.25rem',
            zIndex: 50,
            maxWidth: '340px',
            padding: '1.25rem',
            borderColor: `${selectedStarHabit.colour}55`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${selectedStarHabit.colour}22`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: selectedStarHabit.colour,
                  boxShadow: `0 0 8px ${selectedStarHabit.colour}`,
                }}
                aria-hidden="true"
              />
              <h3 id="popover-habit-name" style={{ fontSize: '1.15rem' }}>
                {selectedStarHabit.name}
              </h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedStarHabit(null)}
              aria-label="Close star details"
              style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
            <span className="badge badge-gold">★ Current: {selectedStarHabit.current_streak}d</span>
            <span className="badge badge-teal">✦ Best: {selectedStarHabit.best_streak}d</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${selectedStarHabit.is_checked_today ? 'btn-teal' : 'btn-primary'}`}
              onClick={async () => {
                await onCheckinToggle(selectedStarHabit);
                setSelectedStarHabit((prev) =>
                  prev ? { ...prev, is_checked_today: !prev.is_checked_today } : null
                );
              }}
              style={{ flex: 1 }}
            >
              {selectedStarHabit.is_checked_today ? '✓ Checked In' : '✦ Check In Today'}
            </button>
            <Link
              to={`/habits/${selectedStarHabit.id}`}
              className="btn btn-secondary btn-sm"
              aria-label={`View 30-day calendar for ${selectedStarHabit.name}`}
            >
              Calendar ↗
            </Link>
          </div>
        </div>
      )}

      {/* Reduced Motion Static Notice for Screen Readers */}
      <span className="sr-only">
        The night sky renders constellations for each active habit. Click any star to view habit details and check in.
      </span>
    </div>
  );
}
