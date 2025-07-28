'use server';

import { z } from 'zod';
import { authActionClient } from '@/lib/safe-action';

// AIDEV-NOTE: Safe Action implementations for file upload with security and validation
// Handles image uploads to Supabase Storage with proper authentication and file validation

// Image validation constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Upload schemas
const uploadImageSchema = z.object({
  file: z.instanceof(File, { message: '유효한 파일을 선택해주세요.' }),
  folder: z.enum(['invitations', 'templates', 'avatars']).default('invitations'),
});

const deleteImageSchema = z.object({
  filePath: z.string().min(1, '삭제할 파일 경로가 필요합니다.'),
});

const getUserImagesSchema = z.object({
  folder: z.enum(['invitations', 'templates', 'avatars']).default('invitations'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

/**
 * 파일 유효성 검사 helper 함수
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '파일 크기는 5MB 이하여야 합니다.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: '지원하지 않는 파일 형식입니다. JPG, PNG, WebP, GIF 파일만 업로드 가능합니다.' };
  }

  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return { valid: false, error: '지원하지 않는 파일 확장자입니다.' };
  }

  return { valid: true };
}

/**
 * 고유 파일명 생성 helper 함수
 */
function generateUniqueFileName(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  
  const userPrefix = userId ? `${userId.substring(0, 8)}_` : '';
  return `${userPrefix}${timestamp}_${randomString}${extension}`;
}

/**
 * 이미지 업로드 Safe Action
 */
export const uploadImageAction = authActionClient
  .schema(uploadImageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { file, folder } = parsedInput;

    // 파일 유효성 검사
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error!);
    }

    // 고유 파일명 생성
    const uniqueFileName = generateUniqueFileName(file.name, ctx.user.id);
    const filePath = `${folder}/${uniqueFileName}`;

    // Supabase Storage에 파일 업로드
    const { error: uploadError } = await ctx.supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      if (uploadError.message.includes('Duplicate')) {
        throw new Error('파일명이 중복되었습니다. 다시 시도해주세요.');
      }

      throw new Error('파일 업로드 중 오류가 발생했습니다.');
    }

    // 공개 URL 생성
    const { data: urlData } = ctx.supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      message: '이미지가 성공적으로 업로드되었습니다.',
      url: urlData.publicUrl,
      path: filePath,
      size: file.size,
      type: file.type,
      originalName: file.name,
    };
  });

/**
 * 이미지 삭제 Safe Action
 */
export const deleteImageAction = authActionClient
  .schema(deleteImageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { filePath } = parsedInput;

    // 파일 소유권 확인 (파일명에 사용자 ID가 포함되어 있는지 확인)
    const fileName = filePath.split('/').pop() || '';
    if (!fileName.startsWith(ctx.user.id.substring(0, 8))) {
      throw new Error('파일 삭제 권한이 없습니다.');
    }

    const { error: deleteError } = await ctx.supabase.storage
      .from('images')
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error('파일 삭제 중 오류가 발생했습니다.');
    }

    return {
      message: '이미지가 성공적으로 삭제되었습니다.',
      deletedPath: filePath,
    };
  });

/**
 * 다중 이미지 업로드 Safe Action
 */
export const uploadMultipleImagesAction = authActionClient
  .schema(z.object({
    files: z.array(z.instanceof(File)).max(10, '한 번에 최대 10개 파일까지 업로드할 수 있습니다.'),
    folder: z.enum(['invitations', 'templates', 'avatars']).default('invitations'),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { files, folder } = parsedInput;

    const results: Array<{ url: string; path: string; originalName: string }> = [];
    const errors: string[] = [];

    // 각 파일을 순차적으로 업로드
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 파일 유효성 검사
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const uniqueFileName = generateUniqueFileName(file.name, ctx.user.id);
        const filePath = `${folder}/${uniqueFileName}`;

        const { error: uploadError } = await ctx.supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          errors.push(`${file.name}: 업로드 실패`);
          continue;
        }

        const { data: urlData } = ctx.supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        results.push({
          url: urlData.publicUrl,
          path: filePath,
          originalName: file.name,
        });
      } catch {
        errors.push(`${file.name}: 처리 중 오류`);
      }
    }

    if (results.length === 0) {
      throw new Error('모든 파일 업로드가 실패했습니다.');
    }

    let message = `${results.length}개 파일이 성공적으로 업로드되었습니다.`;
    if (errors.length > 0) {
      message += ` (${errors.length}개 파일 실패)`;
    }

    return {
      message,
      results,
      errors,
      successCount: results.length,
      failureCount: errors.length,
    };
  });

/**
 * 업로드된 이미지 목록 조회 Safe Action
 */
export const getUserImagesAction = authActionClient
  .schema(getUserImagesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { folder, page, limit } = parsedInput;
    const userPrefix = ctx.user.id.substring(0, 8);

    const { data: files, error } = await ctx.supabase.storage
      .from('images')
      .list(folder, {
        limit: limit * 2, // 더 많이 가져와서 필터링 후 페이지네이션
        offset: 0,
      });

    if (error) {
      console.error('List files error:', error);
      throw new Error('이미지 목록을 불러오는데 실패했습니다.');
    }

    // 사용자가 업로드한 파일만 필터링
    const userFiles = (files || [])
      .filter(file => file.name.startsWith(userPrefix))
      .map(file => {
        const filePath = `${folder}/${file.name}`;
        const { data: urlData } = ctx.supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: urlData.publicUrl,
          path: filePath,
          createdAt: file.created_at || '',
          size: file.metadata?.size,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 페이지네이션 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFiles = userFiles.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      pagination: {
        page,
        limit,
        total: userFiles.length,
        totalPages: Math.ceil(userFiles.length / limit),
        hasNext: endIndex < userFiles.length,
        hasPrev: page > 1,
      },
    };
  });

// 편의 함수들
export async function uploadSingleImage(file: File, folder: 'invitations' | 'templates' | 'avatars' = 'invitations') {
  return uploadImageAction({ file, folder });
}

export async function deleteUserImage(filePath: string) {
  return deleteImageAction({ filePath });
}

export async function getUserImagesPaginated(folder: 'invitations' | 'templates' | 'avatars' = 'invitations', page: number = 1) {
  return getUserImagesAction({ folder, page, limit: 20 });
}