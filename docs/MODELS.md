# Database Models Documentation

This document describes all MongoDB/Mongoose models used in the RaYnk Labs application.

## Table of Contents

- [Admin System Models](#admin-system-models)
  - [Admin](#admin)
  - [PersonalTask](#personaltask)
  - [CommonTask](#commontask)
  - [Notification](#notification)
  - [AdminRequest](#adminrequest)
- [Content Models](#content-models)
  - [Course](#course)
  - [Team](#team)
  - [Project](#project)
  - [Service](#service)
  - [Software](#software)
  - [Submission](#submission)
- [CMS Section Models](#cms-section-models)
  - [Hero](#hero)
  - [AboutSection](#aboutsection)
  - [Community](#community)
  - [Meetup](#meetup)
  - [UpcomingProject](#upcomingproject)

---

## Admin System Models

### Admin

**File:** `src/lib/models/Admin.ts`

The Admin model handles all admin user data including authentication, profile, and approval workflow.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `mobile` | String | Yes | - | Indian mobile (10 digits starting with 6-9) |
| `password` | String | Yes | - | Hashed password (min 8 chars) |
| `name` | String | Yes | - | Admin name (max 100 chars) |
| `role` | String | No | `'admin'` | `'admin'` or `'super-admin'` |
| `status` | String | No | `'pending'` | `'pending'`, `'approved'`, `'rejected'`, `'suspended'` |
| `profile` | Object | No | `{}` | Profile information (see below) |
| `lastLogin` | Date | No | - | Last login timestamp |
| `approvedBy` | ObjectId | No | - | Admin who approved |
| `approvedAt` | Date | No | - | Approval timestamp |
| `rejectedBy` | ObjectId | No | - | Admin who rejected |
| `rejectedAt` | Date | No | - | Rejection timestamp |
| `rejectionReason` | String | No | - | Reason for rejection |
| `isActive` | Boolean | No | `true` | Soft delete flag |

#### Profile Sub-Schema

| Field | Type | Description |
|-------|------|-------------|
| `image.url` | String | Profile image URL |
| `image.publicId` | String | Cloudinary public ID |
| `email` | String | Contact email |
| `github` | String | GitHub profile |
| `instagram` | String | Instagram handle |
| `linkedin` | String | LinkedIn profile |
| `portfolio` | String | Portfolio website |

#### Indexes

- `mobile` (unique)
- `status`
- `role`
- `isActive`
- `createdAt` (descending)

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "mobile": "9876543210",
  "name": "John Doe",
  "role": "admin",
  "status": "approved",
  "profile": {
    "email": "john@example.com",
    "github": "johndoe",
    "linkedin": "john-doe"
  },
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### PersonalTask

**File:** `src/lib/models/PersonalTask.ts`

Personal tasks for individual admins. Can be self-created or assigned by super admin.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | Yes | - | Task title (max 200 chars) |
| `description` | String | No | - | Task description (max 2000 chars) |
| `status` | String | No | `'todo'` | `'todo'`, `'in-progress'`, `'completed'` |
| `priority` | String | No | `'medium'` | `'low'`, `'medium'`, `'high'`, `'urgent'` |
| `adminId` | ObjectId | Yes | - | Owner admin reference |
| `assignedBy` | ObjectId | No | - | Assigner (super admin) reference |
| `isAssigned` | Boolean | No | `false` | Whether assigned by super admin |
| `dueDate` | Date | No | - | Due date |
| `completedAt` | Date | No | - | Completion timestamp |
| `notes` | String | No | - | Additional notes (max 2000 chars) |
| `isActive` | Boolean | No | `true` | Soft delete flag |

#### Indexes

- `adminId` + `status` (compound)
- `adminId` + `isAssigned` (compound)
- `status`
- `priority`
- `dueDate`
- `isActive`
- `createdAt` (descending)

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Complete API documentation",
  "description": "Document all REST API endpoints",
  "status": "in-progress",
  "priority": "high",
  "adminId": "507f1f77bcf86cd799439011",
  "isAssigned": false,
  "dueDate": "2024-01-20T23:59:59.000Z",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### CommonTask

**File:** `src/lib/models/CommonTask.ts`

Shared tasks visible to all admins. Multiple admins can complete the same task.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | Yes | - | Task title (max 200 chars) |
| `description` | String | No | - | Task description (max 2000 chars) |
| `completedBy` | Array | No | `[]` | List of completion records |
| `createdBy` | ObjectId | Yes | - | Creator (super admin) reference |
| `dueDate` | Date | No | - | Due date |
| `isActive` | Boolean | No | `true` | Soft delete flag |

#### CompletedBy Sub-Schema

| Field | Type | Description |
|-------|------|-------------|
| `adminId` | ObjectId | Admin who completed |
| `completedAt` | Date | Completion timestamp |

#### Indexes

- `completedBy.adminId`
- `createdBy`
- `dueDate`
- `isActive`
- `createdAt` (descending)

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Weekly team meeting notes",
  "description": "Submit notes from weekly meeting",
  "completedBy": [
    {
      "adminId": "507f1f77bcf86cd799439011",
      "completedAt": "2024-01-16T14:00:00.000Z"
    },
    {
      "adminId": "507f1f77bcf86cd799439014",
      "completedAt": "2024-01-16T15:30:00.000Z"
    }
  ],
  "createdBy": "super-admin-founder",
  "dueDate": "2024-01-17T18:00:00.000Z",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

### Notification

**File:** `src/lib/models/Notification.ts`

Real-time notifications for admin users.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | String | Yes | - | Notification type (see below) |
| `title` | String | Yes | - | Notification title (max 200 chars) |
| `message` | String | Yes | - | Notification message (max 1000 chars) |
| `recipient` | ObjectId | Yes | - | Target admin reference |
| `sender` | ObjectId | No | - | Sender admin reference |
| `refType` | String | No | - | `'Task'`, `'AdminRequest'`, `'Admin'` |
| `refId` | ObjectId | No | - | Referenced entity ID |
| `isRead` | Boolean | No | `false` | Read status |
| `readAt` | Date | No | - | Read timestamp |
| `isActive` | Boolean | No | `true` | Soft delete flag |

#### Notification Types

| Type | Description |
|------|-------------|
| `task-assigned` | Task was assigned to admin |
| `task-completed` | Task was completed |
| `task-updated` | Task was updated |
| `request-submitted` | New request was submitted |
| `request-approved` | Request was approved |
| `request-rejected` | Request was rejected |
| `admin-approved` | Admin account was approved |
| `admin-rejected` | Admin account was rejected |
| `system` | System notification |
| `announcement` | Broadcast announcement |

#### Indexes

- `recipient` + `isRead` (compound)
- `recipient` + `createdAt` (compound, descending)
- `type`
- `isActive`
- `createdAt` (descending)

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "type": "task-assigned",
  "title": "New Task Assigned",
  "message": "You have been assigned: Complete API documentation",
  "recipient": "507f1f77bcf86cd799439011",
  "sender": "super-admin-founder",
  "refType": "Task",
  "refId": "507f1f77bcf86cd799439012",
  "isRead": false,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### AdminRequest

**File:** `src/lib/models/AdminRequest.ts`

Internal requests for leave, tool subscriptions, and resources.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | String | Yes | - | `'leave'`, `'tool-subscription'`, `'resource'`, `'other'` |
| `title` | String | Yes | - | Request title (max 200 chars) |
| `description` | String | Yes | - | Request description (max 2000 chars) |
| `requestedBy` | ObjectId | Yes | - | Requester admin reference |
| `leaveStartDate` | Date | No | - | Leave start (for leave type) |
| `leaveEndDate` | Date | No | - | Leave end (for leave type) |
| `leaveReason` | String | No | - | Leave reason (max 1000 chars) |
| `toolName` | String | No | - | Tool name (for tool-subscription) |
| `toolCost` | Number | No | - | Tool cost (min 0) |
| `toolDuration` | String | No | - | Subscription duration |
| `status` | String | No | `'pending'` | `'pending'`, `'approved'`, `'rejected'`, `'on-hold'` |
| `processedBy` | ObjectId | No | - | Processing admin reference |
| `processedAt` | Date | No | - | Processing timestamp |
| `responseNote` | String | No | - | Admin response (max 1000 chars) |
| `isActive` | Boolean | No | `true` | Soft delete flag |

#### Indexes

- `requestedBy` + `status` (compound)
- `status`
- `type`
- `isActive`
- `createdAt` (descending)

#### Example Documents

**Leave Request:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "type": "leave",
  "title": "Annual Leave Request",
  "description": "Requesting leave for family vacation",
  "requestedBy": "507f1f77bcf86cd799439011",
  "leaveStartDate": "2024-02-01T00:00:00.000Z",
  "leaveEndDate": "2024-02-05T00:00:00.000Z",
  "leaveReason": "Family vacation",
  "status": "pending",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Tool Subscription Request:**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "type": "tool-subscription",
  "title": "GitHub Copilot Subscription",
  "description": "Need GitHub Copilot for development",
  "requestedBy": "507f1f77bcf86cd799439011",
  "toolName": "GitHub Copilot",
  "toolCost": 19,
  "toolDuration": "monthly",
  "status": "approved",
  "processedBy": "super-admin-founder",
  "processedAt": "2024-01-16T09:00:00.000Z",
  "responseNote": "Approved. Please submit invoice.",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Content Models

### Course

**File:** `src/lib/models/Course.ts`

Training courses offered by RaYnk Labs.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | String | Yes | - | Course title |
| `description` | String | Yes | - | Course description |
| `duration` | String | No | `""` | Duration (e.g., "4 weeks") |
| `level` | String | No | `'Beginner'` | `'Beginner'`, `'Intermediate'`, `'Advanced'` |
| `badge` | String | No | `'Free'` | `'Free'`, `'Paid'`, `'Popular'` |
| `image.url` | String | No | - | Course image URL |
| `image.publicId` | String | No | - | Cloudinary public ID |
| `isActive` | Boolean | No | `true` | Soft delete flag |
| `order` | Number | No | `0` | Display order |

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439018",
  "title": "React Fundamentals",
  "description": "Learn React from scratch",
  "duration": "6 weeks",
  "level": "Beginner",
  "badge": "Popular",
  "image": {
    "url": "https://res.cloudinary.com/xxx/course1.jpg",
    "publicId": "courses/course1"
  },
  "isActive": true,
  "order": 1,
  "createdAt": "2024-01-10T10:00:00.000Z"
}
```

---

### Team

**File:** `src/lib/models/Team.ts`

Team members displayed on the website.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | String | Yes | - | Member name |
| `role` | String | Yes | - | Role/position |
| `skills` | String | No | - | Skills description |
| `image.url` | String | Yes* | - | Profile image URL |
| `image.publicId` | String | Yes* | - | Cloudinary public ID |
| `github` | String | No | - | GitHub username |
| `linkedin` | String | No | - | LinkedIn profile |
| `portfolio` | String | No | - | Portfolio URL |
| `order` | Number | No | `0` | Display order |
| `isActive` | Boolean | No | `true` | Soft delete flag |

*Required within image object if image exists

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439019",
  "name": "Jane Smith",
  "role": "Lead Developer",
  "skills": "React, Node.js, MongoDB",
  "image": {
    "url": "https://res.cloudinary.com/xxx/team1.jpg",
    "publicId": "team/member1"
  },
  "github": "janesmith",
  "linkedin": "jane-smith",
  "order": 1,
  "isActive": true,
  "createdAt": "2024-01-10T10:00:00.000Z"
}
```

---

### Submission

**File:** `src/lib/models/Submission.ts`

Form submissions from website visitors.

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | String | Yes | - | `'service'`, `'course'`, `'contact'`, `'software'`, `'project'` |
| `originTitle` | String | No | - | Source (course/service name) |
| `name` | String | Yes | - | Submitter name |
| `email` | String | Yes | - | Submitter email |
| `phone` | String | No | - | Submitter phone |
| `message` | String | No | - | Message content |
| `isRead` | Boolean | No | `false` | Read status |
| `status` | String | No | `'new'` | `'new'`, `'reviewed'`, `'resolved'` |
| `adminNote` | String | No | - | Internal admin note |
| `ipAddress` | String | No | - | Submitter IP |
| `userAgent` | String | No | - | Browser user agent |

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "type": "course",
  "originTitle": "React Fundamentals",
  "name": "Mike Johnson",
  "email": "mike@example.com",
  "phone": "9876543210",
  "message": "I'm interested in enrolling",
  "isRead": true,
  "status": "reviewed",
  "adminNote": "Follow up scheduled",
  "ipAddress": "192.168.1.1",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## CMS Section Models

### Hero

**File:** `src/lib/models/Hero.ts`

Hero section content for the website homepage.

### AboutSection

**File:** `src/lib/models/AboutSection.ts`

About section with cards.

### Community

**File:** `src/lib/models/Community.ts`

Community section content.

### Meetup

**File:** `src/lib/models/Meetup.ts`

Meetups, masterclasses, and podcasts.

### UpcomingProject

**File:** `src/lib/models/UpcomingProject.ts`

Upcoming project showcases with features.

---

## Common Patterns

### Timestamps

All models include automatic timestamps:
- `createdAt`: Document creation time
- `updatedAt`: Last modification time

### Soft Delete

Most models use `isActive` flag for soft deletion instead of hard delete.

### Cloudinary Images

Image fields follow this structure:
```typescript
{
  url: string;      // Full Cloudinary URL
  publicId: string; // Cloudinary public ID for deletion
}
```

### ObjectId References

All references use MongoDB ObjectId with `ref` for population:
```typescript
adminId: {
  type: Schema.Types.ObjectId,
  ref: 'Admin'
}
```

---

## Database Connection

**File:** `src/lib/mongodb.ts`

Connection is managed using a cached connection pattern:

```typescript
import dbConnect from '@/lib/mongodb';

// In any API route or service
await dbConnect();
// Now use models
```

---

## Related Documentation

- [API Reference](./API-REFERENCE.md) - API endpoints
- [Services](./SERVICES.md) - Business logic layer
- [Authentication](./AUTHENTICATION.md) - Auth flow
