import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function SignUp() {
  usePageTitle('Sign Up');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    // Client-side quick checks
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    if (!formData.password) errors.password = 'Password is required.';
    if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await signup({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirm: formData.password_confirm,
      });
      navigate('/sky', { replace: true });
    } catch (err) {
      if (err.data?.errors) {
        setFieldErrors(err.data.errors);
      }
      setGeneralError(err.message || 'Could not create account. Please verify input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '520px', padding: '2.5rem 1.25rem' }}>
      <div className="glass-card glow-gold">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="brand-icon" style={{ fontSize: '2rem', display: 'inline-block', marginBottom: '0.5rem' }} aria-hidden="true">
            ✦
          </span>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Create Your Sky</h1>
          <p style={{ fontSize: '0.95rem' }}>Begin your celestial habit journey and receive your unique friend code.</p>
        </div>

        {generalError && (
          <div
            role="alert"
            aria-live="polite"
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
          {/* Username */}
          <div className="form-group">
            <label htmlFor="signup-username" className="form-label">
              Username
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-username"
              name="username"
              type="text"
              autoComplete="username"
              className={`form-input ${fieldErrors.username ? 'has-error' : ''}`}
              placeholder="e.g. nova_drifter"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!fieldErrors.username}
              aria-describedby={fieldErrors.username ? 'signup-username-err' : 'signup-username-hint'}
            />
            {fieldErrors.username ? (
              <span id="signup-username-err" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.username) ? fieldErrors.username[0] : fieldErrors.username}
              </span>
            ) : (
              <span id="signup-username-hint" className="form-helper">At least 3 characters. Letters, numbers and - _ .</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              Email Address
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
              placeholder="you@nightsky.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'signup-email-err' : undefined}
            />
            {fieldErrors.email && (
              <span id="signup-email-err" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="signup-password" className="form-label">
              Password
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'signup-pwd-err' : 'signup-pwd-hint'}
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
            {fieldErrors.password ? (
              <span id="signup-pwd-err" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
              </span>
            ) : (
              <span id="signup-pwd-hint" className="form-helper">Minimum 8 characters. Must not be entirely numeric.</span>
            )}
          </div>

          {/* Password Confirmation */}
          <div className="form-group">
            <label htmlFor="signup-password-confirm" className="form-label">
              Confirm Password
              <span className="required-mark" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-password-confirm"
              name="password_confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input ${fieldErrors.password_confirm ? 'has-error' : ''}`}
              placeholder="Re-enter your password"
              value={formData.password_confirm}
              onChange={handleChange}
              disabled={loading}
              aria-required="true"
              aria-invalid={!!fieldErrors.password_confirm}
              aria-describedby={fieldErrors.password_confirm ? 'signup-pwd-confirm-err' : undefined}
            />
            {fieldErrors.password_confirm && (
              <span id="signup-pwd-confirm-err" className="form-error-msg" role="alert">
                <span aria-hidden="true">✕</span> {Array.isArray(fieldErrors.password_confirm) ? fieldErrors.password_confirm[0] : fieldErrors.password_confirm}
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
                Creating Sky...
              </span>
            ) : (
              'Create My Celestial Sky ✦'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ fontSize: '0.875rem' }}>
            Already have a star account?{' '}
            <Link to="/signin" style={{ color: 'var(--star-gold)', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
