'use client';

// AIDEV-NOTE: 헤더 블록 - 신랑신부 이름과 결혼 날짜 표시
import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import type { HeaderBlock as HeaderBlockType } from '@/types/blocks';

interface HeaderBlockProps {
  block: HeaderBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<HeaderBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function HeaderBlock({
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
}: HeaderBlockProps) {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? '오후' : '오전';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${ampm} ${displayHour}:${minutes}`;
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
      className="text-center"
    >
      {isEditing ? (
        <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            헤더 블록 편집
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                신랑 이름
              </label>
              <Input
                value={localData.groomName}
                onChange={(e) => setLocalData(prev => ({ ...prev, groomName: e.target.value }))}
                placeholder="신랑 이름"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                신부 이름
              </label>
              <Input
                value={localData.brideName}
                onChange={(e) => setLocalData(prev => ({ ...prev, brideName: e.target.value }))}
                placeholder="신부 이름"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              부제목
            </label>
            <Input
              value={localData.subtitle || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="결혼합니다"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                결혼 날짜
              </label>
              <Input
                type="date"
                value={localData.weddingDate}
                onChange={(e) => setLocalData(prev => ({ ...prev, weddingDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                결혼 시간
              </label>
              <Input
                type="time"
                value={localData.weddingTime}
                onChange={(e) => setLocalData(prev => ({ ...prev, weddingTime: e.target.value }))}
              />
            </div>
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
        <div className="space-y-4">
          {/* AIDEV-NOTE: 신랑신부 이름 표시 */}
          <div className="text-2xl font-bold text-gray-800">
            {block.data.groomName && block.data.brideName ? (
              <>
                <span>{block.data.groomName}</span>
                <span className="mx-2">♥</span>
                <span>{block.data.brideName}</span>
              </>
            ) : (
              <span className="text-gray-400">신랑 ♥ 신부</span>
            )}
          </div>

          {/* AIDEV-NOTE: 부제목 표시 */}
          {block.data.subtitle && (
            <div className="text-lg text-gray-600">
              {block.data.subtitle}
            </div>
          )}

          {/* AIDEV-NOTE: 결혼 날짜 및 시간 표시 */}
          <div className="space-y-2">
            {block.data.weddingDate && (
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(block.data.weddingDate)}</span>
              </div>
            )}
            {block.data.weddingTime && (
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>{formatTime(block.data.weddingTime)}</span>
              </div>
            )}
          </div>

          {/* AIDEV-NOTE: 빈 상태 표시 */}
          {!block.data.groomName && !block.data.brideName && !block.data.weddingDate && (
            <div className="text-gray-400 text-sm">
              헤더 블록을 편집하여 내용을 추가하세요
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}