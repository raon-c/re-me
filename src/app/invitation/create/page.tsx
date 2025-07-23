'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlockBasedEditor } from '@/components/invitation/BlockBasedEditor';
import { WeddingInfoForm } from '@/components/wedding/WeddingInfoForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTemplateByIdAction } from '@/actions/safe-template-actions';
import { createInvitationAction } from '@/actions/safe-invitation-actions';
import { ArrowLeft, Save, Eye, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { Template } from '@/types';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

// AIDEV-NOTE: 청첩장 생성 페이지 - 2단계 청첩장 생성 플로우 (결혼식 정보 → 블록 편집)

type CreateStep = 'wedding-info' | 'editing';

function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<CreateStep>('wedding-info');
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfoFormData | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<Error | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 템플릿 정보 가져오기
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      setIsTemplateLoading(true);
      try {
        const result = await getTemplateByIdAction({ id: templateId });
        if (result?.data) {
          setSelectedTemplate(result.data as Template);
        } else {
          throw new Error(
            result?.serverError || '템플릿을 불러올 수 없습니다.'
          );
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        setTemplateError(
          error instanceof Error ? error : new Error('알 수 없는 오류')
        );
        toast.error('템플릿을 불러오는데 실패했습니다.');
      } finally {
        setIsTemplateLoading(false);
      }
    };

    loadTemplate();
  }, [templateId]);

  // 템플릿 ID가 없는 경우 템플릿 선택 페이지로 리다이렉트
  useEffect(() => {
    if (!templateId) {
      router.push('/templates');
    }
  }, [templateId, router]);

  const handleBack = () => {
    router.push('/templates');
  };

  // AIDEV-NOTE: camelCase에서 snake_case로 변환 (Safe Action 호환)
  const convertWeddingInfoToSnakeCase = (data: WeddingInfoFormData) => {
    return {
      title: `${data.groomName} ❤ ${data.brideName}의 결혼식`,
      groom_name: data.groomName,
      bride_name: data.brideName,
      wedding_date: data.weddingDate,
      wedding_time: data.weddingTime,
      venue_name: data.venueName,
      venue_address: data.venueAddress,
      template_id: templateId!,
      custom_message: data.customMessage || '',
      dress_code: data.dressCode || '',
      parking_info: data.parkingInfo || '',
      meal_info: data.mealInfo || '',
      special_notes: data.specialNotes || '',
      rsvp_enabled: data.rsvpEnabled,
      rsvp_deadline: data.rsvpDeadline || '',
      background_image_url: data.backgroundImageUrl || '',
    };
  };

  // 결혼식 정보 제출 핸들러
  const handleWeddingInfoSubmit = (data: WeddingInfoFormData) => {
    setWeddingInfo(data);
    setCurrentStep('editing');
    toast.success('결혼식 정보가 입력되었습니다. 이제 청첩장을 꾸며보세요!');
  };

  // 청첩장 저장 핸들러 
  const handleSave = async () => {
    if (!weddingInfo || !templateId) {
      toast.error('결혼식 정보가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const invitationData = convertWeddingInfoToSnakeCase(weddingInfo);
      const result = await createInvitationAction(invitationData);

      if (result?.data) {
        toast.success('청첩장이 성공적으로 생성되었습니다!');
        router.push(`/dashboard`);
      } else {
        throw new Error(result?.serverError || '청첩장 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to create invitation:', error);
      toast.error('청첩장 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 이전 단계로 돌아가기
  const handlePrevStep = () => {
    if (currentStep === 'editing') {
      setCurrentStep('wedding-info');
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (!templateId) {
    return null; // 리다이렉트 처리 중
  }

  if (templateError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="font-semibold">템플릿을 찾을 수 없습니다</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              요청하신 템플릿이 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={handleBack} variant="outline">
              템플릿 선택으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTemplateLoading || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-48"></div>
            <div className="h-4 bg-muted rounded mb-8 w-96"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={currentStep === 'wedding-info' ? handleBack : handlePrevStep}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 'wedding-info' ? '템플릿 선택' : '결혼식 정보'}
              </Button>
              <div className="border-l pl-4">
                <h1 className="font-semibold">청첩장 만들기</h1>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 'wedding-info' ? '1단계: 결혼식 정보 입력' : '2단계: 청첩장 편집'}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${currentStep === 'wedding-info' ? 'bg-blue-600' : 'bg-green-600'}`} />
                <span className={currentStep === 'wedding-info' ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                  결혼식 정보
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className={`w-2 h-2 rounded-full ${currentStep === 'editing' ? 'bg-blue-600' : 'bg-muted'}`} />
                <span className={currentStep === 'editing' ? 'text-blue-600 font-medium' : 'text-muted-foreground'}>
                  청첩장 편집
                </span>
              </div>

              {currentStep === 'editing' && (
                <div className="flex items-center gap-2 border-l pl-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePreview}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {isPreviewMode ? '편집' : '미리보기'}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave} 
                    className="gap-2"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? '저장 중...' : '청첩장 생성'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6">
        {currentStep === 'wedding-info' ? (
          // Step 1: Wedding Info Form
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">결혼식 정보 입력</CardTitle>
                <p className="text-muted-foreground">
                  청첩장에 표시될 결혼식 정보를 입력해주세요
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    선택한 템플릿: <strong>{selectedTemplate.name}</strong>
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <WeddingInfoForm
                  onSubmit={handleWeddingInfoSubmit}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Step 2: Block Editor
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Editor Area */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isPreviewMode ? '미리보기' : '편집기'}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {selectedTemplate.name}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlockBasedEditor
                    template={selectedTemplate}
                    weddingInfo={weddingInfo || undefined}
                    isPreviewMode={isPreviewMode}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결혼식 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weddingInfo && (
                    <>
                      <div>
                        <label className="text-sm font-medium">신랑신부</label>
                        <p className="text-sm text-muted-foreground">
                          {weddingInfo.groomName} ❤ {weddingInfo.brideName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">예식일시</label>
                        <p className="text-sm text-muted-foreground">
                          {weddingInfo.weddingDate} {weddingInfo.weddingTime}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">예식장</label>
                        <p className="text-sm text-muted-foreground">
                          {weddingInfo.venueName}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">도움말</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• 블록을 클릭하여 내용을 편집할 수 있습니다</p>
                  <p>• 블록 순서를 변경하려면 드래그하세요</p>
                  <p>• 새로운 블록을 추가하려면 + 버튼을 클릭하세요</p>
                  <p>• 미리보기로 최종 결과를 확인하세요</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CreateInvitationContent />
    </Suspense>
  );
}
