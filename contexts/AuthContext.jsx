'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api, endpoints, onAuthError } from '@/lib/apiClient';

const AuthContext = createContext({});

// User roles enum
export const UserRole = {
  DONOR: 'donor',
  VOLUNTEER: 'volunteer',
  CLIENT: 'client',
  ADMIN: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  /**
   * Fetch user profile from backend API
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await api.get(endpoints.auth.me);
      if (response.ok && response.data) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Don't clear user if it's just a network error
      if (err.status === 401 || err.status === 403) {
        setUser(null);
        setProfile(null);
      }
    }
    return null;
  }, []);

  /**
   * Sync Supabase OAuth user with backend
   */
  const syncOAuthUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession?.user) return null;

    try {
      // Send OAuth callback to backend to create/sync user
      const response = await api.post(endpoints.auth.oauthCallback, {
        provider: supabaseSession.user.app_metadata?.provider || 'unknown',
        access_token: supabaseSession.access_token,
        user: {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          name: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.user_metadata?.name,
          avatar_url: supabaseSession.user.user_metadata?.avatar_url,
        },
      });

      if (response.ok && response.data) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        return response.data;
      }
    } catch (err) {
      console.error('Error syncing OAuth user:', err);
      // Fall back to basic user info from Supabase
      const basicUser = {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email,
        username: supabaseSession.user.email?.split('@')[0],
        first_name: supabaseSession.user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: supabaseSession.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      };
      setUser(basicUser);
    }
    return null;
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing Supabase session
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();

        if (supabaseSession) {
          setSession(supabaseSession);
          await syncOAuthUser(supabaseSession);
        } else {
          // Check for legacy token (backward compatibility)
          const legacyToken = localStorage.getItem('access_token');
          if (legacyToken) {
            await fetchUserProfile();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && supabaseSession) {
          setSession(supabaseSession);
          await syncOAuthUser(supabaseSession);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
          setSession(supabaseSession);
        }
      }
    );

    // Listen for API auth errors (401/403)
    const unsubscribeAuthError = onAuthError((err) => {
      console.error('Auth error:', err);
      if (err.status === 401) {
        // Token expired, try to refresh
        refreshSession();
      }
    });

    return () => {
      subscription?.unsubscribe();
      unsubscribeAuthError();
    };
  }, [fetchUserProfile, syncOAuthUser]);

  /**
   * Refresh the current session
   */
  const refreshSession = async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (newSession) {
        setSession(newSession);
        return { success: true };
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      // Clear invalid session
      await logout();
      return { success: false, error: err.message };
    }
    return { success: false, error: 'No session to refresh' };
  };

  /**
   * Get the current access token
   */
  const getAccessToken = useCallback(() => {
    // Prefer Supabase session token
    if (session?.access_token) {
      return session.access_token;
    }
    // Fall back to legacy token
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }, [session]);

  /**
   * Register a new user with email/password
   */
  const register = async (userData) => {
    try {
      setError(null);

      // Register via backend API
      const response = await api.post(endpoints.auth.register, userData, { skipAuth: true });

      if (!response.ok) {
        throw new Error(response.error || 'Registration failed');
      }

      // Store tokens (if using legacy auth)
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }

      // Set user state
      setUser(response.data.user);
      setProfile(response.data.profile);

      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Login with email/password
   */
  const login = async (username, password) => {
    try {
      setError(null);

      const response = await api.post(
        endpoints.auth.login,
        { username, password },
        { skipAuth: true }
      );

      if (!response.ok) {
        throw new Error(response.error || 'Login failed');
      }

      // Store tokens
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }

      // Set user state
      setUser(response.data.user);
      setProfile(response.data.profile);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      // Try to logout from backend
      const token = getAccessToken();
      const refreshToken = localStorage.getItem('refresh_token');

      if (token) {
        try {
          await api.post(endpoints.auth.logout, { refresh_token: refreshToken });
        } catch (err) {
          console.error('Backend logout error:', err);
        }
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setSession(null);
      setUser(null);
      setProfile(null);
      setError(null);
      router.push('/');
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profileData) => {
    try {
      setError(null);

      const response = await api.patch(endpoints.auth.profile, profileData);

      if (!response.ok) {
        throw new Error(response.error || 'Profile update failed');
      }

      // Refresh user data
      await fetchUserProfile();

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Change password
   */
  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      setError(null);

      const response = await api.post(endpoints.auth.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });

      if (!response.ok) {
        throw new Error(response.error || 'Password change failed');
      }

      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Request password reset
   */
  const requestPasswordReset = async (email) => {
    try {
      setError(null);

      const response = await api.post(
        endpoints.auth.passwordReset,
        { email },
        { skipAuth: true }
      );

      return { success: true, message: response.data?.message || 'Reset email sent' };
    } catch (err) {
      // Don't reveal if email exists
      return { success: true, message: 'If an account exists, a reset email will be sent.' };
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (uid, token, newPassword, newPasswordConfirm) => {
    try {
      setError(null);

      const response = await api.post(
        endpoints.auth.passwordResetConfirm,
        {
          uid,
          token,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        },
        { skipAuth: true }
      );

      if (!response.ok) {
        throw new Error(response.error || 'Password reset failed');
      }

      return { success: true, message: response.data.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Sign in with Facebook OAuth
   */
  const signInWithFacebook = async () => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Facebook OAuth error:', error);
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role) => {
      if (!profile?.role) return false;
      if (Array.isArray(profile.role)) {
        return profile.role.includes(role);
      }
      return profile.role === role;
    },
    [profile]
  );

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => hasRole(UserRole.ADMIN), [hasRole]);

  /**
   * Check if user is donor
   */
  const isDonor = useCallback(() => hasRole(UserRole.DONOR), [hasRole]);

  /**
   * Check if user is volunteer
   */
  const isVolunteer = useCallback(() => hasRole(UserRole.VOLUNTEER), [hasRole]);

  /**
   * Check if user is client
   */
  const isClient = useCallback(() => hasRole(UserRole.CLIENT), [hasRole]);

  const value = {
    // State
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user,

    // Token access
    accessToken: session?.access_token || null,
    getAccessToken,

    // Auth methods
    register,
    login,
    logout,
    refreshSession,

    // Profile methods
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,

    // OAuth methods
    signInWithGoogle,
    signInWithFacebook,

    // Role checking
    hasRole,
    isAdmin,
    isDonor,
    isVolunteer,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
