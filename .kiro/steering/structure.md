# Project Structure

## Next.js App Router Structure

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
│   ├── globals.css              # Global styles
│   └── loading.tsx              # Global loading UI
├── components/
│   ├── ui/                      # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── ...
│   ├── common/                  # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── SocialLogin.tsx
│   ├── invitation/              # Invitation-related components
│   │   ├── TemplateSelector.tsx
│   │   ├── InvitationEditor.tsx
│   │   ├── InvitationPreview.tsx
│   │   └── ShareModal.tsx
│   ├── rsvp/                    # RSVP components
│   │   ├── RSVPForm.tsx
│   │   └── RSVPConfirmation.tsx
│   └── dashboard/               # Dashboard components
│       ├── StatsDashboard.tsx
│       ├── GuestList.tsx
│       └── ExportData.tsx
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
│   ├── useAuth.ts               # Authentication hook
│   ├── useInvitation.ts         # Invitation management hook
│   └── useRSVP.ts               # RSVP hook
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── invitation.ts
│   └── rsvp.ts
└── styles/                      # Additional styles
    └── components.css           # Component-specific styles
```

## Key Architectural Patterns

### File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx`
- **Components**: PascalCase (e.g., `InvitationEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `validations.ts`)
- **Types**: camelCase (e.g., `invitation.ts`)

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
import React from "react";
import { NextPage } from "next";

// 2. Third-party libraries
import { z } from "zod";
import { useForm } from "react-hook-form";

// 3. Internal imports (absolute paths)
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";

// 4. Relative imports
import "./styles.css";
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
