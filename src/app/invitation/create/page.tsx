'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlockBasedEditor } from '@/components/invitation/BlockBasedEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTemplateByIdAction } from '@/actions/safe-template-actions';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Template } from '@/types';

// AIDEV-NOTE: 청첩장 생성 페이지 - 템플릿 기반 블록 에디터 사용

function CreateInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<Error | null>(null);

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

  const handleSave = () => {
    // TODO: 청첩장 저장 로직 구현
    console.log('청첩장 저장');
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
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                돌아가기
              </Button>
              <div className="border-l pl-4">
                <h1 className="font-semibold">청첩장 만들기</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.name} 템플릿
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {isPreviewMode ? '편집' : '미리보기'}
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6">
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
                  isPreviewMode={isPreviewMode}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">템플릿 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">템플릿 이름</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">카테고리</label>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(selectedTemplate.category)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">스타일</label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {selectedTemplate.cssStyles &&
                      typeof selectedTemplate.cssStyles === 'object' && (
                        <>
                          {(selectedTemplate.cssStyles as any).primaryColor && (
                            <div className="flex items-center gap-2">
                              <span>주 색상:</span>
                              <div
                                className="w-4 h-4 rounded border"
                                style={{
                                  backgroundColor: (
                                    selectedTemplate.cssStyles as any
                                  ).primaryColor,
                                }}
                              />
                              <span className="text-xs">
                                {
                                  (selectedTemplate.cssStyles as any)
                                    .primaryColor
                                }
                              </span>
                            </div>
                          )}
                          {(selectedTemplate.cssStyles as any).fontFamily && (
                            <div>
                              폰트:{' '}
                              {(selectedTemplate.cssStyles as any).fontFamily}
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </div>
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
      </div>
    </div>
  );
}

/**
 * Get category label in Korean
 */
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'classic':
      return '클래식';
    case 'modern':
      return '모던';
    case 'romantic':
      return '로맨틱';
    case 'minimal':
      return '미니멀';
    default:
      return '기타';
  }
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
