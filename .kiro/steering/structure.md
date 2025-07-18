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
│   ├── invitation/               # Invitation-related components
│   │   ├── TemplateCard.tsx
│   │   ├── TemplatePreviewModal.tsx
│   │   └── TemplateSelector.tsx
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
│   ├── trpc.ts                   # tRPC client configuration
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod validation schemas
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Authentication hook
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Auth types
│   ├── database.ts               # Database types
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
- 🔄 Working on invitation editor components
- 🔄 Working on RSVP components
- 🔄 Working on dashboard components
