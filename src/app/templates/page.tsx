'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateSelector } from '@/components/invitation/TemplateSelector';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';

type Template = Database['public']['Tables']['templates']['Row'];
import '@/styles/templates.css';

// AIDEV-NOTE: Template selection page with navigation to editor

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    console.log('Selected template:', template);
  };

  const handleCreateInvitation = (template?: Template) => {
    const targetTemplate = template || selectedTemplate;
    if (targetTemplate) {
      router.push(`/invitation/create?template=${targetTemplate.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">템플릿 선택</h1>
          <p className="text-muted-foreground">
            청첩장 템플릿을 선택하여 나만의 청첩장을 만들어보세요.
          </p>
        </div>

        <TemplateSelector
          selectedTemplateId={selectedTemplate?.id}
          onTemplateSelect={handleTemplateSelect}
          onCreateInvitation={handleCreateInvitation}
        />

        {selectedTemplate && (
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">선택된 템플릿</h2>
              <Button 
                onClick={() => handleCreateInvitation()}
                className="gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                이 템플릿으로 만들기
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">기본 정보</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>이름:</strong> {selectedTemplate.name}
                  </li>
                  <li>
                    <strong>카테고리:</strong> {getCategoryLabel(selectedTemplate.category)}
                  </li>
                  <li>
                    <strong>ID:</strong> {selectedTemplate.id}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">스타일 정보</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>주 색상:</strong>{' '}
                    {(
                      selectedTemplate.cssStyles as Record<
                        string,
                        string
                      > | null
                    )?.primaryColor || 'N/A'}
                  </li>
                  <li>
                    <strong>보조 색상:</strong>{' '}
                    {(
                      selectedTemplate.cssStyles as Record<
                        string,
                        string
                      > | null
                    )?.accentColor || 'N/A'}
                  </li>
                  <li>
                    <strong>폰트:</strong>{' '}
                    {(
                      selectedTemplate.cssStyles as Record<
                        string,
                        string
                      > | null
                    )?.fontFamily || 'N/A'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
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
