'use client';

import { Block } from '@/types/blocks';
import { 
  Eye, 
  EyeOff, 
  Smartphone, 
  Monitor,
  Save,
  Clock
} from 'lucide-react';

interface EditorStatusBarProps {
  blocks: Block[];
  viewMode: 'mobile' | 'desktop';
  isPreviewMode: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved?: Date;
}

export function EditorStatusBar({
  blocks,
  viewMode,
  isPreviewMode,
  isSaving,
  isDirty,
  lastSaved,
}: EditorStatusBarProps) {
  const visibleBlocks = blocks.filter(block => block.isVisible);
  const totalBlocks = blocks.length;

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return '방금 전';
    } else if (minutes < 60) {
      return `${minutes}분 전`;
    } else {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between text-sm">
        {/* 좌측: 블록 정보 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <span>블록:</span>
            <span className="font-medium">
              {visibleBlocks.length}/{totalBlocks}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-600">
            {viewMode === 'mobile' ? (
              <>
                <Smartphone className="w-3 h-3" />
                <span>모바일</span>
              </>
            ) : (
              <>
                <Monitor className="w-3 h-3" />
                <span>데스크톱</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 text-gray-600">
            {isPreviewMode ? (
              <>
                <Eye className="w-3 h-3" />
                <span>미리보기</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>편집 모드</span>
              </>
            )}
          </div>
        </div>

        {/* 우측: 저장 상태 */}
        <div className="flex items-center space-x-4">
          {/* 마지막 저장 시간 */}
          {lastSaved && (
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                마지막 저장: {formatLastSaved(lastSaved)}
              </span>
            </div>
          )}

          {/* 저장 상태 */}
          <div className="flex items-center space-x-1">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-600 text-xs">저장 중...</span>
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-600 text-xs">변경사항 있음</span>
              </>
            ) : (
              <>
                <Save className="w-3 h-3 text-green-600" />
                <span className="text-green-600 text-xs">저장됨</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}