/**
 * useAuth Hook
 * 
 * Authentication state and operations.
 * Provides current user, loading state, and auth methods.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

/**
 * Auth Provider - wrap your app with this
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { user } = await authService.signIn(email, password);
    return user;
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { user } = await authService.signUp(email, password);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - access auth state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
