import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string };
}) {
  const supabase = await createClient();

  if (searchParams.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      searchParams.code
    );

    if (!error) {
      // Successful authentication, redirect to dashboard
      redirect('/dashboard');
    }
  }

  if (searchParams.error) {
    // Handle authentication error
    redirect('/login?error=auth_failed');
  }

  // Default redirect if no code or error
  redirect('/login');
}
