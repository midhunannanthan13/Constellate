import React, { useState } from 'react';

/**
 * StylePreview Component
 * Interactive showcase for the Constellate "Aurora Night" design system.
 */
export default function StylePreview({ activeSection }) {
  const [formState, setFormState] = useState({
    habitName: 'Morning Astronomy Reading',
    category: 'mindfulness',
    notes: 'Watching Sirius rise before dawn check-in.',
    goalDays: '7',
    hasError: false,
  });

  const [copiedColor, setCopiedColor] = useState(null);

  const copyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  const palette = [
    { name: 'Sky Background', hex: '#070B1A', role: 'Main deep navy canvas', contrast: 'Base' },
    { name: 'Sky Gradient Top', hex: '#101A3A', role: 'Upper atmosphere soft glow', contrast: 'Base' },
    { name: 'Star Gold (Primary)', hex: '#FFD76A', role: 'Primary actions, active stars, streaks', contrast: '13.8:1', isAccent: true },
    { name: 'Aurora Teal', hex: '#3EE6C3', role: 'Focus rings, milestones, completed lines', contrast: '12.4:1', isAccent: true },
    { name: 'Aurora Violet', hex: '#8B7CFF', role: 'Constellation bonds, cards, accents', contrast: '7.6:1', isAccent: true },
    { name: 'Aurora Pink', hex: '#FF7AC6', role: 'Celebrations, special badges, streak highlights', contrast: '8.9:1', isAccent: true },
    { name: 'Text Primary', hex: '#EAF0FF', role: 'Headings, active inputs, readable text', contrast: '15.2:1' },
    { name: 'Text Muted', hex: '#9AA6C7', role: 'Secondary labels, descriptions, metadata', contrast: '7.8:1' },
    { name: 'Success', hex: '#4ADE80', role: 'Check-in confirmed, streak goal met', contrast: '11.5:1' },
    { name: 'Warning', hex: '#FFB84D', role: 'Streak at risk, uncompleted habit', contrast: '10.8:1' },
    { name: 'Error', hex: '#FF6B81', role: 'Validation alerts, cancel actions', contrast: '6.4:1' },
  ];

  return (
    <div className="container fade-in">
      {/* --- Section: Hero / Header --- */}
      {(activeSection === 'preview' || !activeSection) && (
        <section className="glass-card glow-gold" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-gold">✦ DESIGN SYSTEM</span>
            <span className="badge badge-teal">WCAG AAA COMPLIANT</span>
          </div>

          <h1 className="text-gradient" style={{ marginBottom: '0.75rem' }}>
            Aurora Night
          </h1>
          <p style={{ fontSize: '1.15rem', maxWidth: '720px', marginBottom: '1.5rem', lineHeight: '1.7' }}>
            Constellate turns daily habits into stars. The Aurora Night aesthetic combines deep cosmic navy,
            frosted glass panels, organic star glow, and fluid celestial motion to foster a calm, meditative habit experience.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <a href="#colors" className="btn btn-primary">
              Explore Palette ✦
            </a>
            <a href="#components" className="btn btn-secondary">
              UI Components
            </a>
            <a href="#forms" className="btn btn-outline">
              Form Elements
            </a>
          </div>
        </section>
      )}

      {/* --- Section: Colors --- */}
      {(activeSection === 'preview' || activeSection === 'colors') && (
        <section id="colors" style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>01. PALETTE</span>
            <h2>Celestial Color Variables</h2>
            <p>Every color strictly passes the 4.5:1 minimum contrast requirement against our deep sky background.</p>
          </div>

          <div className="grid-3">
            {palette.map((color) => (
              <div
                key={color.name}
                className="glass-card glass-card-interactive"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => copyHex(color.hex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && copyHex(color.hex)}
                aria-label={`Copy hex code for ${color.name}: ${color.hex}`}
              >
                <div
                  style={{
                    height: '68px',
                    borderRadius: 'var(--radius-md)',
                    background: color.hex,
                    marginBottom: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: color.isAccent ? `0 0 20px ${color.hex}33` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {copiedColor === color.hex && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#070B1A', background: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                      COPIED!
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem' }}>{color.name}</h4>
                  <code style={{ fontSize: '0.8rem', color: 'var(--aurora-teal)' }}>{color.hex}</code>
                </div>
                <p style={{ fontSize: '0.825rem', marginBottom: '0.75rem' }}>{color.role}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>Contrast ratio</span>
                  <span style={{ color: 'var(--aurora-teal)', fontWeight: 600 }}>{color.contrast}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Section: Typography --- */}
      {(activeSection === 'preview' || activeSection === 'typography') && (
        <section id="typography" style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-violet" style={{ marginBottom: '0.5rem' }}>02. TYPOGRAPHY</span>
            <h2>Serene Typography Scale</h2>
            <p>Headings rendered in <strong>Sora</strong>, body and controls in <strong>Inter</strong>.</p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div>
                <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>H1 — Sora Bold / 40-52px</span>
                <h1>Your habits, written in stars.</h1>
              </div>

              <div>
                <span className="badge badge-teal" style={{ marginBottom: '0.35rem' }}>H2 — Sora SemiBold / 28-36px</span>
                <h2>Connect 7 stars to form your constellation.</h2>
              </div>

              <div>
                <span className="badge badge-violet" style={{ marginBottom: '0.35rem' }}>H3 — Sora Medium / 20-24px</span>
                <h3>Orion's Study Habit — 5 Day Streak</h3>
              </div>

              <div>
                <span className="badge badge-pink" style={{ marginBottom: '0.35rem' }}>Body — Inter Regular / 16px</span>
                <p style={{ maxWidth: '680px' }}>
                  Every daily check-in illuminates a star in your personal night sky. Steady consistency charts glowing
                  lines connecting each day's achievement, transforming routine actions into cosmic landmarks.
                </p>
              </div>

              <div>
                <span className="badge badge-teal" style={{ marginBottom: '0.35rem' }}>Muted & Helper Text / 14px</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Last check-in recorded yesterday at 21:40 UTC. Next milestone in 2 days.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Section: Components & Buttons --- */}
      {(activeSection === 'preview' || activeSection === 'components') && (
        <section id="components" style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>03. BUTTONS & ACTIONS</span>
            <h2>Luminous Buttons</h2>
            <p>Every action element has prominent tactile focus rings, distinct hover states, and WCAG AA accessible contrast.</p>
          </div>

          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Button Variants</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <button className="btn btn-primary" type="button">
                <span>✦</span> Primary Star Gold
              </button>
              <button className="btn btn-teal" type="button">
                <span>⚡</span> Aurora Teal
              </button>
              <button className="btn btn-violet" type="button">
                <span>🌌</span> Aurora Violet
              </button>
              <button className="btn btn-secondary" type="button">
                Secondary Glass
              </button>
              <button className="btn btn-outline" type="button">
                Outline Pill
              </button>
              <button className="btn btn-danger" type="button">
                <span>✕</span> Delete Habit
              </button>
              <button className="btn btn-primary" disabled type="button">
                Disabled Action
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Button Sizes & Status Badges</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button className="btn btn-primary btn-sm" type="button">Small Button</button>
              <button className="btn btn-primary" type="button">Regular Button</button>
              <button className="btn btn-primary btn-lg" type="button">Large Button</button>
            </div>

            <h4 style={{ marginBottom: '1rem' }}>Status Badges (Not Color Alone: Includes Descriptive Icons)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span className="badge badge-gold"><span aria-hidden="true">★</span> 7-Day Constellation</span>
              <span className="badge badge-teal"><span aria-hidden="true">✓</span> Checked In Today</span>
              <span className="badge badge-violet"><span aria-hidden="true">👥</span> Friend Sky</span>
              <span className="badge badge-pink"><span aria-hidden="true">✦</span> New Badge</span>
              <span className="badge badge-success"><span aria-hidden="true">●</span> Active</span>
              <span className="badge badge-warning"><span aria-hidden="true">▲</span> Streak at risk</span>
              <span className="badge badge-error"><span aria-hidden="true">✕</span> Missed day</span>
            </div>
          </div>
        </section>
      )}

      {/* --- Section: Form Controls --- */}
      {(activeSection === 'preview' || activeSection === 'forms') && (
        <section id="forms" style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>04. ACCESSIBLE FORMS</span>
            <h2>Form Controls & States</h2>
            <p>All inputs have explicit &lt;label&gt; tags, keyboard focus outlines in Aurora Teal, and descriptive error helpers.</p>
          </div>

          <div className="grid-2">
            <div className="glass-card">
              <h4 style={{ marginBottom: '1.25rem' }}>Standard Form Controls</h4>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="habit-name-input" className="form-label">
                    Habit Name
                    <span className="required-mark" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="habit-name-input"
                    type="text"
                    className="form-input"
                    value={formState.habitName}
                    onChange={(e) => setFormState({ ...formState, habitName: e.target.value })}
                    placeholder="e.g., Morning Stargazing, Daily Code..."
                    required
                  />
                  <span className="form-helper">This will name your star in the sky.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="habit-category-select" className="form-label">
                    Category Star Color
                  </label>
                  <select
                    id="habit-category-select"
                    className="form-select"
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  >
                    <option value="mindfulness">Gold (#FFD76A) — Mindfulness & Focus</option>
                    <option value="fitness">Teal (#3EE6C3) — Health & Fitness</option>
                    <option value="learning">Violet (#8B7CFF) — Learning & Craft</option>
                    <option value="creativity">Pink (#FF7AC6) — Creative Art</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="habit-notes-textarea" className="form-label">
                    Daily Reflection Note (Optional)
                  </label>
                  <textarea
                    id="habit-notes-textarea"
                    className="form-textarea"
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    placeholder="How did today's session feel?"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="glass-card glow-violet">
              <h4 style={{ marginBottom: '1.25rem' }}>Validation & State Feedback</h4>
              
              <div className="form-group">
                <label htmlFor="error-input-demo" className="form-label">
                  Friend Code (Error Demonstration)
                </label>
                <input
                  id="error-input-demo"
                  type="text"
                  className="form-input has-error"
                  defaultValue="INV-9999"
                  aria-invalid="true"
                  aria-describedby="friend-code-error"
                />
                <span id="friend-code-error" className="form-error-msg">
                  <span aria-hidden="true">⚠️</span> Friend code not found. Please verify the 8-character star code.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="disabled-input-demo" className="form-label">
                  Calculated Current Streak (Read Only)
                </label>
                <input
                  id="disabled-input-demo"
                  type="text"
                  className="form-input"
                  value="✦ 5 Consecutive Days (Active)"
                  disabled
                  readOnly
                />
                <span className="form-helper">Server-calculated metric from check-in dates.</span>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-teal" style={{ flex: 1 }}>
                  Save Habit Star
                </button>
                <button type="button" className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Section: Glass Cards & Bento Grid --- */}
      {(activeSection === 'preview' || activeSection === 'cards') && (
        <section id="cards" style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-pink" style={{ marginBottom: '0.5rem' }}>05. GLASS PANELS & DEPTH</span>
            <h2>Bento Grid Glass Cards</h2>
            <p>Translucent cards at 6% opacity with 12% borders and 16px background blur create depth without visual noise.</p>
          </div>

          <div className="grid-bento">
            {/* Bento Card 1: Main Highlight */}
            <div className="glass-card glass-card-interactive glow-gold col-span-8">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="badge badge-gold">✦ ACTIVE CONSTELLATION</span>
                <span style={{ fontSize: '1.5rem', color: 'var(--star-gold)' }}>★</span>
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>The Voyager Habit Path</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                6 out of 7 stars aligned this week. One more consecutive check-in triggers constellation completion shimmer.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {[1, 2, 3, 4, 5, 6].map((star) => (
                  <div
                    key={star}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFE28A, #FFD76A)',
                      boxShadow: '0 0 12px var(--star-gold-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#070B1A',
                    }}
                  >
                    ✦
                  </div>
                ))}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px dashed var(--star-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--star-gold)',
                  }}
                  title="Today's pending check-in"
                >
                  ?
                </div>
              </div>
            </div>

            {/* Bento Card 2: Quick Stat */}
            <div className="glass-card glow-teal col-span-4">
              <span className="badge badge-teal" style={{ marginBottom: '0.75rem' }}>CURRENT STREAK</span>
              <div style={{ fontSize: '2.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--aurora-teal)' }}>
                14 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days</span>
              </div>
              <p style={{ fontSize: '0.85rem' }}>Longest personal record across all celestial habits.</p>
            </div>

            {/* Bento Card 3: Aurora Violet Feature */}
            <div className="glass-card glow-violet col-span-6">
              <span className="badge badge-violet" style={{ marginBottom: '0.75rem' }}>FRIEND'S SKY</span>
              <h4 style={{ marginBottom: '0.5rem' }}>Lyra's Night Horizon</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                3 active constellations illuminated. Visiting friend skies is completely read-only and respects mutual privacy.
              </p>
              <button className="btn btn-outline btn-sm" type="button">
                Visit Sky ↗
              </button>
            </div>

            {/* Bento Card 4: Accessibility Summary */}
            <div className="glass-card col-span-6">
              <span className="badge badge-success" style={{ marginBottom: '0.75rem' }}>A11Y AUDITED</span>
              <h4 style={{ marginBottom: '0.5rem' }}>Accessibility Specifications</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <li>Visible Keyboard Focus Ring (Aurora Teal #3EE6C3)</li>
                <li>`prefers-reduced-motion` suppresses twinkling and shimmers</li>
                <li>Semantic buttons and input labels on all elements</li>
                <li>Minimum text contrast: 4.5:1 (Tested up to 15:1)</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* --- Footer Note --- */}
      <footer style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <p>Constellate Design System "Aurora Night" • Built entirely through AI agent prompts</p>
      </footer>
    </div>
  );
}
