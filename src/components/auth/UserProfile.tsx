'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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

// AIDEV-NOTE: Complete user profile management with Korean UX

interface UserProfileProps {
  showPasswordUpdate?: boolean;
}

export function UserProfile({ showPasswordUpdate = true }: UserProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    user,
    profile,
    updateProfile,
    updatePassword,
    deleteAccount,
    signOut,
  } = useAuth();
  const router = useRouter();

  // Profile update form
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: user?.email || '',
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
      const { error } = await updateProfile(data);

      if (error) {
        profileForm.setError('root', { message: error.message });
      } else {
        setIsEditingProfile(false);
        profileForm.reset({
          name: data.name,
          email: data.email,
        });
      }
    } catch {
      profileForm.setError('root', {
        message: '프로필 업데이트 중 오류가 발생했습니다.',
      });
    }
  };

  const onPasswordSubmit = async (data: UpdatePasswordInput) => {
    try {
      const { error } = await updatePassword(data.password);

      if (error) {
        passwordForm.setError('root', { message: error.message });
      } else {
        setIsEditingPassword(false);
        passwordForm.reset();
      }
    } catch {
      passwordForm.setError('root', {
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await deleteAccount();

      if (error) {
        console.error('계정 삭제 오류:', error);
      } else {
        router.push('/');
      }
    } catch {
      console.error('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch {
      console.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  // AIDEV-NOTE: Account deletion with confirmation dialog for safety

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            사용자 정보를 불러오는 중...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
                  {profile.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">이메일 주소</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">로그인 방식</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.provider === 'email'
                    ? '이메일'
                    : profile.provider === 'google'
                      ? 'Google'
                      : profile.provider === 'kakao'
                        ? '카카오'
                        : profile.provider}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">가입일</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(profile.created_at).toLocaleDateString('ko-KR')}
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
      {showPasswordUpdate && profile.provider === 'email' && (
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