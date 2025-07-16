import { z } from 'zod';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc';
import { db } from '@/lib/db';
import {
  templateCategorySchema,
  createTemplateSchema,
  updateTemplateSchema,
  templateRenderDataSchema,
} from '@/lib/validations';
import type {
  TemplateRenderDataInput,
} from '@/lib/validations';

// AIDEV-NOTE: Template tRPC router with rendering engine and Korean UX

export const templateRouter = createTRPCRouter({
  // Get all templates
  getAll: publicProcedure.query(async () => {
    const templates = await db.template.findMany({
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });

    return templates;
  }),

  // Get templates by category
  getByCategory: publicProcedure
    .input(
      z.object({
        category: templateCategorySchema,
      })
    )
    .query(async ({ input }) => {
      const templates = await db.template.findMany({
        where: {
          category: input.category,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return templates;
    }),

  // Get template by ID
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, '템플릿 ID는 필수입니다.'),
      })
    )
    .query(async ({ input }) => {
      const template = await db.template.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!template) {
        throw new Error('템플릿을 찾을 수 없습니다.');
      }

      return template;
    }),

  // Get template categories with counts
  getCategoriesWithCounts: publicProcedure.query(async () => {
    const categoryCounts = await db.template.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return categoryCounts.map((item) => ({
      category: item.category,
      count: item._count.id,
    }));
  }),

  // Create template (protected - admin only in real app)
  create: protectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ input }) => {
      // Generate unique ID based on name and timestamp
      const id = `${input.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const template = await db.template.create({
        data: {
          id,
          name: input.name,
          category: input.category,
          previewImageUrl: input.previewImageUrl,
          cssStyles: input.cssStyles, // Prisma JSON type
          htmlStructure: input.htmlStructure,
        },
      });

      return template;
    }),

  // Update template (protected - admin only in real app)
  update: protectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      // Handle JSON type for cssStyles
      const processedUpdateData = {
        ...updateData,
        ...(updateData.cssStyles && { cssStyles: updateData.cssStyles }),
      };

      const template = await db.template.update({
        where: {
          id,
        },
        data: processedUpdateData,
      });

      return template;
    }),

  // Delete template (protected - admin only in real app)
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, '템플릿 ID는 필수입니다.'),
      })
    )
    .mutation(async ({ input }) => {
      // Check if template is being used by any invitations
      const invitationCount = await db.invitation.count({
        where: {
          templateId: input.id,
        },
      });

      if (invitationCount > 0) {
        throw new Error(
          '이 템플릿을 사용하는 청첩장이 있어 삭제할 수 없습니다.'
        );
      }

      await db.template.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  // Render template with data (template rendering engine)
  render: publicProcedure
    .input(
      z.object({
        templateId: z.string().min(1, '템플릿 ID는 필수입니다.'),
        data: templateRenderDataSchema,
      })
    )
    .query(async ({ input }) => {
      const template = await db.template.findUnique({
        where: {
          id: input.templateId,
        },
      });

      if (!template) {
        throw new Error('템플릿을 찾을 수 없습니다.');
      }

      // Template rendering engine - replace placeholders with actual data
      const renderedHtml = renderTemplate(template.htmlStructure, input.data);

      return {
        ...template,
        renderedHtml,
      };
    }),

  // Preview template with sample data
  preview: publicProcedure
    .input(
      z.object({
        templateId: z.string().min(1, '템플릿 ID는 필수입니다.'),
      })
    )
    .query(async ({ input }) => {
      const template = await db.template.findUnique({
        where: {
          id: input.templateId,
        },
      });

      if (!template) {
        throw new Error('템플릿을 찾을 수 없습니다.');
      }

      // Sample data for preview
      const sampleData: TemplateRenderDataInput = {
        groomName: '김철수',
        brideName: '이영희',
        weddingDate: '2024년 12월 25일',
        weddingTime: '오후 2시',
        venueName: '그랜드 웨딩홀',
        venueAddress: '서울시 강남구 테헤란로 123',
        customMessage: '저희 두 사람의 소중한 순간에 함께해 주세요.',
        dressCode: '정장',
        parkingInfo: '지하 1층 주차장 이용 가능',
        mealInfo: '식사 제공',
        specialNotes: '축하의 마음만 받겠습니다.',
      };

      const renderedHtml = renderTemplate(template.htmlStructure, sampleData);

      return {
        ...template,
        renderedHtml,
        sampleData,
      };
    }),
});

/**
 * Template rendering engine
 * Replaces placeholders in HTML structure with actual data
 */
function renderTemplate(
  htmlStructure: string,
  data: TemplateRenderDataInput
): string {
  let rendered = htmlStructure;

  // Define placeholder mappings
  const placeholders: Record<string, string> = {
    '{{groomName}}': data.groomName || '',
    '{{brideName}}': data.brideName || '',
    '{{weddingDate}}': data.weddingDate || '',
    '{{weddingTime}}': data.weddingTime || '',
    '{{venueName}}': data.venueName || '',
    '{{venueAddress}}': data.venueAddress || '',
    '{{customMessage}}': data.customMessage || '',
    '{{dressCode}}': data.dressCode || '',
    '{{parkingInfo}}': data.parkingInfo || '',
    '{{mealInfo}}': data.mealInfo || '',
    '{{specialNotes}}': data.specialNotes || '',
    '{{backgroundImageUrl}}': data.backgroundImageUrl || '',
  };

  // Replace all placeholders
  Object.entries(placeholders).forEach(([placeholder, value]) => {
    rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
  });

  // Handle conditional sections
  rendered = handleConditionalSections(rendered, data);

  return rendered;
}

/**
 * Handle conditional sections in templates
 * Supports {{#if field}}...{{/if}} syntax
 */
function handleConditionalSections(
  html: string,
  data: TemplateRenderDataInput
): string {
  let rendered = html;

  // Handle {{#if field}}...{{/if}} blocks
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

  rendered = rendered.replace(conditionalRegex, (match, fieldName, content) => {
    const fieldValue = data[fieldName as keyof TemplateRenderDataInput];
    return fieldValue ? content : '';
  });

  // Handle {{#unless field}}...{{/unless}} blocks
  const unlessRegex = /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;

  rendered = rendered.replace(unlessRegex, (match, fieldName, content) => {
    const fieldValue = data[fieldName as keyof TemplateRenderDataInput];
    return !fieldValue ? content : '';
  });

  return rendered;
}
