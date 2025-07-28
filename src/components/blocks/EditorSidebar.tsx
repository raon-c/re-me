'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Type,
  Image,
  MapPin,
  Phone,
  Calendar,
  Palette,
  Settings,
  Layers,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { Block } from '@/types/blocks';

interface EditorSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  blocks: Block[];
  onAddBlock: (type: string) => void;
  onBlockEdit: (blockId: string) => void;
  onBlockToggleVisibility: (blockId: string) => void;
}

type TabType = 'blocks' | 'design' | 'settings';

const blockTypes = [
  { type: 'content', label: '텍스트', icon: Type, description: '제목, 본문 등의 텍스트 블록' },
  { type: 'image', label: '이미지', icon: Image, description: '사진이나 그래픽 이미지' },
  { type: 'location', label: '위치', icon: MapPin, description: '예식장 위치 정보' },
  { type: 'contact', label: '연락처', icon: Phone, description: '신랑신부 연락처' },
  { type: 'rsvp', label: 'RSVP', icon: Calendar, description: '참석 의사 확인' },
];

export function EditorSidebar({
  collapsed,
  onToggleCollapse,
  blocks,
  onAddBlock,
  onBlockEdit,
  onBlockToggleVisibility,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('blocks');

  const tabs = [
    { id: 'blocks' as TabType, label: '블록', icon: Layers },
    { id: 'design' as TabType, label: '디자인', icon: Palette },
    { id: 'settings' as TabType, label: '설정', icon: Settings },
  ];

  if (collapsed) {
    return (
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-12 w-12 p-0 border-b border-gray-200"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col space-y-1 p-1 mt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="h-10 w-10 p-0"
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">편집 패널</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 h-10 rounded-none border-r border-gray-200 last:border-r-0"
            >
              <Icon className="w-4 h-4 mr-1" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* 탭 컨텐츠 */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {activeTab === 'blocks' && (
            <div className="space-y-4">
              {/* 블록 추가 섹션 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">블록 추가</h3>
                <div className="grid grid-cols-1 gap-2">
                  {blockTypes.map((blockType) => {
                    const Icon = blockType.icon;
                    return (
                      <Button
                        key={blockType.type}
                        variant="outline"
                        size="sm"
                        onClick={() => onAddBlock(blockType.type)}
                        className="h-auto p-3 flex flex-col items-start text-left"
                      >
                        <div className="flex items-center w-full mb-1">
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="font-medium">{blockType.label}</span>
                          <Plus className="w-3 h-3 ml-auto" />
                        </div>
                        <span className="text-xs text-gray-500">{blockType.description}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* 현재 블록 목록 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  현재 블록 ({blocks.length}개)
                </h3>
                <div className="space-y-1">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="flex items-center p-2 bg-white rounded border border-gray-200 hover:border-gray-300"
                    >
                      <GripVertical className="w-3 h-3 text-gray-400 mr-2 cursor-move" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {block.type === 'content' && '텍스트'}
                            {block.type === 'image' && '이미지'}
                            {block.type === 'header' && '헤더'}
                            {block.type === 'location' && '위치'}
                            {block.type === 'contact' && '연락처'}
                            {block.type === 'rsvp' && 'RSVP'}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">#{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBlockToggleVisibility(block.id)}
                          className="h-6 w-6 p-0"
                        >
                          {block.isVisible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBlockEdit(block.id)}
                          className="h-6 px-2 text-xs"
                        >
                          편집
                        </Button>
                      </div>
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">아직 블록이 없습니다</p>
                      <p className="text-xs">위에서 블록을 추가해보세요</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">테마 설정</h3>
              <p className="text-sm text-gray-500">디자인 설정 기능이 곧 추가됩니다.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">편집기 설정</h3>
              <p className="text-sm text-gray-500">설정 기능이 곧 추가됩니다.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}