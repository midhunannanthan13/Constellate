import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect destination (defaults to /sky)
  const from = location.state?.from?.pathname || '/sky';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field once user edits
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!formData.username.trim()) {
      setFieldErrors({ username: 'Please enter your username or email.' });
      return;
    }
    if (!formData.password) {
      setFieldErrors({ password: 'Please enter your password.' });
      return;
    }

    setLoading(true);

    try {
      await signin({
        username: formData.username.trim(),
        password: formData.password,
      });
      // Navigate to destination
      navigate(from, { replace: true });
    } catch (err) {
      if (err.data?.errors) {
        setFieldErrors(err.data.errors);
      }
      setGeneralError(err.message || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '480px', padding: '3rem 1.25rem' }}>
      <div className="glass-card glow-teal">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="brand-icon" style={{ fontSize: '2rem', display: 'inline-block', marginBottom: '0.5rem' }} aria-hidden="true">
            ✦
          </span>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ fontSize: '0.95rem' }}>Enter your credentials to return to your night sky.</p>
        </div>

        {generalError && (
          <div
            role="alert"
            aria-live="polite"
            className="form-group"
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--error-bg)',
              border: '1px solid rgba(255, 107, 129, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.5rem',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>⚠️</span>
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username / Email Field */}
          <div className="form-group">
            <label htmlFor="signin-username" className="form-label">
              Username or Email
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="signin-username"
              name="username"
              type="text"
              autoComplete="username"
              className={`form-input ${fieldErrors.username ? 'has-error' : ''}`}
              placeholder="e.g. starlord or astronomer@sky.com"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            />
            {fieldErrors.username && (
              <span id="username-error" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.username) ? fieldErrors.username[0] : fieldErrors.username}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="signin-password" className="form-label">
              Password
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.4rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <span id="password-error" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
          >
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="brand-icon" style={{ animationDuration: '1s' }} aria-hidden="true">✦</span>
                Signing In...
              </span>
            ) : (
              'Sign In to Sky ✦'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.875rem' }}>
            New to Constellate?{' '}
            <Link to="/signup" style={{ color: 'var(--star-gold)', textDecoration: 'none', fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
