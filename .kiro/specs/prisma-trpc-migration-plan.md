# Prisma & tRPC 제거 및 Next-Safe-Action 도입 마이그레이션 계획

> **Date:** 2025-07-22  
> **Status:** ✅ 구현 완료 + 🚀 Safe Action 업그레이드 완료  
> **Target:** Prisma ORM + tRPC → Supabase Client + Next-Safe-Action

## 📋 마이그레이션 개요

모바일 청첩장 서비스의 백엔드 아키텍처를 단순화하여 번들 크기를 줄이고 Next.js 15의 네이티브 기능을 활용하기 위한 전면적인 마이그레이션을 실시했습니다.

### 기존 아키텍처

```
Client → tRPC Client → tRPC Server → Prisma → Supabase Database
```

### 새로운 아키텍처

```
Client → Next-Safe-Action → Supabase Client → Supabase Database
        ↳ 타입 안전성, 미들웨어, 로깅, 인증
```

## 🎯 마이그레이션 목표

- **번들 크기 최적화**: tRPC, Prisma 클라이언트 제거로 ~200KB+ 절약
- **복잡도 감소**: 서버/클라이언트 경계 단순화
- **성능 향상**: Server Actions의 네이티브 캐싱 활용
- **타입 안전성 강화**: Next-Safe-Action으로 더욱 안전한 타입 체크
- **보안 및 추적성 향상**: 미들웨어 기반 인증, 로깅, 검증
- **개발자 경험 개선**: 선언적 액션 정의 및 에러 처리
- **기능 동등성**: 모든 기존 기능 완전 호환

## ⚡ 마이그레이션 단계별 실행 결과

### ✅ 1단계: 의존성 및 설정 파일 정리

**제거된 패키지**:

- `@prisma/client`: ^6.11.1
- `@trpc/client`: ^11.4.3
- `@trpc/next`: ^11.4.3
- `@trpc/react-query`: ^11.4.3
- `@trpc/server`: ^11.4.3
- `@tanstack/react-query`: ^5.83.0
- `prisma`: ^6.11.1
- `@types/pg`: ^8.15.4
- `pg`: ^8.16.3
- `superjson`: ^2.2.2

**제거된 스크립트**:

```json
{
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:reset": "prisma db reset",
  "db:seed": "prisma db seed",
  "postinstall": "prisma generate"
}
```

**제거된 디렉토리/파일**:

- `prisma/` - 스키마 및 시드 파일
- `src/server/` - tRPC 라우터 및 설정
- `src/lib/trpc.ts` - tRPC 클라이언트
- `src/components/providers/trpc-provider.tsx` - tRPC 프로바이더
- `src/app/api/` - tRPC API 라우트

### ✅ 2단계: 타입 정의 재구성

기존 `src/types/database.ts`의 Supabase 타입 정의가 이미 완성되어 있어 추가 작업 불필요.

**활용 중인 타입**:

- `Database['public']['Tables']['users']['Row']` - 사용자 프로필
- `Database['public']['Tables']['invitations']['Row']` - 청첩장 데이터
- `Database['public']['Tables']['templates']['Row']` - 템플릿 데이터
- `Database['public']['Tables']['rsvp_responses']['Row']` - RSVP 응답
- `Database['public']['Tables']['invitation_views']['Row']` - 조회 통계

### ✅ 3단계: Server Actions 구현

**구현된 Server Actions 파일**:

#### `src/actions/auth-actions.ts`

- ✅ `registerAction`: 회원가입 + 프로필 생성
- ✅ `loginAction`: 로그인 + 프로필 조회
- ✅ `socialLoginAction`: 소셜 로그인 (카카오/구글)
- ✅ `logoutAction`: 로그아웃 + 리다이렉트
- ✅ `resetPasswordAction`: 비밀번호 재설정 이메일
- ✅ `updatePasswordAction`: 비밀번호 변경
- ✅ `updateProfileAction`: 프로필 업데이트
- ✅ `deleteAccountAction`: 계정 완전 삭제
- ✅ `resendEmailVerificationAction`: 이메일 인증 재발송
- ✅ `getCurrentUser`: 현재 사용자 조회 (Server Component용)

#### `src/actions/template-actions.ts`

- ✅ `getTemplatesAction`: 템플릿 목록 조회 (카테고리 필터링, 페이지네이션)
- ✅ `getTemplateByIdAction`: 특정 템플릿 상세 조회
- ✅ `getTemplateCategoriesAction`: 카테고리별 템플릿 개수
- ✅ `getPopularTemplatesAction`: 인기 템플릿 조회
- ✅ `getLatestTemplatesAction`: 최신 템플릿 조회
- ✅ `searchTemplatesAction`: 템플릿 검색

#### `src/actions/invitation-actions.ts`

- ✅ `createInvitationAction`: 청첩장 생성 + 고유 코드 생성
- ✅ `getUserInvitationsAction`: 사용자별 청첩장 목록
- ✅ `getInvitationByIdAction`: 특정 청첩장 조회 (소유자용)
- ✅ `getInvitationByCodeAction`: 초대 코드로 청첩장 조회 (공개)
- ✅ `updateInvitationAction`: 청첩장 업데이트
- ✅ `deleteInvitationAction`: 청첩장 삭제
- ✅ `getInvitationStatsAction`: 청첩장 통계 (조회수, RSVP 현황)

#### `src/actions/upload-actions.ts`

- ✅ `uploadImageAction`: Supabase Storage 이미지 업로드
- ✅ `deleteImageAction`: 이미지 삭제 (소유권 확인)
- ✅ `uploadMultipleImagesAction`: 다중 이미지 업로드 (최대 10개)
- ✅ `getUserImagesAction`: 사용자 업로드 이미지 목록

#### `src/actions/rsvp-actions.ts`

- ✅ `createRsvpResponseAction`: RSVP 응답 생성 (중복 방지, 마감일 확인)
- ✅ `getInvitationRsvpResponsesAction`: 청첩장별 RSVP 목록 (소유자용)
- ✅ `getRsvpResponseByIdAction`: 특정 RSVP 응답 조회
- ✅ `updateRsvpResponseAction`: RSVP 응답 수정 (마감일 확인)
- ✅ `deleteRsvpResponseAction`: RSVP 응답 삭제 (소유자 권한)
- ✅ `getRsvpStatsAction`: RSVP 통계 (참석/불참 현황)
- ✅ `exportRsvpDataAction`: RSVP 데이터 CSV 내보내기

**공통 패턴**:

- Zod 스키마 기반 입력 검증
- 한국어 오류 메시지
- 타입 안전한 반환값 (`ActionResult<T>`)
- `revalidatePath`를 통한 캐시 무효화
- 적절한 권한 확인 (사용자 소유 데이터)

### ✅ 4단계: 컴포넌트 마이그레이션

**마이그레이션된 컴포넌트**:

#### `src/components/invitation/TemplateSelector.tsx`

- **Before**: `api.template.getAll.useQuery()`, `api.template.getCategoriesWithCounts.useQuery()`
- **After**: `getTemplatesAction()`, `getTemplateCategoriesAction()` with `useEffect`
- **변경점**: tRPC 훅 → Server Actions + 로컬 상태 관리

#### `src/components/invitation/TemplatePreviewModal.tsx`

- **Before**: `api.template.preview.useQuery()`
- **After**: `getTemplateByIdAction()` with `useEffect`
- **변경점**: 모달 오픈 시점에 템플릿 데이터 로딩

#### `src/app/layout.tsx`

- **Before**: `<TRPCReactProvider>` 래퍼
- **After**: 직접 children 렌더링
- **변경점**: tRPC 프로바이더 완전 제거

### ✅ 5단계: 인증 시스템 최적화

**기존 `src/hooks/useAuth.ts`**: 이미 Supabase 클라이언트 직접 사용 방식으로 구현되어 있어 수정 불필요.

**유지된 기능**:

- Supabase Auth 세션 관리
- 실시간 인증 상태 감지
- 사용자 프로필 동기화
- 소셜 로그인 지원 (Google, Kakao)

## 🔍 구현 상세

### ActionResult 타입 패턴

모든 Server Actions는 일관된 반환 타입을 사용합니다:

```typescript
type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
```

### 에러 처리 전략

1. **입력 검증**: Zod 스키마로 타입 안전성 보장
2. **권한 확인**: 사용자 소유 데이터 접근 제한
3. **한국어 메시지**: 사용자 친화적 오류 메시지
4. **로깅**: 서버 사이드 에러 로그 유지

### 캐싱 전략

- `revalidatePath()`: 데이터 변경 시 관련 경로 캐시 무효화
- Server Components: 자동 캐싱 활용
- 클라이언트 상태: 최소한의 로컬 상태 관리

## 📊 마이그레이션 효과

### 번들 크기 최적화

- **제거된 패키지**: ~200KB+ 절약 예상
- **Runtime**: tRPC, Prisma 클라이언트 로딩 제거

### 개발 경험 개선

- **단순성**: Server/Client 경계 명확화
- **디버깅**: 네트워크 레이어 단순화
- **타입 안전성**: Supabase 생성 타입 활용

### 성능 향상

- **Server Actions**: Next.js 네이티브 캐싱
- **Database**: 직접 Supabase 연결
- **Network**: 중간 레이어 제거

## ⚠️ 주의사항 및 제약사항

### Server Actions 제약사항

- **POST만 지원**: GET 요청은 별도 처리 필요
- **직렬화**: FormData 또는 JSON 직렬화 가능한 데이터만
- **에러 처리**: try/catch 패턴 필수

### 타입 안전성 관리

- Supabase CLI로 타입 정의 동기화 필요
- 수동 타입 관리 주의사항

### 실시간 기능

- Supabase Realtime 직접 사용 방식 유지
- tRPC subscriptions 대체 방안

## 🚀 배포 고려사항

### 환경 변수

기존 Supabase 환경 변수만 필요:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 데이터베이스

- RLS 정책 유지
- 기존 테이블 구조 변경 없음
- Supabase Storage 버킷 설정 유지

### 빌드 프로세스

- Prisma 관련 스크립트 제거로 빌드 속도 향상
- 타입 체크 단순화

## 📈 향후 개선 방향

### 성능 최적화

- Server Components 적극 활용
- 캐싱 전략 세분화
- 이미지 최적화 강화

### 개발자 경험

- Server Actions 추상화 레이어
- 공통 에러 처리 유틸리티
- 자동화된 타입 생성 워크플로

### 확장성

- API 경로별 rate limiting
- 모니터링 및 로깅 강화
- 테스트 커버리지 확대

## 🚀 Next-Safe-Action 업그레이드

### ✅ Phase 2: Next-Safe-Action 도입 (추가 개선)

기본 Server Actions 마이그레이션 완료 후, [next-safe-action](https://next-safe-action.dev/)을 도입하여 추가적인 보안성과 개발자 경험을 향상시켰습니다.

#### 도입된 패키지:
- `next-safe-action`: ^8.0.1

#### 구현된 Safe Action 파일:
- ✅ `src/lib/safe-action.ts` - 기본 클라이언트 및 미들웨어 설정
- ✅ `src/actions/safe-auth-actions.ts` - 인증 관련 Safe Actions (10개)
- ✅ `src/actions/safe-template-actions.ts` - 템플릿 관련 Safe Actions (8개)  
- ✅ `src/actions/safe-invitation-actions.ts` - 청첩장 관련 Safe Actions (8개)
- ✅ `src/actions/safe-upload-actions.ts` - 파일 업로드 Safe Actions (4개)
- ✅ `src/actions/safe-rsvp-actions.ts` - RSVP 관련 Safe Actions (6개)
- ✅ `src/hooks/useSafeAction.ts` - Safe Action 사용을 위한 커스텀 훅
- ✅ `src/components/forms/LoginForm.tsx` - Safe Action 사용 예시 컴포넌트

#### Safe Action의 주요 특징:

**1. 타입 안전성 강화**
```typescript
export const loginAction = actionClient
  .schema(loginSchema)
  .metadata({ actionName: 'login' })
  .action(async ({ parsedInput }) => {
    // 자동 입력 검증 및 타입 추론
    const { email, password } = parsedInput;
  });
```

**2. 미들웨어 기반 인증**
```typescript
export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }
  
  return next({ ctx: { user, supabase } });
});
```

**3. 자동 로깅 및 모니터링**
- 모든 액션 실행 시간 측정
- 액션 이름 기반 로그
- 에러 추적 및 리포팅

**4. 선언적 에러 처리**
```typescript
handleReturnedServerError(e) {
  console.error("Action error:", e);
  return e instanceof Error ? e.message : "예상치 못한 오류가 발생했습니다.";
}
```

**5. 클라이언트 훅 통합**
```typescript
const loginSafeAction = useSafeActionWithToast(loginAction, {
  onSuccess: (data) => toast.success(data.message),
  onError: (error) => toast.error(error),
});
```

#### 마이그레이션 이점:

**보안성**
- 자동 입력 검증 (Zod 스키마)
- 미들웨어 기반 권한 확인
- 타입 안전한 컨텍스트 전달

**개발자 경험**
- 선언적 액션 정의
- 자동 타입 추론
- 통합된 에러 처리

**추적성**
- 모든 액션 실행 로그
- 성능 메트릭 수집
- 에러 추적 및 디버깅

**확장성**  
- 미들웨어 체인 구성 가능
- Rate limiting 적용 가능
- Admin 권한 체크 등 추가 보안

## 🎉 마이그레이션 완료

이번 마이그레이션을 통해 모바일 청첩장 서비스의 백엔드 아키텍처가 대폭 단순화되었으며, Next-Safe-Action을 통해 타입 안전성과 보안성이 더욱 강화되었습니다. Next.js 15의 최신 기능을 완전히 활용하면서도 개발자 경험과 코드 품질이 크게 향상되었습니다.
