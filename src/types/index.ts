/**
 * RaYnk Labs - Type Definitions
 * Enterprise-grade TypeScript interfaces for all entities
 */

// ============================================
// COMMON TYPES
// ============================================

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseEntity extends Timestamps {
  _id: string;
}

export interface ActiveEntity extends BaseEntity {
  isActive: boolean;
}

export interface OrderedEntity extends ActiveEntity {
  order: number;
}

// ============================================
// AUTHENTICATION & ADMIN
// ============================================

export type AdminRole = 'admin' | 'super-admin';
export type AdminStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AdminJWTPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  iat?: number;
  exp?: number;
}

export interface AdminProfile {
  image?: CloudinaryImage;
  email?: string;
  github?: string;
  instagram?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface AdminUser {
  _id: string;
  mobile: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  profile: AdminProfile;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy interface for backward compatibility
export interface AdminUserLegacy {
  _id: string;
  email: string;
  role: AdminRole;
  createdAt: Date;
}

// ============================================
// TASK TYPES
// ============================================

export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PersonalTask extends ActiveEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  adminId: string;
  assignedBy?: string;
  isAssigned: boolean;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface CommonTask extends ActiveEntity {
  title: string;
  description?: string;
  completedBy: Array<{
    adminId: string;
    completedAt: Date;
  }>;
  createdBy: string;
  dueDate?: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'task-assigned'
  | 'task-completed'
  | 'task-updated'
  | 'request-submitted'
  | 'request-approved'
  | 'request-rejected'
  | 'admin-approved'
  | 'admin-rejected'
  | 'system'
  | 'announcement';

export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  recipient: string;
  sender?: string;
  refType?: 'Task' | 'AdminRequest' | 'Admin';
  refId?: string;
  isRead: boolean;
  readAt?: Date;
  isActive: boolean;
}

// ============================================
// ADMIN REQUEST TYPES
// ============================================

export type AdminRequestType = 'leave' | 'tool-subscription' | 'resource' | 'other';
export type AdminRequestStatus = 'pending' | 'approved' | 'rejected' | 'on-hold';

export interface AdminRequest extends BaseEntity {
  type: AdminRequestType;
  title: string;
  description: string;
  requestedBy: string;
  leaveStartDate?: Date;
  leaveEndDate?: Date;
  leaveReason?: string;
  toolName?: string;
  toolCost?: number;
  toolDuration?: string;
  status: AdminRequestStatus;
  processedBy?: string;
  processedAt?: Date;
  responseNote?: string;
  isActive: boolean;
}

// ============================================
// CONTENT ENTITIES
// ============================================

export interface Course extends OrderedEntity {
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  badge: 'Free' | 'Paid' | 'Popular';
  image?: CloudinaryImage;
}

export interface Project extends ActiveEntity {
  name: string;
  description: string;
  tech: string[];
  url?: string;
  icon?: string;
  status: 'Live' | 'Coming Soon';
}

export interface Service extends OrderedEntity {
  title: string;
  description: string;
  icon: string;
  image?: CloudinaryImage;
}

export interface Software extends BaseEntity {
  name: string;
  description: string;
  downloadUrl: string;
  image?: CloudinaryImage;
}

export interface TeamMember extends OrderedEntity {
  name: string;
  role: string;
  skills?: string;
  image?: CloudinaryImage | null;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

// ============================================
// CMS SECTIONS
// ============================================

export interface HeroButton {
  label: string;
  href: string;
}

export interface Hero extends ActiveEntity {
  title: string;
  tagline: string;
  words: string[];
  primaryBtn?: HeroButton;
  secondaryBtn?: HeroButton;
}

export interface AboutCard {
  title: string;
  description: string;
  icon: string;
}

export interface AboutSection extends ActiveEntity {
  heading: string;
  description: string;
  cards: AboutCard[];
}

export interface Community extends ActiveEntity {
  title: string;
  description: string;
  points: string[];
  ctaText: string;
}

export interface Meetup extends ActiveEntity {
  title: string;
  date: string;
  description: string;
  type: 'meetup' | 'masterclass' | 'podcast';
  cta: string;
}

export interface UpcomingProjectFeature {
  title: string;
  description: string;
  icon: string;
}

export interface UpcomingProject extends ActiveEntity {
  title: string;
  subtitle?: string;
  description: string;
  features: UpcomingProjectFeature[];
  liveUrl?: string;
  previewUrl?: string;
  image?: CloudinaryImage;
}

// ============================================
// SUBMISSIONS
// ============================================

export type SubmissionType = 'service' | 'course' | 'contact' | 'software' | 'project';
export type SubmissionStatus = 'new' | 'reviewed' | 'resolved';

export interface Submission extends BaseEntity {
  type: string;
  originTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  isRead: boolean;
  status: SubmissionStatus;
  adminNote?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateCourseRequest {
  title: string;
  description: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  badge?: 'Free' | 'Paid' | 'Popular';
  order?: number;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  tech?: string[] | string;
  url?: string;
  icon?: string;
  status?: 'Live' | 'Coming Soon';
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  id: string;
}

export interface CreateTeamRequest {
  name: string;
  role: string;
  skills?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  order?: number;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {
  id: string;
}

export interface CreateSoftwareRequest {
  name: string;
  description: string;
  downloadUrl: string;
}

export interface UpdateSoftwareRequest extends Partial<CreateSoftwareRequest> {
  id: string;
}

export interface CreateSubmissionRequest {
  type: string;
  originTitle?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface UpdateSubmissionRequest {
  id: string;
  isRead?: boolean;
  status?: SubmissionStatus;
  adminNote?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Admin (team member) login request
export interface AdminMobileLoginRequest {
  mobile: string;
  password: string;
}

// Admin signup request
export interface AdminSignupRequest {
  name: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

// Admin profile update request
export interface AdminProfileUpdateRequest {
  name?: string;
  profile?: Partial<AdminProfile>;
}

// Admin approval request
export interface AdminApprovalRequest {
  adminId: string;
  action: 'approve' | 'reject' | 'hold' | 'suspend';
  reason?: string;
}

// Task requests
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  notes?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
  status?: TaskStatus;
}

export interface AssignTaskRequest extends CreateTaskRequest {
  adminId: string;
}

// Admin request (leave, tool subscription, etc.)
export interface CreateAdminRequestRequest {
  type: AdminRequestType;
  title: string;
  description: string;
  leaveStartDate?: string;
  leaveEndDate?: string;
  leaveReason?: string;
  toolName?: string;
  toolCost?: number;
  toolDuration?: string;
}

export interface ProcessAdminRequestRequest {
  requestId: string;
  action: 'approve' | 'reject' | 'hold';
  responseNote?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithId<T> = T & { _id: string };
export type WithoutId<T> = Omit<T, '_id'>;
export type CreateRequest<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>;
