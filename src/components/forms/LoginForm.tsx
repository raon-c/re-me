'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAction } from '@/actions/safe-auth-actions';
import { useSafeActionWithToast } from '@/hooks/useSafeAction';
import { toast } from 'sonner';

// AIDEV-NOTE: Example login form using safe actions with proper error handling
// Demonstrates integration of next-safe-action with React Hook Form

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginSafeAction = useSafeActionWithToast(loginAction, {
    onSuccess: (data) => {
      toast.success(data.message || '로그인되었습니다.');
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await loginSafeAction.execute(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력해주세요"
              {...register('email')}
              disabled={loginSafeAction.isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              {...register('password')}
              disabled={loginSafeAction.isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {loginSafeAction.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {loginSafeAction.error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loginSafeAction.isLoading}
          >
            {loginSafeAction.isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}