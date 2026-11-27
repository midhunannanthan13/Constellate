import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Floating Navigation Bar Component
 * Dynamically presents navigation links and user session controls (Sign In / Sign Out).
 */
export default function Navbar() {
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signout();
    navigate('/welcome', { replace: true });
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/sky' : '/welcome'} className="navbar-brand">
          <span className="brand-icon" aria-hidden="true">✦</span>
          <span className="brand-name">Constellate</span>
        </Link>

        {/* Primary Links */}
        <ul className="nav-links" role="menubar">
          {isAuthenticated ? (
            <>
              <li role="none">
                <NavLink
                  to="/sky"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>My Sky</span>
                </NavLink>
              </li>
              <li role="none">
                <NavLink
                  to="/habits"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Habits</span>
                </NavLink>
              </li>
              <li role="none">
                <NavLink
                  to="/report"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Weekly Report</span>
                </NavLink>
              </li>
              <li role="none">
                <NavLink
                  to="/friends"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Friends</span>
                </NavLink>
              </li>
              <li role="none">
                <NavLink
                  to="/preview"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Design System</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li role="none">
                <NavLink
                  to="/welcome"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Welcome</span>
                </NavLink>
              </li>
              <li role="none">
                <NavLink
                  to="/preview"
                  role="menuitem"
                  className={({ isActive }) => `nav-item-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" aria-hidden="true"></span>
                  <span>Design System</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Actions / Auth States */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isAuthenticated ? (
            <>
              <span className="badge badge-gold" title={`Logged in as ${user?.username} (${user?.friend_code})`}>
                <span aria-hidden="true">★</span> {user?.username}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSignOut}
                aria-label="Sign out of Constellate"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up ✦
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
