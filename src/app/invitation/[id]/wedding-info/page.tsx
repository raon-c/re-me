'use client';

import { useParams, useRouter } from 'next/navigation';
import { WeddingInfoForm } from '@/components/wedding/WeddingInfoForm';
import {
  getInvitationByIdAction,
  updateInvitationAction,
} from '@/actions/safe-invitation-actions';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

export default function WeddingInfoPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const invitationId = params.id as string;
  const [weddingInfo, setWeddingInfo] = useState<any>(null);
  const [isLoadingWeddingInfo, setIsLoadingWeddingInfo] = useState(false);
  const [weddingInfoError, setWeddingInfoError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 결혼식 정보 조회
  useEffect(() => {
    const loadWeddingInfo = async () => {
      if (!invitationId || !user) return;

      setIsLoadingWeddingInfo(true);
      try {
        const result = await getInvitationByIdAction({ id: invitationId });
        if (result?.data) {
          setWeddingInfo(result.data);
        } else {
          throw new Error(
            result?.serverError || '초대장을 불러올 수 없습니다.'
          );
        }
      } catch (error) {
        console.error('Failed to load wedding info:', error);
        setWeddingInfoError(
          error instanceof Error ? error : new Error('알 수 없는 오류')
        );
        toast.error('결혼식 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingWeddingInfo(false);
      }
    };

    loadWeddingInfo();
  }, [invitationId, user]);

  // AIDEV-NOTE: camelCase에서 snake_case로 변환 함수
  const convertToSnakeCase = (data: Partial<WeddingInfoFormData>) => {
    const converted: any = {};
    if (data.groomName !== undefined) converted.groom_name = data.groomName;
    if (data.brideName !== undefined) converted.bride_name = data.brideName;
    if (data.weddingDate !== undefined) converted.wedding_date = data.weddingDate;
    if (data.weddingTime !== undefined) converted.wedding_time = data.weddingTime;
    if (data.venueName !== undefined) converted.venue_name = data.venueName;
    if (data.venueAddress !== undefined) converted.venue_address = data.venueAddress;
    if (data.customMessage !== undefined) converted.custom_message = data.customMessage;
    if (data.dressCode !== undefined) converted.dress_code = data.dressCode;
    if (data.parkingInfo !== undefined) converted.parking_info = data.parkingInfo;
    if (data.mealInfo !== undefined) converted.meal_info = data.mealInfo;
    if (data.specialNotes !== undefined) converted.special_notes = data.specialNotes;
    if (data.rsvpEnabled !== undefined) converted.rsvp_enabled = data.rsvpEnabled;
    if (data.rsvpDeadline !== undefined) converted.rsvp_deadline = data.rsvpDeadline;
    if (data.backgroundImageUrl !== undefined) converted.background_image_url = data.backgroundImageUrl;
    return converted;
  };

  // 임시 저장 (부분 업데이트)
  const handleSave = async (data: Partial<WeddingInfoFormData>) => {
    setIsUpdating(true);
    try {
      const convertedData = convertToSnakeCase(data);
      const result = await updateInvitationAction({
        id: invitationId,
        data: convertedData,
      });

      if (result?.data) {
        toast.success('임시 저장되었습니다.');
        setWeddingInfo(result.data);
      } else {
        throw new Error(result?.serverError || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(
        error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // 폼 제출 (완전 저장)
  const handleSubmit = async (data: WeddingInfoFormData) => {
    setIsUpdating(true);
    try {
      const convertedData = convertToSnakeCase(data);
      const result = await updateInvitationAction({
        id: invitationId,
        data: convertedData,
      });

      if (result?.data) {
        toast.success('결혼식 정보가 성공적으로 저장되었습니다.');
        router.push(`/invitation/${invitationId}/edit` as any);
      } else {
        throw new Error(result?.serverError || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(
        error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
      );
    } finally {
      setIsUpdating(false);
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
        isLoading={isUpdating}
      />
    </div>
  );
}
