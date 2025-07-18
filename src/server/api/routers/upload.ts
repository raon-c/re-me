// AIDEV-NOTE: 이미지 업로드 tRPC 라우터
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';

export const uploadRouter = createTRPCRouter({
  // AIDEV-NOTE: 이미지 업로드 URL 생성
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
        fileSize: z.number().min(1).max(5 * 1024 * 1024), // 5MB 제한
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, fileType } = input;
      
      // AIDEV-NOTE: 파일 타입 검증
      if (!fileType.startsWith('image/')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미지 파일만 업로드할 수 있습니다.',
        });
      }

      // AIDEV-NOTE: 지원되는 이미지 형식 확인
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(fileType)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'JPEG, PNG, WebP, GIF 파일만 업로드 가능합니다.',
        });
      }

      try {
        // AIDEV-NOTE: 고유한 파일명 생성
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        const uniqueFileName = `${nanoid()}.${fileExtension}`;
        const filePath = `invitations/${ctx.session.user.id}/${uniqueFileName}`;

        // AIDEV-NOTE: 임시 구현 - 실제로는 Supabase Storage 연동
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invitation-images/${filePath}`;

        return {
          uploadUrl: `https://api.supabase.co/storage/v1/upload/sign/invitation-images/${filePath}`,
          filePath,
          publicUrl,
        };
      } catch (error) {
        console.error('이미지 업로드 URL 생성 실패:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '업로드 준비 중 오류가 발생했습니다.',
        });
      }
    }),

  // AIDEV-NOTE: 업로드 완료 확인 및 메타데이터 저장
  confirmUpload: protectedProcedure
    .input(
      z.object({
        filePath: z.string().min(1),
        fileName: z.string().min(1),
        fileSize: z.number().min(1),
        fileType: z.string().min(1),
        alt: z.string().optional(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { filePath, fileName, fileSize, fileType, alt, caption } = input;

      try {
        // AIDEV-NOTE: 데이터베이스에 이미지 메타데이터 저장 (선택사항)
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invitation-images/${filePath}`;

        return {
          id: nanoid(),
          fileName,
          filePath,
          fileSize,
          fileType,
          publicUrl,
          alt: alt || fileName,
          caption,
          uploadedAt: new Date().toISOString(),
          uploadedBy: ctx.session.user.id,
        };
      } catch (error) {
        console.error('업로드 확인 실패:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '업로드 확인 중 오류가 발생했습니다.',
        });
      }
    }),

  // AIDEV-NOTE: 이미지 삭제
  deleteImage: protectedProcedure
    .input(
      z.object({
        filePath: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { filePath } = input;

      try {
        // AIDEV-NOTE: 파일 소유자 확인 (filePath에 userId 포함)
        if (!filePath.includes(ctx.session.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '이 파일을 삭제할 권한이 없습니다.',
          });
        }

        // AIDEV-NOTE: 임시 구현 - 실제로는 Supabase Storage에서 파일 삭제
        return {
          success: true,
          message: '이미지가 삭제되었습니다.',
        };
      } catch (error) {
        console.error('이미지 삭제 실패:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 삭제 중 오류가 발생했습니다.',
        });
      }
    }),

  // AIDEV-NOTE: 사용자 이미지 목록 조회
  getImages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async () => {
      try {
        // AIDEV-NOTE: 임시 구현 - 실제로는 Supabase Storage에서 목록 조회
        const images: any[] = [];

        return {
          images,
          total: 0,
          hasMore: false,
        };
      } catch (error) {
        console.error('이미지 목록 조회 실패:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 목록 조회 중 오류가 발생했습니다.',
        });
      }
    }),
});