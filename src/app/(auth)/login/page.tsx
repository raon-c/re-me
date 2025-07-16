'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  loginSchema,
  resetPasswordSchema,
  type LoginInput,
  type ResetPasswordInput,
} from '@/lib/validations';

// AIDEV-NOTE: Login page with password reset functionality and social login integration

export default function LoginPage() {
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, resetPassword } = useAuth();

  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const authError = searchParams.get('error');

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Reset password form
  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        loginForm.setError('root', { message: error.message });
      } else {
        router.push(redirectTo as '/dashboard');
      }
    } catch {
      loginForm.setError('root', { message: '로그인 중 오류가 발생했습니다.' });
    }
  };

  // AIDEV-NOTE: Password reset with Korean UX messaging

  const onResetSubmit = async (data: ResetPasswordInput) => {
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        resetForm.setError('root', { message: error.message });
      } else {
        setResetSuccess(true);
      }
    } catch {
      resetForm.setError('root', {
        message: '비밀번호 재설정 중 오류가 발생했습니다.',
      });
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetSuccess(false);
    resetForm.reset();
  };

  // Reset success screen
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">이메일을 확인해 주세요</CardTitle>
            <CardDescription>
              비밀번호 재설정 링크를 {resetForm.getValues('email')}로
              보내드렸습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              로그인으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
            <CardDescription>
              가입하신 이메일 주소를 입력해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={resetForm.handleSubmit(onResetSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="resetEmail">이메일 주소</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  {...resetForm.register('email')}
                />
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {resetForm.formState.errors.root && (
                <p className="text-sm text-destructive text-center">
                  {resetForm.formState.errors.root.message}
                </p>
              )}

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={resetForm.formState.isSubmitting}
                  className="flex-1"
                >
                  {resetForm.formState.isSubmitting
                    ? '전송 중...'
                    : '재설정 링크 전송'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            또는{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              새 계정 만들기
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                autoComplete="email"
                {...loginForm.register('email')}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                {...loginForm.register('password')}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowResetForm(true)}
                className="px-0 text-sm"
              >
                비밀번호를 잊으셨나요?
              </Button>
            </div>

            {(loginForm.formState.errors.root || authError) && (
              <p className="text-sm text-destructive text-center">
                {loginForm.formState.errors.root?.message ||
                  (authError === 'auth_failed'
                    ? '인증에 실패했습니다.'
                    : authError)}
              </p>
            )}

            <Button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full"
            >
              {loginForm.formState.isSubmitting ? '로그인 중...' : '로그인'}
            </Button>

            <SocialLogin 
              onError={(error) => loginForm.setError('root', { message: error })}
              onLoading={() => {}} 
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
