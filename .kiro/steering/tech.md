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
- 🔄 Working on invitation editor implementation
- 🔄 Working on RSVP system
- 🔄 Working on dashboard implementation
