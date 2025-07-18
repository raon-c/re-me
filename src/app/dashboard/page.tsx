import { requireAuth } from '@/lib/auth-utils';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AccountInfoCard } from '@/components/dashboard/AccountInfoCard';

// AIDEV-NOTE: 서버 컴포넌트로 변경된 대시보드 페이지 - 서버에서 사용자 정보를 가져와 렌더링
export default async function DashboardPage() {
  // 서버에서 사용자 인증 확인 및 데이터 가져오기
  const userData = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with client-side interactions */}
      <DashboardHeader userData={userData} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AccountInfoCard userData={userData} />
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
