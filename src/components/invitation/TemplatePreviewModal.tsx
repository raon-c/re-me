'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getTemplateByIdAction } from '@/actions/safe-template-actions';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database';

type Template = Database['public']['Tables']['templates']['Row'];

// AIDEV-NOTE: Template preview modal with Korean UX and responsive design

interface TemplatePreviewModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onSelect,
  isSelected = false,
}: TemplatePreviewModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [previewData, setPreviewData] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch template preview data when modal opens
  useEffect(() => {
    if (isOpen && template?.id) {
      setIsLoading(true);
      getTemplateByIdAction({ id: template.id })
        .then((result) => {
          if (result?.data) {
            setPreviewData(result.data);
          } else {
            console.error('Failed to load template:', result?.serverError);
          }
        })
        .catch((error) => {
          console.error('Template preview error:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, template?.id]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [handleClose, isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSelect = () => {
    onSelect?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm',
        'transition-opacity duration-200',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'relative w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-xl',
          'transition-all duration-200',
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(template.category)} 템플릿
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onSelect && (
              <Button
                onClick={handleSelect}
                variant={isSelected ? 'default' : 'outline'}
                disabled={isSelected}
              >
                {isSelected ? '선택됨' : '이 템플릿 선택'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-semibold">미리보기</h3>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : previewData ? (
                <div className="border rounded-lg p-4 bg-white">
                  <div
                    className="template-preview"
                    style={{
                      fontFamily:
                        (previewData.css_styles as Record<string, string> | null)?.fontFamily || 'inherit',
                      backgroundColor:
                        (previewData.css_styles as Record<string, string> | null)?.backgroundColor ||
                        '#ffffff',
                      color:
                        (previewData.css_styles as Record<string, string> | null)?.primaryColor ||
                        '#000000',
                      minHeight: '400px',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: previewData.html_structure || '',
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  미리보기를 불러올 수 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">템플릿 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">이름:</span>
                    <span>{template.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">카테고리:</span>
                    <span>{getCategoryLabel(template.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">생성일:</span>
                    <span>
                      {new Date(template.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">스타일 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">주 색상:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor:
                            (template.css_styles as Record<string, string> | null)?.primaryColor ||
                            '#000000',
                        }}
                      />
                      <span className="font-mono text-xs">
                        {(template.css_styles as Record<string, string> | null)?.primaryColor || '#000000'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">보조 색상:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor:
                            (template.css_styles as Record<string, string> | null)?.secondaryColor || '#ffffff',
                        }}
                      />
                      <span className="font-mono text-xs">
                        {(template.css_styles as Record<string, string> | null)?.secondaryColor || '#ffffff'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">폰트:</span>
                    <span className="capitalize">
                      {(template.css_styles as Record<string, string> | null)?.fontFamily || 'default'}
                    </span>
                  </div>
                </div>
              </div>

              {previewData && (
                <div>
                  <h3 className="font-semibold mb-3">샘플 데이터</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신랑:</span>
                      <span>김민수</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신부:</span>
                      <span>이지은</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">날짜:</span>
                      <span>2024-10-15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">시간:</span>
                      <span>14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">장소:</span>
                      <span>롯데호텔 서울 크리스탈볼룸</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get category label in Korean
 */
function getCategoryLabel(category: Template['category']): string {
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
