'use server';

import { z } from 'zod';
import { actionClient, commonSchemas } from '@/lib/safe-action';
import type { Database } from '@/types/database';

// AIDEV-NOTE: Safe Action implementations for template management with enhanced security
// Provides type-safe template operations with built-in validation and logging

type Template = Database['public']['Tables']['templates']['Row'];

// Template category enum matching database
const templateCategories = ['classic', 'modern', 'romantic', 'minimal'] as const;

// Extended schemas for template operations
const getTemplatesSchema = z.object({
  category: z.enum(templateCategories).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const searchTemplatesSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요.').max(100, '검색어는 100자 이하여야 합니다.'),
  category: z.enum(templateCategories).optional(),
  limit: z.number().min(1).max(50).default(10),
});

/**
 * 템플릿 목록 조회 Safe Action
 * 카테고리별 필터링과 페이지네이션을 지원합니다.
 */
export const getTemplatesAction = actionClient
  .schema(getTemplatesSchema)
  .action(async ({ parsedInput }) => {
    const { category, limit, offset } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 쿼리 빌더 생성
    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' });

    // 카테고리 필터링
    if (category) {
      query = query.eq('category', category);
    }

    // 페이지네이션
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Get templates error:', error);
      throw new Error('템플릿 목록을 불러오는데 실패했습니다.');
    }

    return {
      templates: templates || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  });

/**
 * 특정 템플릿 조회 Safe Action
 * ID로 특정 템플릿의 상세 정보를 조회합니다.
 */
export const getTemplateByIdAction = actionClient
  .schema(commonSchemas.templateId)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('템플릿을 찾을 수 없습니다.');
      }

      console.error('Get template by ID error:', error);
      throw new Error('템플릿 정보를 불러오는데 실패했습니다.');
    }

    return template;
  });

/**
 * 카테고리별 템플릿 개수 조회 Safe Action
 * 각 카테고리별로 몇 개의 템플릿이 있는지 조회합니다.
 */
export const getTemplateCategoriesAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 카테고리별 개수를 한 번에 조회
    const categoryCounts = await Promise.all(
      templateCategories.map(async (category) => {
        const { count, error } = await supabase
          .from('templates')
          .select('*', { count: 'exact', head: true })
          .eq('category', category);

        if (error) {
          console.error(`Error counting templates for category ${category}:`, error);
          return { category, count: 0, displayName: getCategoryDisplayName(category) };
        }

        return {
          category,
          count: count || 0,
          displayName: getCategoryDisplayName(category),
        };
      })
    );

    return categoryCounts.filter(item => item.count > 0); // 템플릿이 있는 카테고리만 반환
  });

/**
 * 인기 템플릿 조회 Safe Action
 * 사용량이 많은 템플릿을 우선으로 조회합니다.
 */
export const getPopularTemplatesAction = actionClient
  .schema(z.object({
    limit: z.number().min(1).max(20).default(6),
  }))
  .action(async ({ parsedInput }) => {
    const { limit } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 사용량 기준으로 정렬 (invitations 테이블과 조인)
    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        *,
        invitations:invitations(count)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get popular templates error:', error);
      throw new Error('인기 템플릿을 불러오는데 실패했습니다.');
    }

    // invitations 필드를 제거하고 Template[] 타입으로 반환
    const cleanTemplates: Template[] = (templates || []).map(template => {
      const { invitations, ...cleanTemplate } = template as any;
      return cleanTemplate;
    });

    return cleanTemplates;
  });

/**
 * 최신 템플릿 조회 Safe Action
 * 최근에 추가된 템플릿을 조회합니다.
 */
export const getLatestTemplatesAction = actionClient
  .schema(z.object({
    limit: z.number().min(1).max(20).default(6),
  }))
  .action(async ({ parsedInput }) => {
    const { limit } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get latest templates error:', error);
      throw new Error('최신 템플릿을 불러오는데 실패했습니다.');
    }

    return templates || [];
  });

/**
 * 템플릿 검색 Safe Action
 * 이름이나 카테고리로 템플릿을 검색합니다.
 */
export const searchTemplatesAction = actionClient
  .schema(searchTemplatesSchema)
  .action(async ({ parsedInput }) => {
    const { query, category, limit } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    let queryBuilder = supabase
      .from('templates')
      .select('*')
      .ilike('name', `%${query.trim()}%`);

    if (category && templateCategories.includes(category)) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data: templates, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Search templates error:', error);
      throw new Error('템플릿 검색 중 오류가 발생했습니다.');
    }

    return {
      templates: templates || [],
      query,
      category,
      resultCount: templates?.length || 0,
    };
  });

/**
 * 템플릿 미리보기 데이터 생성 Safe Action
 * 샘플 데이터로 템플릿을 렌더링할 수 있는 데이터를 생성합니다.
 */
export const generateTemplatePreviewAction = actionClient
  .schema(commonSchemas.templateId)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 템플릿 정보 가져오기
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      throw new Error('템플릿을 찾을 수 없습니다.');
    }

    // 샘플 데이터 생성
    const sampleData = {
      groomName: '김민수',
      brideName: '이지은',
      weddingDate: '2024-10-15',
      weddingTime: '14:00',
      venueName: '롯데호텔 서울 크리스탈볼룸',
      venueAddress: '서울시 중구 을지로 30',
      customMessage: '평생 서로 사랑하며 행복하게 살겠습니다.\n저희의 새로운 시작을 축복해 주세요.',
      rsvpDeadline: '2024-10-01',
    };

    return {
      template,
      sampleData,
      previewId: `preview-${id}-${Date.now()}`,
    };
  });

/**
 * 템플릿 사용 통계 조회 Safe Action (관리자용)
 */
export const getTemplateStatsAction = actionClient
  .schema(commonSchemas.templateId)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 템플릿 사용량 통계
    const [
      { count: totalUsage },
      { count: activeUsage },
    ] = await Promise.all([
      supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', id),
      supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', id)
        .gte('wedding_date', new Date().toISOString().split('T')[0]),
    ]);

    // 월별 사용량 (최근 6개월)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: monthlyUsage } = await supabase
      .from('invitations')
      .select('created_at')
      .eq('template_id', id)
      .gte('created_at', sixMonthsAgo.toISOString());

    // 월별 데이터 집계
    const monthlyStats = (monthlyUsage || []).reduce((acc, invitation) => {
      const month = new Date(invitation.created_at).toISOString().substr(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      templateId: id,
      totalUsage: totalUsage || 0,
      activeUsage: activeUsage || 0,
      monthlyStats,
      popularityRank: await getTemplatePopularityRank(id),
    };
  });

/**
 * 카테고리 표시명 반환 helper 함수
 */
function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    classic: '클래식',
    modern: '모던',
    romantic: '로맨틱',
    minimal: '미니멀',
  };

  return displayNames[category] || category;
}

/**
 * 템플릿 인기도 순위 helper 함수
 */
async function getTemplatePopularityRank(templateId: string): Promise<number> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('templates')
    .select(`
      id,
      invitations:invitations(count)
    `);

  if (!templates) return 0;

  // 사용량 기준으로 정렬하여 순위 계산
  const sorted = templates
    .map(t => ({
      id: t.id,
      usage: (t.invitations as any)?.length || 0,
    }))
    .sort((a, b) => b.usage - a.usage);

  const rank = sorted.findIndex(t => t.id === templateId) + 1;
  return rank;
}

// 편의 함수들
export async function getAllTemplates() {
  return getTemplatesAction({ limit: 100, offset: 0 });
}

export async function getTemplatesByCategory(category: typeof templateCategories[number]) {
  return getTemplatesAction({ category, limit: 20, offset: 0 });
}

export async function searchTemplatesByName(query: string) {
  return searchTemplatesAction({ query, limit: 20 });
}