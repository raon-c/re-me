import { z } from 'zod';

// AIDEV-NOTE: Korean-friendly validation schemas with strong security requirements
// Auth validation schemas
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 주소를 입력해주세요.'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
    ),
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(100, '이름은 최대 100자까지 입력 가능합니다.'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 주소를 입력해주세요.'),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
    ),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .max(100, '이름은 최대 100자까지 입력 가능합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.').optional(),
});

// Social login schema
export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'kakao'], {
    message: '지원하지 않는 소셜 로그인 제공자입니다.',
  }),
  redirectTo: z.string().url('올바른 URL을 입력해주세요.').optional(),
});

// Template validation schemas
export const templateCategorySchema = z.enum(
  ['classic', 'modern', 'romantic', 'minimal'],
  {
    message: '올바른 템플릿 카테고리를 선택해주세요.',
  }
);

export const templateSchema = z.object({
  id: z.string().min(1, '템플릿 ID는 필수입니다.'),
  name: z
    .string()
    .min(1, '템플릿 이름은 필수입니다.')
    .max(100, '템플릿 이름은 최대 100자까지 입력 가능합니다.'),
  category: templateCategorySchema,
  previewImageUrl: z.string().url('올바른 이미지 URL을 입력해주세요.'),
  cssStyles: z.record(z.string(), z.any()),
  htmlStructure: z.string().min(1, 'HTML 구조는 필수입니다.'),
});

export const createTemplateSchema = templateSchema.omit({ id: true });

export const updateTemplateSchema = templateSchema.partial().extend({
  id: z.string().min(1, '템플릿 ID는 필수입니다.'),
});

export const templateRenderDataSchema = z.object({
  groomName: z.string().optional(),
  brideName: z.string().optional(),
  weddingDate: z.string().optional(),
  weddingTime: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  customMessage: z.string().optional(),
  dressCode: z.string().optional(),
  parkingInfo: z.string().optional(),
  mealInfo: z.string().optional(),
  specialNotes: z.string().optional(),
  backgroundImageUrl: z.string().url().optional(),
});

// AIDEV-NOTE: Wedding info validation schema with RSVP settings - matches database schema
export const weddingInfoSchema = z
  .object({
    groom_name: z
      .string()
      .min(1, '신랑 이름을 입력해주세요.')
      .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
    bride_name: z
      .string()
      .min(1, '신부 이름을 입력해주세요.')
      .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
    wedding_date: z.string().min(1, '결혼식 날짜를 선택해주세요.'),
    wedding_time: z.string().min(1, '결혼식 시간을 선택해주세요.'),
    venue_name: z
      .string()
      .min(1, '예식장 이름을 입력해주세요.')
      .max(100, '예식장 이름은 최대 100자까지 입력 가능합니다.'),
    venue_address: z
      .string()
      .min(1, '예식장 주소를 입력해주세요.')
      .max(200, '주소는 최대 200자까지 입력 가능합니다.'),
    custom_message: z
      .string()
      .max(500, '초대 메시지는 최대 500자까지 입력 가능합니다.')
      .optional(),
    dress_code: z
      .string()
      .max(100, '드레스코드는 최대 100자까지 입력 가능합니다.')
      .optional(),
    parking_info: z
      .string()
      .max(300, '주차 안내는 최대 300자까지 입력 가능합니다.')
      .optional(),
    meal_info: z
      .string()
      .max(300, '식사 안내는 최대 300자까지 입력 가능합니다.')
      .optional(),
    special_notes: z
      .string()
      .max(300, '특별 안내사항은 최대 300자까지 입력 가능합니다.')
      .optional(),
    rsvp_enabled: z.boolean().default(true),
    rsvp_deadline: z.string().optional(),
    background_image_url: z.string().url('올바른 이미지 URL을 입력해주세요.').optional(),
  })
  .refine(
    (data) => {
      // RSVP deadline validation
      if (data.rsvp_enabled && data.rsvp_deadline) {
        const deadline = new Date(data.rsvp_deadline);
        const wedding = new Date(data.wedding_date);
        const today = new Date();

        // Deadline must be after today and before wedding date
        return deadline >= today && deadline <= wedding;
      }
      return true;
    },
    {
      message: 'RSVP 마감일은 오늘 이후이면서 결혼식 날짜 이전이어야 합니다.',
      path: ['rsvp_deadline'],
    }
  );

// RSVP response validation schema
export const rsvpResponseSchema = z.object({
  invitationId: z.string().min(1, '청첩장 ID는 필수입니다.'),
  guestName: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
  attendanceStatus: z.enum(['attending', 'not_attending'], {
    message: '참석 여부를 선택해주세요.',
  }),
  companionCount: z
    .number()
    .min(0, '동반자 수는 0 이상이어야 합니다.')
    .max(10, '동반자 수는 최대 10명까지 가능합니다.')
    .default(0),
  message: z
    .string()
    .max(200, '메시지는 최대 200자까지 입력 가능합니다.')
    .optional(),
  phoneNumber: z
    .string()
    .min(1, '연락처를 입력해주세요.')
    .max(20, '연락처는 최대 20자까지 입력 가능합니다.')
    .optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;

// Template type exports
export type TemplateCategory = z.infer<typeof templateCategorySchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateRenderDataInput = z.infer<typeof templateRenderDataSchema>;

// Wedding info and RSVP type exports
export type WeddingInfoInput = z.infer<typeof weddingInfoSchema>;
export type WeddingInfoFormData = z.infer<typeof weddingInfoSchema>;
export type RsvpResponseInput = z.infer<typeof rsvpResponseSchema>;
