-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'email',
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    wedding_date DATE NOT NULL,
    wedding_time TIME NOT NULL,
    venue_name VARCHAR(200) NOT NULL,
    venue_address TEXT NOT NULL,
    venue_lat DECIMAL(10, 8),
    venue_lng DECIMAL(11, 8),
    template_id VARCHAR(50) NOT NULL,
    custom_message TEXT,
    dress_code VARCHAR(100),
    parking_info TEXT,
    meal_info TEXT,
    special_notes TEXT,
    rsvp_enabled BOOLEAN DEFAULT TRUE,
    rsvp_deadline DATE,
    invitation_code VARCHAR(8) UNIQUE NOT NULL,
    background_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS public.rsvp_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    guest_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    attendance_status VARCHAR(20) NOT NULL CHECK (attendance_status IN ('attending', 'not_attending')),
    adult_count INTEGER DEFAULT 1,
    child_count INTEGER DEFAULT 0,
    message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create invitation views table for analytics
CREATE TABLE IF NOT EXISTS public.invitation_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_duration INTEGER -- in seconds
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    preview_image_url VARCHAR(500) NOT NULL,
    css_styles JSONB NOT NULL,
    html_structure TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_invitation_id ON public.rsvp_responses(invitation_id);
CREATE INDEX IF NOT EXISTS idx_invitation_views_invitation_id ON public.invitation_views(invitation_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for invitations table
CREATE POLICY "Users can view own invitations" ON public.invitations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own invitations" ON public.invitations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own invitations" ON public.invitations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own invitations" ON public.invitations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Public access to invitations by code (for guests)
CREATE POLICY "Public can view invitations by code" ON public.invitations
    FOR SELECT USING (true);

-- RLS Policies for RSVP responses table
CREATE POLICY "Users can view RSVP responses for own invitations" ON public.rsvp_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invitations 
            WHERE invitations.id = rsvp_responses.invitation_id 
            AND invitations.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can submit RSVP responses" ON public.rsvp_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update RSVP responses for own invitations" ON public.rsvp_responses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.invitations 
            WHERE invitations.id = rsvp_responses.invitation_id 
            AND invitations.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete RSVP responses for own invitations" ON public.rsvp_responses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.invitations 
            WHERE invitations.id = rsvp_responses.invitation_id 
            AND invitations.user_id::text = auth.uid()::text
        )
    );

-- RLS Policies for invitation views table
CREATE POLICY "Users can view analytics for own invitations" ON public.invitation_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.invitations 
            WHERE invitations.id = invitation_views.invitation_id 
            AND invitations.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can record invitation views" ON public.invitation_views
    FOR INSERT WITH CHECK (true);

-- RLS Policies for templates table (public read access)
CREATE POLICY "Anyone can view templates" ON public.templates
    FOR SELECT USING (true);

-- Only authenticated users can manage templates (admin functionality)
CREATE POLICY "Authenticated users can manage templates" ON public.templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for invitation images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invitation-images', 'invitation-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for invitation images
CREATE POLICY "Anyone can view invitation images" ON storage.objects
    FOR SELECT USING (bucket_id = 'invitation-images');

CREATE POLICY "Authenticated users can upload invitation images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'invitation-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own invitation images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'invitation-images' 
        AND auth.uid()::text = owner::text
    );

CREATE POLICY "Users can delete own invitation images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'invitation-images' 
        AND auth.uid()::text = owner::text
    );