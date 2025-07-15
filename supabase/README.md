# Supabase Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Environment Variables Setup

1. Copy your Supabase project URL and anon key from the project settings
2. Update your `.env.local` file with the following values:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create tables and policies
5. Copy and paste the contents of `supabase/seed.sql`
6. Run the SQL to insert initial template data

### Option 2: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

3. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push the schema:
   ```bash
   supabase db push
   ```

## Authentication Setup

### Social Login Configuration

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable the providers you want to use:

#### Google OAuth
- Enable Google provider
- Add your Google OAuth client ID and secret
- Add authorized redirect URLs:
  - `https://your-project-ref.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (for development)

#### Kakao OAuth
- Enable Kakao provider (if available) or use custom OAuth
- Add your Kakao app ID and secret
- Configure redirect URLs

### Email Configuration

1. Go to Authentication > Settings
2. Configure your SMTP settings or use Supabase's built-in email service
3. Customize email templates as needed

## Storage Setup

The schema automatically creates a storage bucket called `invitation-images` for storing user-uploaded images.

### Storage Policies

The following policies are automatically created:
- Public read access to invitation images
- Authenticated users can upload images
- Users can only modify their own images

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Users Table
- Users can only view and modify their own profile

### Invitations Table
- Users can only manage their own invitations
- Public read access for invitation viewing (by code)

### RSVP Responses Table
- Users can view RSVP responses for their own invitations
- Anyone can submit RSVP responses
- Users can manage RSVP responses for their own invitations

### Invitation Views Table
- Users can view analytics for their own invitations
- Anyone can record invitation views (for analytics)

### Templates Table
- Public read access to all templates
- Only authenticated users can manage templates

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check that the Supabase connection is working by:
   - Visiting the app in your browser
   - Opening browser dev tools and checking for any Supabase connection errors
   - Testing user registration/login functionality

## Troubleshooting

### Common Issues

1. **Connection Error**: Verify your environment variables are correct
2. **RLS Policy Error**: Make sure you're authenticated when accessing protected resources
3. **CORS Error**: Check that your domain is added to the allowed origins in Supabase settings

### Useful Supabase CLI Commands

```bash
# Check connection status
supabase status

# View logs
supabase logs

# Reset database (careful!)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

## Next Steps

After completing the Supabase setup:

1. Test the authentication flow
2. Verify database operations work correctly
3. Test file upload to storage
4. Proceed with implementing tRPC API routes