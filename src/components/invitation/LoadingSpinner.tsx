import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = '로딩 중...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
