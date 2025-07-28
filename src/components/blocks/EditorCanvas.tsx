'use client';

import { Block } from '@/types/blocks';
import { ContentBlock } from './ContentBlock';
import { ImageBlock } from './ImageBlock';
import { HeaderBlock } from './HeaderBlock';
import { LocationBlock } from './LocationBlock';
import { ContactBlock } from './ContactBlock';
import { RsvpBlock } from './RsvpBlock';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  blocks: Block[];
  viewMode: 'mobile' | 'desktop';
  isPreviewMode: boolean;
  onBlockUpdate: (blockId: string, updates: Partial<Block>) => void;
  onBlockEdit: (blockId: string) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockDuplicate: (blockId: string) => void;
  onBlockMove: (blockId: string, direction: 'up' | 'down') => void;
  onBlockSettings: (blockId: string) => void;
}

export function EditorCanvas({
  blocks,
  viewMode,
  isPreviewMode,
  onBlockUpdate,
  onBlockEdit,
  onBlockDelete,
  onBlockDuplicate,
  onBlockMove,
  onBlockSettings,
}: EditorCanvasProps) {
  const renderBlock = (block: Block) => {
    const commonProps = {
      key: block.id,
      block,
      isEditing: block.isEditing || false,
      isPreview: isPreviewMode,
      onUpdate: (updates: Partial<Block>) => onBlockUpdate(block.id, updates),
      onEdit: () => onBlockEdit(block.id),
      onDelete: () => onBlockDelete(block.id),
      onDuplicate: () => onBlockDuplicate(block.id),
      onMoveUp: () => onBlockMove(block.id, 'up'),
      onMoveDown: () => onBlockMove(block.id, 'down'),
      onSettings: () => onBlockSettings(block.id),
    };

    switch (block.type) {
      case 'content':
        return <ContentBlock {...commonProps} block={block as any} />;
      case 'image':
        return <ImageBlock {...commonProps} block={block as any} />;
      case 'header':
        return <HeaderBlock {...commonProps} block={block as any} />;
      case 'location':
        return <LocationBlock {...commonProps} block={block as any} />;
      case 'contact':
        return <ContactBlock {...commonProps} block={block as any} />;
      case 'rsvp':
        return <RsvpBlock {...commonProps} block={block as any} />;
      default:
        return null;
    }
  };

  const visibleBlocks = blocks
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden">
      <div className="h-full flex items-center justify-center p-4">
        {/* 캔버스 컨테이너 */}
        <div
          className={cn(
            'bg-white shadow-lg transition-all duration-300 overflow-y-auto scrollbar-hide',
            viewMode === 'mobile'
              ? 'w-full max-w-sm h-full max-h-[800px] rounded-lg'
              : 'w-full max-w-4xl h-full max-h-[900px] rounded-lg'
          )}
        >
          {/* 캔버스 헤더 */}
          {!isPreviewMode && (
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    viewMode === 'mobile' ? 'bg-blue-500' : 'bg-gray-400'
                  )} />
                  <span className="text-sm font-medium text-gray-700">
                    {viewMode === 'mobile' ? '모바일 뷰' : '데스크톱 뷰'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {visibleBlocks.length}개 블록
                </div>
              </div>
            </div>
          )}

          {/* 블록 렌더링 영역 */}
          <div className={cn(
            'min-h-full',
            isPreviewMode ? 'p-0' : 'p-4'
          )}>
            {visibleBlocks.length > 0 ? (
              <div className="space-y-4">
                {visibleBlocks.map(renderBlock)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  블록을 추가해보세요
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  왼쪽 사이드바에서 원하는 블록을 선택하여 청첩장을 만들어보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}