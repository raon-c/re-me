import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc';

// AIDEV-NOTE: Comprehensive authentication router with Korean UX and type safety
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
  socialLoginSchema,
} from '@/lib/validations';
import type { User } from '@/types/auth';

export const authRouter = createTRPCRouter({
  /**
   * 회원가입 프로시저
   * 이메일과 비밀번호로 새 계정을 생성합니다.
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;

      try {
        // Supabase Auth를 통한 회원가입
        const { data: authData, error: authError } =
          await ctx.supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

        if (authError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              authError.message === 'User already registered'
                ? '이미 등록된 이메일입니다.'
                : '회원가입 중 오류가 발생했습니다.',
            cause: authError,
          });
        }

        if (!authData.user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '사용자 생성에 실패했습니다.',
          });
        }

        // 사용자 프로필을 public.users 테이블에 저장
        const { error: profileError } = await ctx.supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name,
            provider: 'email',
            email_verified: false,
          });

        if (profileError) {
          // 프로필 생성 실패 시 auth 사용자도 삭제 시도
          await ctx.supabase.auth.admin.deleteUser(authData.user.id);

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '사용자 프로필 생성에 실패했습니다.',
            cause: profileError,
          });
        }

        return {
          message: '회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.',
          user: {
            id: authData.user.id,
            email,
            name,
            provider: 'email' as const,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          needsEmailVerification: !authData.session,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '회원가입 중 예상치 못한 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 로그인 프로시저
   * 이메일과 비밀번호로 로그인합니다.
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { email, password } = input;

    try {
      const { data: authData, error: authError } =
        await ctx.supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            authError.message === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다.'
              : '로그인 중 오류가 발생했습니다.',
          cause: authError,
        });
      }

      if (!authData.user || !authData.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '로그인에 실패했습니다.',
        });
      }

      // 사용자 프로필 정보 조회
      const { data: userProfile, error: profileError } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '사용자 정보를 불러오는데 실패했습니다.',
          cause: profileError,
        });
      }

      return {
        message: '로그인되었습니다.',
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          provider: userProfile.provider as 'email' | 'google' | 'kakao',
          providerId: userProfile.provider_id,
          emailVerified: userProfile.email_verified,
          createdAt: new Date(userProfile.created_at),
          updatedAt: new Date(userProfile.updated_at),
        } as User,
        session: {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          expiresAt: authData.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '로그인 중 예상치 못한 오류가 발생했습니다.',
        cause: error,
      });
    }
  }),

  /**
   * 소셜 로그인 URL 생성 프로시저
   * 카카오, 구글 소셜 로그인 URL을 생성합니다.
   */
  socialLogin: publicProcedure
    .input(socialLoginSchema)
    .mutation(async ({ input, ctx }) => {
      const { provider, redirectTo } = input;

      try {
        const { data, error } = await ctx.supabase.auth.signInWithOAuth({
          provider: provider === 'kakao' ? 'kakao' : 'google',
          options: {
            redirectTo:
              redirectTo || `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '소셜 로그인 URL 생성에 실패했습니다.',
            cause: error,
          });
        }

        return {
          url: data.url,
          provider,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '소셜 로그인 처리 중 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 로그아웃 프로시저
   * 현재 세션을 종료합니다.
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await ctx.supabase.auth.signOut();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '로그아웃 중 오류가 발생했습니다.',
          cause: error,
        });
      }

      return {
        message: '로그아웃되었습니다.',
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '로그아웃 처리 중 예상치 못한 오류가 발생했습니다.',
        cause: error,
      });
    }
  }),

  /**
   * 현재 세션 조회 프로시저
   * 현재 로그인된 사용자의 세션 정보를 반환합니다.
   */
  getSession: publicProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user) {
        return {
          user: null,
          session: null,
        };
      }

      // 사용자 프로필 정보 조회
      const { data: userProfile, error: profileError } = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', ctx.session.user.id)
        .single();

      if (profileError || !userProfile) {
        return {
          user: null,
          session: null,
        };
      }

      return {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          provider: userProfile.provider as 'email' | 'google' | 'kakao',
          providerId: userProfile.provider_id,
          emailVerified: userProfile.email_verified,
          createdAt: new Date(userProfile.created_at),
          updatedAt: new Date(userProfile.updated_at),
        } as User,
        session: {
          accessToken: ctx.session.access_token,
          refreshToken: ctx.session.refresh_token,
          expiresAt: ctx.session.expires_at || 0,
        },
      };
    } catch (error) {
      // 세션 조회 실패는 로그만 남기고 null 반환
      console.error('Session retrieval error:', error);
      return {
        user: null,
        session: null,
      };
    }
  }),

  /**
   * 비밀번호 재설정 이메일 발송 프로시저
   * 비밀번호 재설정 링크를 이메일로 발송합니다.
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      try {
        const { error } = await ctx.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '비밀번호 재설정 이메일 발송에 실패했습니다.',
            cause: error,
          });
        }

        return {
          message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
          email,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '비밀번호 재설정 처리 중 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 비밀번호 업데이트 프로시저
   * 로그인된 사용자의 비밀번호를 변경합니다.
   */
  updatePassword: protectedProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { password } = input;

      try {
        const { error } = await ctx.supabase.auth.updateUser({
          password,
        });

        if (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '비밀번호 변경에 실패했습니다.',
            cause: error,
          });
        }

        return {
          message: '비밀번호가 성공적으로 변경되었습니다.',
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '비밀번호 변경 처리 중 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 프로필 업데이트 프로시저
   * 사용자의 프로필 정보를 업데이트합니다.
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, email } = input;
      const userId = ctx.session.user.id;

      try {
        // 이메일 변경이 있는 경우 Supabase Auth 업데이트
        if (email && email !== ctx.session.user.email) {
          const { error: authError } = await ctx.supabase.auth.updateUser({
            email,
          });

          if (authError) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message:
                authError.message === 'Email address already in use'
                  ? '이미 사용 중인 이메일입니다.'
                  : '이메일 변경에 실패했습니다.',
              cause: authError,
            });
          }
        }

        // 프로필 정보 업데이트
        // AIDEV-NOTE: Type-safe profile update data preparation
        const updateData: { name: string; email?: string } = { name };
        if (email) {
          updateData.email = email;
        }

        const { data: updatedProfile, error: profileError } = await ctx.supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (profileError || !updatedProfile) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '프로필 업데이트에 실패했습니다.',
            cause: profileError,
          });
        }

        return {
          message: '프로필이 성공적으로 업데이트되었습니다.',
          user: {
            id: updatedProfile.id,
            email: updatedProfile.email,
            name: updatedProfile.name,
            provider: updatedProfile.provider as 'email' | 'google' | 'kakao',
            providerId: updatedProfile.provider_id,
            emailVerified: updatedProfile.email_verified,
            createdAt: new Date(updatedProfile.created_at),
            updatedAt: new Date(updatedProfile.updated_at),
          } as User,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '프로필 업데이트 처리 중 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 계정 삭제 프로시저
   * 사용자 계정과 관련된 모든 데이터를 삭제합니다.
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmPassword: z.string().min(1, '비밀번호를 입력해주세요.'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { confirmPassword } = input;
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;

      try {
        // 비밀번호 확인을 위해 재로그인 시도
        if (userEmail) {
          const { error: verifyError } =
            await ctx.supabase.auth.signInWithPassword({
              email: userEmail,
              password: confirmPassword,
            });

          if (verifyError) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: '비밀번호가 올바르지 않습니다.',
              cause: verifyError,
            });
          }
        }

        // 관련 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
        // AIDEV-NOTE: Explicit cleanup of user data before account deletion
        // 1. 청첩장 관련 데이터 삭제 (RLS 정책에 의해 자동으로 사용자 소유 데이터만 삭제됨)
        await ctx.supabase.from('invitations').delete().eq('user_id', userId);

        // 2. 사용자 프로필 삭제
        const { error: profileError } = await ctx.supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (profileError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '사용자 데이터 삭제에 실패했습니다.',
            cause: profileError,
          });
        }

        // 3. Supabase Auth 사용자 삭제
        const { error: authError } =
          await ctx.supabase.auth.admin.deleteUser(userId);

        if (authError) {
          // 이미 프로필은 삭제되었으므로 로그만 남김
          console.error('Auth user deletion error:', authError);
        }

        return {
          message: '계정이 성공적으로 삭제되었습니다.',
          deletedAt: new Date(),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '계정 삭제 처리 중 오류가 발생했습니다.',
          cause: error,
        });
      }
    }),

  /**
   * 이메일 인증 재발송 프로시저
   * 이메일 인증 링크를 재발송합니다.
   */
  resendEmailVerification: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await ctx.supabase.auth.resend({
        type: 'signup',
        email: ctx.session.user.email!,
      });

      if (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이메일 인증 재발송에 실패했습니다.',
          cause: error,
        });
      }

      return {
        message: '이메일 인증 링크가 재발송되었습니다.',
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '이메일 인증 재발송 처리 중 오류가 발생했습니다.',
        cause: error,
      });
    }
  }),
});
