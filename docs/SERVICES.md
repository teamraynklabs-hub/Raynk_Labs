# Services Documentation

This document describes all business logic services in the RaYnk Labs application.

## Table of Contents

- [Service Architecture](#service-architecture)
- [Admin Services](#admin-services)
  - [AdminService](#adminservice)
  - [TaskService](#taskservice)
  - [NotificationService](#notificationservice)
  - [AdminRequestService](#adminrequestservice)
- [Content Services](#content-services)
  - [CourseService](#courseservice)
  - [TeamService](#teamservice)
  - [ProjectService](#projectservice)
  - [ServiceService](#serviceservice)
  - [SoftwareService](#softwareservice)
  - [SubmissionService](#submissionservice)
- [CMS Services](#cms-services)
- [Service Index](#service-index)

---

## Service Architecture

All services follow a consistent pattern:

```
src/server/services/
├── index.ts              # Service exports
├── admin.service.ts      # Admin authentication & management
├── task.service.ts       # Personal & common tasks
├── notification.service.ts # Notifications
├── admin-request.service.ts # Leave/tool requests
├── course.service.ts     # Course CRUD
├── team.service.ts       # Team CRUD
├── project.service.ts    # Project CRUD
├── service.service.ts    # Service CRUD
├── software.service.ts   # Software CRUD
├── submission.service.ts # Submission CRUD
├── hero.service.ts       # Hero section
├── about.service.ts      # About section
├── community.service.ts  # Community section
├── meetup.service.ts     # Meetup section
└── upcoming-project.service.ts # Upcoming projects
```

### Common Patterns

1. **Database Connection**: Each method calls `await connectDB()` first
2. **Validation**: Uses Zod schemas from `@/server/schemas`
3. **Error Handling**: Throws custom errors from `@/server/utils/errors`
4. **Return Types**: Returns public interfaces (without sensitive data)

---

## Admin Services

### AdminService

**File:** `src/server/services/admin.service.ts`

Handles admin authentication, signup, approval workflow, and profile management.

#### Methods

| Method | Access | Description |
|--------|--------|-------------|
| `superAdminLogin(data)` | Public | Authenticate super admin (founder) via env credentials |
| `adminLogin(data)` | Public | Authenticate regular admin via mobile/password |
| `signup(data)` | Public | Register new admin (pending approval) |
| `getById(id)` | Protected | Get admin by ID |
| `getByMobile(mobile)` | Protected | Get admin by mobile number |
| `getAll(status?)` | Super Admin | Get all admins, optionally filtered by status |
| `getPendingRequests()` | Super Admin | Get admins pending approval |
| `processApproval(data, processedBy)` | Super Admin | Approve/reject/suspend admin |
| `updateProfile(adminId, data, image?)` | Protected | Update admin profile |
| `requestPasswordChangeOTP(mobile)` | Protected | Request OTP for password change |
| `verifyOTP(mobile, otp)` | Protected | Verify OTP |
| `changePassword(mobile, current, new, otp)` | Protected | Change password with OTP |
| `delete(adminId)` | Super Admin | Soft delete admin |
| `getTaskStats()` | Super Admin | Get task completion ranking |

#### Login Flow

```
Super Admin Login:
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Email/Pass  │────▶│ Validate vs ENV  │────▶│ Generate JWT│
└─────────────┘     └──────────────────┘     └─────────────┘

Regular Admin Login:
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────┐
│ Mobile/Pass │────▶│ Find in Database │────▶│ Check Status│────▶│ Verify Pass │
└─────────────┘     └──────────────────┘     └─────────────┘     └─────────────┘
                                                    │
                              ┌──────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Generate JWT     │
                    └──────────────────┘
```

#### Account Lockout

- Max attempts: `MAX_LOGIN_ATTEMPTS` (default: 5)
- Lockout duration: `LOCKOUT_DURATION_MINUTES` (default: 15)
- Resets on successful login

#### Example Usage

```typescript
import { adminService } from '@/server/services';

// Super admin login
const result = await adminService.superAdminLogin({
  email: 'founder@raynklabs.com',
  password: 'secure-password'
});

// Regular admin login
const result = await adminService.adminLogin({
  mobile: '9876543210',
  password: 'SecurePass123!'
});

// Signup
const admin = await adminService.signup({
  name: 'John Doe',
  mobile: '9876543210',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!'
});

// Process approval
const approved = await adminService.processApproval({
  adminId: '507f1f77bcf86cd799439011',
  action: 'approve'
}, 'super-admin-founder');
```

---

### TaskService

**File:** `src/server/services/task.service.ts`

Manages personal tasks (self-created/assigned) and common tasks (shared).

#### Personal Task Methods

| Method | Access | Description |
|--------|--------|-------------|
| `getPersonalTasks(adminId, status?)` | Protected | Get admin's tasks |
| `getAssignedTasks(adminId)` | Protected | Get tasks assigned to admin |
| `getPersonalTaskById(taskId, adminId)` | Protected | Get specific task |
| `createPersonalTask(adminId, data)` | Protected | Create self task |
| `assignTask(assignedBy, data)` | Super Admin | Assign task to admin |
| `updatePersonalTask(taskId, adminId, data)` | Protected | Update task |
| `deletePersonalTask(taskId, adminId)` | Protected | Delete task (self-created only) |

#### Common Task Methods

| Method | Access | Description |
|--------|--------|-------------|
| `getCommonTasks()` | Protected | Get all common tasks |
| `createCommonTask(createdBy, data)` | Super Admin | Create common task |
| `completeCommonTask(taskId, adminId)` | Protected | Mark as completed |
| `updateCommonTask(taskId, data)` | Super Admin | Update common task |
| `deleteCommonTask(taskId)` | Super Admin | Delete common task |

#### Statistics Methods

| Method | Access | Description |
|--------|--------|-------------|
| `getAdminTaskStats(adminId)` | Protected | Get personal stats |
| `getCommonTaskStats()` | Protected | Get common task stats |

#### Task Workflow

```
Personal Task:
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│     TODO      │────▶│  IN_PROGRESS  │────▶│   COMPLETED   │
└───────────────┘     └───────────────┘     └───────────────┘

Assigned Task:
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌─────────────┐
│Super Admin  │────▶│ Create + Assign  │────▶│ Notification│────▶│ Admin Works │
└─────────────┘     └──────────────────┘     └─────────────┘     └─────────────┘
                                                                        │
                              ┌─────────────────────────────────────────┘
                              ▼
                    ┌──────────────────┐     ┌─────────────────┐
                    │ Complete Task    │────▶│ Notify Assigner │
                    └──────────────────┘     └─────────────────┘
```

#### Example Usage

```typescript
import { taskService } from '@/server/services';

// Create personal task
const task = await taskService.createPersonalTask('admin-id', {
  title: 'Complete documentation',
  priority: 'high',
  dueDate: '2024-01-20'
});

// Assign task (super admin)
const assigned = await taskService.assignTask('super-admin-founder', {
  adminId: '507f1f77bcf86cd799439011',
  title: 'Review code',
  priority: 'urgent',
  dueDate: '2024-01-18'
});

// Update status
const updated = await taskService.updatePersonalTask(
  'task-id',
  'admin-id',
  { status: 'completed' }
);

// Get stats
const stats = await taskService.getAdminTaskStats('admin-id');
// Returns: { total: 10, todo: 3, inProgress: 2, completed: 5, assigned: 4 }
```

---

### NotificationService

**File:** `src/server/services/notification.service.ts`

Manages real-time notifications for admins.

#### Methods

| Method | Access | Description |
|--------|--------|-------------|
| `getNotifications(adminId, options?)` | Protected | Get admin's notifications |
| `getUnreadCount(adminId)` | Protected | Count unread notifications |
| `markAsRead(notificationId, adminId)` | Protected | Mark single as read |
| `markAllAsRead(adminId)` | Protected | Mark all as read |
| `create(input)` | Internal | Create notification |
| `notifyTaskAssigned(...)` | Internal | Task assignment notification |
| `notifyTaskCompleted(...)` | Internal | Task completion notification |
| `notifyAdminApproved(...)` | Internal | Account approved notification |
| `notifyAdminRejected(...)` | Internal | Account rejected notification |
| `notifyRequestSubmitted(...)` | Internal | Request submitted notification |
| `notifyRequestApproved(...)` | Internal | Request approved notification |
| `notifyRequestRejected(...)` | Internal | Request rejected notification |
| `createAnnouncement(...)` | Super Admin | Broadcast to multiple admins |
| `delete(notificationId, adminId)` | Protected | Delete notification |
| `deleteAll(adminId)` | Protected | Delete all notifications |

#### Notification Types

| Type | Trigger |
|------|---------|
| `task-assigned` | Task assigned to admin |
| `task-completed` | Assigned task completed |
| `task-updated` | Task was updated |
| `request-submitted` | New request created |
| `request-approved` | Request approved |
| `request-rejected` | Request rejected |
| `admin-approved` | Account approved |
| `admin-rejected` | Account rejected |
| `system` | System messages |
| `announcement` | Broadcast messages |

#### Example Usage

```typescript
import { notificationService } from '@/server/services';

// Get notifications
const notifications = await notificationService.getNotifications(
  'admin-id',
  { isRead: false, limit: 10 }
);

// Get unread count
const count = await notificationService.getUnreadCount('admin-id');

// Mark as read
await notificationService.markAsRead('notification-id', 'admin-id');

// Create announcement
await notificationService.createAnnouncement(
  ['admin-1', 'admin-2', 'admin-3'],
  'Team Meeting',
  'Please join the team meeting at 3 PM',
  'super-admin-founder'
);
```

---

### AdminRequestService

**File:** `src/server/services/admin-request.service.ts`

Handles leave requests, tool subscriptions, and other internal requests.

#### Methods

| Method | Access | Description |
|--------|--------|-------------|
| `getMyRequests(adminId, status?)` | Protected | Get admin's requests |
| `getAllRequests(status?)` | Super Admin | Get all requests |
| `getPendingRequests()` | Super Admin | Get pending requests |
| `getById(requestId)` | Protected | Get request by ID |
| `create(adminId, data, superAdminId?)` | Protected | Create new request |
| `process(processedBy, data)` | Super Admin | Approve/reject/hold request |
| `cancel(requestId, adminId)` | Protected | Cancel pending request |
| `getStats()` | Super Admin | Get overall stats |
| `getMyStats(adminId)` | Protected | Get admin's stats |

#### Request Types

| Type | Required Fields |
|------|-----------------|
| `leave` | `leaveStartDate`, `leaveEndDate`, `leaveReason` |
| `tool-subscription` | `toolName`, `toolCost`, `toolDuration` |
| `resource` | `description` |
| `other` | `description` |

#### Request Workflow

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Create    │────▶│   PENDING   │────▶│ Super Admin      │
└─────────────┘     └─────────────┘     │ Review           │
                          │             └────────┬─────────┘
                          │                      │
              ┌───────────┴───────────┬──────────┼──────────┐
              ▼                       ▼          ▼          ▼
        ┌──────────┐           ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ APPROVED │           │ REJECTED │ │ ON_HOLD  │ │ Cancelled│
        └──────────┘           └──────────┘ └──────────┘ └──────────┘
              │                       │
              ▼                       ▼
        ┌──────────┐           ┌──────────┐
        │ Notify   │           │ Notify   │
        │ Requester│           │ Requester│
        └──────────┘           └──────────┘
```

#### Example Usage

```typescript
import { adminRequestService } from '@/server/services';

// Create leave request
const request = await adminRequestService.create('admin-id', {
  type: 'leave',
  title: 'Annual Leave',
  description: 'Family vacation',
  leaveStartDate: '2024-02-01',
  leaveEndDate: '2024-02-05',
  leaveReason: 'Family vacation'
}, 'super-admin-founder');

// Create tool subscription request
const toolRequest = await adminRequestService.create('admin-id', {
  type: 'tool-subscription',
  title: 'GitHub Copilot',
  description: 'AI coding assistant',
  toolName: 'GitHub Copilot',
  toolCost: 19,
  toolDuration: 'monthly'
});

// Process request (super admin)
const processed = await adminRequestService.process('super-admin-founder', {
  requestId: '507f1f77bcf86cd799439016',
  action: 'approve',
  responseNote: 'Approved. Enjoy your vacation!'
});
```

---

## Content Services

### CourseService

**File:** `src/server/services/course.service.ts`

CRUD operations for training courses.

| Method | Description |
|--------|-------------|
| `getAll()` | Get all active courses |
| `getById(id)` | Get course by ID |
| `create(data, image?)` | Create new course |
| `update(id, data, image?)` | Update course |
| `delete(id)` | Soft delete course |
| `reorder(ids)` | Reorder courses |

### TeamService

**File:** `src/server/services/team.service.ts`

CRUD operations for team members.

| Method | Description |
|--------|-------------|
| `getAll()` | Get all active team members |
| `getById(id)` | Get team member by ID |
| `create(data, image?)` | Create new team member |
| `update(id, data, image?)` | Update team member |
| `delete(id)` | Soft delete team member |
| `reorder(ids)` | Reorder team members |

### ProjectService

**File:** `src/server/services/project.service.ts`

CRUD operations for projects.

### ServiceService

**File:** `src/server/services/service.service.ts`

CRUD operations for services offered.

### SoftwareService

**File:** `src/server/services/software.service.ts`

CRUD operations for software/tools.

### SubmissionService

**File:** `src/server/services/submission.service.ts`

CRUD operations for form submissions.

| Method | Description |
|--------|-------------|
| `getAll(filters?)` | Get all submissions with filters |
| `getById(id)` | Get submission by ID |
| `create(data)` | Create new submission (public) |
| `update(id, data)` | Update submission status/note |
| `delete(id)` | Soft delete submission |
| `getStats()` | Get submission statistics |

---

## CMS Services

### HeroService

**File:** `src/server/services/hero.service.ts`

Manages hero section content.

### AboutService

**File:** `src/server/services/about.service.ts`

Manages about section content.

### CommunityService

**File:** `src/server/services/community.service.ts`

Manages community section content.

### MeetupService

**File:** `src/server/services/meetup.service.ts`

Manages meetups, masterclasses, and podcasts.

### UpcomingProjectService

**File:** `src/server/services/upcoming-project.service.ts`

Manages upcoming project showcases.

---

## Service Index

**File:** `src/server/services/index.ts`

All services are exported from this index file:

```typescript
export { adminService } from './admin.service';
export { taskService } from './task.service';
export { notificationService } from './notification.service';
export { adminRequestService } from './admin-request.service';
export { courseService } from './course.service';
export { teamService } from './team.service';
export { projectService } from './project.service';
export { serviceService } from './service.service';
export { softwareService } from './software.service';
export { submissionService } from './submission.service';
export { heroService } from './hero.service';
export { aboutService } from './about.service';
export { communityService } from './community.service';
export { meetupService } from './meetup.service';
export { upcomingProjectService } from './upcoming-project.service';
```

### Usage in API Routes

```typescript
import { courseService, adminService } from '@/server/services';

export async function GET() {
  const courses = await courseService.getAll();
  return NextResponse.json({ success: true, data: courses });
}
```

---

## Error Handling

Services throw custom errors from `@/server/utils/errors`:

| Error Class | HTTP Status | Description |
|-------------|-------------|-------------|
| `NotFoundError` | 404 | Resource not found |
| `UnauthorizedError` | 401 | Authentication failed |
| `ForbiddenError` | 403 | Permission denied |
| `ConflictError` | 409 | Resource conflict (duplicate) |
| `ValidationError` | 400 | Invalid input data |

```typescript
import { NotFoundError, UnauthorizedError } from '@/server/utils/errors';

// In service
if (!admin) {
  throw new NotFoundError('Admin');
}

// In API route
try {
  const result = await someService.method();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  return handleApiError(error);
}
```

---

## Related Documentation

- [API Reference](./API-REFERENCE.md) - API endpoints
- [Models](./MODELS.md) - Database schemas
- [Authentication](./AUTHENTICATION.md) - Auth flow
- [Admin Workflow](./ADMIN-WORKFLOW.md) - Admin system
