'use client';

import React, { useState } from 'react';
import { TemplateSelector } from '@/components/invitation/TemplateSelector';
import type { Template } from '@/types';
import '@/styles/templates.css';

// AIDEV-NOTE: Template selection test page for development

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    console.log('Selected template:', template);
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
        />

        {selectedTemplate && (
          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">선택된 템플릿</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">기본 정보</h3>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>이름:</strong> {selectedTemplate.name}
                  </li>
                  <li>
                    <strong>카테고리:</strong> {selectedTemplate.category}
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
                    {(selectedTemplate.cssStyles as Record<string, string> | null)?.primaryColor || 'N/A'}
                  </li>
                  <li>
                    <strong>보조 색상:</strong>{' '}
                    {(selectedTemplate.cssStyles as Record<string, string> | null)?.secondaryColor || 'N/A'}
                  </li>
                  <li>
                    <strong>폰트:</strong>{' '}
                    {(selectedTemplate.cssStyles as Record<string, string> | null)?.fontFamily || 'N/A'}
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
