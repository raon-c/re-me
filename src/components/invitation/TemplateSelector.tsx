'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { getTemplatesAction, getTemplateCategoriesAction } from '@/actions/safe-template-actions';
import { cn } from '@/lib/utils';
import type { TemplateCategory } from '@/types';
import type { Database } from '@/types/database';

type Template = Database['public']['Tables']['templates']['Row'];

// AIDEV-NOTE: Template selector with category filtering and responsive grid layout

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect?: (template: Template) => void;
  onCreateInvitation?: (template: Template) => void;
  className?: string;
}

const CATEGORY_FILTERS: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'classic', label: '클래식' },
  { value: 'modern', label: '모던' },
  { value: 'romantic', label: '로맨틱' },
  { value: 'minimal', label: '미니멀' },
];

export function TemplateSelector({
  selectedTemplateId,
  onTemplateSelect,
  onCreateInvitation,
  className,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | 'all'
  >('all');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Array<{ category: string; count: number; displayName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load templates and categories in parallel
        const [templatesResult, categoriesResult] = await Promise.all([
          getTemplatesAction({ limit: 100, offset: 0 }),
          getTemplateCategoriesAction({}),
        ]);

        if (templatesResult?.data) {
          setTemplates(templatesResult.data.templates || []);
        } else {
          throw new Error(templatesResult?.serverError || '템플릿을 불러오는데 실패했습니다.');
        }

        if (categoriesResult?.data) {
          setCategoryCounts(categoriesResult.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter templates by selected category
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return templates;
    }
    return templates.filter(
      (template) => template.category === selectedCategory
    );
  }, [templates, selectedCategory]);

  // Get count for each category
  const getCategoryCount = (category: TemplateCategory | 'all') => {
    if (category === 'all') {
      return templates.length;
    }
    const categoryData = categoryCounts.find((c) => c.category === category);
    return categoryData?.count || 0;
  };

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect?.(template);
  };

  const handleTemplatePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-destructive mb-2">
              {error}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">템플릿 선택</CardTitle>
          <p className="text-sm text-muted-foreground">
            마음에 드는 템플릿을 선택하여 청첩장을 만들어보세요.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => {
              const count = getCategoryCount(filter.value);
              const isActive = selectedCategory === filter.value;

              return (
                <Button
                  key={filter.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(filter.value)}
                  className={cn(
                    'transition-all duration-200',
                    isActive && 'shadow-md'
                  )}
                  disabled={count === 0}
                >
                  {filter.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                        isActive
                          ? 'bg-primary-foreground text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Templates Grid */}
          {!isLoading && filteredTemplates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={handleTemplateSelect}
                  onPreview={handleTemplatePreview}
                  onCreateInvitation={onCreateInvitation}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedCategory === 'all'
                  ? '템플릿이 없습니다'
                  : `${CATEGORY_FILTERS.find((f) => f.value === selectedCategory)?.label} 템플릿이 없습니다`}
              </h3>
              <p className="text-muted-foreground mb-4">
                다른 카테고리를 선택해보세요.
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory('all')}
              >
                전체 템플릿 보기
              </Button>
            </div>
          )}

          {/* Selected Template Info */}
          {selectedTemplateId && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">선택된 템플릿</h4>
                  <p className="text-sm text-muted-foreground">
                    {templates.find((t) => t.id === selectedTemplateId)?.name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const template = templates.find(
                      (t) => t.id === selectedTemplateId
                    );
                    if (template) {
                      handleTemplatePreview(template);
                    }
                  }}
                >
                  미리보기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={closePreview}
          onSelect={() => {
            handleTemplateSelect(previewTemplate);
            closePreview();
          }}
          isSelected={selectedTemplateId === previewTemplate.id}
        />
      )}
    </>
  );
}
