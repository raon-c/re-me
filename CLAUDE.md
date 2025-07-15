# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Mobile Wedding Invitation Service** - a web-based platform that enables users to easily create and share digital wedding invitations through smartphones. The service provides an eco-friendly and cost-effective alternative to traditional paper invitations.

### Core Features
- **Template-based Design**: 15+ wedding invitation templates categorized by theme (Classic, Modern, Romantic, Minimal)
- **Mobile-First Editor**: Drag-and-drop interface with touch-friendly editing capabilities
- **Wedding Information Management**: Date, time, venue, contact details with integrated map services
- **RSVP System**: Guest response collection with attendance tracking and message features
- **Sharing & Distribution**: Multiple sharing options (KakaoTalk, SMS, email, URL)
- **Management Dashboard**: Real-time statistics, guest list management, and data export

## Development Commands

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:reset` - Reset database and run migrations
- `npm run db:seed` - Seed database with initial data

### Testing
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Technology Stack

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

## Project Architecture

### Next.js App Router Structure
```
src/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Route groups for auth pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/                # User dashboard
│   │   ├── page.tsx
│   │   └── [id]/page.tsx        # Individual invitation management
│   ├── invitation/
│   │   ├── create/page.tsx      # Invitation creation flow
│   │   └── [code]/page.tsx      # Public invitation view
│   ├── api/
│   │   └── trpc/[trpc]/route.ts # tRPC API handler
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # Shadcn/ui base components
│   ├── common/                  # Shared components
│   ├── auth/                    # Authentication components
│   ├── invitation/              # Invitation-related components
│   ├── rsvp/                    # RSVP components
│   └── dashboard/               # Dashboard components
├── server/                      # tRPC server code
│   ├── api/
│   │   ├── routers/             # tRPC routers
│   │   │   ├── auth.ts
│   │   │   ├── invitation.ts
│   │   │   ├── rsvp.ts
│   │   │   └── template.ts
│   │   ├── root.ts              # Root router
│   │   └── trpc.ts              # tRPC configuration
│   └── db/
│       ├── schema.ts            # Prisma schema
│       └── index.ts             # Database client
├── lib/                         # Utility libraries
│   ├── supabase.ts              # Supabase client configuration
│   ├── trpc.ts                  # tRPC client configuration
│   ├── utils.ts                 # General utilities
│   └── validations.ts           # Zod validation schemas
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
└── styles/                      # Additional styles
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
- **Authentication Router**: User registration, login, logout, session management
- **Invitation Router**: CRUD operations for invitations, image uploads, public access
- **RSVP Router**: Guest response submission, statistics, data export
- **Template Router**: Template catalog with category-based filtering

### Authentication Flow
- Uses Supabase Auth with email/password and OAuth providers (Google, Kakao)
- Custom `useAuth` hook provides authentication state and methods
- RLS policies ensure users can only access their own data
- Public access to invitations via unique 8-character invitation codes

### UI Components
- Built with shadcn/ui component library
- Configured in `components.json` with Tailwind CSS integration
- Korean language support (locale: "ko")
- Mobile-first responsive design with touch-friendly interfaces

## Key Implementation Details

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

## Important Notes

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection for migrations
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Security Considerations
- RLS policies implemented for all tables
- CORS headers configured in next.config.js
- Storage bucket policies for image uploads
- Invitation codes for secure guest access
- HTTPS enforcement and XSS prevention

### Development Workflow
1. Database changes should be made in both Prisma schema and Supabase SQL
2. Run `npm run db:generate` after schema changes
3. Use `npm run db:push` to apply changes to development database
4. Always run `npm run type-check` and `npm run lint` before commits
5. Follow mobile-first responsive design principles
6. Implement proper error handling and loading states

### Testing Strategy
- Unit tests with Jest + React Testing Library (80%+ coverage target)
- Integration tests for API endpoints and database operations
- E2E tests with Playwright for main user flows
- Performance testing with Lighthouse (3-second load time goal)