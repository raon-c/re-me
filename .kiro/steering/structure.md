# Project Structure

## Current Next.js App Router Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Route groups for auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── auth/                     # Auth callback routes
│   │   ├── callback/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/                # User dashboard
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   └── trpc/[trpc]/route.ts  # tRPC API handler
│   ├── templates/                # Templates page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   └── loading.tsx               # Global loading UI
├── components/
│   ├── ui/                       # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── ...
│   ├── common/                   # Shared components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── auth/                     # Authentication components
│   │   ├── SocialLogin.tsx
│   │   └── UserProfile.tsx
│   ├── blocks/                   # ✅ Block-based editor components
│   │   ├── BaseBlock.tsx         # Base block wrapper component
│   │   ├── HeaderBlock.tsx       # Header block (bride/groom names, date)
│   │   ├── ContentBlock.tsx      # Content block (text content)
│   │   ├── ImageBlock.tsx        # Image block with upload functionality
│   │   ├── ContactBlock.tsx      # Contact information block
│   │   ├── LocationBlock.tsx     # Venue location block
│   │   ├── RsvpBlock.tsx         # RSVP functionality block
│   │   ├── BlockEditor.tsx       # Main block editor component
│   │   └── index.ts              # Block component exports
│   ├── invitation/               # Invitation-related components
│   │   ├── TemplateCard.tsx
│   │   ├── TemplatePreviewModal.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── BlockBasedEditor.tsx  # ✅ Block-based editor integration
│   │   └── InvitationEditor.tsx  # ✅ Main editor component
│   └── providers/                # Provider components
│       └── trpc-provider.tsx
├── server/                       # tRPC server code
│   └── api/
│       ├── routers/              # tRPC routers
│       ├── root.ts               # Root router
│       └── trpc.ts               # tRPC configuration
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database client
│   ├── server-api.ts             # Server API utilities
│   ├── supabase/                 # Supabase utilities
│   │   ├── client.ts             # Supabase client
│   │   ├── server.ts             # Supabase server
│   │   └── utils.ts              # Supabase utilities
│   ├── blocks/                   # ✅ Block system utilities
│   │   └── block-factory.ts      # Block creation and management factory
│   ├── trpc.ts                   # tRPC client configuration
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod validation schemas
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   ├── useBlocks.ts              # ✅ Block state management hook
│   └── useImageUpload.ts         # ✅ Image upload hook
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Auth types
│   ├── database.ts               # Database types
│   ├── blocks.ts                 # ✅ Block system type definitions
│   └── index.ts                  # Common types
├── styles/                       # Additional styles
│   └── templates.css             # Template-specific styles
└── features/                     # Feature-specific code
    └── wedding-editor/           # Wedding editor feature
        └── lib/                  # Wedding editor utilities
```

## Key Architectural Patterns

### Server vs Client Component Architecture (CRITICAL)

**BEFORE modifying ANY component, identify its type and dependencies:**

#### Server Components (Default in App Router)
```
src/app/*/page.tsx           # All pages are server components by default
src/components/**/display/   # Static display components
src/lib/auth-utils.ts        # Server-side utilities
```

Requirements:
- ✅ Can use `await` for data fetching
- ✅ Access to server APIs (cookies, headers)
- ❌ NO React hooks (`useState`, `useEffect`)
- ❌ NO event handlers
- ❌ NO browser APIs

#### Client Components (Require 'use client')
```
src/components/**/interactive/  # Interactive components
src/components/**/forms/        # Form components with state
src/hooks/                      # All custom hooks
```

Requirements:
- ✅ React hooks and state management
- ✅ Event handlers and interactivity
- ✅ Browser APIs
- ❌ NO direct server API access

#### Mixed Component Patterns
```typescript
// ✅ CORRECT: Server component with client children
export default async function ServerPage() {
  const data = await fetchServerData();
  return (
    <div>
      <StaticDisplay data={data} />           {/* Server component */}
      <InteractiveSection userData={data} />  {/* Client component */}
    </div>
  );
}

// ✅ Client component for interactions
'use client';
export function InteractiveSection({ userData }) {
  const [state, setState] = useState();
  return <button onClick={handleClick}>Click me</button>;
}
```

### File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **Components**: PascalCase (e.g., `TemplateSelector.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `validations.ts`)
- **Types**: camelCase (e.g., `auth.ts`)

### Component Organization

- **UI Components**: Reusable, unstyled base components from Shadcn/ui
- **Feature Components**: Business logic components organized by feature
- **Page Components**: Top-level components that represent routes
- **Common Components**: Shared across multiple features

### API Structure

- **tRPC Routers**: Organized by domain (auth, invitation, rsvp, template)
- **Procedures**: Type-safe API endpoints with input/output validation
- **Middleware**: Authentication and authorization logic
- **Error Handling**: Centralized error handling with proper HTTP status codes

### State Management

- **Server State**: Managed by TanStack Query + tRPC
- **Client State**: React state and context for UI state
- **Form State**: React Hook Form for complex forms
- **Authentication State**: Supabase Auth with custom hooks

### Database Schema

- **Users**: Authentication and profile information
- **Invitations**: Wedding invitation data and settings
- **RSVP Responses**: Guest responses and attendance data
- **Templates**: Predefined invitation templates
- **Invitation Views**: Analytics and tracking data

## Development Guidelines

### Import Organization

```typescript
// 1. React and Next.js imports
import React from 'react';
import { NextPage } from 'next';

// 2. Third-party libraries
import { z } from 'zod';
import { useForm } from 'react-hook-form';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { api } from '@/lib/trpc';

// 4. Relative imports
import './styles.css';
```

### Component Structure

```typescript
// Props interface
interface ComponentProps {
  // props definition
}

// Main component
export function Component({ ...props }: ComponentProps) {
  // hooks
  // state
  // effects
  // handlers
  // render
}

// Default export
export default Component;
```

### Error Boundaries

- Wrap major sections with error boundaries
- Provide fallback UI for graceful degradation
- Log errors for monitoring and debugging

### Performance Considerations

- Use React.memo for expensive components
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Lazy load non-critical components

## Implementation Progress

- ✅ Basic project structure setup
- ✅ Authentication components and routes
- ✅ Template selection components
- ✅ Block-based invitation editor system (Task 6 완료)
  - ✅ 6가지 블록 타입 완전 구현
  - ✅ 모바일 최적화 세로 컬럼 레이아웃
  - ✅ 터치 친화적 편집 인터페이스
  - ✅ TypeScript 타입 안전성 보장
  - ✅ React Hook 순서 일관성 확보
- 🔄 Working on RSVP components
- 🔄 Working on dashboard components

## Block-Based Editor Architecture

### 🎯 Design Philosophy
- **Mobile-First**: 9:16 세로 화면 비율에 최적화
- **Touch-Friendly**: 드래그 앤 드롭 대신 블록 기반 편집
- **Modular**: 각 블록은 독립적으로 편집 가능
- **Type-Safe**: 완전한 TypeScript 타입 정의

### 🧩 Block Types
1. **HeaderBlock**: 신랑신부 이름, 결혼식 날짜/시간
2. **ContentBlock**: 텍스트 콘텐츠 (일반/리치 텍스트)
3. **ImageBlock**: 이미지 업로드 및 표시
4. **ContactBlock**: 연락처 정보 관리
5. **LocationBlock**: 예식장 위치 및 교통 정보
6. **RsvpBlock**: 참석 확인 기능

### 🔧 Technical Implementation
- **State Management**: useReducer 기반 블록 상태 관리
- **Hook Consistency**: 모든 블록 컴포넌트에서 일관된 Hook 순서
- **Factory Pattern**: BlockFactory로 블록 생성 및 관리
- **Type Safety**: 완전한 TypeScript 타입 정의
