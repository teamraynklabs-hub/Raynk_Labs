/**
 * RaYnk Labs - Admin Feature Types
 * Type definitions specific to admin functionality
 */

// Re-export common types for convenience
export type {
  Course,
  Project,
  Service,
  TeamMember,
  Software,
  Submission,
  Hero,
  AboutSection,
  Community,
  Meetup,
  UpcomingProject,
  CloudinaryImage,
} from '@/types';

// Admin-specific form types
export interface AdminFormState {
  modalOpen: boolean;
  editing: boolean;
  saving: boolean;
}

// Generic entity with ID
export interface Entity {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Ordered entity
export interface OrderedEntity extends Entity {
  order?: number;
  isActive?: boolean;
}

// Entity with image
export interface ImageEntity extends Entity {
  image?: {
    url: string;
    publicId: string;
  };
}
