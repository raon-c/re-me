# Technology Stack

## Frontend Framework

- **Next.js 14+** with App Router
- **TypeScript 5.0+** for type safety
- **React 18+** with Server Components and Client Components
- **Tailwind CSS 3.3+** for mobile-first responsive design
- **Shadcn/ui** component library

## API & State Management

- **tRPC 10+** for type-safe API communication
- **TanStack Query 4+** for server state management (integrated with tRPC)
- **Zod** for schema validation
- **React Hook Form 7.0+** for form management

## Backend Services

- **Supabase** as Backend-as-a-Service
  - PostgreSQL database
  - Authentication (JWT + OAuth)
  - File storage
  - Real-time subscriptions
- **Prisma 5.0+** as ORM (Supabase integration)

## Deployment & Hosting

- **Vercel** for serverless deployment
- **PWA** configuration with Service Worker
- **Edge Functions** for performance optimization

## External Services

- **Kakao Map API** for location services
- **Kakao/Google OAuth** for social login
- **Resend** for email services

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
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database
npx prisma db reset

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

# Run E2E tests
npm run test:e2e

# Generate test coverage
npm run test:coverage
```

## Performance Requirements

- Page load time: < 3 seconds
- Image optimization: max 1MB, WebP format
- Bundle size optimization with code splitting
- Mobile-first responsive design
- Support for 1000+ concurrent users
