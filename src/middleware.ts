import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('🚨 Auth error:', error.message);
    }

    const { pathname } = request.nextUrl;
    
    // Define routes
    const publicRoutes = [
      '/',
      '/login',
      '/signup',
      '/auth/callback',
      '/auth/reset-password',
      '/templates',
    ];

    const protectedRoutes = [
      '/dashboard',
      '/invitation/create',
      '/invitation/edit',
      '/profile',
    ];

    // Check if route is public
    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isProtectedInvitationEdit = /^\/invitation\/[0-9a-f-]{36}\//.test(pathname);
    
    // AIDEV-NOTE: Route protection logic for authentication

    // Allow public routes
    if (isPublicRoute) {
      return supabaseResponse;
    }

    // Check for protected routes
    if ((isProtectedRoute || isProtectedInvitationEdit) && !user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (user && ['/login', '/signup'].includes(pathname)) {
      const redirectUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;

  } catch (error) {
    console.error('💥 Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};