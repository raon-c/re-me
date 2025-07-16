'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/auth/UserProfile';
import { useState } from 'react';

export default function DashboardPage() {
  const { user, profile, signOut, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600">
            이 페이지에 접근하려면 로그인해 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-600">
                안녕하세요, {profile?.name || user.email}님!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                프로필 관리
              </button>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          {showProfile ? (
            <UserProfile />
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  계정 정보
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">이름</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile?.name || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      이메일
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      로그인 방식
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {profile?.provider || 'email'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      이메일 인증
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.email_confirmed_at ? (
                        <span className="text-green-600">인증됨</span>
                      ) : (
                        <span className="text-yellow-600">미인증</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      가입일
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            'ko-KR'
                          )
                        : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Placeholder for future features */}
        <div className="mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                청첩장 관리
              </h3>
              <p className="text-gray-600">
                청첩장 생성 및 관리 기능은 추후 구현됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
