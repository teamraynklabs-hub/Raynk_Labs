/**
 * RaYnk Labs - Zod Validation Schemas
 * Enterprise-grade input validation for all API endpoints
 */

import { z } from 'zod';

// ============================================
// COMMON SCHEMAS
// ============================================

export const cloudinaryImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string().min(1, 'Public ID is required'),
});

export const mongoIdSchema = z.string().min(1, 'ID is required');

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

// Indian mobile number regex (10 digits starting with 6-9)
const indianMobileRegex = /^[6-9]\d{9}$/;

// Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Super Admin login (email-based for founder)
export const superAdminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type SuperAdminLoginInput = z.infer<typeof superAdminLoginSchema>;

// Regular Admin login (mobile-based for team members)
export const adminLoginSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(indianMobileRegex, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// Admin signup schema
export const adminSignupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(indianMobileRegex, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>;

// Admin profile update schema
export const adminProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  profile: z.object({
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  }).optional(),
});

export type AdminProfileUpdateInput = z.infer<typeof adminProfileUpdateSchema>;

// Admin approval/rejection schema
export const adminApprovalSchema = z.object({
  adminId: mongoIdSchema,
  action: z.enum(['approve', 'reject', 'hold', 'suspend']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

export type AdminApprovalInput = z.infer<typeof adminApprovalSchema>;

// ============================================
// COURSE SCHEMAS
// ============================================

export const courseCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  duration: z.string().optional().default(''),
  level: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .default('Beginner'),
  badge: z
    .enum(['Free', 'Paid', 'Popular'])
    .default('Free'),
  order: z.number().int().min(0).default(0),
});

export const courseUpdateSchema = courseCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

// ============================================
// PROJECT SCHEMAS
// ============================================

// Transform comma-separated string to array
const techArrayTransform = z.union([
  z.array(z.string()),
  z.string().transform((val) =>
    val ? val.split(',').map((t) => t.trim()).filter(Boolean) : []
  ),
]).default([]);

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  tech: techArrayTransform,
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  icon: z.string().optional(),
  status: z.enum(['Live', 'Coming Soon']).default('Coming Soon'),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

// ============================================
// SERVICE SCHEMAS
// ============================================

export const serviceCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  icon: z.string().optional().default(''),
  order: z.number().int().min(0).default(0),
});

export const serviceUpdateSchema = serviceCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;

// ============================================
// TEAM SCHEMAS
// ============================================

export const teamCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  role: z
    .string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters'),
  skills: z.string().optional(),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
});

export const teamUpdateSchema = teamCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;

// ============================================
// SOFTWARE SCHEMAS
// ============================================

export const softwareCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  downloadUrl: z
    .string()
    .min(1, 'Download URL is required')
    .url('Invalid download URL'),
});

export const softwareUpdateSchema = softwareCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type SoftwareCreateInput = z.infer<typeof softwareCreateSchema>;
export type SoftwareUpdateInput = z.infer<typeof softwareUpdateSchema>;

// ============================================
// HERO SCHEMAS
// ============================================

const heroButtonSchema = z.object({
  label: z.string().min(1, 'Button label is required'),
  href: z.string().min(1, 'Button href is required'),
});

export const heroCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  tagline: z
    .string()
    .min(1, 'Tagline is required')
    .max(500, 'Tagline must be less than 500 characters'),
  words: z.array(z.string()).default([]),
  primaryBtn: heroButtonSchema.optional(),
  secondaryBtn: heroButtonSchema.optional(),
});

export const heroUpdateSchema = heroCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type HeroCreateInput = z.infer<typeof heroCreateSchema>;
export type HeroUpdateInput = z.infer<typeof heroUpdateSchema>;

// ============================================
// ABOUT SECTION SCHEMAS
// ============================================

const aboutCardSchema = z.object({
  title: z.string().min(1, 'Card title is required'),
  description: z.string().min(1, 'Card description is required'),
  icon: z.string().optional().default(''),
});

export const aboutCreateSchema = z.object({
  heading: z
    .string()
    .min(1, 'Heading is required')
    .max(200, 'Heading must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  cards: z.array(aboutCardSchema).default([]),
});

export const aboutUpdateSchema = aboutCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type AboutCreateInput = z.infer<typeof aboutCreateSchema>;
export type AboutUpdateInput = z.infer<typeof aboutUpdateSchema>;

// ============================================
// COMMUNITY SCHEMAS
// ============================================

export const communityCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  points: z.array(z.string()).default([]),
  ctaText: z.string().default('Join Community — Free'),
});

export const communityUpdateSchema = communityCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type CommunityCreateInput = z.infer<typeof communityCreateSchema>;
export type CommunityUpdateInput = z.infer<typeof communityUpdateSchema>;

// ============================================
// MEETUP SCHEMAS
// ============================================

export const meetupCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  date: z.string().min(1, 'Date is required'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  type: z.enum(['meetup', 'masterclass', 'podcast']).default('meetup'),
  cta: z.string().default('Register'),
});

export const meetupUpdateSchema = meetupCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type MeetupCreateInput = z.infer<typeof meetupCreateSchema>;
export type MeetupUpdateInput = z.infer<typeof meetupUpdateSchema>;

// ============================================
// UPCOMING PROJECT SCHEMAS
// ============================================

const upcomingFeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required'),
  description: z.string().min(1, 'Feature description is required'),
  icon: z.string().optional().default(''),
});

export const upcomingProjectCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  subtitle: z.string().optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  features: z.array(upcomingFeatureSchema).default([]),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
  previewUrl: z.string().url('Invalid preview URL').optional().or(z.literal('')),
});

export const upcomingProjectUpdateSchema = upcomingProjectCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type UpcomingProjectCreateInput = z.infer<typeof upcomingProjectCreateSchema>;
export type UpcomingProjectUpdateInput = z.infer<typeof upcomingProjectUpdateSchema>;

// ============================================
// SUBMISSION SCHEMAS
// ============================================

export const submissionCreateSchema = z.object({
  type: z.string().min(1, 'Submission type is required'),
  originTitle: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  phone: z.string().optional(),
  message: z.string().max(5000, 'Message must be less than 5000 characters').optional(),
});

export const submissionUpdateSchema = z.object({
  id: mongoIdSchema,
  isRead: z.boolean().optional(),
  status: z.enum(['new', 'reviewed', 'resolved']).optional(),
  adminNote: z.string().max(2000, 'Note must be less than 2000 characters').optional(),
});

export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>;
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;

// ============================================
// PERSONAL TASK SCHEMAS
// ============================================

export const personalTaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const personalTaskUpdateSchema = personalTaskCreateSchema.partial().extend({
  id: mongoIdSchema,
  status: z.enum(['todo', 'in-progress', 'completed']).optional(),
});

export type PersonalTaskCreateInput = z.infer<typeof personalTaskCreateSchema>;
export type PersonalTaskUpdateInput = z.infer<typeof personalTaskUpdateSchema>;

// Assign task to admin schema (super admin only)
export const assignTaskSchema = z.object({
  adminId: mongoIdSchema,
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
});

export type AssignTaskInput = z.infer<typeof assignTaskSchema>;

// ============================================
// COMMON TASK SCHEMAS
// ============================================

export const commonTaskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  dueDate: z.string().optional(),
});

export const commonTaskUpdateSchema = commonTaskCreateSchema.partial().extend({
  id: mongoIdSchema,
});

export type CommonTaskCreateInput = z.infer<typeof commonTaskCreateSchema>;
export type CommonTaskUpdateInput = z.infer<typeof commonTaskUpdateSchema>;

// ============================================
// ADMIN REQUEST SCHEMAS
// ============================================

export const adminRequestCreateSchema = z.object({
  type: z.enum(['leave', 'tool-subscription', 'resource', 'other']),
  title: z
    .string()
    .min(1, 'Request title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Request description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  // Leave specific
  leaveStartDate: z.string().optional(),
  leaveEndDate: z.string().optional(),
  leaveReason: z.string().max(1000, 'Leave reason must be less than 1000 characters').optional(),
  // Tool subscription specific
  toolName: z.string().max(100, 'Tool name must be less than 100 characters').optional(),
  toolCost: z.number().min(0, 'Tool cost cannot be negative').optional(),
  toolDuration: z.string().max(50, 'Tool duration must be less than 50 characters').optional(),
});

export const adminRequestProcessSchema = z.object({
  requestId: mongoIdSchema,
  action: z.enum(['approve', 'reject', 'hold']),
  responseNote: z.string().max(1000, 'Response note must be less than 1000 characters').optional(),
});

export type AdminRequestCreateInput = z.infer<typeof adminRequestCreateSchema>;
export type AdminRequestProcessInput = z.infer<typeof adminRequestProcessSchema>;

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

export const markNotificationReadSchema = z.object({
  notificationId: mongoIdSchema,
});

export const markAllNotificationsReadSchema = z.object({
  adminId: mongoIdSchema.optional(), // Optional, defaults to current user
});

export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
export type MarkAllNotificationsReadInput = z.infer<typeof markAllNotificationsReadSchema>;

// ============================================
// DELETE SCHEMA
// ============================================

export const deleteSchema = z.object({
  id: mongoIdSchema,
});

export type DeleteInput = z.infer<typeof deleteSchema>;
