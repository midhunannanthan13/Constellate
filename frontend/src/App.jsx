import React, { createContext, useContext, useState } from 'react';
import './index.css';

// Authentication context placeholder for Stage 1
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="stage-container">
        <header className="stage-header">
          <div className="logo-badge">✦ CONSTELLATE</div>
          <span className="stage-pill">Stage 1 Initialized</span>
        </header>

        <main className="stage-card">
          <h1 className="title">Your habits, written in stars.</h1>
          <p className="subtitle">
            Welcome to <strong>Constellate</strong>. The frontend and backend foundations are now active.
          </p>

          <div className="status-grid">
            <div className="status-item">
              <span className="dot dot-active"></span>
              <div>
                <strong>Frontend:</strong> React 18 + React Router running on <code>localhost:3000</code>
              </div>
            </div>
            <div className="status-item">
              <span className="dot dot-active"></span>
              <div>
                <strong>Backend:</strong> Django REST Framework ready on <code>127.0.0.1:8000</code>
              </div>
            </div>
            <div className="status-item">
              <span className="dot dot-active"></span>
              <div>
                <strong>Database:</strong> MySQL configured via <code>backend/.env</code>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
}
