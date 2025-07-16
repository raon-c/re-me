import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// AIDEV-NOTE: Comprehensive authentication hook with profile management
type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const supabase = createClient();

  // AIDEV-NOTE: Cached user profile fetching with error handling
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
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
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    [supabase]
  );

  // AIDEV-NOTE: Centralized auth state management with profile syncing
  const updateAuthState = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    },
    [fetchUserProfile]
  );

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await updateAuthState(session);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setState((prev) => ({ ...prev, loading: false, initialized: true }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      await updateAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, updateAuthState]);

  // AIDEV-NOTE: Authentication methods with loading state management
  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
      return { data, error };
    },
    [supabase.auth]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setState((prev) => ({ ...prev, loading: true }));
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
      if (error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
      return { data, error };
    },
    [supabase.auth]
  );

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'kakao') => {
      setState((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
      if (error) {
        setState((prev) => ({ ...prev, loading: false }));
      }
      return { data, error };
    },
    [supabase.auth]
  );

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase.auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });
      return { data, error };
    },
    [supabase.auth]
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      return { data, error };
    },
    [supabase.auth]
  );

  // AIDEV-NOTE: Profile update with dual auth/database sync
  const updateProfile = useCallback(
    async (updates: { name?: string; email?: string }) => {
      if (!state.user) {
        return { data: null, error: new Error('User not authenticated') };
      }

      try {
        // Update user metadata in auth
        if (updates.email) {
          const { error: authError } = await supabase.auth.updateUser({
            email: updates.email,
          });
          if (authError) {
            return { data: null, error: authError };
          }
        }

        if (updates.name) {
          const { error: authError } = await supabase.auth.updateUser({
            data: { name: updates.name },
          });
          if (authError) {
            return { data: null, error: authError };
          }
        }

        // Update profile in database
        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.user.id)
          .select()
          .single();

        if (error) {
          return { data: null, error };
        }

        // Update local state
        setState((prev) => ({
          ...prev,
          profile: data,
        }));

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    [state.user, supabase]
  );

  // AIDEV-NOTE: Account deletion with cascade cleanup
  const deleteAccount = useCallback(async () => {
    if (!state.user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      // Delete user profile (this will cascade delete related data)
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', state.user.id);

      if (profileError) {
        return { error: profileError };
      }

      // Sign out the user
      await signOut();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [state.user, supabase, signOut]);

  return {
    // State
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    initialized: state.initialized,
    isAuthenticated: !!state.user,

    // Methods
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
  };
}
