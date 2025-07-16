import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// AIDEV-NOTE: Type definitions for mobile wedding invitation authentication system
// Extended user type that includes our custom fields
export interface User {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google' | 'kakao';
  providerId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth session type
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Auth context type for tRPC
export interface AuthContext {
  session: Session | null;
  user: SupabaseUser | null;
}

// Auth response types
export interface AuthResponse {
  user: User;
  session: AuthSession;
  message: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

// Social login provider types
export type SocialProvider = 'google' | 'kakao';

export interface SocialLoginResponse {
  url: string;
  provider: SocialProvider;
}

// Password reset types
export interface PasswordResetResponse {
  message: string;
  email: string;
}

// Profile update types
export interface ProfileUpdateResponse {
  user: User;
  message: string;
}

// Account deletion types
export interface AccountDeletionResponse {
  message: string;
  deletedAt: Date;
}
