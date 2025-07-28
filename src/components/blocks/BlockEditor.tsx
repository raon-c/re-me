'use client';

// AIDEV-NOTE: 블록 편집기 - 전체 블록 컬렉션 관리 (모던 디자인)
import { useEffect, useState } from 'react';
import { useBlocks } from '@/hooks/useBlocks';
import { renderBlock } from '@/components/blocks';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Plus, 
  Smartphone, 
  Monitor, 
  Settings, 
  Layout,
  Layers,
  Palette,
  Undo,
  Redo,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'blocks' | 'design' | 'settings'>('blocks');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddBlock = (blockType: BlockType) => {
    addBlock(blockType);
    toast.success(`${getBlockTypeLabel(blockType)} 블록이 추가되었습니다.`);
  };

  // AIDEV-NOTE: 블록 타입별 한글 라벨
  const getBlockTypeLabel = (type: BlockType): string => {
    const labels: Record<BlockType, string> = {
      header: '헤더',
      content: '텍스트',
      image: '이미지',
      contact: '연락처',
      location: '위치',
      rsvp: 'RSVP'
    };
    return labels[type] || type;
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* AIDEV-NOTE: 현대적인 상단 툴바 */}
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
              ) : isDirty() ? (
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
              onClick={() => setViewMode('mobile')}
              className="h-8 px-2 sm:px-3"
            >
              <Smartphone className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">모바일</span>
            </Button>
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('desktop')}
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
              onClick={() => onPreviewToggle?.(!isPreviewMode)}
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
              onClick={handleSave}
              disabled={!isDirty() || isSaving}
              className="h-8 bg-blue-600 hover:bg-blue-700 px-2 sm:px-3"
              size="sm"
            >
              <Save className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">저장</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AIDEV-NOTE: 메인 편집 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 사이드바 */}
        {!isPreviewMode && (
          <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 ${
            sidebarCollapsed ? 'w-12 sm:w-16' : 'w-64 sm:w-72 lg:w-80'
          }`}>
            {/* 사이드바 헤더 */}
            <div className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200">
              {!sidebarCollapsed && (
                <div className="flex space-x-1 overflow-hidden">
                  <Button
                    variant={activeTab === 'blocks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('blocks')}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">블록</span>
                  </Button>
                  <Button
                    variant={activeTab === 'design' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('design')}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <Palette className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">디자인</span>
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('settings')}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">설정</span>
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 sm:p-2"
              >
                {sidebarCollapsed ? <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
            </div>

            {/* 사이드바 컨텐츠 */}
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-y-auto p-2 sm:p-4">
                {activeTab === 'blocks' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">블록 추가</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: 'header' as BlockType, icon: '👰', label: '헤더' },
                          { type: 'content' as BlockType, icon: '📝', label: '텍스트' },
                          { type: 'image' as BlockType, icon: '📷', label: '이미지' },
                          { type: 'contact' as BlockType, icon: '📞', label: '연락처' },
                          { type: 'location' as BlockType, icon: '📍', label: '위치' },
                          { type: 'rsvp' as BlockType, icon: '✅', label: 'RSVP' },
                        ].map(({ type, icon, label }) => (
                          <Button
                            key={type}
                            variant="outline"
                            onClick={() => handleAddBlock(type)}
                            className="h-20 flex flex-col items-center justify-center gap-1 hover:bg-gray-50"
                          >
                            <span className="text-xl">{icon}</span>
                            <span className="text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* 블록 리스트 */}
                    {blocks.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          블록 목록 ({blocks.length}개)
                        </h3>
                        <div className="space-y-2">
                          {sortedBlocks.map((block, index) => (
                            <div
                              key={block.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">
                                  {block.type === 'header' && '👰'}
                                  {block.type === 'content' && '📝'}
                                  {block.type === 'image' && '📷'}
                                  {block.type === 'contact' && '📞'}
                                  {block.type === 'location' && '📍'}
                                  {block.type === 'rsvp' && '✅'}
                                </span>
                                <div>
                                  <div className="text-sm font-medium">
                                    {getBlockTypeLabel(block.type)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    순서: {index + 1}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBlockEdit(block.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">테마 설정</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {['클래식', '모던', '로맨틱'].map((theme) => (
                          <div
                            key={theme}
                            className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-colors"
                          >
                            {theme}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">편집기 설정</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>자동 저장: 활성화</div>
                        <div>총 블록: {blocks.length}개</div>
                        <div>변경사항: {isDirty() ? '있음' : '없음'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 중앙 편집 영역 */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden min-w-0">
          <div className={`transition-all duration-300 ${
            viewMode === 'mobile' 
              ? 'w-full max-w-xs sm:max-w-sm' 
              : 'w-full max-w-2xl xl:max-w-4xl'
          } flex flex-col items-center`}>
            {/* 청첩장 프리뷰 프레임 */}
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 ${
              viewMode === 'mobile' 
                ? 'w-full mx-auto' 
                : 'w-full'
            }`} style={{
              aspectRatio: viewMode === 'mobile' ? '9/16' : '16/9',
              maxHeight: viewMode === 'mobile' ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)'
            }}>
              <div className="h-full flex flex-col">
                {sortedBlocks.length > 0 ? (
                  <div className="flex-1 overflow-y-auto">
                    {sortedBlocks.map((block) => (
                      <div key={block.id} className="relative group">
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
                            console.log('블록 설정:', block.id);
                          },
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="text-center text-gray-400 max-w-xs">
                      <Plus className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-300" />
                      <div className="text-lg sm:text-xl font-medium mb-2">첫 번째 블록을 추가하세요</div>
                      <div className="text-xs sm:text-sm mb-4 sm:mb-6 px-2">
                        {isPreviewMode ? '편집 모드로 전환하여 블록을 추가하세요' : '왼쪽 사이드바에서 블록을 선택하여 청첩장 제작을 시작하세요'}
                      </div>
                      {!isPreviewMode && (
                        <Button
                          onClick={() => handleAddBlock('header')}
                          className="bg-blue-600 hover:bg-blue-700 text-sm"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          헤더 블록 추가
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 상태바 */}
            {!isPreviewMode && (
              <div className="mt-4 text-center w-full">
                <div className="inline-flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500 bg-white px-3 sm:px-4 py-2 rounded-full shadow-sm border border-gray-200 max-w-full">
                  <span className="truncate">총 {blocks.length}개 블록</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline truncate">{viewMode === 'mobile' ? '모바일' : '데스크톱'} 뷰</span>
                  <span className="hidden sm:inline">•</span>
                  <span className={`truncate ${isDirty() ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isDirty() ? '변경사항 있음' : '저장됨'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}