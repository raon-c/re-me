'use client';

// AIDEV-NOTE: 컨텐트 블록 - 자유 텍스트 입력 및 표시
import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ContentBlock as ContentBlockType } from '@/types/blocks';

interface ContentBlockProps {
  block: ContentBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<ContentBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function ContentBlock({
  block,
  isEditing = false,
  isPreview = false,
  onUpdate,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSettings,
}: ContentBlockProps) {
  // AIDEV-NOTE: Hook은 항상 동일한 순서로 호출되어야 함
  const [localData, setLocalData] = useState(block.data);

  const handleSave = () => {
    onUpdate?.({
      ...block,
      data: localData,
      isEditing: false,
    });
  };

  const handleCancel = () => {
    setLocalData(block.data);
    onUpdate?.({
      ...block,
      isEditing: false,
    });
  };

  // AIDEV-NOTE: 줄바꿈을 <br> 태그로 변환
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <BaseBlock
      block={block}
      isEditing={isEditing}
      isPreview={isPreview}
      onEdit={onEdit}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onSettings={onSettings}
    >
      {isEditing ? (
        <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            텍스트 블록 편집
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 (선택사항)
            </label>
            <Input
              value={localData.title || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <Textarea
              value={localData.content}
              onChange={(e) => setLocalData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="내용을 입력하세요"
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {localData.content.length} / 1000자
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`rich-text-${block.id}`}
              checked={localData.isRichText || false}
              onCheckedChange={(checked) => 
                setLocalData(prev => ({ ...prev, isRichText: checked as boolean }))
              }
            />
            <label 
              htmlFor={`rich-text-${block.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              서식 적용 (굵게, 기울임 등)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* AIDEV-NOTE: 제목 표시 */}
          {block.data.title && (
            <h3 className="text-lg font-semibold text-gray-800">
              {block.data.title}
            </h3>
          )}

          {/* AIDEV-NOTE: 내용 표시 */}
          {block.data.content ? (
            <div 
              className={`text-gray-700 leading-relaxed ${
                block.data.isRichText ? 'whitespace-pre-wrap' : ''
              }`}
            >
              {block.data.isRichText ? (
                // AIDEV-NOTE: 리치 텍스트 모드일 때는 HTML 렌더링 (실제로는 마크다운 파서 등 사용)
                <div dangerouslySetInnerHTML={{ __html: block.data.content }} />
              ) : (
                formatContent(block.data.content)
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              텍스트 블록을 편집하여 내용을 추가하세요
            </div>
          )}

          {/* AIDEV-NOTE: 빈 상태 메시지 */}
          {!block.data.content && !block.data.title && (
            <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              클릭하여 텍스트를 추가하세요
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}