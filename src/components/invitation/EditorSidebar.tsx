'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Trash2,
  Upload,
  Images,
} from 'lucide-react';
import { EditorElement } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/common/ImageUpload';
import { ImageGallery } from '@/components/common/ImageGallery';

interface EditorSidebarProps {
  selectedElement: EditorElement | null;
  weddingInfo: {
    brideName: string;
    groomName: string;
    weddingDate: string;
    weddingTime: string;
    venue: string;
    venueAddress: string;
    contact: string;
  };
  onElementUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onElementDelete: (id: string) => void;
  onWeddingInfoUpdate: (
    updates: Partial<EditorSidebarProps['weddingInfo']>
  ) => void;
  className?: string;
}

// AIDEV-NOTE: Korean-optimized font options for wedding invitations
const FONT_OPTIONS = [
  { value: 'Noto Sans KR', label: '본고딕' },
  { value: 'Noto Serif KR', label: '본명조' },
  { value: 'Nanum Gothic', label: '나눔고딕' },
  { value: 'Nanum Myeongjo', label: '나눔명조' },
  { value: 'Nanum Pen Script', label: '나눔펜' },
  { value: 'Gaegu', label: '개구' },
  { value: 'Jua', label: '주아' },
  { value: 'Gamja Flower', label: '감자꽃' },
];

const COLOR_PALETTE = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ffa500',
  '#800080',
  '#ffc0cb',
  '#a52a2a',
  '#808080',
  '#000080',
  '#008000',
  '#800000',
  '#808000',
  '#ffd700',
  '#c0c0c0',
  '#dda0dd',
];

export function EditorSidebar({
  selectedElement,
  weddingInfo,
  onElementUpdate,
  onElementDelete,
  onWeddingInfoUpdate,
  className,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'style' | 'images'>('info');
  const handleStyleUpdate = (styleUpdates: Partial<EditorElement['style']>) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, {
        style: { ...selectedElement.style, ...styleUpdates },
      });
    }
  };

  const handlePositionUpdate = (
    positionUpdates: Partial<EditorElement['position']>
  ) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, {
        position: { ...selectedElement.position, ...positionUpdates },
      });
    }
  };

  const handleSizeUpdate = (sizeUpdates: Partial<EditorElement['size']>) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, {
        size: { ...selectedElement.size, ...sizeUpdates },
      });
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUploaded = (imageUrl: string) => {
    if (selectedElement && selectedElement.type === 'image') {
      onElementUpdate(selectedElement.id, {
        content: imageUrl,
      });
    }
  };

  // 갤러리에서 이미지 선택 핸들러
  const handleImageSelect = (imageUrl: string) => {
    if (selectedElement && selectedElement.type === 'image') {
      onElementUpdate(selectedElement.id, {
        content: imageUrl,
      });
    }
  };

  return (
    <div
      className={cn(
        'w-80 bg-white border-l border-gray-200 overflow-y-auto',
        className
      )}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          정보
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'style'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          스타일
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'images'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Images className="h-4 w-4 inline mr-1" />
          이미지
        </button>
      </div>

      <div className="p-4">
        {/* Wedding Information Panel */}
        {activeTab === 'info' && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-lg mb-4">결혼식 정보</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="brideName" className="text-sm">
                신부 이름
              </Label>
              <Input
                id="brideName"
                value={weddingInfo.brideName}
                onChange={(e) =>
                  onWeddingInfoUpdate({ brideName: e.target.value })
                }
                placeholder="신부 이름"
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="groomName" className="text-sm">
                신랑 이름
              </Label>
              <Input
                id="groomName"
                value={weddingInfo.groomName}
                onChange={(e) =>
                  onWeddingInfoUpdate({ groomName: e.target.value })
                }
                placeholder="신랑 이름"
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="weddingDate" className="text-sm">
                날짜
              </Label>
              <Input
                id="weddingDate"
                type="date"
                value={weddingInfo.weddingDate}
                onChange={(e) =>
                  onWeddingInfoUpdate({ weddingDate: e.target.value })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="weddingTime" className="text-sm">
                시간
              </Label>
              <Input
                id="weddingTime"
                type="time"
                value={weddingInfo.weddingTime}
                onChange={(e) =>
                  onWeddingInfoUpdate({ weddingTime: e.target.value })
                }
                className="h-8"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venue" className="text-sm">
              예식장
            </Label>
            <Input
              id="venue"
              value={weddingInfo.venue}
              onChange={(e) => onWeddingInfoUpdate({ venue: e.target.value })}
              placeholder="예식장 이름"
              className="h-8"
            />
          </div>

          <div>
            <Label htmlFor="venueAddress" className="text-sm">
              주소
            </Label>
            <Input
              id="venueAddress"
              value={weddingInfo.venueAddress}
              onChange={(e) =>
                onWeddingInfoUpdate({ venueAddress: e.target.value })
              }
              placeholder="예식장 주소"
              className="h-8"
            />
          </div>

          <div>
            <Label htmlFor="contact" className="text-sm">
              연락처
            </Label>
            <Input
              id="contact"
              value={weddingInfo.contact}
              onChange={(e) => onWeddingInfoUpdate({ contact: e.target.value })}
              placeholder="연락처"
              className="h-8"
            />
          </div>
        </div>
      </Card>
        )}

        {/* Element Styling Panel */}
        {activeTab === 'style' && selectedElement ? (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">요소 스타일</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onElementDelete(selectedElement.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {selectedElement.type === 'text' && (
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <Label className="text-sm">폰트</Label>
                <select
                  value={selectedElement.style.fontFamily}
                  onChange={(e) =>
                    handleStyleUpdate({ fontFamily: e.target.value })
                  }
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <Label className="text-sm">크기</Label>
                <Input
                  type="number"
                  value={selectedElement.style.fontSize}
                  onChange={(e) =>
                    handleStyleUpdate({ fontSize: parseInt(e.target.value) })
                  }
                  min={8}
                  max={72}
                  className="h-8 mt-1"
                />
              </div>

              {/* Text Alignment */}
              <div>
                <Label className="text-sm">정렬</Label>
                <div className="flex gap-1 mt-1">
                  <Button
                    variant={
                      selectedElement.style.textAlign === 'left'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleStyleUpdate({ textAlign: 'left' })}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      selectedElement.style.textAlign === 'center'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleStyleUpdate({ textAlign: 'center' })}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      selectedElement.style.textAlign === 'right'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleStyleUpdate({ textAlign: 'right' })}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Font Weight and Style */}
              <div>
                <Label className="text-sm">스타일</Label>
                <div className="flex gap-1 mt-1">
                  <Button
                    variant={
                      selectedElement.style.fontWeight === 'bold'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStyleUpdate({
                        fontWeight:
                          selectedElement.style.fontWeight === 'bold'
                            ? 'normal'
                            : 'bold',
                      })
                    }
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      selectedElement.style.fontStyle === 'italic'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      handleStyleUpdate({
                        fontStyle:
                          selectedElement.style.fontStyle === 'italic'
                            ? 'normal'
                            : 'italic',
                      })
                    }
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <Label className="text-sm">색상</Label>
                <div className="grid grid-cols-10 gap-1 mt-1">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-6 h-6 rounded border-2',
                        selectedElement.style.color === color
                          ? 'border-gray-800'
                          : 'border-gray-300'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleStyleUpdate({ color })}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={selectedElement.style.color}
                  onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                  className="h-8 mt-2"
                />
              </div>
            </div>
          )}

          {/* Position and Size Controls */}
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <Label className="text-sm">위치</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  value={Math.round(selectedElement.position.x)}
                  onChange={(e) =>
                    handlePositionUpdate({ x: parseInt(e.target.value) })
                  }
                  placeholder="X"
                  className="h-8"
                />
                <Input
                  type="number"
                  value={Math.round(selectedElement.position.y)}
                  onChange={(e) =>
                    handlePositionUpdate({ y: parseInt(e.target.value) })
                  }
                  placeholder="Y"
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">크기</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  value={Math.round(selectedElement.size.width)}
                  onChange={(e) =>
                    handleSizeUpdate({ width: parseInt(e.target.value) })
                  }
                  placeholder="너비"
                  className="h-8"
                />
                <Input
                  type="number"
                  value={Math.round(selectedElement.size.height)}
                  onChange={(e) =>
                    handleSizeUpdate({ height: parseInt(e.target.value) })
                  }
                  placeholder="높이"
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </Card>
        ) : activeTab === 'style' ? (
          <Card className="p-4">
            <div className="text-center text-gray-500">
              <p className="text-sm">요소를 선택하여</p>
              <p className="text-sm">스타일을 편집하세요</p>
            </div>
          </Card>
        ) : null}

        {/* Images Panel */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            {/* 이미지 업로드 */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                이미지 업로드
              </h3>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                options={{
                  width: 800,
                  height: 600,
                  quality: 85,
                  format: 'webp',
                  createThumbnail: true,
                }}
              />
            </Card>

            {/* 이미지 갤러리 */}
            <ImageGallery
              onImageSelect={handleImageSelect}
              selectable={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
