import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

/**
 * Deterministic pseudo-random number generator from a string seed.
 * Guarantees star positions and celestial layouts never shift between renders.
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

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function NightSky({
  habits = [],
  onCheckinToggle,
  checkingInId = null,
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [selectedStarHabit, setSelectedStarHabit] = useState(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Pause animations when browser tab is inactive for peak efficiency
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Responsive container observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const w = clientWidth || 960;
        const h = Math.max(Math.min(w * 0.65, 680), 480);
        setDimensions({ width: w, height: h });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute ambient stardust points for deep space atmosphere
  const ambientStardust = useMemo(() => {
    const dustRng = hashSeed('constellate_ambient_stardust_universe');
    const points = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      points.push({
        id: `stardust_${i}`,
        x: dustRng() * dimensions.width,
        y: dustRng() * dimensions.height,
        r: dustRng() * 1.2 + 0.3,
        opacity: dustRng() * 0.45 + 0.15,
        twinkleDelay: (dustRng() * 5).toFixed(1) + 's',
      });
    }
    return points;
  }, [dimensions]);

  // Compute deterministic constellation layouts
  const constellationData = useMemo(() => {
    const { width, height } = dimensions;
    const count = habits.length;
    if (count === 0) return [];

    // Assign harmonic celestial region centers
    const centers = [];
    if (count === 1) {
      centers.push({ x: width * 0.5, y: height * 0.48 });
    } else if (count === 2) {
      centers.push({ x: width * 0.32, y: height * 0.48 });
      centers.push({ x: width * 0.68, y: height * 0.48 });
    } else if (count === 3) {
      centers.push({ x: width * 0.28, y: height * 0.38 });
      centers.push({ x: width * 0.72, y: height * 0.38 });
      centers.push({ x: width * 0.5, y: height * 0.72 });
    } else {
      const rx = width * 0.36;
      const ry = height * 0.32;
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

      // Sort check-ins chronologically
      const sortedCheckins = [...(habit.checkins || [])].sort((a, b) =>
        a.date.localeCompare(b.date)
      );

      // Home star sizing & halo
      const streak = habit.current_streak || 0;
      const homeRadius = Math.min(8.5 + streak * 0.9, 19);

      // Compute deterministic star positions
      const stars = sortedCheckins.map((checkin, idx) => {
        const starRng = hashSeed(`${habit.id}_${checkin.date}`);
        const baseAngle = (idx / Math.max(sortedCheckins.length, 1)) * Math.PI * 2;
        const jitterAngle = (starRng() - 0.5) * 0.45;
        const angle = baseAngle + jitterAngle;

        // Celestial radius from home star
        const dist = 34 + (idx % 7) * 15 + starRng() * 18;

        const x = Math.max(35, Math.min(width - 35, center.x + Math.cos(angle) * dist));
        const y = Math.max(35, Math.min(height - 35, center.y + Math.sin(angle) * dist));

        return {
          id: checkin.id,
          date: checkin.date,
          note: checkin.note,
          x,
          y,
          radius: 3.8 + (idx % 3) * 0.6,
          twinkleDelay: (starRng() * 4).toFixed(2) + 's',
          twinkleDuration: (2.8 + starRng() * 1.8).toFixed(2) + 's',
        };
      });

      // Compute consecutive line segments
      const lines = [];
      for (let i = 1; i < stars.length; i++) {
        const prev = stars[i - 1];
        const curr = stars[i];

        const tPrev = parseLocalDate(prev.date);
        const tCurr = parseLocalDate(curr.date);
        const dayDiff = Math.round((tCurr - tPrev) / ONE_DAY_MS);

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

      // Connect latest check-in star to home star
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

      // Compute celebratory shimmer sparkles for 7-day complete constellations
      const isComplete = habit.is_constellation_complete;
      const sparkles = [];
      if (isComplete) {
        const sparkRng = hashSeed(`sparkle_${habit.id}`);
        for (let s = 0; s < 6; s++) {
          const spAngle = sparkRng() * Math.PI * 2;
          const spDist = 45 + sparkRng() * 55;
          sparkles.push({
            id: `sp_${s}`,
            x: center.x + Math.cos(spAngle) * spDist,
            y: center.y + Math.sin(spAngle) * spDist,
            size: sparkRng() * 8 + 8,
            delay: (sparkRng() * 2).toFixed(1) + 's',
          });
        }
      }

      return {
        habit,
        center,
        homeRadius,
        stars,
        lines,
        isComplete,
        sparkles,
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
        minHeight: '500px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 16px 54px rgba(0, 0, 0, 0.6), inset 0 0 100px rgba(16, 26, 58, 0.5)',
        background: 'radial-gradient(ellipse 95% 85% at 50% 50%, #0d1533 0%, #070B1A 90%)',
      }}
      aria-label="Interactive Magical Night Sky Constellations Canvas"
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Universal soft glow filter */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Celebratory Shimmer Filter */}
          <filter id="celebrateGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Nebula clouds for each habit's region */}
          {constellationData.map(({ habit, center, isComplete }) => (
            <radialGradient
              key={`nebulaGrad_${habit.id}`}
              id={`nebulaGrad_${habit.id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={habit.colour} stopOpacity={isComplete ? 0.22 : 0.12} />
              <stop offset="45%" stopColor={habit.colour} stopOpacity={isComplete ? 0.08 : 0.04} />
              <stop offset="75%" stopColor="#8B7CFF" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#070B1A" stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* --- 1. Ambient Stardust Field (Adds Cosmic Depth) --- */}
        <g className="ambient-stardust" aria-hidden="true">
          {ambientStardust.map((d) => (
            <circle
              key={d.id}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#EAF0FF"
              opacity={d.opacity}
              style={{
                animation: isTabVisible ? `celestialTwinkle 4s infinite ease-in-out` : 'none',
                animationDelay: d.twinkleDelay,
              }}
            />
          ))}
        </g>

        {/* --- 2. Nebula Glow Clouds Behind Constellations --- */}
        <g className="nebula-layers" aria-hidden="true">
          {constellationData.map(({ habit, center, isComplete }) => (
            <g key={`nebula_group_${habit.id}`} className="nebula-mesh">
              <ellipse
                cx={center.x}
                cy={center.y}
                rx={isComplete ? 140 : 110}
                ry={isComplete ? 110 : 85}
                fill={`url(#nebulaGrad_${habit.id})`}
                style={{
                  filter: 'blur(12px)',
                  transition: 'all 0.8s ease',
                }}
              />
            </g>
          ))}
        </g>

        {/* --- 3. Constellations, Lines & Stars --- */}
        {constellationData.map(({ habit, center, homeRadius, stars, lines, isComplete, sparkles }) => {
          const isPulseTarget = checkingInId === habit.id;

          return (
            <g
              key={habit.id}
              className={`constellation-cluster ${isComplete ? 'constellation-completed' : ''}`}
            >
              {/* Celebratory Ethereal Constellation Polygon Aura for 7-day streak */}
              {isComplete && stars.length >= 3 && (
                <polygon
                  points={`${center.x},${center.y} ` + stars.map((s) => `${s.x},${s.y}`).join(' ')}
                  fill={habit.colour}
                  fillOpacity="0.05"
                  stroke={habit.colour}
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  filter="url(#celebrateGlow)"
                  aria-hidden="true"
                />
              )}

              {/* Luminous Constellation Lines (Dual Pass for Soft Glow) */}
              {lines.map((line) => (
                <g key={line.id}>
                  {/* Outer Glow Stroke */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={habit.colour}
                    strokeWidth={line.isHomeBond ? 3.5 : 2.8}
                    strokeOpacity={isComplete ? 0.45 : 0.28}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${habit.colour})`,
                    }}
                    aria-hidden="true"
                  />
                  {/* Inner Core Luminous Stroke */}
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#FFFFFF"
                    strokeWidth={line.isHomeBond ? 1.6 : 1.3}
                    strokeOpacity={0.85}
                    strokeDasharray={line.isHomeBond ? '3 3' : 'none'}
                    className="luminous-line-core"
                    aria-hidden="true"
                  />
                </g>
              ))}

              {/* Check-In Stars with Soft Halos & Sparkle */}
              {stars.map((star) => {
                const label = `${habit.name} star on ${star.date}${star.note ? `: ${star.note}` : ''}. Click to inspect.`;
                return (
                  <g key={star.id} className="star-node">
                    {/* Soft atmospheric halo */}
                    <circle
                      cx={star.x}
                      cy={star.y}
                      r={star.radius * 2.4}
                      fill={habit.colour}
                      opacity={0.3}
                      aria-hidden="true"
                    />

                    {/* Star Core */}
                    <circle
                      cx={star.x}
                      cy={star.y}
                      r={star.radius}
                      fill={habit.colour}
                      stroke="#FFFFFF"
                      strokeWidth={1}
                      strokeOpacity={0.7}
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
                      className="celestial-star"
                      style={{
                        cursor: 'pointer',
                        filter: `drop-shadow(0 0 6px ${habit.colour})`,
                        animationDelay: star.twinkleDelay,
                        animationDuration: star.twinkleDuration,
                      }}
                    />

                    {/* 4-point Diamond Cross Flare on check-in stars */}
                    <path
                      d={`M ${star.x} ${star.y - star.radius * 1.7} L ${star.x} ${star.y + star.radius * 1.7} M ${star.x - star.radius * 1.7} ${star.y} L ${star.x + star.radius * 1.7} ${star.y}`}
                      stroke="#FFFFFF"
                      strokeWidth="0.8"
                      strokeOpacity="0.5"
                      pointerEvents="none"
                      aria-hidden="true"
                    />
                  </g>
                );
              })}

              {/* Home Star (Brightest Anchor Star with Rotating Corona & Flare) */}
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
                {/* 1. Outer Pulsating Corona Aura */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={homeRadius * 2.4}
                  fill={habit.colour}
                  opacity={isComplete ? 0.35 : 0.18}
                  className="home-star-corona"
                  style={{
                    filter: `drop-shadow(0 0 20px ${habit.colour})`,
                  }}
                  aria-hidden="true"
                />

                {/* 2. Middle Glow Ring */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={homeRadius * 1.5}
                  fill={habit.colour}
                  opacity={0.35}
                  style={{ filter: `drop-shadow(0 0 10px ${habit.colour})` }}
                  aria-hidden="true"
                />

                {/* 3. Core Star Sphere with High-Luminance Gradient */}
                <circle
                  cx={center.x}
                  cy={center.y}
                  r={homeRadius}
                  fill={`url(#starGrad_${habit.id})`}
                  stroke="#FFFFFF"
                  strokeWidth={1.8}
                  strokeOpacity={0.8}
                  style={{ filter: `drop-shadow(0 0 12px ${habit.colour})` }}
                />

                {/* 4. Astronomical 4-Point Star Rays */}
                <path
                  d={`M ${center.x} ${center.y - homeRadius * 2.2} L ${center.x} ${center.y + homeRadius * 2.2} M ${center.x - homeRadius * 2.2} ${center.y} L ${center.x + homeRadius * 2.2} ${center.y}`}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeOpacity="0.85"
                  pointerEvents="none"
                  aria-hidden="true"
                />

                {/* Home Star Gradient */}
                <defs>
                  <radialGradient id={`starGrad_${habit.id}`} cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor={habit.colour} />
                    <stop offset="100%" stopColor={habit.colour} stopOpacity="0.9" />
                  </radialGradient>
                </defs>

                {/* Habit Label Text */}
                <text
                  x={center.x}
                  y={center.y + homeRadius + 20}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12.5"
                  fontFamily="'Sora', sans-serif"
                  fontWeight="700"
                  letterSpacing="0.04em"
                  style={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {habit.name}
                </text>

                {/* Streak Badge */}
                <text
                  x={center.x}
                  y={center.y + homeRadius + 35}
                  textAnchor="middle"
                  fill={isComplete ? '#FFD76A' : habit.colour}
                  fontSize="10.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="700"
                  style={{
                    textShadow: '0 1px 8px rgba(0,0,0,0.95)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {isComplete ? '✨ 7d CONSTELLATION' : `★ ${habit.current_streak}d streak`}
                </text>
              </g>

              {/* Celebratory Floating Stardust Sparkles for Completed 7-Day Constellations */}
              {isComplete &&
                sparkles.map((sp) => (
                  <text
                    key={sp.id}
                    x={sp.x}
                    y={sp.y}
                    fill="#FFD76A"
                    fontSize={sp.size}
                    opacity="0.8"
                    style={{
                      animation: isTabVisible ? `celebrateSparkle 3s infinite ease-in-out` : 'none',
                      animationDelay: sp.delay,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      filter: 'drop-shadow(0 0 6px #FFD76A)',
                    }}
                    aria-hidden="true"
                  >
                    ✦
                  </text>
                ))}
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
            boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 24px ${selectedStarHabit.colour}33`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: selectedStarHabit.colour,
                  boxShadow: `0 0 10px ${selectedStarHabit.colour}`,
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
