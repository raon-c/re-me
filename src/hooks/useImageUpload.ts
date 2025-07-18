'use client';

// AIDEV-NOTE: 이미지 업로드 훅 - 파일 업로드 및 상태 관리
import { useState, useCallback } from 'react';
import { api } from '@/lib/trpc';

export interface UploadedImage {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  publicUrl: string;
  alt?: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UploadError {
  message: string;
  code?: string;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: UploadError | null;
  uploadedImage: UploadedImage | null;
}

export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedImage: null,
  });

  const getUploadUrlMutation = api.upload.getUploadUrl.useMutation();
  const confirmUploadMutation = api.upload.confirmUpload.useMutation();
  const deleteImageMutation = api.upload.deleteImage.useMutation();

  // AIDEV-NOTE: 파일 업로드 메인 함수
  const uploadImage = useCallback(async (
    file: File,
    options?: {
      alt?: string;
      caption?: string;
      onProgress?: (progress: number) => void;
    }
  ): Promise<UploadedImage | null> => {
    try {
      // AIDEV-NOTE: 업로드 상태 초기화
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedImage: null,
      });

      // AIDEV-NOTE: 파일 크기 검증
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('파일 크기는 5MB 이하여야 합니다.');
      }

      // AIDEV-NOTE: 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        throw new Error('이미지 파일만 업로드할 수 있습니다.');
      }

      // AIDEV-NOTE: 1단계 - 업로드 URL 요청
      const uploadUrlResponse = await getUploadUrlMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      setUploadState(prev => ({ ...prev, progress: 20 }));
      options?.onProgress?.(20);

      // AIDEV-NOTE: 2단계 - 실제 파일 업로드 (임시로 로컬 URL 사용)
      // 실제 구현에서는 Supabase Storage에 업로드
      const uploadPromise = new Promise<void>((resolve) => {
        // AIDEV-NOTE: 진행률 시뮬레이션
        let progress = 20;
        const interval = setInterval(() => {
          progress += 20;
          setUploadState(prev => ({ ...prev, progress }));
          options?.onProgress?.(progress);
          
          if (progress >= 80) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });

      await uploadPromise;

      // AIDEV-NOTE: 3단계 - 업로드 완료 확인
      const uploadedImage = await confirmUploadMutation.mutateAsync({
        filePath: uploadUrlResponse.filePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        alt: options?.alt,
        caption: options?.caption,
      });

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        uploadedImage,
      });

      options?.onProgress?.(100);
      return uploadedImage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: { message: errorMessage },
        uploadedImage: null,
      });

      console.error('이미지 업로드 실패:', error);
      return null;
    }
  }, [getUploadUrlMutation, confirmUploadMutation]);

  // AIDEV-NOTE: 이미지 삭제 함수
  const deleteImage = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      await deleteImageMutation.mutateAsync({ filePath });
      return true;
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      return false;
    }
  }, [deleteImageMutation]);

  // AIDEV-NOTE: 상태 초기화 함수
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedImage: null,
    });
  }, []);

  // AIDEV-NOTE: 파일 크기 포맷팅 유틸리티
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // AIDEV-NOTE: 이미지 미리보기 URL 생성
  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  // AIDEV-NOTE: 미리보기 URL 해제
  const revokePreviewUrl = useCallback((url: string): void => {
    URL.revokeObjectURL(url);
  }, []);

  return {
    // 상태
    uploadState,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    uploadedImage: uploadState.uploadedImage,
    
    // 함수
    uploadImage,
    deleteImage,
    resetUploadState,
    
    // 유틸리티
    formatFileSize,
    createPreviewUrl,
    revokePreviewUrl,
    
    // 뮤테이션 상태
    isGettingUploadUrl: getUploadUrlMutation.isPending,
    isConfirmingUpload: confirmUploadMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,
  };
}