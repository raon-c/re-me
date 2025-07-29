'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlockBasedEditor } from '@/components/invitation/BlockBasedEditor';
import { WeddingInfoForm } from '@/components/wedding/WeddingInfoForm';
import { WeddingInfoRow } from '@/components/invitation/WeddingInfoRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTemplateByIdAction } from '@/actions/safe-template-actions';
import { ArrowLeft, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { Template } from '@/types';
import type { WeddingInfoFormData } from '@/lib/wedding-validations';

// AIDEV-NOTE: 청첩장 생성 페이지 - 2단계 청첩장 생성 플로우 (결혼식 정보 → 블록 편집)

type CreateStep = 'wedding-info' | 'editing';

function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentStep, setCurrentStep] = useState<CreateStep>('wedding-info');
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfoFormData | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // 템플릿 정보 가져오기
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) return;

      setIsTemplateLoading(true);
      setTemplateError(null);
      
      try {
        const result = await getTemplateByIdAction({ id: templateId });
        if (result?.data) {
          setSelectedTemplate(result.data as Template);
        } else {
          const errorMessage = result?.serverError || '템플릿을 불러올 수 없습니다.';
          setTemplateError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        setTemplateError(errorMessage);
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


  // 결혼식 정보 제출 핸들러
  const handleWeddingInfoSubmit = (data: WeddingInfoFormData) => {
    setWeddingInfo(data);
    setCurrentStep('editing');
    toast.success('결혼식 정보가 입력되었습니다. 이제 청첩장을 꾸며보세요!');
  };


  // 이전 단계로 돌아가기
  const handlePrevStep = () => {
    if (currentStep === 'editing') {
      setCurrentStep('wedding-info');
    }
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
                onClick={
                  currentStep === 'wedding-info' ? handleBack : handlePrevStep
                }
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 'wedding-info' ? '템플릿 선택' : '결혼식 정보'}
              </Button>
              <div className="border-l pl-4">
                <h1 className="font-semibold">청첩장 만들기</h1>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 'wedding-info'
                    ? '1단계: 결혼식 정보 입력'
                    : '2단계: 청첩장 편집'}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${currentStep === 'wedding-info' ? 'bg-blue-600' : 'bg-green-600'}`}
                />
                <span
                  className={
                    currentStep === 'wedding-info'
                      ? 'text-blue-600 font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  결혼식 정보
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div
                  className={`w-2 h-2 rounded-full ${currentStep === 'editing' ? 'bg-blue-600' : 'bg-muted'}`}
                />
                <span
                  className={
                    currentStep === 'editing'
                      ? 'text-blue-600 font-medium'
                      : 'text-muted-foreground'
                  }
                >
                  청첩장 편집
                </span>
              </div>

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
          <div className="space-y-6">
            {/* Wedding Info Row */}
            <WeddingInfoRow weddingInfo={weddingInfo} />

            {/* Editor Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>편집기</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {selectedTemplate.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BlockBasedEditor
                  template={selectedTemplate}
                  weddingInfo={weddingInfo || undefined}
                />
              </CardContent>
            </Card>
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
