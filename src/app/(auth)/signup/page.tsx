'use client';

import { useState } from 'react';
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
import { registerSchema, type RegisterInput } from '@/lib/validations';

// AIDEV-NOTE: User registration page with email verification flow

export default function SignupPage() {
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { signUp } = useAuth();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const { error } = await signUp(data.email, data.password, data.name);

      if (error) {
        form.setError('root', { message: error.message });
      } else {
        setUserEmail(data.email);
        setSuccess(true);
      }
    } catch {
      form.setError('root', { message: '회원가입 중 오류가 발생했습니다.' });
    }
  };

  // AIDEV-NOTE: Email verification success screen with Korean messaging

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">이메일을 확인해 주세요</CardTitle>
            <CardDescription>
              {userEmail}로 인증 메일을 보내드렸습니다.
              <br />
              메일함을 확인하고 인증을 완료해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">로그인 페이지로 이동</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            또는{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              기존 계정으로 로그인
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                autoComplete="name"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일 주소를 입력하세요"
                autoComplete="email"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                autoComplete="new-password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? '가입 중...' : '회원가입'}
            </Button>

            <SocialLogin 
              onError={(error) => form.setError('root', { message: error })}
              onLoading={() => {}}
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              회원가입 시{' '}
              <Link href="#" className="text-primary hover:underline">
                서비스 이용약관
              </Link>{' '}
              및{' '}
              <Link href="#" className="text-primary hover:underline">
                개인정보 처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}