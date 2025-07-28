# CLAUDE.md

_Last updated 2025-07-22_

> **Purpose** – This file is the onboarding manual for every AI assistant (Claude, Cursor, GPT, etc.) and every human who edits this repository.  
> It encodes our coding standards, guard-rails, and workflow practices so the _human decision-making_ (architecture, business logic, UX) stays in human hands.

---

## 0. Project Overview

**Mobile Wedding Invitation Service** is a web-based platform that enables users to easily create and share digital wedding invitations through smartphones. The service provides an eco-friendly and cost-effective alternative to traditional paper invitations.

**Core Features**:

- **Template-based Design**: 15+ wedding invitation templates categorized by theme (Classic, Modern, Romantic, Minimal)
- **Mobile-First Editor**: Block-based modular interface with touch-friendly editing capabilities
- **Wedding Information Management**: Date, time, venue, contact details with integrated map services
- **RSVP System**: Guest response collection with attendance tracking and message features
- **Sharing & Distribution**: Multiple sharing options (KakaoTalk, SMS, email, URL)
- **Management Dashboard**: Real-time statistics, guest list management, and data export

**Golden rule**: When unsure about implementation details, business requirements, or UX decisions, ALWAYS consult the developer rather than making assumptions.

---

## 1. Non-negotiable golden rules

| #   | AI _may_ do                                                                                                                     | AI _must NOT_ do                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| G-0 | Ask for clarification when unsure about project-specific features, business logic, or UX decisions.                             | ❌ Make assumptions about user requirements or business logic without confirmation.                  |
| G-1 | Generate code **only inside** relevant source directories (`src/`, `supabase/`) or explicitly specified files.       | ❌ Touch `.kiro/` directory, test files, or any specification documents without explicit permission. |
| G-2 | Add/update **`AIDEV-NOTE:` anchor comments** near non-trivial edited code.                                                      | ❌ Delete or modify existing `AIDEV-` comments without explicit instruction.                         |
| G-3 | Follow lint/style configs (`eslint`, `prettier`, `typescript`). Use `npm run lint:fix` and `npm run type-check` before commits. | ❌ Reformat code to any other style or ignore TypeScript errors.                                     |
| G-4 | For changes >300 LOC or >3 files, **ask for confirmation** before proceeding.                                                   | ❌ Refactor large modules or change core architecture without human guidance.                        |
| G-5 | Stay within current task context. Reference tasks.md for implementation sequence.                                               | ❌ Jump to unrelated features or skip implementation steps without discussion.                       |
| G-6 | **BEFORE component conversion**: Audit for hooks, event handlers, browser APIs. Plan server/client boundaries.                 | ❌ Convert components without checking dependencies. Never mix server/client patterns.              |
| G-7 | **ALWAYS** implement graceful fallbacks for missing database tables or API failures.                                           | ❌ Assume database tables exist. Never hard-code dependencies without error handling.               |

---

## 2. Build, test & utility commands

Use npm scripts for consistency (they ensure correct environment variables and configuration).

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code quality
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run type-check       # Run TypeScript type checking

# Database operations (Supabase)
# Note: Database operations are managed directly through Supabase Dashboard
# or Supabase CLI for schema changes and migrations

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

**Always run before commits**: `npm run lint:fix && npm run type-check`

---

## 3. Coding standards

- **TypeScript**: 5.0+, strict mode enabled, `"use client"` for client components
- **Formatting**: Prettier with 2-space indentation, single quotes, trailing commas
- **Linting**: ESLint with Next.js recommended rules
- **Naming**:
  - `camelCase` (functions/variables)
  - `PascalCase` (components/types)
  - `kebab-case` (file names)
  - `SCREAMING_SNAKE_CASE` (constants)
- **Error Handling**: Typed errors with proper user feedback
- **Documentation**: JSDoc comments for complex functions
- **Testing**: Jest + React Testing Library for components

**Error handling patterns**:

```typescript
// Use typed errors with proper user feedback in Safe Actions
export const createInvitationAction = authActionClient
  .schema(createInvitationSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      // Process invitation with validated input
      const invitation = await ctx.supabase
        .from('invitations')
        .insert(parsedInput)
        .select()
        .single();
      
      return {
        message: '청첩장이 성공적으로 생성되었습니다.',
        invitation: invitation.data,
      };
    } catch (error) {
      // Safe Action automatically handles error responses
      throw new Error('청첩장 생성 중 오류가 발생했습니다.');
    }
  });
```

---

## 4. Technology Stack & Architecture

### Full-Stack Framework

- **Next.js 15+** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** with Server Components and Client Components
- **Tailwind CSS 3.3+** for mobile-first responsive design
- **Shadcn/ui** component library

### API & State Management

- **Next-Safe-Action 8+** for type-safe server actions with enhanced security
- **Zod** for schema validation and input/output type safety
- **React Hook Form 7.0+** for form management
- **Direct Supabase Client** for real-time data and optimistic updates

### Backend Services

- **Supabase** as Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (JWT + OAuth)
  - File storage with bucket policies
  - Real-time subscriptions
  - Direct SQL access with type-safe client

### External Services

- **Kakao Map API** for location services
- **Kakao/Google OAuth** for social login
- **Resend** for email services

---

## 5. Project layout & Core Components

### Next.js App Router Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Route groups for auth pages
│   │   ├── login/page.tsx        # ✅ 로그인 페이지 완료
│   │   └── signup/page.tsx       # ✅ 회원가입 페이지 완료
│   ├── auth/                     # Auth callback routes
│   │   ├── callback/page.tsx     # ✅ OAuth 콜백 처리 완료
│   │   └── reset-password/page.tsx # ✅ 비밀번호 재설정 완료
│   ├── dashboard/                # User dashboard
│   │   └── page.tsx              # ✅ 대시보드 기본 구조 완료
│   ├── templates/                # Template selection
│   │   └── page.tsx              # ✅ 템플릿 선택 페이지 완료
│   ├── invitation/
│   │   ├── create/page.tsx       # 🚧 청첩장 생성 (계획됨)
│   │   └── [code]/page.tsx       # 🚧 공개 청첩장 보기 (계획됨)
│   ├── layout.tsx                # ✅ 루트 레이아웃 완료
│   ├── page.tsx                  # ✅ 랜딩 페이지 완료
│   ├── loading.tsx               # ✅ 글로벌 로딩 UI 완료
│   └── globals.css               # ✅ 글로벌 스타일 완료
├── components/
│   ├── ui/                       # ✅ Shadcn/ui 기본 컴포넌트 완료
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   └── label.tsx
│   ├── common/                   # ✅ 공통 컴포넌트 완료
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── auth/                     # ✅ 인증 컴포넌트 완료
│   │   ├── SocialLogin.tsx
│   │   └── UserProfile.tsx
│   ├── blocks/                   # ✅ 블록 기반 에디터 컴포넌트 완료
│   │   ├── BaseBlock.tsx         # 기본 블록 래퍼
│   │   ├── HeaderBlock.tsx       # 헤더 블록 (신랑신부 이름, 날짜)
│   │   ├── ContentBlock.tsx      # 콘텐츠 블록 (텍스트)
│   │   ├── ImageBlock.tsx        # 이미지 블록
│   │   ├── ContactBlock.tsx      # 연락처 블록
│   │   ├── LocationBlock.tsx     # 위치 블록
│   │   ├── RsvpBlock.tsx         # RSVP 블록
│   │   ├── BlockEditor.tsx       # 블록 에디터 메인 컴포넌트
│   │   └── index.ts              # 블록 컴포넌트 내보내기
│   ├── invitation/               # ✅ 청첩장 관련 컴포넌트 완료
│   │   ├── TemplateCard.tsx
│   │   ├── TemplatePreviewModal.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── BlockBasedEditor.tsx  # 블록 기반 에디터 통합
│   │   └── InvitationEditor.tsx  # 메인 에디터 컴포넌트
│   ├── rsvp/                     # 🚧 RSVP 컴포넌트 (계획됨)
│   └── dashboard/                # 🚧 대시보드 컴포넌트 (계획됨)
├── actions/                      # ✅ Next-Safe-Action 서버 액션 완료
│   ├── safe-auth-actions.ts      # ✅ 인증 관련 Safe Actions (10개)
│   ├── safe-template-actions.ts  # ✅ 템플릿 관련 Safe Actions (8개)
│   ├── safe-invitation-actions.ts # ✅ 청첩장 관련 Safe Actions (8개)
│   ├── safe-upload-actions.ts    # ✅ 파일 업로드 Safe Actions (4개)
│   └── safe-rsvp-actions.ts      # ✅ RSVP 관련 Safe Actions (6개)
├── lib/                          # ✅ 유틸리티 라이브러리 완료
│   ├── supabase/
│   │   ├── client.ts             # ✅ Supabase 클라이언트 설정
│   │   └── server.ts             # ✅ Supabase 서버 설정
│   ├── blocks/                   # ✅ 블록 시스템 유틸리티 완료
│   │   └── block-factory.ts      # 블록 생성 및 관리 팩토리
│   ├── safe-action.ts            # ✅ Safe Action 클라이언트 설정
│   ├── utils.ts                  # ✅ 일반 유틸리티
│   └── validations.ts            # ✅ Zod 검증 스키마
├── hooks/                        # ✅ 커스텀 React 훅 완료
│   ├── useAuth.ts                # ✅ 인증 훅
│   ├── useBlocks.ts              # ✅ 블록 상태 관리 훅
│   └── useImageUpload.ts         # ✅ 이미지 업로드 훅
├── types/                        # ✅ TypeScript 타입 정의 완료
│   ├── auth.ts
│   ├── database.ts
│   ├── blocks.ts                 # ✅ 블록 시스템 타입 정의
│   └── index.ts
└── styles/                       # 추가 스타일
```

### Database Architecture

This is a mobile wedding invitation platform with the following core entities:

- **Users**: Authentication and user management via Supabase
- **Invitations**: Core wedding invitation data (bride/groom names, venue, date, etc.)
- **Templates**: Reusable invitation templates with HTML/CSS structures
- **RsvpResponse**: Guest responses to invitations
- **InvitationView**: Analytics tracking for invitation views

### Key Database Features

- PostgreSQL with UUID primary keys
- Row Level Security (RLS) policies for data access control
- Supabase Storage integration for invitation images
- Comprehensive indexing for performance
- Direct Supabase client with generated TypeScript types for full type safety

### Safe Action API Structure

- **Authentication Actions**: ✅ User registration, login, logout, session management (완료)
- **Template Actions**: ✅ Template catalog with category-based filtering (완료)
- **Invitation Actions**: ✅ CRUD operations for invitations, image uploads, public access (완료)
- **Upload Actions**: ✅ File upload with Supabase Storage integration (완료)
- **RSVP Actions**: ✅ Guest response submission, statistics, data export (완료)

### Authentication Flow

- ✅ Supabase Auth with email/password and OAuth providers (Google, Kakao) - 완료
- ✅ Custom `useAuth` hook provides authentication state and methods - 완료
- ✅ RLS policies ensure users can only access their own data - 완료
- ✅ Public access to invitations via unique 8-character invitation codes - 완료

### UI Components

- ✅ Built with shadcn/ui component library - 완료
- ✅ Configured in `components.json` with Tailwind CSS integration - 완료
- ✅ Korean language support (locale: "ko") - 완료
- ✅ Mobile-first responsive design with touch-friendly interfaces - 완료

### Block-Based Editor System

- ✅ **6가지 블록 타입**: Header, Content, Image, Contact, Location, RSVP
- ✅ **모바일 최적화**: 9:16 세로 화면 비율에 맞춘 레이아웃
- ✅ **터치 친화적 인터페이스**: 드래그 앤 드롭 대신 블록 기반 편집
- ✅ **타입 안전성**: TypeScript로 완전 타입 정의
- ✅ **상태 관리**: useReducer 기반 블록 상태 관리
- ✅ **React Hook 일관성**: 모든 컴포넌트에서 Hook 순서 보장

---

## 6. Anchor comments

Add specially formatted comments throughout the codebase for AI and developer guidance.

### Guidelines

- Use `AIDEV-NOTE:`, `AIDEV-TODO:`, or `AIDEV-QUESTION:` (all-caps prefix)
- Keep them concise (≤ 120 chars)
- **Before scanning files, locate existing anchors** `AIDEV-*` in relevant directories
- **Update relevant anchors** when modifying associated code
- **Do not remove `AIDEV-NOTE`s** without explicit instruction

Add anchor comments when code is:

- Complex or performance-critical
- Business logic that requires context
- Mobile-specific optimizations
- Korean localization considerations
- Integration points with external APIs

Example:

```typescript
// AIDEV-NOTE: Korean mobile keyboards require specific input handling
const handleKoreanInput = (value: string) => {
  // Handle Korean character composition
};

// AIDEV-TODO: Add Kakao Map error handling for network failures
const initializeMap = async () => {
  // Map initialization
};
```

---

## 7. Key Implementation Details

### File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **Components**: PascalCase (e.g., `InvitationEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `validations.ts`)

### State Management

- **Server State**: Managed by Next-Safe-Action with automatic error handling
- **Client State**: React state and context for UI state
- **Form State**: React Hook Form for complex forms
- **Authentication State**: Supabase Auth with custom hooks

### Performance Requirements

- Page load time: < 3 seconds
- Image optimization: max 1MB, WebP format
- Bundle size optimization with code splitting
- Support for 1000+ concurrent users

## Current Implementation Status

### ✅ Completed Features

1. **Project Setup & Infrastructure** (Tasks 1-3)
   - Next.js 14 프로젝트 with App Router
   - TypeScript, Tailwind CSS, ESLint, Prettier 설정
   - Shadcn/ui 컴포넌트 라이브러리 설치 및 설정
   - Supabase 프로젝트 설정 및 데이터베이스 스키마 구현
   - Next-Safe-Action 설정 완료

2. **Authentication System** (Task 4)
   - Supabase Auth 설정 (이메일/비밀번호, Google/Kakao OAuth)
   - 인증 Safe Actions 구현 완료
   - 로그인/회원가입 UI 컴포넌트 구현
   - 사용자 프로필 관리 기능
   - OAuth 콜백 처리 및 비밀번호 재설정

3. **Template System** (Task 5)
   - 템플릿 데이터 모델 및 Safe Actions 구현
   - 템플릿 카테고리별 필터링 및 조회 기능
   - 템플릿 선택 UI 및 미리보기 컴포넌트
   - 15개 기본 템플릿 데이터 생성

4. **Block-Based Invitation Editor** (Task 6) - ✅ 완료
   - 6가지 블록 타입 구현 (Header, Content, Image, Contact, Location, RSVP)
   - 모바일 최적화 세로 컬럼 레이아웃 (9:16 화면 비율)
   - 터치 친화적 블록 편집 인터페이스
   - 블록 추가/삭제/순서 변경/복사 기능
   - DND 방식 대신 블록 기반 접근 방식 채택
   - TypeScript 타입 안전성 보장 및 React Hook 순서 일관성 확보

5. **Safe Action Architecture Migration** - ✅ 완료
   - tRPC/Prisma 제거 및 Next-Safe-Action 8+ 도입
   - 36개 Safe Actions 구현 (인증, 템플릿, 청첩장, 업로드, RSVP)
   - 타입 안전성 강화 및 보안 향상
   - 미들웨어 기반 인증 및 로깅 시스템

### 🚧 Next Implementation Steps

1. **Wedding Information Forms** (Task 7) - 결혼식 정보 입력
2. **Invitation CRUD UI** (Task 8) - 청첩장 관리 인터페이스
3. **Sharing Features** (Task 9) - 공유 및 공개 조회
4. **RSVP System UI** (Task 10) - 참석 응답 인터페이스

### Environment Variables Required

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase operations

### Security Considerations

- ✅ RLS policies implemented for all tables - 완료
- ✅ CORS headers configured in next.config.js - 완료
- ✅ Storage bucket policies for image uploads - 완료
- ✅ Invitation codes for secure guest access - 완료
- ✅ HTTPS enforcement and XSS prevention - 완료

### Development Workflow

1. ✅ Database changes should be made through Supabase Dashboard or CLI - 완료
2. ✅ Generate TypeScript types with `supabase gen types typescript` - 완료
3. ✅ Always run `npm run type-check` and `npm run lint` before commits - 완료
4. ✅ Follow mobile-first responsive design principles - 진행 중
5. ✅ Implement proper error handling and loading states - 진행 중
6. ✅ Use Safe Actions for all server-side operations - 완료

### Testing Strategy

- Unit tests with Jest + React Testing Library (80%+ coverage target)
- Integration tests for API endpoints and database operations
- E2E tests with Playwright for main user flows
- Performance testing with Lighthouse (3-second load time goal)

---

## 8. Server vs Client Components (CRITICAL)

### Component Architecture Rules

**MUST FOLLOW**: Always identify component type before making changes:

1. **Server Components** (default in App Router):
   - ✅ Data fetching with `await`
   - ✅ Direct database access
   - ✅ Server-only APIs (cookies, headers)
   - ✅ No browser APIs or event handlers
   - ❌ NO `useState`, `useEffect`, or React hooks
   - ❌ NO event handlers (`onClick`, `onChange`)
   - ❌ NO browser APIs (`localStorage`, `window`)

2. **Client Components** (require `'use client'`):
   - ✅ Interactive features (forms, buttons)
   - ✅ React hooks (`useState`, `useEffect`)
   - ✅ Browser APIs and event handlers
   - ✅ State management
   - ❌ NO direct server-only APIs

### Critical Migration Patterns

**WRONG**: Converting client hook-dependent components to server components
```typescript
// ❌ BREAKS: useAuth hook in server component
export default async function Dashboard() {
  const { user } = useAuth(); // ERROR: hooks not allowed
  return <div>{user?.email}</div>;
}
```

**CORRECT**: Server component with client component children
```typescript
// ✅ Server component with data fetching
export default async function Dashboard() {
  const userData = await getUserData(); // Server-side data
  return (
    <div>
      <ServerDataDisplay userData={userData} />
      <ClientInteractiveHeader userData={userData} />
    </div>
  );
}

// ✅ Client component for interactions
'use client';
export function ClientInteractiveHeader({ userData }: { userData: UserData }) {
  const [showModal, setShowModal] = useState(false);
  return <button onClick={() => setShowModal(true)}>Profile</button>;
}
```

### Data Flow Patterns

1. **Server → Client**: Pass server data as props
2. **Client → Server**: Use Safe Actions
3. **Mixed Components**: Server components can render client components, but not vice versa

### Database Integration Rules

**ALWAYS** handle missing database tables gracefully:
```typescript
// ✅ CORRECT: Graceful degradation
try {
  const profile = await supabase.from('users').select('*').single();
  return profile.data;
} catch (error) {
  // AIDEV-NOTE: Fallback to auth metadata if users table missing
  console.warn('Users table not found, using auth data:', error);
  return user.user_metadata;
}
```

### Before Converting Components:

1. **Audit Dependencies**: Check for hooks, event handlers, browser APIs
2. **Plan Data Flow**: Identify what needs server vs client rendering
3. **Create Boundaries**: Split complex components into server/client parts
4. **Test Gracefully**: Ensure fallbacks for missing data/tables

---

## 9. Safe Action Development Checklist (MANDATORY)

**BEFORE creating or modifying ANY Safe Action, complete this checklist:**

#### 1. Identify Action Type
- [ ] Is this a public action? Use `actionClient`
- [ ] Does it require authentication? Use `authActionClient`
- [ ] Does it need admin permissions? Use `adminActionClient`
- [ ] Does it need rate limiting? Use `rateLimitedActionClient`

#### 2. Define Validation Schema
- [ ] Create Zod schema for input validation
- [ ] Include Korean error messages
- [ ] Test edge cases and validation boundaries
- [ ] Ensure type safety with TypeScript

#### 3. Implement Action Logic
- [ ] Use proper error handling with try/catch
- [ ] Implement graceful fallbacks for missing data
- [ ] Add user-friendly Korean error messages
- [ ] Use `revalidatePath()` for cache invalidation

#### 4. Test Action Integration
- [ ] Test with valid inputs
- [ ] Test with invalid inputs and edge cases
- [ ] Verify authentication and authorization
- [ ] Check database permissions and RLS policies

---

## 10. Next.js 15 Critical Guidelines

### Middleware Requirements (CRITICAL)

- **File Location**: Middleware MUST be placed at `src/middleware.ts` (NOT at root level)
- **Compilation Check**: Middleware is compiled and listed in `.next/server/middleware-manifest.json`
- **Debug Pattern**: Always add console.log to verify middleware execution during development
- **Matcher Config**: Use simplified matchers for better compatibility

```typescript
// ✅ CORRECT: src/middleware.ts
export async function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE:', request.nextUrl.pathname);
  // ... implementation
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Common Middleware Issues & Solutions

1. **Middleware not executing**: Check file is in `src/middleware.ts`
2. **Auth session missing**: Ensure proper cookie handling in createServerClient
3. **Build errors**: Verify middleware compiles successfully with `npm run build`
4. **Route matching**: Test matcher patterns with console.log debugging

### Middleware Debugging Steps

1. Add console.log at middleware entry point
2. Check `.next/server/middleware-manifest.json` for compilation
3. Test with curl -I to verify redirects
4. Check server logs for middleware execution

---

## 11. Commit discipline

- **Granular commits**: One logical change per commit
- **Tag AI-generated commits**: e.g., `feat: add RSVP form validation [AI]`
- **Clear commit messages**: Follow existing pattern `[task-number] description`
- **Review AI-generated code**: Never commit code you don't understand
- **Always run quality checks**: `npm run lint:fix && npm run type-check` before commits

Example commit message:

```
[3.1] tRPC 서버 설정 및 기본 라우터 구현

- tRPC 서버 설정 (server/api/trpc.ts)
- 인증 라우터 구현 (auth.ts)
- 기본 미들웨어 설정 (보호된 프로시저)

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 12. Domain-specific terminology

- **청첩장 (Invitation)**: Digital wedding invitation with customizable templates
- **템플릿 (Template)**: Pre-designed invitation layouts with themes (Classic, Modern, Romantic, Minimal)
- **RSVP**: Guest response system for attendance confirmation
- **초대코드 (Invitation Code)**: 8-character unique code for sharing invitations
- **하객 (Guest)**: Wedding attendees who respond to invitations
- **신랑신부 (Bride & Groom)**: Wedding couple who creates invitations
- **예식장 (Venue)**: Wedding ceremony location with map integration
- **참석 여부 (Attendance Status)**: Guest response (attending/not_attending)
- **동반자 (Companion)**: Additional guests brought by primary invitee
- **축하 메시지 (Congratulatory Message)**: Guest messages to the couple
- **관리 대시보드 (Management Dashboard)**: Analytics and guest management interface
- **모바일 최적화 (Mobile Optimization)**: Touch-friendly, responsive design for smartphones

---

## 13. Key File & Pattern References

### Important Files

- **Safe Action Definitions**: `src/actions/` (✅ safe-auth-actions.ts, ✅ safe-template-actions.ts, ✅ safe-invitation-actions.ts, ✅ safe-upload-actions.ts, ✅ safe-rsvp-actions.ts)
- **Database Schema**: ✅ `supabase/migrations/` and generated types
- **Authentication Hook**: ✅ `src/hooks/useAuth.ts`
- **Safe Action Client**: ✅ `src/lib/safe-action.ts`
- **Supabase Client**: ✅ `src/lib/supabase/client.ts` and ✅ `src/lib/supabase/server.ts`
- **Type Definitions**: ✅ `src/types/` (auth.ts, database.ts, index.ts)
- **Validation Schemas**: ✅ `src/lib/validations.ts`
- **⚠️ Middleware**: ✅ `src/middleware.ts` (CRITICAL: Must be in src/ directory for Next.js 15)

### Common Patterns

- **Safe Actions**: Type-safe server actions with automatic validation and error handling
- **Supabase Queries**: Direct database operations with generated TypeScript types
- **Supabase Auth**: JWT-based authentication with RLS policies
- **Form Validation**: Zod schemas with React Hook Form
- **Error Handling**: Typed errors with Korean user-friendly messages
- **Mobile Components**: Touch-friendly UI with proper accessibility

---

## 14. Next-Safe-Action Guidelines (CRITICAL)

### Safe Action Architecture Rules

**MUST FOLLOW**: All server-side operations must use Safe Actions:

1. **Safe Action Structure**:
   ```typescript
   export const exampleAction = authActionClient
     .schema(validationSchema)
     .action(async ({ parsedInput, ctx }) => {
       // Access validated input and authenticated context
       const { user, supabase } = ctx;
       const { data } = parsedInput;
       
       // Perform database operations
       const result = await supabase.from('table').insert(data);
       
       return {
         message: '성공적으로 처리되었습니다.',
         data: result.data,
       };
     });
   ```

2. **Client Types**:
   - `actionClient`: Basic client for public actions
   - `authActionClient`: Requires authentication middleware
   - `adminActionClient`: Requires admin permissions
   - `rateLimitedActionClient`: With rate limiting

3. **Error Handling**: Safe Actions automatically handle validation and server errors
4. **Type Safety**: Full TypeScript support with Zod schemas
5. **Middleware**: Built-in authentication, logging, and security

### Safe Action Usage Patterns

**Form Handling**:
```typescript
// In components
const result = await loginAction({ email, password });
if (result?.data) {
  // Success - redirect or update UI
} else {
  // Handle errors automatically provided
  console.error(result?.serverError);
}
```

**With Custom Hooks**:
```typescript
const { execute, isLoading, error } = useSafeAction(uploadImageAction);
await execute({ file, folder: 'invitations' });
```

### Migration from tRPC Pattern

**OLD (tRPC)**:
```typescript
const { data, error } = api.auth.login.useMutation();
await mutate({ email, password });
```

**NEW (Safe Actions)**:
```typescript
const result = await loginAction({ email, password });
```

### Critical Safe Action Rules

1. **Never use fetch() or axios** - Always use Safe Actions for server communication
2. **Always validate input** - Use Zod schemas for all action inputs
3. **Handle authentication** - Use `authActionClient` for protected actions
4. **Provide Korean error messages** - All user-facing errors in Korean
5. **Use revalidatePath()** - Invalidate Next.js cache after mutations

---

## 15. AI Assistant Workflow

When responding to user instructions, follow this process:

1. **Consult Guidance**: Reference this CLAUDE.md and tasks.md for context
2. **Clarify Ambiguities**: Ask targeted questions about business logic or UX decisions
3. **Break Down & Plan**: Create implementation plan following project conventions
4. **Component Analysis**: For ANY component changes, complete the Server/Client Component Checklist below
5. **Trivial Tasks**: Proceed immediately for simple changes
6. **Non-Trivial Tasks**: Present plan for review before implementation
7. **Track Progress**: Use todo lists for multi-step tasks
8. **Update Documentation**: Add/update AIDEV- comments and documentation
9. **Quality Check**: Run linting and type checking before commits
10. **User Review**: Request feedback on completed work

### Server/Client Component Checklist (MANDATORY)

**BEFORE making ANY component changes, complete this checklist:**

#### 1. Identify Current Component Type
- [ ] Check for `'use client'` directive
- [ ] Audit for React hooks (`useState`, `useEffect`, etc.)
- [ ] Audit for event handlers (`onClick`, `onChange`, etc.)
- [ ] Audit for browser APIs (`localStorage`, `window`, etc.)

#### 2. Determine Target Component Type
- [ ] Will component need server-side data fetching?
- [ ] Will component need interactivity/state management?
- [ ] Will component need browser APIs?

#### 3. Plan Component Architecture
- [ ] If mixing concerns: Plan server/client boundary split
- [ ] Identify data flow patterns (server → client props)
- [ ] Plan fallback strategies for missing data/APIs

#### 4. Implement Error Handling
- [ ] Add try/catch blocks for database operations
- [ ] Implement graceful fallbacks for missing tables
- [ ] Add user-friendly error messages in Korean

#### 5. Test Integration Points
- [ ] Verify server components don't use client-only features
- [ ] Verify client components receive proper props
- [ ] Test error scenarios and fallback paths

### Session Boundaries

- If switching between unrelated features, suggest fresh session
- Reference tasks.md for proper implementation sequence
- Maintain context within current task scope

---

## 16. Files to NOT modify

- **`.kiro/`**: Project specifications and requirements (human-owned)
- **`node_modules/`**: Package dependencies
- **`.next/`**: Next.js build artifacts
- **`test/`**: Test files (require human review)
- **Environment files**: `.env*` (sensitive configuration)
- **Package locks**: `package-lock.json` (auto-generated)

**When adding new files or directories**, ensure they follow the established patterns and don't conflict with existing structure.

---

## 17. AI Development Team Configuration

_Updated by team-configurator on 2025-07-28_

Your project uses: __Next.js 15, TypeScript, Supabase, Next-Safe-Action 8+, Tailwind CSS__

### Current Available Specialists

- **@code-reviewer** - Expert code quality assurance and best practices

### Recommended Task Routing

#### 🏗️ API & Server Actions

**For Safe Actions, authentication, and server-side logic:**

- "Build user registration endpoint"
- "Add RSVP response validation"
- "Create invitation sharing API"
- **Approach**: Use universal development principles with Next-Safe-Action patterns
- **Review with**: @code-reviewer for type safety and security validation

#### ⚛️ Frontend & Components

**For React components, UI, and client-side interactions:**

- "Create invitation editor interface"
- "Build mobile-responsive dashboard"
- "Add block-based editor controls"
- **Approach**: Follow shadcn/ui patterns and mobile-first design
- **Review with**: @code-reviewer for performance and accessibility

#### 🗄️ Database & State Management

**For Supabase operations and data handling:**

- "Optimize invitation queries"
- "Add RLS policies for security"
- "Create real-time subscriptions"
- **Approach**: Use Supabase best practices with TypeScript safety
- **Review with**: @code-reviewer for query optimization and security

#### 🎨 Mobile UI & Korean UX

**For responsive design and localization:**

- "Improve touch interactions"
- "Add Korean input handling"
- "Optimize mobile performance"
- **Approach**: Touch-friendly design with Korean cultural considerations
- **Review with**: @code-reviewer for accessibility and UX patterns

#### 🔍 Quality Assurance

**For comprehensive code review:**

- "Review my invitation editor changes"
- "Audit authentication security"
- "Check mobile performance optimizations"
- **Direct to**: @code-reviewer for thorough analysis

### How to Use Your Current Team

#### For New Feature Development

1. **Start**: Describe your feature goal clearly
2. **Develop**: Build using project conventions in CLAUDE.md
3. **Review**: Call @code-reviewer with: "Review my [feature] implementation"
4. **Iterate**: Apply feedback and commit with proper messages

#### For Code Quality Improvements

1. **Target**: "Review authentication flow for security issues"
2. **Scope**: "Audit invitation sharing for performance bottlenecks"
3. **Standards**: "Check compliance with Next.js 15 and TypeScript best practices"

#### For Bug Fixes

1. **Analyze**: Describe the issue and attempted solutions
2. **Fix**: Implement solution following project patterns
3. **Validate**: Have @code-reviewer verify the fix doesn't introduce new issues

### Specialized Knowledge Areas

#### Next-Safe-Action Expertise

- Type-safe server action patterns
- Validation schema design with Zod
- Authentication middleware implementation
- Korean error message handling

#### Mobile Wedding Platform Domain

- Touch-friendly block editor interfaces
- Korean cultural wedding traditions
- RSVP and guest management workflows
- Template-based design systems

#### Supabase Integration

- Row Level Security (RLS) policy design
- Real-time subscription patterns
- File upload and storage optimization
- PostgreSQL query performance

### Development Workflow with Current Team

1. **Planning Phase**
   - Reference CLAUDE.md sections 1-16 for constraints
   - Use tasks.md for implementation sequence
   - Follow Korean terminology (section 12)

2. **Implementation Phase**
   - Apply Server/Client component rules (section 8)
   - Use Safe Action development checklist (section 9)
   - Follow mobile-first responsive principles

3. **Quality Assurance Phase**
   - Run `npm run lint:fix && npm run type-check`
   - Call @code-reviewer for expert analysis
   - Apply feedback before committing

4. **Commit Phase**
   - Use Korean commit messages with [AI] tags
   - Include AIDEV-NOTE comments for complex code
   - Follow commit discipline (section 11)

### Example Task Commands

```bash
# Feature Development
"Build a mobile-optimized RSVP form with Korean validation messages"

# Code Review  
"@code-reviewer: Review my new invitation sharing component for security and performance"

# Bug Fixing
"Fix the Korean input handling issue in the contact block editor"

# Performance Optimization
"Optimize the template loading performance for mobile devices"
```

Your AI development team is configured for high-quality, culturally-aware mobile development with strong TypeScript safety and Korean user experience focus!
