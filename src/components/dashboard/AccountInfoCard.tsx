import type { UserData } from '@/lib/auth-utils';

interface AccountInfoCardProps {
  userData: UserData;
}

// AIDEV-NOTE: 계정 정보를 보여주는 정적 카드 컴포넌트 (서버 컴포넌트에서 사용)
export function AccountInfoCard({ userData }: AccountInfoCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          계정 정보
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">이름</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {userData.name || 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">이메일</dt>
            <dd className="mt-1 text-sm text-gray-900">{userData.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">로그인 방식</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {userData.provider || 'email'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">이메일 인증</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {userData.email_confirmed_at ? (
                <span className="text-green-600">인증됨</span>
              ) : (
                <span className="text-yellow-600">미인증</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">가입일</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString('ko-KR')
                : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}