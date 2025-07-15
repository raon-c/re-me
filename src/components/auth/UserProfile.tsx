'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function UserProfile({ onSuccess, onError }: UserProfileProps) {
  const { user, profile, updateProfile, deleteAccount, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { error } = await updateProfile({
        name: formData.name,
        email: formData.email !== profile.email ? formData.email : undefined,
      });

      if (error) {
        onError?.(error.message);
      } else {
        setIsEditing(false);
        onSuccess?.();
      }
    } catch (err) {
      onError?.('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const { error } = await deleteAccount();

      if (error) {
        onError?.(error.message);
      } else {
        // Account deletion successful, user will be redirected by auth state change
      }
    } catch (err) {
      onError?.('계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">프로필 정보</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            편집
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              이름
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {formData.email !== profile.email && (
              <p className="mt-1 text-xs text-gray-500">
                이메일 변경 시 인증 메일이 발송됩니다.
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              로그인 방식
            </label>
            <p className="mt-1 text-sm text-gray-900 capitalize">
              {profile.provider}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              가입일
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(profile.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      )}

      {/* Delete Account Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-red-600 mb-2">위험 구역</h3>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-600 hover:text-red-500"
          >
            계정 삭제
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은
              되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isDeleting ? '삭제 중...' : '계정 삭제'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
