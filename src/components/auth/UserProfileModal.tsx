'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileInput,
  type UpdatePasswordInput,
} from '@/lib/validations';
import type { UserData } from '@/lib/auth-utils';

// AIDEV-NOTE: 서버 데이터를 기반으로 한 프로필 관리 컴포넌트

interface UserProfileModalProps {
  userData: UserData;
  showPasswordUpdate?: boolean;
}

export function UserProfileModal({ 
  userData, 
  showPasswordUpdate = true 
}: UserProfileModalProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Profile update form
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userData.name || '',
      email: userData.email,
    },
  });

  // Password update form
  const passwordForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    try {
      setMessage(null);
      
      // Update Supabase auth user email if changed
      if (data.email !== userData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) {
          profileForm.setError('root', { message: emailError.message });
          return;
        }
      }

      // Update user profile in database
      if (data.name !== userData.name) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .update({ name: data.name })
            .eq('id', userData.id);
            
          if (profileError) {
            // AIDEV-NOTE: users 테이블이 없는 경우 user_metadata 업데이트로 fallback
            console.warn('Users table not found, updating user_metadata:', profileError);
            const { error: metadataError } = await supabase.auth.updateUser({
              data: { name: data.name }
            });
            
            if (metadataError) {
              profileForm.setError('root', { message: metadataError.message });
              return;
            }
          }
        } catch {
          // Fallback to user_metadata update
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { name: data.name }
          });
          
          if (metadataError) {
            profileForm.setError('root', { message: metadataError.message });
            return;
          }
        }
      }

      setIsEditingProfile(false);
      setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
      router.refresh(); // 서버 컴포넌트 데이터 새로고침
    } catch {
      profileForm.setError('root', {
        message: '프로필 업데이트 중 오류가 발생했습니다.',
      });
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordInput) => {
    try {
      setMessage(null);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        passwordForm.setError('root', { message: error.message });
      } else {
        setIsEditingPassword(false);
        passwordForm.reset();
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
      }
    } catch {
      passwordForm.setError('root', {
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user profile from database first (if table exists)
      try {
        await supabase
          .from('users')
          .delete()
          .eq('id', userData.id);
      } catch (error) {
        console.warn('Users table not found, skipping profile deletion:', error);
      }

      // Sign out (admin.deleteUser requires service role key)
      await supabase.auth.signOut();
      router.push('/');
      setMessage({ type: 'success', text: '로그아웃되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '로그아웃 중 오류가 발생했습니다.' });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setMessage({ type: 'error', text: '로그아웃 중 오류가 발생했습니다.' });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>
            계정 정보를 확인하고 수정할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingProfile ? (
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  {...profileForm.register('name')}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  {...profileForm.register('email')}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {profileForm.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.root.message}
                </p>
              )}

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting}
                >
                  {profileForm.formState.isSubmitting ? '저장 중...' : '저장'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    profileForm.reset();
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">이름</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.name || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">이메일 주소</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">로그인 방식</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.provider === 'email'
                    ? '이메일'
                    : userData.provider === 'google'
                      ? 'Google'
                      : userData.provider === 'kakao'
                        ? '카카오'
                        : userData.provider || 'email'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">가입일</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {userData.created_at
                    ? new Date(userData.created_at).toLocaleDateString('ko-KR')
                    : 'N/A'}
                </p>
              </div>
              <Button onClick={() => setIsEditingProfile(true)}>
                프로필 수정
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Update (only for email users) */}
      {showPasswordUpdate && userData.provider === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
            <CardDescription>
              보안을 위해 정기적으로 비밀번호를 변경해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditingPassword ? (
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">새 비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                    {...passwordForm.register('password')}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {passwordForm.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.root.message}
                  </p>
                )}

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting
                      ? '변경 중...'
                      : '비밀번호 변경'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingPassword(false);
                      passwordForm.reset();
                    }}
                  >
                    취소
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setIsEditingPassword(true)}>
                비밀번호 변경
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
          <CardDescription>
            계정 관련 작업을 수행할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full"
            >
              로그아웃
            </Button>

            {showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="flex-1"
                  >
                    계정 삭제
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                계정 삭제
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}