# CLAUDE.md

_Last updated 2025-07-17_

> **Purpose** – This file is the onboarding manual for every AI assistant (Claude, Cursor, GPT, etc.) and every human who edits this repository.  
> It encodes our coding standards, guard-rails, and workflow practices so the _human decision-making_ (architecture, business logic, UX) stays in human hands.

---

## 0. Project Overview

**Mobile Wedding Invitation Service** is a web-based platform that enables users to easily create and share digital wedding invitations through smartphones. The service provides an eco-friendly and cost-effective alternative to traditional paper invitations.

**Core Features**:

- **Template-based Design**: 15+ wedding invitation templates categorized by theme (Classic, Modern, Romantic, Minimal)
- **Mobile-First Editor**: Drag-and-drop interface with touch-friendly editing capabilities
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
| G-1 | Generate code **only inside** relevant source directories (`src/`, `prisma/`, `supabase/`) or explicitly specified files.       | ❌ Touch `.kiro/` directory, test files, or any specification documents without explicit permission. |
| G-2 | Add/update **`AIDEV-NOTE:` anchor comments** near non-trivial edited code.                                                      | ❌ Delete or modify existing `AIDEV-` comments without explicit instruction.                         |
| G-3 | Follow lint/style configs (`eslint`, `prettier`, `typescript`). Use `npm run lint:fix` and `npm run type-check` before commits. | ❌ Reformat code to any other style or ignore TypeScript errors.                                     |
| G-4 | For changes >300 LOC or >3 files, **ask for confirmation** before proceeding.                                                   | ❌ Refactor large modules or change core architecture without human guidance.                        |
| G-5 | Stay within current task context. Reference tasks.md for implementation sequence.                                               | ❌ Jump to unrelated features or skip implementation steps without discussion.                       |

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

# Database operations
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:reset         # Reset database and run migrations
npm run db:seed          # Seed database with initial data

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
// Use typed errors with proper user feedback
import { TRPCError } from '@trpc/server';

export const createInvitation = async (input: CreateInvitationInput) => {
  try {
    // Process invitation
    return result;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: '입력하신 정보를 다시 확인해 주세요.',
      });
    }
    throw error;
  }
};
```

---

## 4. Technology Stack & Architecture

### Full-Stack Framework

- **Next.js 14+** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** with Server Components and Client Components
- **Tailwind CSS 3.3+** for mobile-first responsive design
- **Shadcn/ui** component library

### API & State Management

- **tRPC 10+** for type-safe API communication
- **TanStack Query 4+** for server state management (integrated with tRPC)
- **Zod** for schema validation
- **React Hook Form 7.0+** for form management

### Backend Services

- **Supabase** as Backend-as-a-Service
  - PostgreSQL database
  - Authentication (JWT + OAuth)
  - File storage
  - Real-time subscriptions
- **Prisma 5.0+** as ORM (Supabase integration)

### External Services

- **Kakao Map API** for location services
- **Kakao/Google OAuth** for social login
- **Resend** for email services

---

## 5. Project layout & Core Components

### Next.js App Router Structure

```
src/
├── app/                          # Next.js 14 App Router
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
│   ├── api/
│   │   └── trpc/[trpc]/route.ts  # ✅ tRPC API 핸들러 완료
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
│   ├── invitation/               # ✅ 템플릿 관련 컴포넌트 완료
│   │   ├── TemplateCard.tsx
│   │   ├── TemplatePreviewModal.tsx
│   │   └── TemplateSelector.tsx
│   ├── providers/                # ✅ 프로바이더 컴포넌트 완료
│   │   └── trpc-provider.tsx
│   ├── rsvp/                     # 🚧 RSVP 컴포넌트 (계획됨)
│   └── dashboard/                # 🚧 대시보드 컴포넌트 (계획됨)
├── server/                       # ✅ tRPC 서버 코드 완료
│   ├── api/
│   │   ├── routers/              # tRPC 라우터
│   │   │   ├── auth.ts           # ✅ 인증 라우터 완료
│   │   │   └── template.ts       # ✅ 템플릿 라우터 완료
│   │   ├── root.ts               # ✅ 루트 라우터 완료
│   │   └── trpc.ts               # ✅ tRPC 설정 완료
│   └── db/
│       └── index.ts              # ✅ 데이터베이스 클라이언트 완료
├── lib/                          # ✅ 유틸리티 라이브러리 완료
│   ├── supabase/
│   │   ├── client.ts             # ✅ Supabase 클라이언트 설정
│   │   └── server.ts             # ✅ Supabase 서버 설정
│   ├── trpc.ts                   # ✅ tRPC 클라이언트 설정
│   ├── utils.ts                  # ✅ 일반 유틸리티
│   └── validations.ts            # ✅ Zod 검증 스키마
├── hooks/                        # ✅ 커스텀 React 훅 완료
│   └── useAuth.ts                # ✅ 인증 훅
├── types/                        # ✅ TypeScript 타입 정의 완료
│   ├── auth.ts
│   ├── database.ts
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
- Dual database setup: Prisma for type-safe queries, Supabase for auth and RLS

### tRPC API Structure

- **Authentication Router**: ✅ User registration, login, logout, session management (완료)
- **Template Router**: ✅ Template catalog with category-based filtering (완료)
- **Invitation Router**: 🚧 CRUD operations for invitations, image uploads, public access (계획됨)
- **RSVP Router**: 🚧 Guest response submission, statistics, data export (계획됨)

### Authentication Flow

- ✅ Supabase Auth with email/password and OAuth providers (Google, Kakao) - 완료
- ✅ Custom `useAuth` hook provides authentication state and methods - 완료
- ✅ RLS policies ensure users can only access their own data - 완료
- 🚧 Public access to invitations via unique 8-character invitation codes - 계획됨

### UI Components

- ✅ Built with shadcn/ui component library - 완료
- ✅ Configured in `components.json` with Tailwind CSS integration - 완료
- ✅ Korean language support (locale: "ko") - 완료
- ✅ Mobile-first responsive design with touch-friendly interfaces - 진행 중

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

- **Server State**: Managed by TanStack Query + tRPC
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
   - tRPC 서버/클라이언트 설정 완료

2. **Authentication System** (Task 4)
   - Supabase Auth 설정 (이메일/비밀번호, Google/Kakao OAuth)
   - 인증 tRPC 라우터 구현 완료
   - 로그인/회원가입 UI 컴포넌트 구현
   - 사용자 프로필 관리 기능
   - OAuth 콜백 처리 및 비밀번호 재설정

3. **Template System** (Task 5)
   - 템플릿 데이터 모델 및 tRPC 라우터 구현
   - 템플릿 카테고리별 필터링 및 조회 기능
   - 템플릿 선택 UI 및 미리보기 컴포넌트
   - 15개 기본 템플릿 데이터 생성

### 🚧 Next Implementation Steps

1. **Invitation Editor** (Task 6) - 청첩장 편집 기능
2. **Wedding Information Forms** (Task 7) - 결혼식 정보 입력
3. **Invitation CRUD** (Task 8) - 청첩장 관리 기능
4. **Sharing Features** (Task 9) - 공유 및 공개 조회
5. **RSVP System** (Task 10) - 참석 응답 시스템

### Environment Variables Required

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `DIRECT_URL` - Direct database connection for migrations
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase operations

### Security Considerations

- ✅ RLS policies implemented for all tables - 완료
- ✅ CORS headers configured in next.config.js - 완료
- 🚧 Storage bucket policies for image uploads - 계획됨
- 🚧 Invitation codes for secure guest access - 계획됨
- ✅ HTTPS enforcement and XSS prevention - 완료

### Development Workflow

1. ✅ Database changes should be made in both Prisma schema and Supabase SQL - 완료
2. ✅ Run `npm run db:generate` after schema changes - 완료
3. ✅ Use `npm run db:push` to apply changes to development database - 완료
4. ✅ Always run `npm run type-check` and `npm run lint` before commits - 완료
5. ✅ Follow mobile-first responsive design principles - 진행 중
6. ✅ Implement proper error handling and loading states - 진행 중

### Testing Strategy

- Unit tests with Jest + React Testing Library (80%+ coverage target)
- Integration tests for API endpoints and database operations
- E2E tests with Playwright for main user flows
- Performance testing with Lighthouse (3-second load time goal)

---

## 8. Commit discipline

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

## 9. Domain-specific terminology

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

## 10. Key File & Pattern References

### Important Files

- **API Route Definitions**: `src/server/api/routers/` (✅ auth.ts, ✅ template.ts, 🚧 invitation.ts, 🚧 rsvp.ts)
- **Database Schema**: ✅ `prisma/schema.prisma` and ✅ `supabase/migrations/`
- **Authentication Hook**: ✅ `src/hooks/useAuth.ts`
- **Database Client**: ✅ `src/lib/db/index.ts`
- **Supabase Client**: ✅ `src/lib/supabase/client.ts` and ✅ `src/lib/supabase/server.ts`
- **Type Definitions**: ✅ `src/types/` (auth.ts, database.ts, index.ts)

### Common Patterns

- **tRPC Procedures**: Type-safe API endpoints with input validation
- **Prisma Queries**: Type-safe database operations with proper error handling
- **Supabase Auth**: JWT-based authentication with RLS policies
- **Form Validation**: Zod schemas with React Hook Form
- **Error Handling**: Typed errors with Korean user-friendly messages
- **Mobile Components**: Touch-friendly UI with proper accessibility

---

## 11. AI Assistant Workflow

When responding to user instructions, follow this process:

1. **Consult Guidance**: Reference this CLAUDE.md and tasks.md for context
2. **Clarify Ambiguities**: Ask targeted questions about business logic or UX decisions
3. **Break Down & Plan**: Create implementation plan following project conventions
4. **Trivial Tasks**: Proceed immediately for simple changes
5. **Non-Trivial Tasks**: Present plan for review before implementation
6. **Track Progress**: Use todo lists for multi-step tasks
7. **Update Documentation**: Add/update AIDEV- comments and documentation
8. **Quality Check**: Run linting and type checking before commits
9. **User Review**: Request feedback on completed work

### Session Boundaries

- If switching between unrelated features, suggest fresh session
- Reference tasks.md for proper implementation sequence
- Maintain context within current task scope

---

## 12. Files to NOT modify

- **`.kiro/`**: Project specifications and requirements (human-owned)
- **`node_modules/`**: Package dependencies
- **`.next/`**: Next.js build artifacts
- **`test/`**: Test files (require human review)
- **Environment files**: `.env*` (sensitive configuration)
- **Package locks**: `package-lock.json` (auto-generated)

**When adding new files or directories**, ensure they follow the established patterns and don't conflict with existing structure.
