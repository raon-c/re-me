'use client';

import { useParams, useRouter } from 'next/navigation';
import { WeddingInfoForm } from '@/components/wedding/WeddingInfoForm';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

export default function WeddingInfoPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const invitationId = params.id as string;

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 결혼식 정보 조회
  const {
    data: weddingInfo,
    isLoading: isLoadingWeddingInfo,
    error: weddingInfoError,
  } = api.invitation.getWeddingInfo.useQuery(
    { id: invitationId },
    { enabled: !!invitationId && !!user }
  );

  // 결혼식 정보 업데이트
  const updateWeddingInfoMutation = api.invitation.updateWeddingInfo.useMutation({
    onSuccess: () => {
      toast.success('결혼식 정보가 성공적으로 저장되었습니다.');
      router.push(`/invitation/${invitationId}/edit` as any);
    },
    onError: (error) => {
      toast.error(`저장 실패: ${error.message}`);
    },
  });

  // 임시 저장 (부분 업데이트)
  const handleSave = async (data: Partial<WeddingInfoFormData>) => {
    try {
      await updateWeddingInfoMutation.mutateAsync({
        id: invitationId,
        weddingInfo: data,
      });
      toast.success('임시 저장되었습니다.');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // 폼 제출 (완전 저장)
  const handleSubmit = async (data: WeddingInfoFormData) => {
    try {
      await updateWeddingInfoMutation.mutateAsync({
        id: invitationId,
        weddingInfo: data,
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (authLoading || isLoadingWeddingInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결혼식 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (weddingInfoError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">결혼식 정보를 불러올 수 없습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WeddingInfoForm
        initialData={weddingInfo}
        onSubmit={handleSubmit}
        onSave={handleSave}
        isLoading={updateWeddingInfoMutation.isPending}
      />
    </div>
  );
}