/**
 * RaYnk Labs - Application Constants
 * Centralized constants used across the application
 */

// Blocked email domains for spam prevention
export const BLOCKED_EMAIL_DOMAINS = [
  'tempmail',
  'mailinator',
  '10minutemail',
  'guerrillamail',
  'yopmail',
  'fakeinbox',
  'throwaway',
  'tempinbox',
] as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 5 },       // 5 attempts per 15 min
  API: { windowMs: 60 * 1000, max: 100 },           // 100 requests per minute
  SUBMISSION: { windowMs: 60 * 60 * 1000, max: 10 }, // 10 submissions per hour
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

// Admin roles
export const ADMIN_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

// Entity status values
export const ENTITY_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

// Submission status values
export const SUBMISSION_STATUS = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
} as const;

export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];

// Course levels
export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export type CourseLevel = typeof COURSE_LEVELS[keyof typeof COURSE_LEVELS];

// Course badges
export const COURSE_BADGES = {
  FREE: 'Free',
  PAID: 'Paid',
  POPULAR: 'Popular',
} as const;

export type CourseBadge = typeof COURSE_BADGES[keyof typeof COURSE_BADGES];

// Project status
export const PROJECT_STATUS = {
  LIVE: 'Live',
  COMING_SOON: 'Coming Soon',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// Meetup types
export const MEETUP_TYPES = {
  MEETUP: 'meetup',
  MASTERCLASS: 'masterclass',
  PODCAST: 'podcast',
} as const;

export type MeetupType = typeof MEETUP_TYPES[keyof typeof MEETUP_TYPES];

// API Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
