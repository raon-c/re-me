// AIDEV-NOTE: Core type definitions for template system
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Invitation {
  id: string;
  user_id: string;
  title: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  venue_lat: number | null;
  venue_lng: number | null;
  template_id: string;
  custom_message: string | null;
  dress_code: string | null;
  parking_info: string | null;
  meal_info: string | null;
  special_notes: string | null;
  rsvp_enabled: boolean;
  rsvp_deadline: string | null;
  invitation_code: string;
  background_image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Template types
export type TemplateCategory = 'classic' | 'modern' | 'romantic' | 'minimal';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  previewImageUrl: string;
  cssStyles: Record<string, unknown> | string | number | boolean | null; // JsonValue from Prisma
  htmlStructure: string;
  createdAt: Date;
}

export interface TemplateRenderData {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  customMessage?: string;
  dressCode?: string;
  parkingInfo?: string;
  mealInfo?: string;
  specialNotes?: string;
  backgroundImageUrl?: string;
}

// AIDEV-NOTE: Template system interfaces for rendering and styling

// Dashboard types
export interface InvitationWithStats extends Invitation {
  view_count: number;
  rsvp_count: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url?: string;
}

// Share functionality types
export interface ShareData {
  id: string;
  invitation_code: string;
  groom_name: string;
  bride_name: string;
  wedding_date: string;
  wedding_time: string;
  venue_name: string;
}
