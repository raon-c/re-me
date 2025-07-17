'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  Trash2,
} from 'lucide-react';
import { useImageUpload, type ImageUploadOptions } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string, metadata: Record<string, any>) => void;
  onImageRemoved?: (imageUrl: string) => void;
  options?: ImageUploadOptions;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  options = {},
  className,
  disabled = false,
}: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customOptions, setCustomOptions] = useState<ImageUploadOptions>(options);

  const {
    progress,
    uploadedImages,
    uploadImage,
    deleteImage,
    resetProgress,
    isUploading,
    hasError,
  } = useImageUpload(customOptions);

  // 드래그 앤 드롭 설정
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;

    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      // 미리보기 이미지 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImages([e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || isUploading,
  });

  // 업로드 실행
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    await uploadImage(selectedFile, customOptions);
    
    // 업로드 성공 시 미리보기 초기화
    if (!hasError) {
      setPreviewImages([]);
      setSelectedFile(null);
    }
  }, [selectedFile, uploadImage, customOptions, hasError]);

  // 이미지 삭제
  const handleDeleteImage = useCallback(async (fileName: string, publicUrl: string) => {
    await deleteImage(fileName);
    onImageRemoved?.(publicUrl);
  }, [deleteImage, onImageRemoved]);

  // 옵션 변경
  const handleOptionChange = useCallback((key: keyof ImageUploadOptions, value: string | number | boolean) => {
    setCustomOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // 파일 선택 취소
  const handleCancelSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewImages([]);
    resetProgress();
  }, [resetProgress]);

  React.useEffect(() => {
    if (uploadedImages.length > 0) {
      const latestImage = uploadedImages[uploadedImages.length - 1];
      onImageUploaded?.(latestImage.publicUrl, latestImage.metadata);
    }
  }, [uploadedImages, onImageUploaded]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* 업로드 영역 */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* 드래그 앤 드롭 영역 */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">
                  업로드 중... ({progress.progress}%)
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            ) : previewImages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewImages[0]}
                    alt="미리보기"
                    className="max-h-40 rounded-lg shadow-md"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelSelection();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    업로드
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelSelection();
                    }}
                    disabled={isUploading}
                  >
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg text-gray-600">
                  {isDragActive
                    ? '이미지를 여기에 놓으세요'
                    : '이미지를 드래그하거나 클릭하여 선택하세요'}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, WebP, GIF 파일 (최대 5MB)
                </p>
              </div>
            )}
          </div>

          {/* 업로드 옵션 */}
          {selectedFile && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="width" className="text-sm">너비 (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={customOptions.width || ''}
                  onChange={(e) => handleOptionChange('width', parseInt(e.target.value) || 0)}
                  placeholder="자동"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-sm">높이 (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={customOptions.height || ''}
                  onChange={(e) => handleOptionChange('height', parseInt(e.target.value) || 0)}
                  placeholder="자동"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="quality" className="text-sm">품질 (1-100)</Label>
                <Input
                  id="quality"
                  type="number"
                  min="1"
                  max="100"
                  value={customOptions.quality || 80}
                  onChange={(e) => handleOptionChange('quality', parseInt(e.target.value))}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="format" className="text-sm">포맷</Label>
                <select
                  id="format"
                  value={customOptions.format || 'webp'}
                  onChange={(e) => handleOptionChange('format', e.target.value)}
                  className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm"
                >
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                </select>
              </div>
            </div>
          )}

          {/* 에러 표시 */}
          {hasError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{progress.error}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 업로드된 이미지 목록 */}
      {uploadedImages.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">업로드된 이미지</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.thumbnailUrl || image.publicUrl}
                    alt={image.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 이미지 정보 */}
                <div className="mt-2 text-xs text-gray-600">
                  <p className="truncate">{image.originalName}</p>
                  <p>{image.metadata.width}×{image.metadata.height}</p>
                  <p>{(image.metadata.size / 1024).toFixed(1)}KB</p>
                  <p>품질: {image.metadata.qualityScore}점</p>
                </div>

                {/* 액션 버튼 */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(image.publicUrl, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteImage(image.fileName, image.publicUrl)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 성공 표시 */}
                <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}