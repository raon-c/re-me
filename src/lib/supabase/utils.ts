import { createClient as createBrowserClient } from './client';
import { createClient as createServerClient } from './server';
import { Database } from '@/types/database';

export type SupabaseClient = ReturnType<typeof createBrowserClient>;
export type SupabaseServerClient = Awaited<
  ReturnType<typeof createServerClient>
>;

// Type-safe table references
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types for easier use
export type User = Tables<'users'>;
export type Invitation = Tables<'invitations'>;
export type RSVPResponse = Tables<'rsvp_responses'>;
export type InvitationView = Tables<'invitation_views'>;
export type Template = Tables<'templates'>;

// Insert types
export type UserInsert = TablesInsert<'users'>;
export type InvitationInsert = TablesInsert<'invitations'>;
export type RSVPResponseInsert = TablesInsert<'rsvp_responses'>;
export type InvitationViewInsert = TablesInsert<'invitation_views'>;
export type TemplateInsert = TablesInsert<'templates'>;

// Update types
export type UserUpdate = TablesUpdate<'users'>;
export type InvitationUpdate = TablesUpdate<'invitations'>;
export type RSVPResponseUpdate = TablesUpdate<'rsvp_responses'>;
export type InvitationViewUpdate = TablesUpdate<'invitation_views'>;
export type TemplateUpdate = TablesUpdate<'templates'>;

// Helper function to generate unique invitation codes
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to format date for database
export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to format time for database
export function formatTimeForDB(time: string): string {
  // Ensure time is in HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  return time;
}
