'use client';

// AIDEV-NOTE: 블록 편집기 - 전체 블록 컬렉션 관리 (리팩토링된 모던 디자인)
import { useEffect, useState } from 'react';
import { useBlocks } from '@/hooks/useBlocks';
import { EditorToolbar } from './EditorToolbar';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { EditorStatusBar } from './EditorStatusBar';
import { toast } from 'sonner';
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
  // AIDEV-NOTE: 편집기 상태 관리
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();

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
      toast.error('일부 블록에 필수 정보가 누락되었습니다. 확인해 주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(blocks);
      setLastSaved(new Date());
      toast.success('청첩장이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<Block>) => {
    updateBlock(blockId, updates);
  };

  const handleBlockEdit = (blockId: string) => {
    toggleEdit(blockId);
  };

  const handleBlockDelete = (blockId: string) => {
    removeBlock(blockId);
    toast.success('블록이 삭제되었습니다.');
  };

  const handleBlockDuplicate = (blockId: string) => {
    duplicateBlock(blockId);
  };

  const handleAddBlock = (blockType: string) => {
    addBlock(blockType as BlockType);
    toast.success(`블록이 추가되었습니다.`);
  };

  const handleBlockMove = (blockId: string, direction: 'up' | 'down') => {
    if (direction === 'up') {
      moveBlockUp(blockId);
    } else {
      moveBlockDown(blockId);
    }
  };

  const handleBlockSettings = (blockId: string) => {
    console.log('블록 설정:', blockId);
  };

  const handleBlockToggleVisibility = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      updateBlock(blockId, { isVisible: !block.isVisible });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 상단 툴바 */}
      <EditorToolbar
        isSaving={isSaving}
        isDirty={isDirty()}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isPreviewMode={isPreviewMode}
        onPreviewToggle={(isPreview) => onPreviewToggle?.(isPreview)}
        onSave={handleSave}
      />

      {/* 메인 편집 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        {!isPreviewMode && (
          <EditorSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            blocks={blocks}
            onAddBlock={handleAddBlock}
            onBlockEdit={handleBlockEdit}
            onBlockToggleVisibility={handleBlockToggleVisibility}
          />
        )}

        {/* 중앙 캔버스 */}
        <EditorCanvas
          blocks={blocks}
          viewMode={viewMode}
          isPreviewMode={isPreviewMode}
          onBlockUpdate={handleBlockUpdate}
          onBlockEdit={handleBlockEdit}
          onBlockDelete={handleBlockDelete}
          onBlockDuplicate={handleBlockDuplicate}
          onBlockMove={handleBlockMove}
          onBlockSettings={handleBlockSettings}
        />
      </div>

      {/* 하단 상태바 */}
      <EditorStatusBar
        blocks={blocks}
        viewMode={viewMode}
        isPreviewMode={isPreviewMode}
        isSaving={isSaving}
        isDirty={isDirty()}
        lastSaved={lastSaved}
      />
    </div>
  );
}