'use client';

// AIDEV-NOTE: 이 컴포넌트는 더 이상 사용되지 않음 - 블록 기반 에디터로 교체됨
// 레거시 코드로 유지하되 실제 사용은 BlockBasedEditor를 사용

import React from 'react';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  elements: EditorElement[];
  selectedElementId: string | null;
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onElementSelect: (id: string | null) => void;
  onAddElement: (
    type: EditorElement['type'],
    position: { x: number; y: number }
  ) => void;
  className?: string;
}

// AIDEV-NOTE: 레거시 컴포넌트 - 사용되지 않음

export function EditorCanvas({
  className,
}: Pick<EditorCanvasProps, 'className'>) {
  // AIDEV-NOTE: 레거시 캔버스 - 블록 기반 에디터로 교체됨
  return (
    <div className={cn('flex items-center justify-center h-64 bg-gray-100 border border-gray-300 rounded-lg', className)}>
      <div className="text-center text-gray-500">
        <p className="text-lg mb-2">⚠️ 레거시 캔버스</p>
        <p className="text-sm">블록 기반 에디터를 사용하세요</p>
      </div>
    </div>
  );
}
