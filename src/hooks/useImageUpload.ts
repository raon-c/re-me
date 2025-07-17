'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/trpc';
import { toast } from 'sonner';

export interface ImageUploadOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  createThumbnail?: boolean;
}

export interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface UploadedImage {
  fileName: string;
  originalName: string;
  publicUrl: string;
  thumbnailUrl: string | null;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    originalSize: number;
    qualityScore: number;
  };
}

// AIDEV-NOTE: 이미지 업로드 상태 관리 및 파일 처리 커스텀 훅
export function useImageUpload(options: ImageUploadOptions = {}) {
  const [progress, setProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const uploadMutation = api.upload.uploadImage.useMutation({
    onSuccess: (data) => {
      setUploadedImages((prev) => [...prev, data.data]);
      setProgress({
        isUploading: false,
        progress: 100,
        error: null,
      });
      toast.success('이미지가 성공적으로 업로드되었습니다.');
    },
    onError: (error) => {
      setProgress({
        isUploading: false,
        progress: 0,
        error: error.message,
      });
      toast.error(`업로드 실패: ${error.message}`);
    },
  });

  const deleteMutation = api.upload.deleteImage.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  // 파일을 Base64로 변환하는 유틸리티 함수
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // 이미지 업로드 함수
  const uploadImage = useCallback(async (file: File, customOptions?: ImageUploadOptions) => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기가 5MB를 초과합니다.');
      return;
    }

    setProgress({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // 진행률 시뮬레이션
      setProgress(prev => ({ ...prev, progress: 20 }));

      // 파일을 Base64로 변환
      const base64Data = await fileToBase64(file);
      
      setProgress(prev => ({ ...prev, progress: 40 }));

      // 업로드 실행
      const mergedOptions = { ...options, ...customOptions };
      
      setProgress(prev => ({ ...prev, progress: 60 }));

      await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data,
        options: mergedOptions,
      });

      setProgress(prev => ({ ...prev, progress: 100 }));
    } catch (error) {
      console.error('Upload error:', error);
      setProgress({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    }
  }, [fileToBase64, uploadMutation, options]);

  // 이미지 삭제 함수
  const deleteImage = useCallback(async (fileName: string) => {
    try {
      await deleteMutation.mutateAsync({ fileName });
      setUploadedImages((prev) => 
        prev.filter((img) => img.fileName !== fileName)
      );
    } catch (error) {
      console.error('Delete error:', error);
    }
  }, [deleteMutation]);

  // 업로드 상태 초기화
  const resetProgress = useCallback(() => {
    setProgress({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  // 업로드된 이미지 목록 초기화
  const clearUploadedImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  return {
    progress,
    uploadedImages,
    uploadImage,
    deleteImage,
    resetProgress,
    clearUploadedImages,
    isUploading: progress.isUploading,
    hasError: !!progress.error,
  };
}