import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// AIDEV-NOTE: Safe Action client with authentication middleware and error handling
// Provides type-safe server actions with built-in validation and logging

/**
 * Base Safe Action client with global error handling
 */
export const actionClient = createSafeActionClient({
  // Global error handling for all actions
  handleServerError(e) {
    // Log server errors for debugging
    console.error('Action error:', e);

    // Return user-friendly Korean error messages
    if (e instanceof Error) {
      return e.message;
    }

    return '예상치 못한 오류가 발생했습니다.';
  },
}).use(async ({ next }) => {
  // Log action execution for debugging
  const startTime = Date.now();
  const result = await next();
  const duration = Date.now() - startTime;

  console.log(`✅ Action completed in ${duration}ms`);

  return result;
});

/**
 * Authenticated Safe Action client that requires user authentication
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();

  // Get current user from Supabase Auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  // Get user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.warn('User profile not found, using auth user data');
  }

  // Pass user and profile data to the action
  return next({
    ctx: {
      user,
      profile,
      supabase,
    },
  });
});

/**
 * Admin Safe Action client for administrative operations
 */
export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  // Check if user is admin (you can customize this logic)
  if (!ctx.profile?.email?.endsWith('@admin.com')) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});

/**
 * Rate-limited Safe Action client
 */
export const rateLimitedActionClient = actionClient.use(
  async ({ next }) => {
    // Simple in-memory rate limiting (in production, use Redis or similar)
    // For demo purposes, we'll skip the actual rate limiting implementation
    // In production, you would implement proper rate limiting here

    return next();
  }
);

// Export common schemas for reuse
export const commonSchemas = {
  // Pagination schema
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).optional(),
  }),

  // Search schema
  search: z.object({
    query: z.string().min(1).max(100),
    category: z.string().optional(),
  }),

  // ID validation schema
  id: z.object({
    id: z.string().uuid('유효하지 않은 ID 형식입니다.'),
  }),

  // Template ID validation schema (supports custom string IDs)
  templateId: z.object({
    id: z.string().min(1, '템플릿 ID가 필요합니다.').max(50, '템플릿 ID가 너무 깁니다.'),
  }),

  // Invitation code schema
  invitationCode: z.object({
    code: z.string().length(8, '초대 코드는 8자리여야 합니다.'),
  }),
};

// Type helpers for action results
export type ActionSuccess<T = any> = {
  data: T;
  serverError?: undefined;
  validationErrors?: undefined;
};

export type ActionError = {
  data?: undefined;
  serverError?: string;
  validationErrors?: Record<string, string[]>;
};

export type SafeActionResult<T = any> = ActionSuccess<T> | ActionError;

// Utility function to check if action result is successful
export function isActionSuccess<T>(
  result: SafeActionResult<T>
): result is ActionSuccess<T> {
  return (
    result.data !== undefined && !result.serverError && !result.validationErrors
  );
}

// Utility function to extract error message from action result
export function getActionError(result: SafeActionResult): string {
  if (result.serverError) {
    return result.serverError;
  }

  if (result.validationErrors) {
    const errors = Object.values(result.validationErrors).flat();
    return errors.join(', ');
  }

  return '알 수 없는 오류가 발생했습니다.';
}
