'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SocialLoginProps {
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
}

export function SocialLogin({ onError, onLoading }: SocialLoginProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { signInWithProvider } = useAuth();

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoadingProvider(provider);
    onLoading?.(true);

    try {
      const { error } = await signInWithProvider(provider);

      if (error) {
        onError?.(error.message);
      }
      // Success will be handled by the auth state change
    } catch {
      // AIDEV-NOTE: Korean error message for better UX
      onError?.('소셜 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoadingProvider(null);
      onLoading?.(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={loadingProvider === 'google'}
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'google' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('kakao')}
          disabled={loadingProvider === 'kakao'}
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProvider === 'kakao' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#000000"
                  d="M12 3C7.03 3 3 6.14 3 10.1c0 2.52 1.65 4.74 4.1 6.1l-.96 3.48c-.06.22.18.4.37.28L10.85 17c.38.04.77.06 1.15.06 4.97 0 9-3.14 9-7.1S16.97 3 12 3z"
                />
              </svg>
              카카오로 계속하기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
