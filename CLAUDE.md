# CLAUDE.md  
*Last updated 2025-01-15*

> **Purpose** – This file is the onboarding manual for every AI assistant (Claude, Cursor, GPT, etc.) and every human who edits this repository.  
> It encodes our coding standards, guard-rails, and workflow practices so the *human decision-making* (architecture, business logic, UX) stays in human hands.

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

| # | AI *may* do | AI *must NOT* do |
|---|-------------|------------------|
| G-0 | Ask for clarification when unsure about project-specific features, business logic, or UX decisions. | ❌ Make assumptions about user requirements or business logic without confirmation. |
| G-1 | Generate code **only inside** relevant source directories (`src/`, `prisma/`, `supabase/`) or explicitly specified files. | ❌ Touch `.kiro/` directory, test files, or any specification documents without explicit permission. |
| G-2 | Add/update **`AIDEV-NOTE:` anchor comments** near non-trivial edited code. | ❌ Delete or modify existing `AIDEV-` comments without explicit instruction. |
| G-3 | Follow lint/style configs (`eslint`, `prettier`, `typescript`). Use `npm run lint:fix` and `npm run type-check` before commits. | ❌ Reformat code to any other style or ignore TypeScript errors. |
| G-4 | For changes >300 LOC or >3 files, **ask for confirmation** before proceeding. | ❌ Refactor large modules or change core architecture without human guidance. |
| G-5 | Stay within current task context. Reference tasks.md for implementation sequence. | ❌ Jump to unrelated features or skip implementation steps without discussion. |

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

---

## 6. Anchor comments

Add specially formatted comments throughout the codebase for AI and developer guidance.

### Guidelines:
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

### Important Files:
- **API Route Definitions**: `src/server/api/routers/` (auth.ts, invitation.ts, rsvp.ts, template.ts)
- **Database Schema**: `prisma/schema.prisma` and `supabase/schema.sql`
- **Authentication Hook**: `src/hooks/useAuth.ts`
- **Database Client**: `src/lib/db.ts`
- **Supabase Client**: `src/lib/supabase/client.ts`
- **Type Definitions**: `src/types/` (database.ts, index.ts)

### Common Patterns:
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

### Session Boundaries:
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