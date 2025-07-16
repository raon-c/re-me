// AIDEV-NOTE: Core type definitions for template system
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Invitation {
  id: string;
  title: string;
  // More fields will be added in later tasks
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
