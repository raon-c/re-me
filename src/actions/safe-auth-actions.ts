'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { actionClient, authActionClient, commonSchemas } from '@/lib/safe-action';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  socialLoginSchema,
} from '@/lib/validations';
import type { User } from '@/types/auth';

// AIDEV-NOTE: Safe Action implementations for authentication with enhanced security and logging
// Provides type-safe server actions with built-in validation, error handling, and user context

/**
 * 회원가입 Safe Action
 * 이메일과 비밀번호로 새 계정을 생성합니다.
 */
export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, name } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Supabase Auth를 통한 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (authError) {
      throw new Error(
        authError.message === 'User already registered'
          ? '이미 등록된 이메일입니다.'
          : '회원가입 중 오류가 발생했습니다.'
      );
    }

    if (!authData.user) {
      throw new Error('사용자 생성에 실패했습니다.');
    }

    // 사용자 프로필을 public.users 테이블에 저장
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        provider: 'email',
        email_verified: false,
      });

    if (profileError) {
      // 프로필 생성 실패 시 auth 사용자도 삭제 시도
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('사용자 프로필 생성에 실패했습니다.');
    }

    return {
      message: '회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.',
      user: {
        id: authData.user.id,
        email,
        name,
        provider: 'email' as const,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      needsEmailVerification: !authData.session,
    };
  });

/**
 * 로그인 Safe Action
 * 이메일과 비밀번호로 로그인합니다.
 */
export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      throw new Error(
        authError.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : '로그인 중 오류가 발생했습니다.'
      );
    }

    if (!authData.user || !authData.session) {
      throw new Error('로그인에 실패했습니다.');
    }

    // 사용자 프로필 정보 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('사용자 정보를 불러오는데 실패했습니다.');
    }

    revalidatePath('/', 'layout');
    
    return {
      message: '로그인되었습니다.',
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        provider: userProfile.provider as 'email' | 'google' | 'kakao',
        providerId: userProfile.provider_id,
        emailVerified: userProfile.email_verified,
        createdAt: new Date(userProfile.created_at),
        updatedAt: new Date(userProfile.updated_at),
      } as User,
    };
  });

/**
 * 소셜 로그인 Safe Action
 * 카카오, 구글 소셜 로그인 URL을 생성하고 리다이렉트합니다.
 */
export const socialLoginAction = actionClient
  .schema(socialLoginSchema)
  .action(async ({ parsedInput }) => {
    const { provider, redirectTo } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'kakao' ? 'kakao' : 'google',
      options: {
        redirectTo:
          redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error || !data.url) {
      throw new Error('소셜 로그인 URL 생성에 실패했습니다.');
    }

    // Safe action에서는 redirect를 직접 호출하지 않고 URL을 반환
    return {
      redirectUrl: data.url,
      provider,
    };
  });

/**
 * 로그아웃 Safe Action
 * 현재 세션을 종료합니다.
 */
export const logoutAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();

    if (error) {
      throw new Error('로그아웃 중 오류가 발생했습니다.');
    }

    revalidatePath('/', 'layout');
    
    return {
      message: '로그아웃되었습니다.',
    };
  });

/**
 * 비밀번호 재설정 이메일 발송 Safe Action
 */
export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      throw new Error('비밀번호 재설정 이메일 발송에 실패했습니다.');
    }

    return {
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      email,
    };
  });

/**
 * 비밀번호 업데이트 Safe Action
 */
export const updatePasswordAction = authActionClient
  .schema(updatePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { password } = parsedInput;

    const { error } = await ctx.supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw new Error('비밀번호 변경에 실패했습니다.');
    }

    revalidatePath('/', 'layout');

    return {
      message: '비밀번호가 성공적으로 변경되었습니다.',
    };
  });

/**
 * 프로필 업데이트 Safe Action
 */
export const updateProfileAction = authActionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { name, email } = parsedInput;

    // 이메일 변경이 있는 경우 Supabase Auth 업데이트
    if (email && email !== ctx.user.email) {
      const { error: authError } = await ctx.supabase.auth.updateUser({
        email,
      });

      if (authError) {
        throw new Error(
          authError.message === 'Email address already in use'
            ? '이미 사용 중인 이메일입니다.'
            : '이메일 변경에 실패했습니다.'
        );
      }
    }

    // 프로필 정보 업데이트
    const updateData: { name: string; email?: string } = { name };
    if (email) {
      updateData.email = email;
    }

    const { data: updatedProfile, error: profileError } = await ctx.supabase
      .from('users')
      .update(updateData)
      .eq('id', ctx.user.id)
      .select()
      .single();

    if (profileError || !updatedProfile) {
      throw new Error('프로필 업데이트에 실패했습니다.');
    }

    revalidatePath('/', 'layout');

    return {
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        provider: updatedProfile.provider as 'email' | 'google' | 'kakao',
        providerId: updatedProfile.provider_id,
        emailVerified: updatedProfile.email_verified,
        createdAt: new Date(updatedProfile.created_at),
        updatedAt: new Date(updatedProfile.updated_at),
      } as User,
    };
  });

/**
 * 계정 삭제 Safe Action
 */
export const deleteAccountAction = authActionClient
  .schema(z.object({
    confirmPassword: z.string().min(1, '비밀번호를 입력해주세요.'),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { confirmPassword } = parsedInput;

    // 비밀번호 확인을 위해 재로그인 시도
    if (ctx.user.email) {
      const { error: verifyError } = await ctx.supabase.auth.signInWithPassword({
        email: ctx.user.email,
        password: confirmPassword,
      });

      if (verifyError) {
        throw new Error('비밀번호가 올바르지 않습니다.');
      }
    }

    // 관련 데이터 삭제 (RLS 정책에 의해 자동으로 사용자 소유 데이터만 삭제됨)
    await ctx.supabase.from('invitations').delete().eq('user_id', ctx.user.id);

    // 사용자 프로필 삭제
    const { error: profileError } = await ctx.supabase
      .from('users')
      .delete()
      .eq('id', ctx.user.id);

    if (profileError) {
      throw new Error('사용자 데이터 삭제에 실패했습니다.');
    }

    // Supabase Auth 사용자 삭제
    const { error: authError } = await ctx.supabase.auth.admin.deleteUser(ctx.user.id);

    if (authError) {
      // 이미 프로필은 삭제되었으므로 로그만 남김
      console.error('Auth user deletion error:', authError);
    }

    revalidatePath('/', 'layout');
    
    return {
      message: '계정이 성공적으로 삭제되었습니다.',
      deletedAt: new Date(),
    };
  });

/**
 * 이메일 인증 재발송 Safe Action
 */
export const resendEmailVerificationAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
    if (!ctx.user.email) {
      throw new Error('이메일 정보를 찾을 수 없습니다.');
    }

    const { error } = await ctx.supabase.auth.resend({
      type: 'signup',
      email: ctx.user.email,
    });

    if (error) {
      throw new Error('이메일 인증 재발송에 실패했습니다.');
    }

    return {
      message: '이메일 인증 링크가 재발송되었습니다.',
    };
  });

/**
 * 현재 사용자 정보 가져오기 Safe Action (Server Component용)
 */
export const getCurrentUserAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return null;
    }

    // 사용자 프로필 정보 조회
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      return null;
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      provider: userProfile.provider as 'email' | 'google' | 'kakao',
      providerId: userProfile.provider_id,
      emailVerified: userProfile.email_verified,
      createdAt: new Date(userProfile.created_at),
      updatedAt: new Date(userProfile.updated_at),
    } as User;
  });

// Helper function to handle social login redirect
export async function handleSocialLoginRedirect(provider: 'google' | 'kakao', redirectTo?: string) {
  const result = await socialLoginAction({
    provider,
    redirectTo,
  });

  if (result?.data?.redirectUrl) {
    redirect(result.data.redirectUrl);
  } else {
    throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
  }
}

// Helper function to handle logout with redirect
export async function handleLogoutWithRedirect() {
  await logoutAction({});
  redirect('/');
}