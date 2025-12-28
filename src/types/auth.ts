// src/types/auth.ts
// Authentication Types

import { UserMode } from './dataDonation';

export interface User {
  id: string;
  email: string;
  name: string;
  mode: UserMode;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  isVerified: boolean;
  avatar?: string;
}

export type UserRole = 'user' | 'researcher' | 'vc' | 'admin';

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  mode: UserMode;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

// Helper to check if user has permission for a mode
export function canAccessMode(user: User | null, requiredMode: UserMode): boolean {
  if (!user) return false;

  // Admin can access everything
  if (user.role === 'admin') return true;

  // VCs can access VC mode
  if (requiredMode === 'ea-vc' && user.role === 'vc') return true;

  // Researchers can access researcher mode
  if (requiredMode === 'researcher' && (user.role === 'researcher' || user.role === 'vc')) return true;

  // Everyone can access individual mode
  if (requiredMode === 'individual') return true;

  // Check if user's selected mode matches
  return user.mode === requiredMode;
}

// Role-based permission check
export function hasPermission(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    'user': 1,
    'researcher': 2,
    'vc': 3,
    'admin': 4
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
