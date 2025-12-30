// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  AuthState,
  AuthContextType,
  LoginCredentials,
  RegisterData,
  AuthSession
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sifter_auth_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session: AuthSession = JSON.parse(stored);

          // Check if session is expired
          if (session.expiresAt > Date.now()) {
            setState({
              user: session.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          } else {
            // Session expired, try to refresh
            const refreshed = await refreshSession();
            if (refreshed) return;
          }
        }
      } catch (error) {
        console.error('Failed to load auth session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }

      setState(prev => ({ ...prev, isLoading: false }));
    };

    loadSession();
  }, []);

  const saveSession = (session: AuthSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Replace with actual API call
      const response = await mockLogin(credentials);

      saveSession(response);
      setState({
        user: response.user,
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
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Replace with actual API call
      const response = await mockRegister(data);

      saveSession(response);
      setState({
        user: response.user,
        isAuthenticated: true,
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
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // TODO: Call logout API endpoint
      await mockLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const session: AuthSession = JSON.parse(stored);

      // TODO: Replace with actual API call
      const response = await mockRefreshToken(session.refreshToken);

      saveSession(response);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      clearSession();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      return false;
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };

      // Update stored session
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        session.user = updatedUser;
        saveSession(session);
      }

      return { ...prev, user: updatedUser };
    });
  }, []);

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

// Mock API functions - Replace with real API calls
async function mockLogin(credentials: LoginCredentials): Promise<AuthSession> {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate validation
  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }

  if (credentials.password.length < 6) {
    throw new Error('Invalid credentials');
  }

  const user: User = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: credentials.email,
    name: credentials.email.split('@')[0],
    mode: 'individual',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isVerified: true
  };

  return {
    user,
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresAt: Date.now() + 3600000 // 1 hour
  };
}

async function mockRegister(data: RegisterData): Promise<AuthSession> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate validation
  if (!data.email || !data.password || !data.name) {
    throw new Error('All fields are required');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const user: User = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: data.email,
    name: data.name,
    mode: data.mode,
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isVerified: false
  };

  return {
    user,
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresAt: Date.now() + 3600000
  };
}

async function mockLogout(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
}

async function mockRefreshToken(refreshToken: string): Promise<AuthSession> {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!refreshToken) {
    throw new Error('Invalid refresh token');
  }

  // In real app, this would validate the refresh token and return new tokens
  const user: User = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'User',
    mode: 'individual',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isVerified: true
  };

  return {
    user,
    accessToken: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    expiresAt: Date.now() + 3600000
  };
}
