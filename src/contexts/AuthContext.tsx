// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import {
  User,
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterData,
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: Session['user'] | null): User | null {
  if (!supabaseUser) return null;

  const metadata = supabaseUser.user_metadata || {};

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: metadata.name || metadata.full_name || supabaseUser.email?.split('@')[0] || '',
    mode: metadata.mode || 'individual',
    role: metadata.role || 'user',
    createdAt: supabaseUser.created_at || new Date().toISOString(),
    lastLoginAt: supabaseUser.last_sign_in_at || new Date().toISOString(),
    isVerified: !!supabaseUser.email_confirmed_at,
    avatar: metadata.avatar_url || supabaseUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Memoize the supabase client to avoid recreating on each render
  const supabase = useMemo(() => createClient(), []);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // If Supabase is not configured, show error state
    if (!supabase) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication is not configured. Please set up Supabase environment variables.'
      });
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          });
          return;
        }

        setState({
          user: mapSupabaseUser(session?.user ?? null),
          isAuthenticated: !!session,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setState(prev => ({
          ...prev,
          user: mapSupabaseUser(session?.user ?? null),
          isAuthenticated: !!session,
          isLoading: false,
          error: null
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    if (!supabase) {
      setState(prev => ({ ...prev, error: 'Authentication is not configured' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        return false;
      }

      setState({
        user: mapSupabaseUser(data.user),
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message
      }));
      return false;
    }
  }, [supabase]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    if (!supabase) {
      setState(prev => ({ ...prev, error: 'Authentication is not configured' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            full_name: data.name,
            mode: data.mode,
            role: 'user',
          },
        },
      });

      if (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
        return false;
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
        // User needs to confirm email - return true but they won't be authenticated yet
        return true;
      }

      setState({
        user: mapSupabaseUser(authData.user),
        isAuthenticated: !!authData.session,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message
      }));
      return false;
    }
  }, [supabase]);

  const logout = useCallback(async (): Promise<void> => {
    if (!supabase) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, [supabase]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        return false;
      }

      setState({
        user: mapSupabaseUser(data.user),
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return false;
    }
  }, [supabase]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!supabase) {
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          full_name: updates.name,
          mode: updates.mode,
          role: updates.role,
          avatar_url: updates.avatar,
        },
      });

      if (error) {
        console.error('Failed to update user:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        user: mapSupabaseUser(data.user),
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, [supabase]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshSession,
        updateUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
