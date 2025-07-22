'use client';

// AIDEV-NOTE: 이미지 블록 - 이미지 업로드 및 표시
import { useState, useRef } from 'react';
import { BaseBlock } from './BaseBlock';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { ImageBlock as ImageBlockType } from '@/types/blocks';

interface ImageBlockProps {
  block: ImageBlockType;
  isEditing?: boolean;
  isPreview?: boolean;
  onUpdate?: (updates: Partial<ImageBlockType>) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSettings?: () => void;
}

export function ImageBlock({
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
}: ImageBlockProps) {
  // AIDEV-NOTE: Hook은 항상 동일한 순서로 호출되어야 함
  const [localData, setLocalData] = useState(block.data);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadImage,
    isUploading,
    progress,
    error,
    resetUploadState,
  } = useImageUpload();

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file, 'invitations', {
        onProgress: (progress: number) => {
          console.log('업로드 진행률:', progress);
        },
      });

      if (result) {
        setLocalData(prev => ({
          ...prev,
          imageUrl: result.url,
          alt: result.originalName || file.name,
        }));
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setLocalData(prev => ({ ...prev, imageUrl: url }));
  };

  const handleRemoveImage = () => {
    setLocalData(prev => ({
      ...prev,
      imageUrl: '',
      alt: '',
      caption: '',
    }));
  };

  const getAspectRatioClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[4/3]';
    }
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
            이미지 블록 편집
          </div>
          
          {/* AIDEV-NOTE: 이미지 업로드 영역 */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? `업로드 중... ${progress}%` : '파일 선택'}
              </Button>
              {localData.imageUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* AIDEV-NOTE: 업로드 진행률 표시 */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <div className="text-sm text-gray-600 text-center">
                  {progress}% 완료
                </div>
              </div>
            )}

            {/* AIDEV-NOTE: 업로드 에러 표시 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-sm text-red-600">{error.message}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUploadState}
                  className="mt-2"
                >
                  다시 시도
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="text-center text-sm text-gray-500">
              또는
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이미지 URL
              </label>
              <Input
                value={localData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* AIDEV-NOTE: 이미지 미리보기 */}
          {localData.imageUrl && (
            <div className="border border-gray-200 rounded-lg p-2">
              <img
                src={localData.imageUrl}
                alt={localData.alt || ''}
                className="w-full h-32 object-cover rounded"
              />
            </div>
          )}

          {/* AIDEV-NOTE: 이미지 옵션 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비율
              </label>
              <Select
                value={localData.aspectRatio || 'landscape'}
                onValueChange={(value) => setLocalData(prev => ({ 
                  ...prev, 
                  aspectRatio: value as 'square' | 'portrait' | 'landscape' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">가로형 (4:3)</SelectItem>
                  <SelectItem value="portrait">세로형 (3:4)</SelectItem>
                  <SelectItem value="square">정사각형 (1:1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대체 텍스트
              </label>
              <Input
                value={localData.alt || ''}
                onChange={(e) => setLocalData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="이미지 설명"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              캡션 (선택사항)
            </label>
            <Input
              value={localData.caption || ''}
              onChange={(e) => setLocalData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="이미지 캡션"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={!localData.imageUrl}>
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* AIDEV-NOTE: 이미지 표시 */}
          {block.data.imageUrl ? (
            <div className="relative">
              <div className={`relative overflow-hidden rounded-lg ${getAspectRatioClass(block.data.aspectRatio || 'landscape')}`}>
                <img
                  src={block.data.imageUrl}
                  alt={block.data.alt || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* AIDEV-NOTE: 캡션 표시 */}
              {block.data.caption && (
                <div className="text-sm text-gray-600 text-center mt-2">
                  {block.data.caption}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <div>이미지 블록을 편집하여 이미지를 추가하세요</div>
            </div>
          )}
        </div>
      )}
    </BaseBlock>
  );
}