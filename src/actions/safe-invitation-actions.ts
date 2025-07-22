'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { actionClient, authActionClient, commonSchemas } from '@/lib/safe-action';
import type { Database } from '@/types/database';

// AIDEV-NOTE: Safe Action implementations for invitation management with enhanced security
// Handles CRUD operations for wedding invitations with proper authentication and validation

type Invitation = Database['public']['Tables']['invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];
type InvitationUpdate = Database['public']['Tables']['invitations']['Update'];

// Validation schemas
const createInvitationSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(200, '제목은 200자 이하여야 합니다.'),
  groomName: z.string().min(1, '신랑 이름을 입력해주세요.').max(100, '이름은 100자 이하여야 합니다.'),
  brideName: z.string().min(1, '신부 이름을 입력해주세요.').max(100, '이름은 100자 이하여야 합니다.'),
  weddingDate: z.string().refine((date) => !isNaN(Date.parse(date)), '올바른 날짜를 입력해주세요.'),
  weddingTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), '올바른 시간을 입력해주세요.'),
  venueName: z.string().min(1, '예식장 이름을 입력해주세요.').max(200, '예식장 이름은 200자 이하여야 합니다.'),
  venueAddress: z.string().min(1, '예식장 주소를 입력해주세요.'),
  venueLat: z.number().optional(),
  venueLng: z.number().optional(),
  templateId: z.string().min(1, '템플릿을 선택해주세요.'),
  customMessage: z.string().max(1000, '메시지는 1000자 이하여야 합니다.').optional(),
  dressCode: z.string().max(100, '드레스 코드는 100자 이하여야 합니다.').optional(),
  parkingInfo: z.string().max(500, '주차 정보는 500자 이하여야 합니다.').optional(),
  mealInfo: z.string().max(500, '식사 정보는 500자 이하여야 합니다.').optional(),
  specialNotes: z.string().max(1000, '특별 안내는 1000자 이하여야 합니다.').optional(),
  rsvpEnabled: z.boolean().default(true),
  rsvpDeadline: z.string().optional(),
  backgroundImageUrl: z.string().max(500, 'URL이 너무 깁니다.').optional(),
});

const updateInvitationSchema = createInvitationSchema.partial();

/**
 * 초대 코드 생성 helper 함수
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 청첩장 생성 Safe Action
 */
export const createInvitationAction = authActionClient
  .schema(createInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 고유한 초대 코드 생성
    let invitationCode: string;
    let isUnique = false;
    let attempts = 0;

    do {
      invitationCode = generateInvitationCode();
      const { data: existing } = await ctx.supabase
        .from('invitations')
        .select('id')
        .eq('invitation_code', invitationCode)
        .single();

      isUnique = !existing;
      attempts++;
    } while (!isUnique && attempts < 10);

    if (!isUnique) {
      throw new Error('초대 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }

    // 청첩장 데이터 준비
    const invitationData: InvitationInsert = {
      ...parsedInput,
      user_id: ctx.user.id,
      invitation_code: invitationCode!,
      groom_name: parsedInput.groomName,
      bride_name: parsedInput.brideName,
      wedding_date: parsedInput.weddingDate,
      wedding_time: parsedInput.weddingTime,
      venue_name: parsedInput.venueName,
      venue_address: parsedInput.venueAddress,
      venue_lat: parsedInput.venueLat,
      venue_lng: parsedInput.venueLng,
      template_id: parsedInput.templateId,
      custom_message: parsedInput.customMessage,
      dress_code: parsedInput.dressCode,
      parking_info: parsedInput.parkingInfo,
      meal_info: parsedInput.mealInfo,
      special_notes: parsedInput.specialNotes,
      rsvp_enabled: parsedInput.rsvpEnabled,
      rsvp_deadline: parsedInput.rsvpDeadline,
      background_image_url: parsedInput.backgroundImageUrl,
    };

    const { data: invitation, error } = await ctx.supabase
      .from('invitations')
      .insert(invitationData)
      .select()
      .single();

    if (error) {
      console.error('Create invitation error:', error);
      throw new Error('청첩장 생성 중 오류가 발생했습니다.');
    }

    revalidatePath('/dashboard');

    return {
      message: '청첩장이 성공적으로 생성되었습니다.',
      invitation,
      invitationCode: invitationCode!,
    };
  });

/**
 * 사용자의 청첩장 목록 조회 Safe Action
 */
export const getUserInvitationsAction = authActionClient
  .schema(z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(10),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { page, limit } = parsedInput;
    const offset = (page - 1) * limit;

    const [
      { data: invitations, error: invitationsError },
      { count: total, error: countError }
    ] = await Promise.all([
      ctx.supabase
        .from('invitations')
        .select('*')
        .eq('user_id', ctx.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      ctx.supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', ctx.user.id)
    ]);

    if (invitationsError || countError) {
      console.error('Get user invitations error:', invitationsError || countError);
      throw new Error('청첩장 목록을 불러오는데 실패했습니다.');
    }

    return {
      invitations: invitations || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
        hasNext: (total || 0) > offset + limit,
        hasPrev: page > 1,
      },
    };
  });

/**
 * 특정 청첩장 조회 (사용자 소유) Safe Action
 */
export const getInvitationByIdAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    const { data: invitation, error } = await ctx.supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .eq('user_id', ctx.user.id) // 사용자 소유 청첩장만 조회
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('청첩장을 찾을 수 없습니다.');
      }

      console.error('Get invitation by ID error:', error);
      throw new Error('청첩장 정보를 불러오는데 실패했습니다.');
    }

    return invitation;
  });

/**
 * 초대 코드로 청첩장 조회 (공개) Safe Action
 */
export const getInvitationByCodeAction = actionClient
  .schema(commonSchemas.invitationCode)
  .action(async ({ parsedInput }) => {
    const { code } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 초대 코드로 청첩장 조회 (템플릿 정보 포함)
    const { data: invitation, error } = await supabase
      .from('invitations')
      .select(`
        *,
        template:templates(*)
      `)
      .eq('invitation_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('유효하지 않은 초대 코드입니다.');
      }

      console.error('Get invitation by code error:', error);
      throw new Error('청첩장 정보를 불러오는데 실패했습니다.');
    }

    // 조회수 기록 (비동기로 처리하여 응답 속도에 영향 없도록)
    recordInvitationView(invitation.id).catch(console.error);

    return invitation as Invitation & { template: Database['public']['Tables']['templates']['Row'] };
  });

/**
 * 청첩장 업데이트 Safe Action
 */
export const updateInvitationAction = authActionClient
  .schema(z.object({
    id: z.string().uuid(),
    data: updateInvitationSchema,
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { id, data: input } = parsedInput;

    // 업데이트 데이터 준비 (camelCase → snake_case)
    const updateData: InvitationUpdate = {};
    
    if (input.title !== undefined) updateData.title = input.title;
    if (input.groomName !== undefined) updateData.groom_name = input.groomName;
    if (input.brideName !== undefined) updateData.bride_name = input.brideName;
    if (input.weddingDate !== undefined) updateData.wedding_date = input.weddingDate;
    if (input.weddingTime !== undefined) updateData.wedding_time = input.weddingTime;
    if (input.venueName !== undefined) updateData.venue_name = input.venueName;
    if (input.venueAddress !== undefined) updateData.venue_address = input.venueAddress;
    if (input.venueLat !== undefined) updateData.venue_lat = input.venueLat;
    if (input.venueLng !== undefined) updateData.venue_lng = input.venueLng;
    if (input.templateId !== undefined) updateData.template_id = input.templateId;
    if (input.customMessage !== undefined) updateData.custom_message = input.customMessage;
    if (input.dressCode !== undefined) updateData.dress_code = input.dressCode;
    if (input.parkingInfo !== undefined) updateData.parking_info = input.parkingInfo;
    if (input.mealInfo !== undefined) updateData.meal_info = input.mealInfo;
    if (input.specialNotes !== undefined) updateData.special_notes = input.specialNotes;
    if (input.rsvpEnabled !== undefined) updateData.rsvp_enabled = input.rsvpEnabled;
    if (input.rsvpDeadline !== undefined) updateData.rsvp_deadline = input.rsvpDeadline;
    if (input.backgroundImageUrl !== undefined) updateData.background_image_url = input.backgroundImageUrl;

    const { data: invitation, error } = await ctx.supabase
      .from('invitations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', ctx.user.id) // 사용자 소유 청첩장만 업데이트
      .select()
      .single();

    if (error) {
      console.error('Update invitation error:', error);
      throw new Error('청첩장 업데이트 중 오류가 발생했습니다.');
    }

    if (!invitation) {
      throw new Error('청첩장을 찾을 수 없거나 수정 권한이 없습니다.');
    }

    revalidatePath('/dashboard');
    revalidatePath(`/invitation/${id}`);

    return {
      message: '청첩장이 성공적으로 업데이트되었습니다.',
      invitation,
    };
  });

/**
 * 청첩장 삭제 Safe Action
 */
export const deleteInvitationAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    const { error } = await ctx.supabase
      .from('invitations')
      .delete()
      .eq('id', id)
      .eq('user_id', ctx.user.id); // 사용자 소유 청첩장만 삭제

    if (error) {
      console.error('Delete invitation error:', error);
      throw new Error('청첩장 삭제 중 오류가 발생했습니다.');
    }

    revalidatePath('/dashboard');

    return {
      message: '청첩장이 성공적으로 삭제되었습니다.',
      deletedId: id,
    };
  });

/**
 * 청첩장 통계 조회 Safe Action
 */
export const getInvitationStatsAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id: invitationId } = parsedInput;

    // 청첩장 소유권 확인
    const { data: invitation } = await ctx.supabase
      .from('invitations')
      .select('id')
      .eq('id', invitationId)
      .eq('user_id', ctx.user.id)
      .single();

    if (!invitation) {
      throw new Error('청첩장을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // 통계 데이터 병렬 조회
    const [
      { count: viewCount },
      { count: rsvpCount },
      { count: attendingCount },
      { count: notAttendingCount },
    ] = await Promise.all([
      ctx.supabase
        .from('invitation_views')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_id', invitationId),
      ctx.supabase
        .from('rsvp_responses')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_id', invitationId),
      ctx.supabase
        .from('rsvp_responses')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_id', invitationId)
        .eq('attendance_status', 'attending'),
      ctx.supabase
        .from('rsvp_responses')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_id', invitationId)
        .eq('attendance_status', 'not_attending'),
    ]);

    // 최근 7일간 일별 조회수
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentViews } = await ctx.supabase
      .from('invitation_views')
      .select('viewed_at')
      .eq('invitation_id', invitationId)
      .gte('viewed_at', sevenDaysAgo.toISOString());

    // 일별 조회수 집계
    const dailyViews = (recentViews || []).reduce((acc, view) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      invitationId,
      viewCount: viewCount || 0,
      rsvpCount: rsvpCount || 0,
      attendingCount: attendingCount || 0,
      notAttendingCount: notAttendingCount || 0,
      attendanceRate: rsvpCount ? Math.round((attendingCount || 0) / rsvpCount * 100) : 0,
      dailyViews,
      lastUpdated: new Date().toISOString(),
    };
  });

/**
 * 청첩장 공유 링크 생성 Safe Action
 */
export const generateShareLinkAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // 청첩장 소유권 확인 및 초대 코드 조회
    const { data: invitation, error } = await ctx.supabase
      .from('invitations')
      .select('invitation_code, title, groom_name, bride_name, wedding_date')
      .eq('id', id)
      .eq('user_id', ctx.user.id)
      .single();

    if (error || !invitation) {
      throw new Error('청첩장을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/invitation/${invitation.invitation_code}`;

    return {
      shareUrl,
      invitationCode: invitation.invitation_code,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`,
      socialShareUrls: {
        kakao: `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${invitation.groom_name}♥${invitation.bride_name}의 결혼식에 초대합니다`)}`,
        line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`,
      },
      invitation: {
        title: invitation.title,
        groomName: invitation.groom_name,
        brideName: invitation.bride_name,
        weddingDate: invitation.wedding_date,
      },
    };
  });

/**
 * 조회수 기록 helper 함수 (비동기)
 */
async function recordInvitationView(invitationId: string): Promise<void> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    await supabase
      .from('invitation_views')
      .insert({
        invitation_id: invitationId,
        viewed_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Record invitation view error:', error);
  }
}

// 편의 함수들
export async function getInvitationByCodePublic(code: string) {
  return getInvitationByCodeAction({ code });
}

export async function getUserInvitationsPaginated(userId: string, page: number = 1, limit: number = 10) {
  return getUserInvitationsAction({ page, limit });
}

export async function generateInvitationShareLinks(invitationId: string) {
  return generateShareLinkAction({ id: invitationId });
}