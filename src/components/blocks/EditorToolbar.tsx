'use client';

import { Button } from '@/components/ui/button';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Monitor, 
  Layout,
  Undo,
  Redo,
  Download,
  Share2
} from 'lucide-react';

interface EditorToolbarProps {
  isSaving: boolean;
  isDirty: boolean;
  viewMode: 'mobile' | 'desktop';
  onViewModeChange: (mode: 'mobile' | 'desktop') => void;
  isPreviewMode: boolean;
  onPreviewToggle: (isPreview: boolean) => void;
  onSave: () => void;
}

export function EditorToolbar({
  isSaving,
  isDirty,
  viewMode,
  onViewModeChange,
  isPreviewMode,
  onPreviewToggle,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        {/* 좌측: 제목 및 상태 */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <div className="flex items-center space-x-2 min-w-0">
            <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">청첩장 편집기</h1>
          </div>
          
          {/* 자동저장 상태 */}
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-600">저장 중...</span>
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-600">변경사항 있음</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">저장됨</span>
              </>
            )}
          </div>
        </div>

        {/* 중앙: 뷰 모드 선택 (태블릿 이상에서만 표시) */}
        <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('mobile')}
            className="h-8 px-2 sm:px-3"
          >
            <Smartphone className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">모바일</span>
          </Button>
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('desktop')}
            className="h-8 px-2 sm:px-3"
          >
            <Monitor className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">데스크톱</span>
          </Button>
        </div>

        {/* 우측: 액션 버튼들 */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* 실행취소/재실행 (데스크톱에서만) */}
          <div className="hidden lg:flex items-center border rounded-md">
            <Button variant="ghost" size="sm" className="h-8 px-2 border-r">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* 미리보기 토글 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviewToggle(!isPreviewMode)}
            className="h-8 px-2 sm:px-3"
          >
            {isPreviewMode ? (
              <>
                <EyeOff className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">편집</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">미리보기</span>
              </>
            )}
          </Button>

          {/* 내보내기 (태블릿 이상에서만) */}
          <Button variant="outline" size="sm" className="hidden md:flex h-8 px-2 sm:px-3">
            <Download className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">내보내기</span>
          </Button>

          {/* 공유 (태블릿 이상에서만) */}
          <Button variant="outline" size="sm" className="hidden md:flex h-8 px-2 sm:px-3">
            <Share2 className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">공유</span>
          </Button>

          {/* 저장 버튼 */}
          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="h-8 bg-blue-600 hover:bg-blue-700 px-2 sm:px-3"
            size="sm"
          >
            <Save className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">저장</span>
          </Button>
        </div>
      </div>
    </div>
  );
}