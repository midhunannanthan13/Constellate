import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendsApi } from '../services/api';

export default function Friends() {
  const { user, tokens } = useAuth();
  const token = tokens?.access;

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: '', text: '' });
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await friendsApi.overview(token);
      setOverview(data);
    } catch (err) {
      setError(err.message || 'Could not load your friends list.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleCopyCode = () => {
    const code = overview?.my_friend_code || user?.friend_code;
    if (code) {
      navigator.clipboard?.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    const cleaned = friendCodeInput.trim();
    if (!cleaned) {
      setFormFeedback({ type: 'error', text: 'Please enter a friend code (for example, STAR-7N3KP9).' });
      return;
    }

    setSubmitting(true);
    setFormFeedback({ type: '', text: '' });
    try {
      const res = await friendsApi.sendRequest(token, cleaned);
      setFormFeedback({ type: 'success', text: res.message || 'Friend request sent!' });
      setFriendCodeInput('');
      await fetchOverview();
    } catch (err) {
      setFormFeedback({ type: 'error', text: err.message || 'Could not send friend request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (reqItem) => {
    try {
      const res = await friendsApi.accept(token, reqItem.friendship_id);
      setFormFeedback({ type: 'success', text: res.message });
      await fetchOverview();
    } catch (err) {
      setFormFeedback({ type: 'error', text: err.message || 'Could not accept request.' });
    }
  };

  const handleDecline = async (reqItem) => {
    try {
      const res = await friendsApi.decline(token, reqItem.friendship_id);
      setFormFeedback({ type: 'success', text: res.message });
      await fetchOverview();
    } catch (err) {
      setFormFeedback({ type: 'error', text: err.message || 'Could not decline request.' });
    }
  };

  const handleRemove = async (friendshipId, username, isCancel = false) => {
    const msg = isCancel
      ? `Cancel your pending friend request to ${username}?`
      : `Remove ${username} from your friends list? You will no longer be able to view each other's skies.`;
    if (!window.confirm(msg)) return;

    try {
      await friendsApi.remove(token, friendshipId);
      setFormFeedback({
        type: 'success',
        text: isCancel ? `Cancelled request to ${username}.` : `Removed ${username} from friends.`,
      });
      await fetchOverview();
    } catch (err) {
      setFormFeedback({ type: 'error', text: err.message || 'Action failed.' });
    }
  };

  const friends = overview?.friends || [];
  const incoming = overview?.incoming_requests || [];
  const outgoing = overview?.outgoing_requests || [];
  const myCode = overview?.my_friend_code || user?.friend_code || 'STAR-LOADING';

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div className="glass-card glow-violet" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <span className="badge badge-violet" style={{ marginBottom: '0.45rem' }}>
              👥 CELESTIAL CIRCLE
            </span>
            <h1 className="text-gradient">Friends' Sky</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px' }}>
              Connect with fellow stargazers using their friend code and visit their night sky read-only.
            </p>
          </div>

          {/* Own Friend Code Card */}
          <div
            style={{
              padding: '0.9rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>
              Your Friend Code
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--star-gold)', fontWeight: 700, letterSpacing: '0.08em' }}>
                {myCode}
              </code>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyCode}
                aria-label="Copy my friend code"
              >
                {copiedCode ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add a Friend Form */}
      <div className="glass-card glow-teal" style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.35rem' }}>Add a Friend</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.15rem' }}>
          Enter a friend's unique star code to send them a connection request.
        </p>

        <form onSubmit={handleSendRequest} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 260px' }}>
            <label htmlFor="friend-code-input" className="form-label" style={{ marginBottom: '0.4rem' }}>
              Friend Code
            </label>
            <input
              id="friend-code-input"
              type="text"
              className="form-input"
              placeholder="e.g. STAR-7N3KP9"
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
              disabled={submitting}
              aria-describedby={formFeedback.text ? 'friend-form-feedback' : undefined}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ height: '46px', whiteSpace: 'nowrap' }}
          >
            {submitting ? 'Sending...' : 'Send Request ✦'}
          </button>
        </form>

        {formFeedback.text && (
          <div
            id="friend-form-feedback"
            role="alert"
            aria-live="polite"
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: formFeedback.type === 'error' ? 'var(--error-bg)' : 'var(--success-bg)',
              border: `1px solid ${formFeedback.type === 'error' ? 'var(--error)' : 'var(--success)'}`,
              color: formFeedback.type === 'error' ? 'var(--error)' : 'var(--success)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span aria-hidden="true">{formFeedback.type === 'error' ? '⚠️' : '✓'}</span>
            <span>{formFeedback.text}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div className="brand-icon" style={{ fontSize: '2rem', marginBottom: '0.75rem' }} aria-hidden="true">✦</div>
          <p style={{ color: 'var(--text-muted)' }}>Looking across the horizon for friends...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glass-card" role="alert" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>⚠️ {error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchOverview}>
            Retry
          </button>
        </div>
      )}

      {/* Friends & Requests Grid */}
      {!loading && !error && (
        <div className="grid-bento">
          {/* Accepted Friends List */}
          <div className="glass-card glow-gold col-span-12">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>My Friends ({friends.length})</h2>
              <span className="badge badge-gold">Read-Only Sky Access</span>
            </div>

            {friends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '0.35rem' }}>No accepted friends yet.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Share your friend code above or enter a friend's code to connect.
                </p>
              </div>
            ) : (
              <div className="grid-2">
                {friends.map((f) => (
                  <div
                    key={f.friendship_id}
                    style={{
                      padding: '1.1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ color: 'var(--star-gold)', fontSize: '1.1rem' }} aria-hidden="true">★</span>
                        <strong style={{ fontSize: '1.1rem' }}>{f.username}</strong>
                      </div>
                      <code style={{ fontSize: '0.8rem', color: 'var(--aurora-teal)' }}>{f.friend_code}</code>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/friends/${f.friend_id}/sky`}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, whiteSpace: 'nowrap' }}
                        aria-label={`View ${f.username}'s sky`}
                      >
                        View {f.username}'s Sky ✦
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(f.friendship_id, f.username, false)}
                        aria-label={`Remove ${f.username} from friends`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Requests */}
          <div className="glass-card glow-teal col-span-6">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Incoming Requests ({incoming.length})
            </h2>
            {incoming.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                No incoming friend requests right now.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {incoming.map((reqItem) => (
                  <div
                    key={reqItem.friendship_id}
                    style={{
                      padding: '0.9rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem' }}>{reqItem.username}</strong>
                      <code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{reqItem.friend_code}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-teal btn-sm"
                        onClick={() => handleAccept(reqItem)}
                        aria-label={`Accept friend request from ${reqItem.username}`}
                      >
                        ✓ Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDecline(reqItem)}
                        aria-label={`Decline friend request from ${reqItem.username}`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="glass-card col-span-6">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Outgoing Requests ({outgoing.length})
            </h2>
            {outgoing.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>
                No pending outgoing requests.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {outgoing.map((reqItem) => (
                  <div
                    key={reqItem.friendship_id}
                    style={{
                      padding: '0.9rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '1rem' }}>{reqItem.username}</strong>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                        ⏳ Pending Acceptance
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRemove(reqItem.friendship_id, reqItem.username, true)}
                      aria-label={`Cancel friend request to ${reqItem.username}`}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
