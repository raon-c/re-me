# Technology Stack

## Frontend Framework

- **Next.js 15+** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** with Server Components and Client Components
- **Tailwind CSS 3.3+** for mobile-first responsive design
- **Shadcn/ui** component library

## API & State Management

- **Next-Safe-Action 8+** for type-safe server actions with enhanced security
- **Zod 4+** for schema validation and input/output type safety
- **React Hook Form 7.0+** for form management
- **Direct Supabase Client** for real-time data and optimistic updates

## Backend Services

- **Supabase** as Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (JWT + OAuth)
  - File storage with bucket policies
  - Real-time subscriptions
  - Direct SQL access with type-safe client

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

### Database (Supabase)

```bash
# Generate TypeScript types from Supabase schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# Database operations are managed through Supabase Dashboard or CLI
# Schema changes and migrations are handled via Supabase interface
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
- ✅ Next-Safe-Action integration with enhanced security
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
- ✅ Safe Action Architecture Migration 완료
  - ✅ tRPC/Prisma 제거 및 Next-Safe-Action 8+ 도입
  - ✅ 36개 Safe Actions 구현 (인증, 템플릿, 청첩장, 업로드, RSVP)
  - ✅ 타입 안전성 강화 및 보안 향상
  - ✅ 미들웨어 기반 인증 및 로깅 시스템
- 🔄 Working on invitation CRUD UI
- 🔄 Working on RSVP system UI
- 🔄 Working on dashboard implementation

## Next-Safe-Action Guidelines (CRITICAL)

### 🚨 Safe Action Architecture Rules

⚠️ **All server-side operations MUST use Safe Actions**: Never use fetch() or axios

#### Safe Action Client Types
```typescript
// Basic client for public actions
export const actionClient = createSafeActionClient({ ... });

// Requires authentication middleware  
export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return next({ ctx: { user, supabase } });
});

// Admin permissions required
export const adminActionClient = authActionClient.use(...);

// With rate limiting
export const rateLimitedActionClient = actionClient.use(...);
```

#### Safe Action Structure Pattern
```typescript
export const exampleAction = authActionClient
  .schema(validationSchema)  // Zod schema for input validation
  .action(async ({ parsedInput, ctx }) => {
    const { user, supabase } = ctx;  // Authenticated context
    const { data } = parsedInput;    // Validated input
    
    try {
      // Database operation with error handling
      const result = await supabase.from('table').insert(data);
      
      // Cache invalidation
      revalidatePath('/relevant-path');
      
      return {
        message: '성공적으로 처리되었습니다.',
        data: result.data,
      };
    } catch (error) {
      throw new Error('처리 중 오류가 발생했습니다.');
    }
  });
```

#### Critical Safe Action Rules
1. **Authentication**: Use `authActionClient` for protected actions
2. **Validation**: Always define Zod schemas with Korean error messages
3. **Error Handling**: Provide user-friendly Korean error messages
4. **Cache Management**: Use `revalidatePath()` after mutations
5. **Type Safety**: Full TypeScript support with automatic type inference

#### Usage in Components
```typescript
// Direct usage
const result = await loginAction({ email, password });
if (result?.data) {
  // Success handling
} else {
  console.error(result?.serverError);
}

// With custom hooks
const { execute, isLoading, error } = useSafeAction(uploadImageAction);
await execute({ file, folder: 'invitations' });
```

### 📁 Safe Action File Organization
- `src/actions/safe-auth-actions.ts` - Authentication (10 actions)
- `src/actions/safe-template-actions.ts` - Templates (8 actions)  
- `src/actions/safe-invitation-actions.ts` - Invitations (8 actions)
- `src/actions/safe-upload-actions.ts` - File uploads (4 actions)
- `src/actions/safe-rsvp-actions.ts` - RSVP management (6 actions)

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
