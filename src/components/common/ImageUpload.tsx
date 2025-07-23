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
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string, metadata: Record<string, any>) => void;
  onImageRemoved?: (imageUrl: string) => void;
  folder?: 'invitations' | 'templates' | 'avatars';
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  folder = 'invitations',
  className,
  disabled = false,
}: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    progress,
    uploadedImage,
    uploadImage,
    deleteImage,
    resetUploadState,
    isUploading,
    error,
  } = useImageUpload();

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

    const result = await uploadImage(selectedFile, folder);
    
    // 업로드 성공 시 미리보기 초기화
    if (result) {
      setPreviewImages([]);
      setSelectedFile(null);
      onImageUploaded?.(result.url, {
        path: result.path,
        originalName: result.originalName,
        size: result.size,
        type: result.type,
      });
    }
  }, [selectedFile, uploadImage, folder, onImageUploaded]);

  // 이미지 삭제
  const handleDeleteImage = useCallback(async (fileName: string, publicUrl: string) => {
    const success = await deleteImage(fileName);
    if (success) {
      onImageRemoved?.(publicUrl);
    }
  }, [deleteImage, onImageRemoved]);

  // 업로드 취소
  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreviewImages([]);
    resetUploadState();
  }, [resetUploadState]);

  // 파일 선택 취소
  const handleCancelSelection = useCallback(() => {
    setSelectedFile(null);
    setPreviewImages([]);
    resetUploadState();
  }, [resetUploadState]);

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
                  업로드 중... ({progress}%)
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
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

          {/* 에러 표시 */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 업로드된 이미지 */}
      {uploadedImage && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">업로드된 이미지</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage.url}
                  alt={uploadedImage.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* 이미지 정보 */}
              <div className="mt-2 text-xs text-gray-600">
                <p className="truncate">{uploadedImage.originalName}</p>
                <p>{(uploadedImage.size / 1024).toFixed(1)}KB</p>
              </div>

              {/* 액션 버튼 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                      onClick={() => window.open(uploadedImage.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteImage(uploadedImage.path, uploadedImage.url)}
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
          </div>
        </Card>
      )}
    </div>
  );
}