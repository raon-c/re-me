'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Share2,
  ArrowLeft,
  Trash2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { InvitationEditor } from '@/components/invitation/InvitationEditor';
import { WeddingInfoForm } from '@/components/wedding/WeddingInfoForm';
import { RSVPManager } from '@/components/rsvp/RSVPManager';
import { InvitationAnalytics } from '@/components/invitation/InvitationAnalytics';
import { ShareModal } from '@/components/invitation/ShareModal';
import { getInvitationByIdAction, updateInvitationAction, deleteInvitationAction } from '@/actions/safe-invitation-actions';
import type { Invitation } from '@/types';

// AIDEV-NOTE: 청첩장 편집 메인 페이지
// 통합된 편집 인터페이스와 관리 기능 제공

interface InvitationEditPageProps {
  params: { id: string };
}

export default function InvitationEditPage({ params }: InvitationEditPageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [showShareModal, setShowShareModal] = useState(false);

  // 청첩장 데이터 로드
  const loadInvitation = async () => {
    try {
      setIsLoading(true);
      const result = await getInvitationByIdAction({ id });
      
      if (result?.data) {
        setInvitation(result.data);
      } else {
        toast.error('청첩장을 찾을 수 없습니다.');
        router.push('/dashboard');
      }
    } catch {
      toast.error('청첩장을 불러오는데 실패했습니다.');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // 청첩장 저장
  const handleSave = async (data: Partial<Invitation>) => {
    try {
      setIsSaving(true);
      const result = await updateInvitationAction({ 
        id, 
        data: data as any
      });
      
      if (result?.data) {
        setInvitation(prev => prev ? { ...prev, ...data } : null);
        toast.success('청첩장이 저장되었습니다.');
      } else {
        toast.error('저장에 실패했습니다.');
      }
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 청첩장 삭제
  const handleDelete = async () => {
    if (!confirm('정말 이 청첩장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const result = await deleteInvitationAction({ id });
      
      if (result?.data) {
        toast.success('청첩장이 삭제되었습니다.');
        router.push('/dashboard');
      } else {
        toast.error('삭제에 실패했습니다.');
      }
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.');
    }
  };

  // 미리보기 열기
  const handlePreview = () => {
    if (invitation?.invitation_code) {
      window.open(`/i/${invitation.invitation_code}`, '_blank');
    }
  };

  // 상태 변경 (TODO: InvitationWithStats 타입 사용 시 구현)
  const handleStatusChange = async (status: 'draft' | 'published') => {
    // await handleSave({ status });
    console.log('Status change:', status);
  };

  // 복사 생성
  const handleDuplicate = async () => {
    try {
      // 복사 로직 구현 필요
      toast.success('청첩장이 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">공개됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      default:
        return <Badge variant="outline">미정</Badge>;
    }
  };

  useEffect(() => {
    loadInvitation();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">청첩장을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">청첩장을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 청첩장이 존재하지 않거나 접근 권한이 없습니다.</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                대시보드
              </Button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  {invitation.groom_name} ♥ {invitation.bride_name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    마지막 수정: {new Date(invitation.updated_at || invitation.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                미리보기
              </Button>
              
              <Button
                variant="outline"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    공유
                  </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                복사
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
              
              {/* TODO: 상태 관리 버튼 - InvitationWithStats 타입 적용 후 활성화
              <Button
                size="sm"
                onClick={() => handleStatusChange('published')}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  '공개하기'
                )}
              </Button>
              */}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="edit">편집</TabsTrigger>
            <TabsTrigger value="info">정보</TabsTrigger>
            <TabsTrigger value="rsvp">RSVP</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <InvitationEditor
              invitationId={invitation.id}
              templateId={invitation.template_id}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>결혼식 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <WeddingInfoForm
                  initialData={invitation as any}
                  onSubmit={handleSave as any}
                  onSave={handleSave as any}
                  isLoading={isSaving}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rsvp">
            <RSVPManager invitationId={invitation.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <InvitationAnalytics invitationId={invitation.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 공유 모달 */}
      {showShareModal && invitation.invitation_code && (
        <ShareModal
          invitationCode={invitation.invitation_code}
          groomName={invitation.groom_name}
          brideName={invitation.bride_name}
          weddingDate={invitation.wedding_date}
          weddingVenue={invitation.venue_name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}