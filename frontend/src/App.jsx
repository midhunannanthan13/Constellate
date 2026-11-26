import React, { createContext, useContext, useState } from 'react';
import Starfield from './components/Starfield';
import Navbar from './components/Navbar';
import StylePreview from './components/StylePreview';
import './index.css';

// Authentication context preserved for upcoming Stage 3
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('preview');

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {/* Universal Fixed Twinkling Starfield Background */}
      <Starfield />

      {/* Main Application Layer */}
      <div className="app-wrapper">
        {/* Floating Glass Navigation Bar */}
        <Navbar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Style Preview Page Showcase */}
        <main id="main-content" tabIndex={-1}>
          <StylePreview activeSection={activeSection} />
        </main>
      </div>
    </AuthContext.Provider>
  );
}
