import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'constellate_auth_data';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clean sign out
  const signout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Save auth state
  const saveAuthSession = useCallback((authTokens, userData) => {
    setTokens(authTokens);
    setUser(userData);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tokens: authTokens, user: userData })
    );
  }, []);

  // Verify and refresh session on boot or refresh
  useEffect(() => {
    const initAuth = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw);
        if (!parsed?.tokens?.access) {
          setLoading(false);
          return;
        }

        // Test access token with profile endpoint
        try {
          const profile = await authApi.getProfile(parsed.tokens.access);
          setUser(profile);
          setTokens(parsed.tokens);
        } catch (profileErr) {
          // If access token expired (401), try refresh token
          if (profileErr.status === 401 && parsed.tokens.refresh) {
            try {
              const refreshRes = await authApi.refreshToken(parsed.tokens.refresh);
              const newTokens = {
                access: refreshRes.access,
                refresh: refreshRes.refresh || parsed.tokens.refresh,
              };
              const profile = await authApi.getProfile(newTokens.access);
              saveAuthSession(newTokens, profile);
            } catch {
              // Refresh failed, clean session
              signout();
            }
          } else {
            signout();
          }
        }
      } catch (e) {
        signout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [saveAuthSession, signout]);

  // Sign In handler
  const signin = async (credentials) => {
    const res = await authApi.signin(credentials);
    saveAuthSession(res.tokens, res.user);
    return res;
  };

  // Sign Up handler
  const signup = async (registrationData) => {
    const res = await authApi.signup(registrationData);
    saveAuthSession(res.tokens, res.user);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        loading,
        signin,
        signup,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
