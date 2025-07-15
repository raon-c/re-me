export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          name: string;
          provider: string;
          provider_id: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          name: string;
          provider?: string;
          provider_id?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          name?: string;
          provider?: string;
          provider_id?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      invitations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          groom_name: string;
          bride_name: string;
          wedding_date: string;
          wedding_time: string;
          venue_name: string;
          venue_address: string;
          venue_lat?: number | null;
          venue_lng?: number | null;
          template_id: string;
          custom_message?: string | null;
          dress_code?: string | null;
          parking_info?: string | null;
          meal_info?: string | null;
          special_notes?: string | null;
          rsvp_enabled?: boolean;
          rsvp_deadline?: string | null;
          invitation_code: string;
          background_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          groom_name?: string;
          bride_name?: string;
          wedding_date?: string;
          wedding_time?: string;
          venue_name?: string;
          venue_address?: string;
          venue_lat?: number | null;
          venue_lng?: number | null;
          template_id?: string;
          custom_message?: string | null;
          dress_code?: string | null;
          parking_info?: string | null;
          meal_info?: string | null;
          special_notes?: string | null;
          rsvp_enabled?: boolean;
          rsvp_deadline?: string | null;
          invitation_code?: string;
          background_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rsvp_responses: {
        Row: {
          id: string;
          invitation_id: string;
          guest_name: string;
          guest_phone: string | null;
          attendance_status: 'attending' | 'not_attending';
          adult_count: number;
          child_count: number;
          message: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          guest_name: string;
          guest_phone?: string | null;
          attendance_status: 'attending' | 'not_attending';
          adult_count?: number;
          child_count?: number;
          message?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          guest_name?: string;
          guest_phone?: string | null;
          attendance_status?: 'attending' | 'not_attending';
          adult_count?: number;
          child_count?: number;
          message?: string | null;
          submitted_at?: string;
        };
      };
      invitation_views: {
        Row: {
          id: string;
          invitation_id: string;
          ip_address: string | null;
          user_agent: string | null;
          viewed_at: string;
          view_duration: number | null;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          ip_address?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
          view_duration?: number | null;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          viewed_at?: string;
          view_duration?: number | null;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          category: string;
          preview_image_url: string;
          css_styles: Record<string, any>;
          html_structure: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          category: string;
          preview_image_url: string;
          css_styles: Record<string, any>;
          html_structure: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          preview_image_url?: string;
          css_styles?: Record<string, any>;
          html_structure?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
