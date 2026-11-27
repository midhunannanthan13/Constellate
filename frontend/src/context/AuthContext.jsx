import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'constellate_auth_data';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);

  // Clean sign out
  const signout = useCallback(() => {
    setUser(null);
    setTokens(null);
    setApiOffline(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Save auth state
  const saveAuthSession = useCallback((authTokens, userData) => {
    setTokens(authTokens);
    setUser(userData);
    setApiOffline(false);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tokens: authTokens, user: userData })
    );
  }, []);

  // Verify and refresh session on boot or refresh
  const initAuth = useCallback(async () => {
    setLoading(true);
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
        setApiOffline(false);
      } catch (profileErr) {
        if (profileErr.status === 503) {
          // Backend is stopped/unreachable: keep stored user/tokens and show friendly offline banner
          setUser(parsed.user || null);
          setTokens(parsed.tokens);
          setApiOffline(true);
        } else if (profileErr.status === 401 && parsed.tokens.refresh) {
          try {
            const refreshRes = await authApi.refreshToken(parsed.tokens.refresh);
            const newTokens = {
              access: refreshRes.access,
              refresh: refreshRes.refresh || parsed.tokens.refresh,
            };
            const profile = await authApi.getProfile(newTokens.access);
            saveAuthSession(newTokens, profile);
          } catch (refreshErr) {
            if (refreshErr.status === 503) {
              setUser(parsed.user || null);
              setTokens(parsed.tokens);
              setApiOffline(true);
            } else {
              signout();
            }
          }
        } else {
          signout();
        }
      }
    } catch {
      signout();
    } finally {
      setLoading(false);
    }
  }, [saveAuthSession, signout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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
        apiOffline,
        retryAuth: initAuth,
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
