import { z } from 'zod';

// AIDEV-NOTE: 결혼식 정보 폼 검증 스키마 - 한국어 메시지 포함
export const weddingInfoSchema = z.object({
  // 신랑/신부 정보
  groomName: z
    .string()
    .min(2, '신랑 이름은 2자 이상이어야 합니다.')
    .max(20, '신랑 이름은 20자 이하여야 합니다.')
    .regex(/^[가-힣a-zA-Z\s]+$/, '신랑 이름은 한글 또는 영문만 입력 가능합니다.'),
  
  brideName: z
    .string()
    .min(2, '신부 이름은 2자 이상이어야 합니다.')
    .max(20, '신부 이름은 20자 이하여야 합니다.')
    .regex(/^[가-힣a-zA-Z\s]+$/, '신부 이름은 한글 또는 영문만 입력 가능합니다.'),

  // 결혼식 날짜 및 시간
  weddingDate: z
    .string()
    .min(1, '결혼식 날짜를 선택해주세요.')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, '결혼식 날짜는 오늘 이후여야 합니다.'),

  weddingTime: z
    .string()
    .min(1, '결혼식 시간을 선택해주세요.')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식을 입력해주세요.'),

  // 예식장 정보
  venueName: z
    .string()
    .min(2, '예식장 이름은 2자 이상이어야 합니다.')
    .max(100, '예식장 이름은 100자 이하여야 합니다.'),

  venueAddress: z
    .string()
    .min(5, '예식장 주소는 5자 이상이어야 합니다.')
    .max(200, '예식장 주소는 200자 이하여야 합니다.'),

  venueHall: z
    .string()
    .max(50, '홀 이름은 50자 이하여야 합니다.')
    .optional(),

  // 연락처 정보
  groomContact: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 휴대폰 번호를 입력해주세요.')
    .optional()
    .or(z.literal('')),

  brideContact: z
    .string()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 휴대폰 번호를 입력해주세요.')
    .optional()
    .or(z.literal('')),

  // 부모님 정보
  groomParents: z
    .string()
    .max(100, '신랑 부모님 이름은 100자 이하여야 합니다.')
    .optional(),

  brideParents: z
    .string()
    .max(100, '신부 부모님 이름은 100자 이하여야 합니다.')
    .optional(),

  // 추가 정보
  customMessage: z
    .string()
    .max(500, '사용자 메시지는 500자 이하여야 합니다.')
    .optional(),

  dressCode: z
    .string()
    .max(100, '드레스코드는 100자 이하여야 합니다.')
    .optional(),

  parkingInfo: z
    .string()
    .max(200, '주차 안내는 200자 이하여야 합니다.')
    .optional(),

  mealInfo: z
    .string()
    .max(200, '식사 정보는 200자 이하여야 합니다.')
    .optional(),

  specialNotes: z
    .string()
    .max(300, '특별 안내사항은 300자 이하여야 합니다.')
    .optional(),

  // RSVP 설정
  rsvpEnabled: z.boolean().default(true),
  
  rsvpDeadline: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const deadline = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deadline >= today;
    }, 'RSVP 마감일은 오늘 이후여야 합니다.'),

  // 계좌 정보 (축의금 안내)
  accountInfo: z
    .string()
    .max(300, '계좌 정보는 300자 이하여야 합니다.')
    .optional(),

  // 배경 이미지
  backgroundImageUrl: z
    .string()
    .url('올바른 URL 형식이어야 합니다.')
    .optional()
    .or(z.literal('')),
});

// 부분 업데이트를 위한 스키마
export const weddingInfoUpdateSchema = weddingInfoSchema.partial();

// 타입 정의
export type WeddingInfoFormData = z.infer<typeof weddingInfoSchema>;
export type WeddingInfoUpdateData = z.infer<typeof weddingInfoUpdateSchema>;

// 폼 필드 그룹별 스키마
export const basicInfoSchema = weddingInfoSchema.pick({
  groomName: true,
  brideName: true,
  weddingDate: true,
  weddingTime: true,
  venueName: true,
  venueAddress: true,
  venueHall: true,
});

export const contactInfoSchema = weddingInfoSchema.pick({
  groomContact: true,
  brideContact: true,
  groomParents: true,
  brideParents: true,
});

export const additionalInfoSchema = weddingInfoSchema.pick({
  customMessage: true,
  dressCode: true,
  parkingInfo: true,
  mealInfo: true,
  specialNotes: true,
  accountInfo: true,
  backgroundImageUrl: true,
});

export const rsvpSettingsSchema = weddingInfoSchema.pick({
  rsvpEnabled: true,
  rsvpDeadline: true,
});

// 타입 정의
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type ContactInfoData = z.infer<typeof contactInfoSchema>;
export type AdditionalInfoData = z.infer<typeof additionalInfoSchema>;
export type RsvpSettingsData = z.infer<typeof rsvpSettingsSchema>;

// 폼 필드 설정
export const FORM_FIELD_CONFIG = {
  groomName: {
    label: '신랑 이름',
    placeholder: '홍길동',
    required: true,
    type: 'text' as const,
  },
  brideName: {
    label: '신부 이름',
    placeholder: '김영희',
    required: true,
    type: 'text' as const,
  },
  weddingDate: {
    label: '결혼식 날짜',
    placeholder: '',
    required: true,
    type: 'date' as const,
  },
  weddingTime: {
    label: '결혼식 시간',
    placeholder: '14:00',
    required: true,
    type: 'time' as const,
  },
  venueName: {
    label: '예식장 이름',
    placeholder: '롯데호텔 웨딩홀',
    required: true,
    type: 'text' as const,
  },
  venueAddress: {
    label: '예식장 주소',
    placeholder: '서울시 중구 소공동 30',
    required: true,
    type: 'text' as const,
  },
  venueHall: {
    label: '홀 이름',
    placeholder: '크리스탈 볼룸',
    required: false,
    type: 'text' as const,
  },
  groomContact: {
    label: '신랑 연락처',
    placeholder: '010-1234-5678',
    required: false,
    type: 'tel' as const,
  },
  brideContact: {
    label: '신부 연락처',
    placeholder: '010-1234-5678',
    required: false,
    type: 'tel' as const,
  },
  groomParents: {
    label: '신랑 부모님',
    placeholder: '홍철수 • 김영자',
    required: false,
    type: 'text' as const,
  },
  brideParents: {
    label: '신부 부모님',
    placeholder: '김철수 • 이영자',
    required: false,
    type: 'text' as const,
  },
  customMessage: {
    label: '사용자 메시지',
    placeholder: '저희 두 사람의 소중한 순간에 함께해 주세요.',
    required: false,
    type: 'textarea' as const,
  },
  dressCode: {
    label: '드레스코드',
    placeholder: '정장 착용',
    required: false,
    type: 'text' as const,
  },
  parkingInfo: {
    label: '주차 안내',
    placeholder: '지하 1층 주차장 이용 가능',
    required: false,
    type: 'textarea' as const,
  },
  mealInfo: {
    label: '식사 정보',
    placeholder: '뷔페 식사 제공',
    required: false,
    type: 'text' as const,
  },
  specialNotes: {
    label: '특별 안내사항',
    placeholder: '코로나19 방역 수칙을 준수해주세요.',
    required: false,
    type: 'textarea' as const,
  },
  rsvpEnabled: {
    label: 'RSVP 기능 활성화',
    placeholder: '',
    required: false,
    type: 'checkbox' as const,
  },
  rsvpDeadline: {
    label: 'RSVP 마감일',
    placeholder: '',
    required: false,
    type: 'date' as const,
  },
  accountInfo: {
    label: '계좌 정보',
    placeholder: '신한은행 110-123-456789 홍길동',
    required: false,
    type: 'textarea' as const,
  },
  backgroundImageUrl: {
    label: '배경 이미지',
    placeholder: 'https://example.com/image.jpg',
    required: false,
    type: 'url' as const,
  },
} as const;

// 유틸리티 함수
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시${minutes !== '00' ? ` ${minutes}분` : ''}`;
};