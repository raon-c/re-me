'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserProfileModal } from '@/components/auth/UserProfileModal';
import type { UserData } from '@/lib/auth-utils';

interface DashboardHeaderProps {
  userData: UserData;
}

// AIDEV-NOTE: 대시보드 헤더의 클라이언트 상태 관리 (프로필 토글, 로그아웃)
export function DashboardHeader({ userData }: DashboardHeaderProps) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-600">
                안녕하세요, {userData.name || userData.email}님!
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
                disabled={isSigningOut}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {isSigningOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">프로필 관리</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <UserProfileModal userData={userData} />
          </div>
        </div>
      )}
    </>
  );
}