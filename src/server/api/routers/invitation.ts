import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/lib/db';
import { weddingInfoUpdateSchema } from '@/lib/wedding-validations';

// AIDEV-NOTE: Validation schemas for invitation editor data
const editorElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'divider']),
  content: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  style: z.object({
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    color: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    fontStyle: z.enum(['normal', 'italic']).optional(),
  }),
});

const weddingInfoSchema = z.object({
  brideName: z.string(),
  groomName: z.string(),
  weddingDate: z.string(),
  weddingTime: z.string(),
  venue: z.string(),
  venueAddress: z.string(),
  contact: z.string(),
});

const editorStateSchema = z.object({
  elements: z.array(editorElementSchema),
  weddingInfo: weddingInfoSchema,
  templateId: z.string().optional(),
});

export const invitationRouter = createTRPCRouter({
  // Create a new invitation
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '제목을 입력해주세요'),
        templateId: z.string().optional(),
        editorState: editorStateSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const invitation = await db.invitation.create({
          data: {
            title: input.title,
            templateId: input.templateId || 'classic-basic',
            brideName: input.editorState?.weddingInfo.brideName || '',
            groomName: input.editorState?.weddingInfo.groomName || '',
            weddingDate: input.editorState?.weddingInfo.weddingDate 
              ? new Date(input.editorState.weddingInfo.weddingDate) 
              : new Date(),
            weddingTime: new Date('1970-01-01T' + (input.editorState?.weddingInfo.weddingTime || '14:00') + ':00'),
            venueName: input.editorState?.weddingInfo.venue || '',
            venueAddress: input.editorState?.weddingInfo.venueAddress || '',
            userId: ctx.session.user.id,
            invitationCode: generateInvitationCode(),
          },
        });

        return invitation;
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장 생성 중 오류가 발생했습니다.',
        });
      }
    }),

  // Get user's invitations
  getUserInvitations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const invitations = await db.invitation.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
          include: {
            template: {
              select: {
                name: true,
                category: true,
                previewImageUrl: true,
              },
            },
          },
        });

        const total = await db.invitation.count({
          where: {
            userId: ctx.session.user.id,
          },
        });

        return {
          invitations,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장 목록을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  // Get invitation by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const invitation = await db.invitation.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          include: {
            template: true,
          },
        });

        if (!invitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        // Convert the database invitation to editor state format
        const editorState = {
          elements: [], // This would be loaded from a separate table in a real implementation
          weddingInfo: {
            brideName: invitation.brideName,
            groomName: invitation.groomName,
            weddingDate: invitation.weddingDate.toISOString().split('T')[0],
            weddingTime: invitation.weddingTime.toTimeString().slice(0, 5),
            venue: invitation.venueName,
            venueAddress: invitation.venueAddress,
            contact: '',
          },
          templateId: invitation.templateId,
        };

        return {
          ...invitation,
          editorState,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  // Update invitation
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        editorState: editorStateSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const existingInvitation = await db.invitation.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!existingInvitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        const updateData: Record<string, any> = {};
        
        if (input.title) {
          updateData.title = input.title;
        }

        if (input.editorState) {
          updateData.brideName = input.editorState.weddingInfo.brideName;
          updateData.groomName = input.editorState.weddingInfo.groomName;
          updateData.weddingDate = input.editorState.weddingInfo.weddingDate 
            ? new Date(input.editorState.weddingInfo.weddingDate) 
            : new Date();
          updateData.weddingTime = new Date('1970-01-01T' + (input.editorState.weddingInfo.weddingTime || '14:00') + ':00');
          updateData.venueName = input.editorState.weddingInfo.venue;
          updateData.venueAddress = input.editorState.weddingInfo.venueAddress;
        }

        const updatedInvitation = await db.invitation.update({
          where: {
            id: input.id,
          },
          data: updateData,
        });

        return updatedInvitation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장 저장 중 오류가 발생했습니다.',
        });
      }
    }),

  // Delete invitation
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const existingInvitation = await db.invitation.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!existingInvitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        await db.invitation.delete({
          where: {
            id: input.id,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장 삭제 중 오류가 발생했습니다.',
        });
      }
    }),

  // Get public invitation by code (for sharing)
  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      try {
        const invitation = await db.invitation.findUnique({
          where: {
            invitationCode: input.code,
          },
          include: {
            template: true,
          },
        });

        if (!invitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        // Record view
        await db.invitationView.create({
          data: {
            invitationId: invitation.id,
            ipAddress: '',
            userAgent: '',
          },
        });

        // Convert the database invitation to editor state format
        const editorState = {
          elements: [], // This would be loaded from a separate table in a real implementation
          weddingInfo: {
            brideName: invitation.brideName,
            groomName: invitation.groomName,
            weddingDate: invitation.weddingDate.toISOString().split('T')[0],
            weddingTime: invitation.weddingTime.toTimeString().slice(0, 5),
            venue: invitation.venueName,
            venueAddress: invitation.venueAddress,
            contact: '',
          },
          templateId: invitation.templateId,
        };

        return {
          ...invitation,
          editorState,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '청첩장을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  // Update wedding information
  updateWeddingInfo: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        weddingInfo: weddingInfoUpdateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify ownership
        const existingInvitation = await db.invitation.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!existingInvitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        // Prepare update data
        const updateData: Record<string, any> = {};
        
        if (input.weddingInfo.groomName !== undefined) {
          updateData.groomName = input.weddingInfo.groomName;
        }
        if (input.weddingInfo.brideName !== undefined) {
          updateData.brideName = input.weddingInfo.brideName;
        }
        if (input.weddingInfo.weddingDate !== undefined) {
          updateData.weddingDate = new Date(input.weddingInfo.weddingDate);
        }
        if (input.weddingInfo.weddingTime !== undefined) {
          updateData.weddingTime = new Date('1970-01-01T' + input.weddingInfo.weddingTime + ':00');
        }
        if (input.weddingInfo.venueName !== undefined) {
          updateData.venueName = input.weddingInfo.venueName;
        }
        if (input.weddingInfo.venueAddress !== undefined) {
          updateData.venueAddress = input.weddingInfo.venueAddress;
        }
        if (input.weddingInfo.customMessage !== undefined) {
          updateData.customMessage = input.weddingInfo.customMessage;
        }
        if (input.weddingInfo.dressCode !== undefined) {
          updateData.dressCode = input.weddingInfo.dressCode;
        }
        if (input.weddingInfo.parkingInfo !== undefined) {
          updateData.parkingInfo = input.weddingInfo.parkingInfo;
        }
        if (input.weddingInfo.mealInfo !== undefined) {
          updateData.mealInfo = input.weddingInfo.mealInfo;
        }
        if (input.weddingInfo.specialNotes !== undefined) {
          updateData.specialNotes = input.weddingInfo.specialNotes;
        }
        if (input.weddingInfo.rsvpEnabled !== undefined) {
          updateData.rsvpEnabled = input.weddingInfo.rsvpEnabled;
        }
        if (input.weddingInfo.rsvpDeadline !== undefined) {
          updateData.rsvpDeadline = input.weddingInfo.rsvpDeadline 
            ? new Date(input.weddingInfo.rsvpDeadline)
            : null;
        }
        if (input.weddingInfo.backgroundImageUrl !== undefined) {
          updateData.backgroundImageUrl = input.weddingInfo.backgroundImageUrl;
        }

        const updatedInvitation = await db.invitation.update({
          where: {
            id: input.id,
          },
          data: updateData,
        });

        return updatedInvitation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '결혼식 정보 업데이트 중 오류가 발생했습니다.',
        });
      }
    }),

  // Get wedding information
  getWeddingInfo: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const invitation = await db.invitation.findUnique({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });

        if (!invitation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '청첩장을 찾을 수 없습니다.',
          });
        }

        // Convert database fields to wedding info format
        const weddingInfo = {
          groomName: invitation.groomName,
          brideName: invitation.brideName,
          weddingDate: invitation.weddingDate.toISOString().split('T')[0],
          weddingTime: invitation.weddingTime.toTimeString().slice(0, 5),
          venueName: invitation.venueName,
          venueAddress: invitation.venueAddress,
          venueHall: '', // This field doesn't exist in current schema
          groomContact: '', // This field doesn't exist in current schema
          brideContact: '', // This field doesn't exist in current schema
          groomParents: '', // This field doesn't exist in current schema
          brideParents: '', // This field doesn't exist in current schema
          customMessage: invitation.customMessage || '',
          dressCode: invitation.dressCode || '',
          parkingInfo: invitation.parkingInfo || '',
          mealInfo: invitation.mealInfo || '',
          specialNotes: invitation.specialNotes || '',
          rsvpEnabled: invitation.rsvpEnabled,
          rsvpDeadline: invitation.rsvpDeadline?.toISOString().split('T')[0] || '',
          accountInfo: '', // This field doesn't exist in current schema
          backgroundImageUrl: invitation.backgroundImageUrl || '',
        };

        return weddingInfo;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '결혼식 정보 조회 중 오류가 발생했습니다.',
        });
      }
    }),
});

// AIDEV-NOTE: Generate unique 8-character invitation code
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}