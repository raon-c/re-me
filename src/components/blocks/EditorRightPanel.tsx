'use client';

import { Block } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save, Settings, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorRightPanelProps {
  selectedBlock: Block | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockUpdate: (blockId: string, updates: Partial<Block>) => void;
  onSave: () => void;
}

export function EditorRightPanel({
  selectedBlock,
  isOpen,
  onClose,
  onBlockUpdate,
  onSave,
}: EditorRightPanelProps) {
  if (!isOpen || !selectedBlock) {
    return null;
  }

  const handleFieldChange = (field: string, value: any) => {
    onBlockUpdate(selectedBlock.id, {
      data: {
        ...selectedBlock.data,
        [field]: value,
      },
    } as Partial<Block>);
  };

  const renderBlockEditor = () => {
    switch (selectedBlock.type) {
      case 'content':
        const contentData = selectedBlock.data as {
          title?: string;
          content: string;
          isRichText?: boolean;
        };
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-title">제목</Label>
              <Input
                id="content-title"
                value={contentData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="content-text">텍스트 내용</Label>
              <Textarea
                id="content-text"
                value={contentData.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="텍스트를 입력하세요"
                rows={6}
              />
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groom-name">신랑 이름</Label>
                <Input
                  id="groom-name"
                  value={selectedBlock.data.groomName || ''}
                  onChange={(e) =>
                    handleFieldChange('groomName', e.target.value)
                  }
                  placeholder="신랑 이름"
                />
              </div>
              <div>
                <Label htmlFor="bride-name">신부 이름</Label>
                <Input
                  id="bride-name"
                  value={selectedBlock.data.brideName || ''}
                  onChange={(e) =>
                    handleFieldChange('brideName', e.target.value)
                  }
                  placeholder="신부 이름"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="wedding-date">결혼식 날짜</Label>
              <Input
                id="wedding-date"
                type="date"
                value={selectedBlock.data.weddingDate || ''}
                onChange={(e) =>
                  handleFieldChange('weddingDate', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="wedding-time">결혼식 시간</Label>
              <Input
                id="wedding-time"
                type="time"
                value={selectedBlock.data.weddingTime || ''}
                onChange={(e) =>
                  handleFieldChange('weddingTime', e.target.value)
                }
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">이미지 URL</Label>
              <Input
                id="image-url"
                value={selectedBlock.data.imageUrl || ''}
                onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                placeholder="이미지 URL을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">대체 텍스트</Label>
              <Input
                id="image-alt"
                value={selectedBlock.data.alt || ''}
                onChange={(e) => handleFieldChange('alt', e.target.value)}
                placeholder="이미지 설명"
              />
            </div>
            <div>
              <Label htmlFor="aspect-ratio">비율</Label>
              <select
                id="aspect-ratio"
                value={selectedBlock.data.aspectRatio || 'landscape'}
                onChange={(e) =>
                  handleFieldChange('aspectRatio', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="square">정사각형 (1:1)</option>
                <option value="landscape">가로형 (16:9)</option>
                <option value="portrait">세로형 (3:4)</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>이 블록 타입은 아직 편집을 지원하지 않습니다.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Edit3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedBlock.type} 블록 편집
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 패널 내용 */}
      <div className="flex-1 overflow-y-auto p-4">{renderBlockEditor()}</div>

      {/* 패널 하단 */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={onSave} className="flex-1">
            <Save className="w-4 h-4 mr-1" />
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
