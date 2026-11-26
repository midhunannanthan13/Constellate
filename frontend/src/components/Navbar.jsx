import React from 'react';
import { NavLink, Link } from 'react-router-dom';

/**
 * Floating Navigation Bar Component
 * Glass pill aesthetic with accessible keyboard navigation and focus rings.
 */
export default function Navbar({ activeSection, onSectionChange }) {
  const navItems = [
    { id: 'preview', label: 'Design System', icon: '✦' },
    { id: 'colors', label: 'Palette', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: 'Aa' },
    { id: 'components', label: 'Components', icon: '❖' },
    { id: 'forms', label: 'Forms', icon: '📝' },
    { id: 'cards', label: 'Glass Cards', icon: '🌌' },
  ];

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <Link to="/" className="navbar-brand" onClick={() => onSectionChange?.('preview')}>
          <span className="brand-icon" aria-hidden="true">✦</span>
          <span className="brand-name">Constellate</span>
        </Link>

        <ul className="nav-links" role="menubar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id} role="none">
                <button
                  role="menuitem"
                  className={`nav-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSectionChange?.(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="nav-actions">
          <span className="badge badge-teal">
            <span aria-hidden="true">●</span> Aurora Night
          </span>
        </div>
      </nav>
    </header>
  );
}
