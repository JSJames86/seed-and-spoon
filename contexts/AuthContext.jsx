'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile from Supabase
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const register = async (userData) => {
    try {
      const { email, password, username, first_name, last_name } = userData;

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name,
            last_name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username,
            first_name,
            last_name,
            email,
            created_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        needsEmailVerification: !data.session
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      router.push('/');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      // Refresh profile data
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      // Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: oldPassword,
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
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
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signInWithFacebook = async () => {
    try {
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
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
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
