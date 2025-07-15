import { createClient } from '@/lib/supabase/server';
import { upsertUserProfile } from '@/lib/supabase/utils';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Create or update user profile in database
        const { error: profileError } = await upsertUserProfile(user);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue to dashboard even if profile creation fails
        }
      }

      // Successful authentication, redirect to dashboard
      redirect('/dashboard');
    } else {
      console.error('Auth callback error:', error);
      redirect('/login?error=auth_failed');
    }
  }

  if (params.error) {
    // Handle authentication error
    console.error('OAuth error:', params.error);
    redirect('/login?error=auth_failed');
  }

  // Default redirect if no code or error
  redirect('/login');
}
