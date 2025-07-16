'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Template } from '@/types';

// AIDEV-NOTE: Template card component with Korean UX and mobile-responsive design

interface TemplateCardProps {
  template: Template;
  isSelected?: boolean;
  onSelect?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  className?: string;
}

export function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onPreview,
  className,
}: TemplateCardProps) {
  const handleSelect = () => {
    onSelect?.(template);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template);
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onClick={handleSelect}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <Image
            src={template.previewImageUrl}
            alt={`${template.name} 템플릿 미리보기`}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback to placeholder image if preview image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/templates/placeholder-preview.jpg';
            }}
          />

          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full text-white',
                getCategoryColor(template.category)
              )}
            >
              {getCategoryLabel(template.category)}
            </span>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 p-4">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
          {template.name}
        </h3>

        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="text-xs"
          >
            미리보기
          </Button>

          <Button
            variant={isSelected ? 'default' : 'ghost'}
            size="sm"
            onClick={handleSelect}
            className="text-xs"
          >
            {isSelected ? '선택됨' : '선택'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Get category color for badge
 */
function getCategoryColor(category: Template['category']): string {
  switch (category) {
    case 'classic':
      return 'bg-amber-600';
    case 'modern':
      return 'bg-blue-600';
    case 'romantic':
      return 'bg-pink-600';
    case 'minimal':
      return 'bg-gray-600';
    default:
      return 'bg-gray-600';
  }
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
