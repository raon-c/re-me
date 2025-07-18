# Technology Stack

## Frontend Framework

- **Next.js 15+** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** with Server Components and Client Components
- **Tailwind CSS 3.3+** for mobile-first responsive design
- **Shadcn/ui** component library

## API & State Management

- **tRPC 11+** for type-safe API communication
- **TanStack Query 5+** for server state management (integrated with tRPC)
- **Zod 4+** for schema validation
- **React Hook Form 7.0+** for form management

## Backend Services

- **Supabase** as Backend-as-a-Service
  - PostgreSQL database
  - Authentication (JWT + OAuth)
  - File storage
  - Real-time subscriptions
- **Prisma 6.0+** as ORM (Supabase integration)

## Deployment & Hosting

- **Vercel** for serverless deployment
- **PWA** configuration with Service Worker
- **Edge Functions** for performance optimization

## External Services

- **Kakao Map API** for location services
- **Kakao/Google OAuth** for social login
- **Resend** for email services

## Next.js 15 Critical Guidelines

### Server vs Client Components (CRITICAL)

⚠️ **Component Architecture**: Always identify component type BEFORE making changes

#### Server Components (default)
- ✅ Data fetching with `await`
- ✅ Direct database access  
- ✅ Server-only APIs (cookies, headers)
- ❌ NO React hooks (`useState`, `useEffect`)
- ❌ NO event handlers (`onClick`, `onChange`)
- ❌ NO browser APIs (`localStorage`, `window`)

#### Client Components (require `'use client'`)
- ✅ Interactive features and event handlers
- ✅ React hooks and state management
- ✅ Browser APIs
- ❌ NO direct server-only APIs

#### Critical Conversion Checklist
BEFORE converting any component:
1. **Audit Dependencies**: Check for hooks, event handlers, browser APIs
2. **Plan Boundaries**: Identify what needs server vs client rendering
3. **Split Components**: Create separate server/client components if needed
4. **Test Gracefully**: Implement fallbacks for missing data/tables

### Database Integration Rules (CRITICAL)

⚠️ **Graceful Degradation**: Always handle missing tables/API failures

```typescript
// ✅ CORRECT: Graceful fallback pattern
try {
  const profile = await supabase.from('users').select('*').single();
  return profile.data;
} catch (error) {
  console.warn('Users table not found, using auth data:', error);
  return user.user_metadata; // Fallback to auth metadata
}
```

### Middleware Requirements (CRITICAL)

⚠️ **File Location**: Middleware MUST be placed at `src/middleware.ts` (NOT at root level)

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

### Middleware Debugging Checklist

1. **File Location**: Verify middleware is in `src/middleware.ts`
2. **Compilation**: Check `.next/server/middleware-manifest.json` exists
3. **Execution**: Add console.log to verify middleware runs
4. **Build Test**: Run `npm run build` to verify compilation
5. **Route Test**: Use `curl -I` to verify redirects

### Common Middleware Issues

- **Not executing**: Wrong file location (should be `src/middleware.ts`)
- **Auth session missing**: Cookie handling in Supabase createServerClient
- **Build errors**: TypeScript or import issues
- **Route matching**: Incorrect matcher patterns

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Reset database
npm run db:reset

# Seed database
npm run db:seed
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## Performance Requirements

- Page load time: < 3 seconds
- Image optimization: max 1MB, WebP format
- Bundle size optimization with code splitting
- Mobile-first responsive design
- Support for 1000+ concurrent users

## Implementation Progress

- ✅ Project setup with Next.js 15, TypeScript, and Tailwind CSS
- ✅ Shadcn/ui components integration
- ✅ Supabase setup with authentication
- ✅ Prisma ORM integration with Supabase
- ✅ tRPC API setup with TanStack Query
- ✅ Basic authentication flow (login, signup)
- ✅ Template system implementation
- ✅ Middleware authentication control (src/middleware.ts)
- ✅ Block-based invitation editor system (Task 6 완료)
  - ✅ 6가지 블록 타입 완전 구현
  - ✅ 모바일 최적화 세로 컬럼 레이아웃 (9:16 비율)
  - ✅ 터치 친화적 블록 편집 인터페이스
  - ✅ TypeScript 타입 안전성 보장
  - ✅ React Hook 순서 일관성 확보
  - ✅ 기존 DND 방식 제거 및 블록 기반 접근 방식 채택
- 🔄 Working on RSVP system
- 🔄 Working on dashboard implementation

## Block-Based Editor Critical Guidelines

### 🚨 React Hook Order Consistency (CRITICAL)
**방금 같은 실수를 방지하기 위한 가이드라인:**

⚠️ **Hook 순서 일관성**: 모든 블록 컴포넌트에서 Hook은 항상 동일한 순서로 호출되어야 함

#### Hook 순서 패턴 (모든 블록 컴포넌트에 적용)
```typescript
export function AnyBlock({ block, ...props }: BlockProps) {
  // 1. ALWAYS useState first
  const [localData, setLocalData] = useState(block.data);
  
  // 2. Custom hooks in consistent order
  const { uploadImage, isUploading } = useImageUpload(); // if needed
  
  // 3. useRef hooks
  const fileInputRef = useRef<HTMLInputElement>(null); // if needed
  
  // 4. Event handlers (defined after all hooks)
  const handleSave = () => { /* ... */ };
  const handleCancel = () => { /* ... */ };
  
  // 5. Return JSX
  return (
    <BaseBlock {...props}>
      {/* component JSX */}
    </BaseBlock>
  );
}
```

#### 금지사항 (Hook 순서 오류 방지)
- ❌ 조건부 Hook 호출 (if문 내에서 Hook 사용)
- ❌ 반복문 내에서 Hook 호출
- ❌ 중첩 함수 내에서 Hook 호출
- ❌ 컴포넌트 렌더링 중 Hook 순서 변경

#### TypeScript 타입 안전성 패턴
```typescript
// ✅ 타입 단언 사용하여 Union 타입 문제 해결
const updatedBlocks = state.blocks.map(block => 
  block.id === blockId ? { ...block, ...updates } : block
) as Block[];

// ✅ BlockFactory 메서드에서 타입 안전성 보장
static reorderBlocks(blocks: Block[]): Block[] {
  return blocks
    .sort((a, b) => a.order - b.order)
    .map((block, index) => ({
      ...block,
      order: index,
    })) as Block[];
}
```
