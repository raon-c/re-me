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
export const templateCategorySchema = z.enum(['classic', 'modern', 'romantic', 'minimal'], {
  message: '올바른 템플릿 카테고리를 선택해주세요.',
});

export const templateSchema = z.object({
  id: z.string().min(1, '템플릿 ID는 필수입니다.'),
  name: z.string().min(1, '템플릿 이름은 필수입니다.').max(100, '템플릿 이름은 최대 100자까지 입력 가능합니다.'),
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
