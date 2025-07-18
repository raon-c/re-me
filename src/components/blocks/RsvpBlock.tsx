'use client';

// AIDEV-NOTE: RSVP 블록 - 참석 확인 기능
import { useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Calendar, Users } from 'lucide-react';
import type { RsvpBlock as RsvpBlockType } from '@/types/blocks';

interface RsvpBlockProps {
  block: RsvpBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<RsvpBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function RsvpBlock({
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
}: RsvpBlockProps) {
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
    });
  };

  const handleRsvpClick = () => {
    // AIDEV-NOTE: RSVP 페이지로 이동하거나 모달 열기
    // 실제 구현 시에는 청첩장 ID와 함께 RSVP 페이지로 이동
    alert('RSVP 페이지로 이동합니다.');
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
            RSVP 블록 편집
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                RSVP 기능 활성화
              </label>
              <div className="text-xs text-gray-500">
                하객들이 참석 의사를 전달할 수 있습니다
              </div>
            </div>
            <Switch
              checked={localData.isEnabled}
              onCheckedChange={(checked) => setLocalData(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          {localData.isEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <Input
                  value={localData.title || ''}
                  onChange={(e) => setLocalData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="참석 의사 전달"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <Textarea
                  value={localData.description || ''}
                  onChange={(e) => setLocalData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="참석 여부를 알려주세요"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  응답 마감일 (선택사항)
                </label>
                <Input
                  type="date"
                  value={localData.dueDate || ''}
                  onChange={(e) => setLocalData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <div className="text-xs text-gray-500 mt-1">
                  마감일을 설정하면 하객들에게 안내됩니다
                </div>
              </div>
            </>
          )}

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
          {/* AIDEV-NOTE: RSVP 활성화 상태에 따른 표시 */}
          {block.data.isEnabled ? (
            <div className="text-center space-y-4">
              {/* AIDEV-NOTE: 제목 표시 */}
              <h3 className="text-lg font-semibold text-gray-800">
                {block.data.title || '참석 의사 전달'}
              </h3>

              {/* AIDEV-NOTE: 설명 표시 */}
              {block.data.description && (
                <p className="text-gray-600">
                  {block.data.description}
                </p>
              )}

              {/* AIDEV-NOTE: 마감일 표시 */}
              {block.data.dueDate && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>응답 마감: {formatDate(block.data.dueDate)}</span>
                </div>
              )}

              {/* AIDEV-NOTE: RSVP 버튼 */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-pink-600" />
                  <span className="text-pink-800 font-medium">
                    참석 여부를 알려주세요
                  </span>
                </div>
                
                <Button 
                  onClick={handleRsvpClick}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  참석 의사 전달하기
                </Button>
                
                <div className="text-xs text-pink-600 mt-2">
                  클릭하여 참석 여부와 축하 메시지를 전달해 주세요
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">
                RSVP 기능이 비활성화되어 있습니다
              </div>
              <div className="text-xs text-gray-400">
                편집하여 참석 확인 기능을 활성화하세요
              </div>
            </div>
          )}

          {/* AIDEV-NOTE: 빈 상태 표시 (편집 모드가 아닐 때만) */}
          {!block.data.title && !block.data.description && !block.data.isEnabled && (
            <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <div>RSVP 블록을 편집하여 참석 확인 기능을 설정하세요</div>
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}