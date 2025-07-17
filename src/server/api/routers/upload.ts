import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import { ImageProcessor } from '@/lib/image-utils';

// AIDEV-NOTE: 이미지 업로드 관련 검증 스키마
const imageUploadSchema = z.object({
  fileName: z.string().min(1, '파일명은 필수입니다.'),
  fileType: z.string().min(1, '파일 타입은 필수입니다.'),
  fileSize: z.number().min(1, '파일 크기는 필수입니다.'),
  base64Data: z.string().min(1, '이미지 데이터는 필수입니다.'),
  options: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    quality: z.number().min(1).max(100).optional(),
    format: z.enum(['jpeg', 'png', 'webp']).optional(),
    createThumbnail: z.boolean().optional(),
  }).optional(),
});

const imageDeleteSchema = z.object({
  fileName: z.string().min(1, '파일명은 필수입니다.'),
});

export const uploadRouter = createTRPCRouter({
  // 이미지 업로드
  uploadImage: protectedProcedure
    .input(imageUploadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. 파일 타입 검증
        if (!ImageProcessor.validateImageType(input.fileType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '지원되지 않는 이미지 형식입니다. (JPG, PNG, WebP, GIF만 가능)',
          });
        }

        // 2. 파일 크기 검증 (5MB 제한)
        if (!ImageProcessor.validateImageSize(input.fileSize)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '파일 크기가 5MB를 초과합니다.',
          });
        }

        // 3. Base64 데이터를 Buffer로 변환
        const base64Data = input.base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
        const inputBuffer = Buffer.from(base64Data, 'base64');

        // 4. 이미지 처리 및 최적화
        const processedImage = await ImageProcessor.processImage(inputBuffer, {
          width: input.options?.width,
          height: input.options?.height,
          quality: input.options?.quality,
          format: input.options?.format,
        });

        // 5. 썸네일 생성 (옵션)
        let thumbnailImage = null;
        if (input.options?.createThumbnail) {
          thumbnailImage = await ImageProcessor.createThumbnail(inputBuffer);
        }

        // 6. Supabase 클라이언트 생성
        const supabase = await createClient();

        // 7. 파일명 생성 (사용자 ID 기반 폴더 구조)
        const fileName = ImageProcessor.generateFileName(
          input.fileName,
          ctx.session.user.id
        );
        
        const thumbnailFileName = thumbnailImage
          ? ImageProcessor.generateFileName(
              `thumb_${input.fileName}`,
              ctx.session.user.id
            )
          : null;

        // 8. 원본 이미지 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('invitation-images')
          .upload(fileName, processedImage.buffer, {
            contentType: `image/${processedImage.metadata.format}`,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `이미지 업로드 실패: ${uploadError.message}`,
          });
        }

        // 9. 썸네일 업로드 (옵션)
        if (thumbnailImage && thumbnailFileName) {
          await supabase.storage
            .from('invitation-images')
            .upload(thumbnailFileName, thumbnailImage.buffer, {
              contentType: `image/${thumbnailImage.metadata.format}`,
              cacheControl: '3600',
              upsert: false,
            });
        }

        // 10. 공개 URL 생성
        const { data: publicUrlData } = supabase.storage
          .from('invitation-images')
          .getPublicUrl(fileName);

        const thumbnailPublicUrl = thumbnailFileName
          ? supabase.storage
              .from('invitation-images')
              .getPublicUrl(thumbnailFileName).data.publicUrl
          : null;

        // 11. 이미지 품질 점수 계산
        const qualityScore = ImageProcessor.calculateQualityScore(processedImage.metadata);

        return {
          success: true,
          data: {
            fileName: uploadData.path,
            originalName: input.fileName,
            publicUrl: publicUrlData.publicUrl,
            thumbnailUrl: thumbnailPublicUrl,
            metadata: {
              ...processedImage.metadata,
              originalSize: input.fileSize,
              qualityScore,
            },
            uploadInfo: {
              bucket: 'invitation-images',
              path: uploadData.path,
              id: uploadData.id,
            },
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 업로드 중 오류가 발생했습니다.',
        });
      }
    }),

  // 이미지 삭제
  deleteImage: protectedProcedure
    .input(imageDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = await createClient();

        // 파일명이 사용자 ID로 시작하는지 확인 (보안)
        if (!input.fileName.startsWith(ctx.session.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '본인이 업로드한 이미지만 삭제할 수 있습니다.',
          });
        }

        const { error } = await supabase.storage
          .from('invitation-images')
          .remove([input.fileName]);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `이미지 삭제 실패: ${error.message}`,
          });
        }

        return {
          success: true,
          message: '이미지가 성공적으로 삭제되었습니다.',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 삭제 중 오류가 발생했습니다.',
        });
      }
    }),

  // 사용자 이미지 목록 조회
  getUserImages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const supabase = await createClient();

        // 사용자 폴더 내의 이미지 목록 조회
        const { data: files, error } = await supabase.storage
          .from('invitation-images')
          .list(ctx.session.user.id, {
            limit: input.limit,
            offset: input.offset,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `이미지 목록 조회 실패: ${error.message}`,
          });
        }

        // 공개 URL 생성
        const imagesWithUrls = files?.map((file) => {
          const fullPath = `${ctx.session.user.id}/${file.name}`;
          const { data: publicUrlData } = supabase.storage
            .from('invitation-images')
            .getPublicUrl(fullPath);

          return {
            name: file.name,
            fullPath,
            publicUrl: publicUrlData.publicUrl,
            size: file.metadata?.size || 0,
            lastModified: file.updated_at,
            contentType: file.metadata?.mimetype || 'image/webp',
          };
        }) || [];

        return {
          images: imagesWithUrls,
          total: files?.length || 0,
          hasMore: (files?.length || 0) === input.limit,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 목록 조회 중 오류가 발생했습니다.',
        });
      }
    }),

  // 이미지 메타데이터 조회
  getImageMetadata: protectedProcedure
    .input(z.object({ fileName: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const supabase = await createClient();

        // 보안 검사
        if (!input.fileName.startsWith(ctx.session.user.id)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '접근 권한이 없습니다.',
          });
        }

        // 파일 정보 조회
        const { data: fileData, error: fileError } = await supabase.storage
          .from('invitation-images')
          .list(ctx.session.user.id, {
            search: input.fileName.split('/').pop(),
          });

        if (fileError || !fileData || fileData.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '이미지를 찾을 수 없습니다.',
          });
        }

        const file = fileData[0];
        const { data: publicUrlData } = supabase.storage
          .from('invitation-images')
          .getPublicUrl(input.fileName);

        return {
          name: file.name,
          fullPath: input.fileName,
          publicUrl: publicUrlData.publicUrl,
          size: file.metadata?.size || 0,
          lastModified: file.updated_at,
          contentType: file.metadata?.mimetype || 'image/webp',
          metadata: file.metadata,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '이미지 메타데이터 조회 중 오류가 발생했습니다.',
        });
      }
    }),
});