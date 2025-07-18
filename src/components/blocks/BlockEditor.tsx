'use client';

// AIDEV-NOTE: 블록 편집기 - 전체 블록 컬렉션 관리
import { useEffect } from 'react';
import { useBlocks } from '@/hooks/useBlocks';
import { renderBlock } from '@/components/blocks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Eye, EyeOff, Plus } from 'lucide-react';
import type { Block, BlockType } from '@/types/blocks';

interface BlockEditorProps {
  invitationId?: string;
  initialBlocks?: Block[];
  isPreviewMode?: boolean;
  onSave?: (blocks: Block[]) => Promise<void>;
  onPreviewToggle?: (isPreview: boolean) => void;
}

export function BlockEditor({
  invitationId,
  initialBlocks = [],
  isPreviewMode = false,
  onSave,
  onPreviewToggle,
}: BlockEditorProps) {
  const {
    blocks,
    addBlock,
    removeBlock,
    updateBlock,
    toggleEdit,
    duplicateBlock,
    moveBlockUp,
    moveBlockDown,
    loadBlocks,
    validateBlocks,
    isDirty,
  } = useBlocks(invitationId);

  // AIDEV-NOTE: 초기 블록 데이터 로드
  useEffect(() => {
    if (initialBlocks.length > 0) {
      loadBlocks(initialBlocks);
    }
  }, [initialBlocks, loadBlocks]);

  const handleSave = async () => {
    if (!validateBlocks()) {
      alert('일부 블록에 필수 정보가 누락되었습니다. 확인해 주세요.');
      return;
    }

    try {
      await onSave?.(blocks);
      alert('저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<Block>) => {
    updateBlock(blockId, updates);
  };

  const handleBlockEdit = (blockId: string) => {
    toggleEdit(blockId);
  };

  const handleBlockDelete = (blockId: string) => {
    if (confirm('이 블록을 삭제하시겠습니까?')) {
      removeBlock(blockId);
    }
  };

  const handleBlockDuplicate = (blockId: string) => {
    duplicateBlock(blockId);
  };

  const handleAddBlock = (blockType: BlockType) => {
    addBlock(blockType);
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* AIDEV-NOTE: 편집기 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">청첩장 편집기</CardTitle>
            <div className="flex gap-2">
              {/* AIDEV-NOTE: 미리보기 토글 */}
              <Button
                variant="outline"
                onClick={() => onPreviewToggle?.(!isPreviewMode)}
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    편집 모드
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    미리보기
                  </>
                )}
              </Button>

              {/* AIDEV-NOTE: 저장 버튼 */}
              <Button
                onClick={handleSave}
                disabled={!isDirty()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isPreviewMode && (
          <CardContent>
            <div className="text-sm text-gray-600">
              블록을 클릭하여 편집하거나, 하단의 버튼을 사용하여 새 블록을 추가하세요.
            </div>
          </CardContent>
        )}
      </Card>

      {/* AIDEV-NOTE: 청첩장 프리뷰 영역 - 세로 컬럼 레이아웃 */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm mx-auto">
          {/* AIDEV-NOTE: 모바일 청첩장 프레임 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
            <div className="h-full flex flex-col">
              {sortedBlocks.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  {sortedBlocks.map((block) => (
                    <div key={block.id} className="relative">
                      {renderBlock(block, {
                        isEditing: block.isEditing,
                        isPreview: isPreviewMode,
                        onUpdate: (updates: Partial<Block>) => handleBlockUpdate(block.id, updates),
                        onEdit: () => handleBlockEdit(block.id),
                        onDelete: () => handleBlockDelete(block.id),
                        onDuplicate: () => handleBlockDuplicate(block.id),
                        onMoveUp: () => moveBlockUp(block.id),
                        onMoveDown: () => moveBlockDown(block.id),
                        onSettings: () => {
                          // AIDEV-NOTE: 블록 설정 모달 열기 (추후 구현)
                          console.log('블록 설정:', block.id);
                        },
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center text-gray-400">
                    <Plus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <div className="text-lg font-medium">블록이 없습니다</div>
                    <div className="text-sm">
                      아래 버튼을 사용하여 첫 번째 블록을 추가하세요
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AIDEV-NOTE: 블록 추가 패널 */}
      {!isPreviewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">블록 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                onClick={() => handleAddBlock('header')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">👰</span>
                <span className="text-sm">헤더</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddBlock('content')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📝</span>
                <span className="text-sm">텍스트</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddBlock('image')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📷</span>
                <span className="text-sm">이미지</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddBlock('contact')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📞</span>
                <span className="text-sm">연락처</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddBlock('location')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">📍</span>
                <span className="text-sm">위치</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleAddBlock('rsvp')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <span className="text-2xl">✅</span>
                <span className="text-sm">RSVP</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AIDEV-NOTE: 편집기 상태 표시 */}
      {!isPreviewMode && (
        <div className="text-xs text-gray-500 text-center">
          총 {blocks.length}개 블록 | 
          {isDirty() ? ' 변경사항 있음' : ' 저장됨'}
        </div>
      )}
    </div>
  );
}