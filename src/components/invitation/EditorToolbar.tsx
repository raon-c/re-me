'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Type,
  Image,
  Minus,
  Undo,
  Redo,
  Save,
  Eye,
  Download,
} from 'lucide-react';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onAddElement: (type: EditorElement['type']) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isSaving?: boolean;
  className?: string;
}

export function EditorToolbar({
  onAddElement,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onExport,
  canUndo,
  canRedo,
  isDirty,
  isSaving = false,
  className,
}: EditorToolbarProps) {
  // AIDEV-NOTE: Editor toolbar with element addition and history controls
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200',
        className
      )}
    >
      {/* Element Tools */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddElement('text')}
          className="h-8"
        >
          <Type className="h-4 w-4 mr-1" />
          텍스트
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddElement('image')}
          className="h-8"
        >
          <Image className="h-4 w-4 mr-1" />
          이미지
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddElement('divider')}
          className="h-8"
        >
          <Minus className="h-4 w-4 mr-1" />
          구분선
        </Button>
      </div>

      {/* History Tools */}
      <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Tools */}
      <div className="flex gap-1 ml-auto">
        <Button variant="outline" size="sm" onClick={onPreview} className="h-8">
          <Eye className="h-4 w-4 mr-1" />
          미리보기
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="h-8"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? '저장 중...' : '저장'}
        </Button>

        <Button variant="outline" size="sm" onClick={onExport} className="h-8">
          <Download className="h-4 w-4 mr-1" />
          내보내기
        </Button>
      </div>
    </div>
  );
}
