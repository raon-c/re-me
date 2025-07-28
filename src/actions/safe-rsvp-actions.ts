'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { actionClient, authActionClient, commonSchemas } from '@/lib/safe-action';
import type { Database } from '@/types/database';

// AIDEV-NOTE: Safe Action implementations for RSVP management with enhanced security
// Handles guest responses, attendance tracking, and data export with proper validation

// type RsvpResponse = Database['public']['Tables']['rsvp_responses']['Row']; // 추후 사용 예정
type RsvpResponseInsert = Database['public']['Tables']['rsvp_responses']['Insert'];

// RSVP validation schemas
const createRsvpResponseSchema = z.object({
  invitationId: z.string().uuid('유효하지 않은 청첩장 ID입니다.'),
  guestName: z.string().min(1, '이름을 입력해주세요.').max(100, '이름은 100자 이하여야 합니다.'),
  guestPhone: z.string().max(20, '전화번호가 너무 깁니다.').optional(),
  attendanceStatus: z.enum(['attending', 'not_attending'], {
    message: '참석 여부를 선택해주세요.'
  }),
  adultCount: z.number().min(0, '성인 인원은 0명 이상이어야 합니다.').max(10, '성인 인원은 10명 이하여야 합니다.').default(1),
  childCount: z.number().min(0, '아동 인원은 0명 이상이어야 합니다.').max(10, '아동 인원은 10명 이하여야 합니다.').default(0),
  message: z.string().max(500, '메시지는 500자 이하여야 합니다.').optional(),
});

const updateRsvpResponseSchema = createRsvpResponseSchema.partial().omit({ invitationId: true });

/**
 * RSVP 응답 생성 Safe Action
 */
export const createRsvpResponseAction = actionClient
  .schema(createRsvpResponseSchema)
  .action(async ({ parsedInput }) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 청첩장 존재 여부 및 RSVP 활성화 상태 확인
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, rsvp_enabled, rsvp_deadline')
      .eq('id', parsedInput.invitationId)
      .single();

    if (invitationError || !invitation) {
      throw new Error('유효하지 않은 청첩장입니다.');
    }

    if (!invitation.rsvp_enabled) {
      throw new Error('이 청첩장은 RSVP 응답을 받지 않습니다.');
    }

    // RSVP 마감일 확인
    if (invitation.rsvp_deadline) {
      const deadline = new Date(invitation.rsvp_deadline);
      const now = new Date();
      
      if (now > deadline) {
        throw new Error('RSVP 응답 기간이 마감되었습니다.');
      }
    }

    // 중복 응답 확인
    const { data: existingResponse } = await supabase
      .from('rsvp_responses')
      .select('id')
      .eq('invitation_id', parsedInput.invitationId)
      .eq('guest_name', parsedInput.guestName)
      .single();

    if (existingResponse) {
      throw new Error('이미 응답하셨습니다. 수정을 원하시면 기존 응답을 삭제 후 다시 작성해주세요.');
    }

    // RSVP 응답 데이터 준비
    const rsvpData: RsvpResponseInsert = {
      invitation_id: parsedInput.invitationId,
      guest_name: parsedInput.guestName,
      guest_phone: parsedInput.guestPhone,
      attendance_status: parsedInput.attendanceStatus,
      adult_count: parsedInput.adultCount,
      child_count: parsedInput.childCount,
      message: parsedInput.message,
    };

    const { data: rsvpResponse, error } = await supabase
      .from('rsvp_responses')
      .insert(rsvpData)
      .select()
      .single();

    if (error) {
      console.error('Create RSVP response error:', error);
      throw new Error('RSVP 응답 등록 중 오류가 발생했습니다.');
    }

    revalidatePath(`/invitation/*`);

    return {
      message: 'RSVP 응답이 성공적으로 등록되었습니다.',
      response: rsvpResponse,
    };
  });

/**
 * 청첩장의 모든 RSVP 응답 조회 Safe Action (청첩장 소유자용)
 */
export const getInvitationRsvpResponsesAction = authActionClient
  .schema(z.object({
    invitationId: z.string().uuid(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
  }))
  .action(async ({ parsedInput, ctx }) => {
    const { invitationId, page, limit } = parsedInput;
    const offset = (page - 1) * limit;

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

    const [
      { data: rsvpResponses, error: responsesError },
      { count: total, error: countError }
    ] = await Promise.all([
      ctx.supabase
        .from('rsvp_responses')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1),
      ctx.supabase
        .from('rsvp_responses')
        .select('*', { count: 'exact', head: true })
        .eq('invitation_id', invitationId)
    ]);

    if (responsesError || countError) {
      console.error('Get invitation RSVP responses error:', responsesError || countError);
      throw new Error('RSVP 응답 목록을 불러오는데 실패했습니다.');
    }

    return {
      responses: rsvpResponses || [],
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
 * RSVP 응답 업데이트 Safe Action (게스트용)
 */
export const updateRsvpResponseAction = actionClient
  .schema(z.object({
    id: z.string().uuid(),
    data: updateRsvpResponseSchema,
  }))
  .action(async ({ parsedInput }) => {
    const { id, data: input } = parsedInput;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 기존 RSVP 응답 확인
    const { data: existingResponse, error: fetchError } = await supabase
      .from('rsvp_responses')
      .select('*, invitation:invitations(rsvp_deadline)')
      .eq('id', id)
      .single();

    if (fetchError || !existingResponse) {
      throw new Error('RSVP 응답을 찾을 수 없습니다.');
    }

    // RSVP 마감일 확인
    const invitation = existingResponse.invitation as any;
    if (invitation?.rsvp_deadline) {
      const deadline = new Date(invitation.rsvp_deadline);
      const now = new Date();
      
      if (now > deadline) {
        throw new Error('RSVP 응답 수정 기간이 마감되었습니다.');
      }
    }

    // 업데이트 데이터 준비
    const updateData: Partial<RsvpResponseInsert> = {};
    
    if (input.guestName !== undefined) updateData.guest_name = input.guestName;
    if (input.guestPhone !== undefined) updateData.guest_phone = input.guestPhone;
    if (input.attendanceStatus !== undefined) updateData.attendance_status = input.attendanceStatus;
    if (input.adultCount !== undefined) updateData.adult_count = input.adultCount;
    if (input.childCount !== undefined) updateData.child_count = input.childCount;
    if (input.message !== undefined) updateData.message = input.message;

    const { data: rsvpResponse, error } = await supabase
      .from('rsvp_responses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update RSVP response error:', error);
      throw new Error('RSVP 응답 수정 중 오류가 발생했습니다.');
    }

    revalidatePath(`/invitation/*`);

    return {
      message: 'RSVP 응답이 성공적으로 수정되었습니다.',
      response: rsvpResponse,
    };
  });

/**
 * RSVP 응답 삭제 Safe Action (청첩장 소유자용)
 */
export const deleteRsvpResponseAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // RSVP 응답 정보와 청첩장 정보를 함께 조회
    const { data: rsvpResponse, error: fetchError } = await ctx.supabase
      .from('rsvp_responses')
      .select(`
        *,
        invitation:invitations(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !rsvpResponse) {
      throw new Error('RSVP 응답을 찾을 수 없습니다.');
    }

    // 삭제 권한 확인: 청첩장 소유자만 삭제 가능
    const invitation = rsvpResponse.invitation as any;
    if (invitation?.user_id !== ctx.user.id) {
      throw new Error('RSVP 응답을 삭제할 권한이 없습니다.');
    }

    const { error } = await ctx.supabase
      .from('rsvp_responses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete RSVP response error:', error);
      throw new Error('RSVP 응답 삭제 중 오류가 발생했습니다.');
    }

    revalidatePath(`/invitation/*`);

    return {
      message: 'RSVP 응답이 성공적으로 삭제되었습니다.',
      deletedId: id,
    };
  });

/**
 * 청첩장의 RSVP 통계 조회 Safe Action
 */
export const getRsvpStatsAction = authActionClient
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

    // 통계 데이터 조회
    const { data: responses, error } = await ctx.supabase
      .from('rsvp_responses')
      .select('attendance_status, adult_count, child_count')
      .eq('invitation_id', invitationId);

    if (error) {
      console.error('Get RSVP stats error:', error);
      throw new Error('RSVP 통계 조회 중 오류가 발생했습니다.');
    }

    const stats = (responses || []).reduce(
      (acc, response) => {
        acc.totalResponses += 1;
        acc.totalAdults += response.adult_count;
        acc.totalChildren += response.child_count;

        if (response.attendance_status === 'attending') {
          acc.attendingCount += 1;
          acc.attendingAdults += response.adult_count;
          acc.attendingChildren += response.child_count;
        } else {
          acc.notAttendingCount += 1;
        }

        return acc;
      },
      {
        totalResponses: 0,
        attendingCount: 0,
        notAttendingCount: 0,
        totalAdults: 0,
        totalChildren: 0,
        attendingAdults: 0,
        attendingChildren: 0,
      }
    );

    return {
      invitationId,
      ...stats,
      attendanceRate: stats.totalResponses ? Math.round((stats.attendingCount / stats.totalResponses) * 100) : 0,
      lastUpdated: new Date().toISOString(),
    };
  });

/**
 * RSVP 데이터 CSV 내보내기 Safe Action
 */
export const exportRsvpDataAction = authActionClient
  .schema(commonSchemas.id)
  .action(async ({ parsedInput, ctx }) => {
    const { id: invitationId } = parsedInput;

    // 청첩장 소유권 확인
    const { data: invitation } = await ctx.supabase
      .from('invitations')
      .select('id, title')
      .eq('id', invitationId)
      .eq('user_id', ctx.user.id)
      .single();

    if (!invitation) {
      throw new Error('청첩장을 찾을 수 없거나 접근 권한이 없습니다.');
    }

    // RSVP 응답 데이터 조회
    const { data: responses, error } = await ctx.supabase
      .from('rsvp_responses')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Export RSVP data error:', error);
      throw new Error('RSVP 데이터 내보내기 중 오류가 발생했습니다.');
    }

    // CSV 헤더 생성
    const headers = ['이름', '전화번호', '참석여부', '성인인원', '아동인원', '축하메시지', '응답일시'];

    // CSV 데이터 생성
    const csvRows = [headers.join(',')];

    (responses || []).forEach(response => {
      const row = [
        response.guest_name || '',
        response.guest_phone || '',
        response.attendance_status === 'attending' ? '참석' : '불참',
        response.adult_count.toString(),
        response.child_count.toString(),
        (response.message || '').replace(/,/g, '，').replace(/\n/g, ' '),
        new Date(response.submitted_at).toLocaleString('ko-KR'),
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    return {
      message: 'RSVP 데이터가 성공적으로 생성되었습니다.',
      csvData: csvContent,
      fileName: `rsvp_${invitation.title}_${new Date().toISOString().split('T')[0]}.csv`,
      recordCount: responses?.length || 0,
    };
  });

// 편의 함수들
export async function createRsvpResponse(data: z.infer<typeof createRsvpResponseSchema>) {
  return createRsvpResponseAction(data);
}

export async function getRsvpResponsesForInvitation(invitationId: string, page: number = 1) {
  return getInvitationRsvpResponsesAction({ invitationId, page, limit: 50 });
}

export async function updateRsvpResponse(id: string, data: z.infer<typeof updateRsvpResponseSchema>) {
  return updateRsvpResponseAction({ id, data });
}