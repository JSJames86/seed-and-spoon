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

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Get session immediately — don't wait for profile to set loading=false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        // Fetch profile in background — don't block render
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          fetchProfile(session.user.id).then(setProfile);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const updated = await fetchProfile(user.id);
    setProfile(updated);
  };

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(console.error);
    setUser(null);
    setProfile(null);
    router.push('/');
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, ...profileData, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      const updated = await fetchProfile(user.id);
      setProfile(updated);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const { error: e } = await supabase.auth.signInWithPassword({ email: user?.email, password: oldPassword });
      if (e) throw new Error('Current password is incorrect');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { success: true, message: 'Password reset email sent.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook', options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAuthenticated: !!user,
      login, logout, updateProfile, changePassword, refreshProfile,
      requestPasswordReset, resetPassword,
      signInWithGoogle, signInWithFacebook,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
