import { createClient } from './server';
import { createClient as createBrowserClient } from './client';
import type { User } from '@supabase/supabase-js';

// AIDEV-NOTE: Authentication utilities for server and client-side operations

/**
 * Get the current user from server-side
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session from server-side
 */
export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get user profile data with additional metadata
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    email?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create or update user profile after OAuth sign-in
 * AIDEV-NOTE: Handles both social login and email signup profile creation
 */
export async function upsertUserProfile(user: User) {
  const supabase = await createClient();

  const userData = {
    id: user.id,
    email: user.email!,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email!.split('@')[0],
    provider: user.app_metadata?.provider || 'email',
    provider_id: user.user_metadata?.provider_id || null,
    email_verified: user.email_confirmed_at ? true : false,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(userData, {
      onConflict: 'id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete user account and all associated data
 */
export async function deleteUserAccount(userId: string) {
  const supabase = await createClient();

  // Delete user profile (cascading deletes will handle invitations, etc.)
  const { error: profileError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Error deleting user profile:', profileError);
    return { error: profileError };
  }

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('Error deleting auth user:', authError);
    return { error: authError };
  }

  return { error: null };
}

/**
 * Client-side authentication utilities
 * AIDEV-NOTE: Centralized auth methods for consistent error handling and Korean UX
 */
export const clientAuth = {
  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'kakao') {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Sign out
   */
  async signOut() {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });
    return { data, error };
  },

  /**
   * Update password
   */
  async updatePassword(password: string) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  /**
   * Update user metadata
   */
  async updateUser(updates: { email?: string; data?: Record<string, unknown> }) {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.updateUser(updates);
    return { data, error };
  },
};
