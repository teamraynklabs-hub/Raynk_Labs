# Admin Workflow Documentation

This document describes the complete admin system workflow including role-based access, approval processes, task management, and request handling.

## Table of Contents

- [Role-Based Access Control](#role-based-access-control)
- [Admin Lifecycle](#admin-lifecycle)
- [Task Management System](#task-management-system)
- [Request System](#request-system)
- [Notification System](#notification-system)
- [Dashboard Features](#dashboard-features)

---

## Role-Based Access Control

### Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Founder/Owner | Full access to all features |
| **Admin** | Team Member | Limited access to own data |

### Permission Matrix

| Feature | Super Admin | Admin |
|---------|-------------|-------|
| View all admins | Yes | No |
| Approve/reject admins | Yes | No |
| Create common tasks | Yes | No |
| Assign tasks to others | Yes | No |
| View task rankings | Yes | No |
| Process requests | Yes | No |
| Create announcements | Yes | No |
| Manage own tasks | Yes | Yes |
| Complete common tasks | Yes | Yes |
| Submit requests | N/A | Yes |
| View own notifications | Yes | Yes |
| Update own profile | N/A | Yes |

### Super Admin Identification

```typescript
// Check if current user is super admin
if (admin.role === 'super-admin') {
  // Has full access
}

// Check if super admin by ID
if (adminPayload.adminId === 'super-admin-founder') {
  // Is the founder
}
```

---

## Admin Lifecycle

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   SIGNUP     │
     │              │
     │ name         │
     │ mobile       │
     │ password     │
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │   PENDING    │◄────────────────────────────────┐
     │              │                                 │
     │ Awaiting     │                                 │ Put on Hold
     │ approval     │                                 │
     └──────┬───────┘                                 │
            │                                         │
            ▼                                         │
     ┌──────────────────────────────────────────┐    │
     │        SUPER ADMIN REVIEW                 │    │
     │                                          │    │
     │  • View signup details                   │    │
     │  • Check mobile number                   │    │
     │  • Verify identity                       │────┘
     │                                          │
     └────────────────┬─────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
  ┌──────────────┐         ┌──────────────┐
  │   APPROVED   │         │   REJECTED   │
  │              │         │              │
  │ Can login    │         │ Cannot login │
  │ Full access  │         │ With reason  │
  └──────┬───────┘         └──────────────┘
         │
         ▼
  ┌──────────────┐
  │    ACTIVE    │
  │              │
  │ Working in   │
  │ the system   │
  └──────┬───────┘
         │
         │ (If needed)
         ▼
  ┌──────────────┐
  │  SUSPENDED   │
  │              │
  │ Temporarily  │
  │ blocked      │
  └──────────────┘
```

### Status Transitions

| Current Status | Allowed Actions | New Status |
|----------------|-----------------|------------|
| `pending` | Approve | `approved` |
| `pending` | Reject | `rejected` |
| `pending` | Hold | `pending` (remains) |
| `approved` | Suspend | `suspended` |
| `suspended` | Approve | `approved` |
| `rejected` | Approve | `approved` |

### API for Admin Management

**Get pending admins:**
```http
GET /api/admin/users?status=pending
Authorization: Super Admin
```

**Approve admin:**
```http
POST /api/admin/users/[id]/approve
Content-Type: application/json

{
  "action": "approve"
}
```

**Reject admin:**
```http
POST /api/admin/users/[id]/approve
Content-Type: application/json

{
  "action": "reject",
  "reason": "Invalid information provided"
}
```

---

## Task Management System

### Task Types

#### 1. Personal Tasks (Self-Created)

Tasks created by an admin for themselves.

```
┌─────────────────────────────────────────┐
│           PERSONAL TASK                 │
├─────────────────────────────────────────┤
│ Creator: Admin                          │
│ Owner: Same Admin                       │
│ Visibility: Only to owner               │
│ Deletable: Yes                          │
└─────────────────────────────────────────┘
```

**Create:**
```http
POST /api/admin/tasks
Cookie: admin_token=...
Content-Type: application/json

{
  "title": "Complete documentation",
  "description": "Write API docs",
  "priority": "high",
  "dueDate": "2024-01-20"
}
```

#### 2. Assigned Tasks (By Super Admin)

Tasks assigned to admins by the super admin.

```
┌─────────────────────────────────────────┐
│           ASSIGNED TASK                 │
├─────────────────────────────────────────┤
│ Creator: Super Admin                    │
│ Owner: Target Admin                     │
│ Visibility: Owner + Super Admin         │
│ Deletable: No (by owner)                │
│ Notification: Sent on assignment        │
└─────────────────────────────────────────┘
```

**Assign:**
```http
POST /api/admin/tasks/assign
Authorization: Super Admin
Content-Type: application/json

{
  "adminId": "507f1f77bcf86cd799439011",
  "title": "Review pull request",
  "description": "Review and merge PR #123",
  "priority": "urgent",
  "dueDate": "2024-01-18"
}
```

#### 3. Common Tasks (Shared)

Tasks visible to all admins, tracking individual completions.

```
┌─────────────────────────────────────────┐
│           COMMON TASK                   │
├─────────────────────────────────────────┤
│ Creator: Super Admin                    │
│ Visibility: All admins                  │
│ Completion: Per admin (tracked)         │
│ Purpose: Team-wide activities           │
└─────────────────────────────────────────┘
```

**Create (Super Admin):**
```http
POST /api/admin/tasks/common
Authorization: Super Admin
Content-Type: application/json

{
  "title": "Weekly standup notes",
  "description": "Submit your weekly progress notes",
  "dueDate": "2024-01-19"
}
```

**Complete (Any Admin):**
```http
POST /api/admin/tasks/common/[id]/complete
Cookie: admin_token=...
```

### Task Status Flow

```
Personal/Assigned Tasks:

    ┌────────┐     ┌─────────────┐     ┌───────────┐
    │  TODO  │────▶│ IN_PROGRESS │────▶│ COMPLETED │
    └────────┘     └─────────────┘     └───────────┘
         │                                    │
         │                                    │
         └────────────────────────────────────┘
                   (Can skip stages)


Common Tasks:

    ┌──────────────────────────────────────────────────┐
    │                COMMON TASK                        │
    │                                                  │
    │  Admin A: Not Completed    ──▶  Completed        │
    │  Admin B: Completed                              │
    │  Admin C: Not Completed    ──▶  Completed        │
    └──────────────────────────────────────────────────┘
```

### Task Priority Levels

| Priority | Color | Use Case |
|----------|-------|----------|
| `low` | Green | Non-urgent tasks |
| `medium` | Blue | Normal tasks |
| `high` | Orange | Important tasks |
| `urgent` | Red | Critical/blocking tasks |

### Task Ranking System

Super admin can view task completion rankings.

```http
GET /api/admin/tasks/stats?type=ranking
Authorization: Super Admin
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "adminId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "totalTasks": 25,
      "completedTasks": 20,
      "completionRate": 80
    },
    {
      "adminId": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "totalTasks": 30,
      "completedTasks": 18,
      "completionRate": 60
    }
  ]
}
```

---

## Request System

### Request Types

| Type | Purpose | Required Fields |
|------|---------|-----------------|
| `leave` | Time off request | `leaveStartDate`, `leaveEndDate`, `leaveReason` |
| `tool-subscription` | Software/tool access | `toolName`, `toolCost`, `toolDuration` |
| `resource` | Resource request | General description |
| `other` | Miscellaneous | General description |

### Request Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REQUEST WORKFLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  Admin                                          Super Admin
    │                                                 │
    │  ┌──────────────────┐                          │
    │  │  Create Request  │                          │
    │  │                  │                          │
    │  │  - Leave         │                          │
    │  │  - Tool Sub      │                          │
    │  │  - Resource      │                          │
    │  │  - Other         │                          │
    │  └────────┬─────────┘                          │
    │           │                                    │
    │           ▼                                    │
    │  ┌──────────────────┐      Notification       │
    │  │     PENDING      │─────────────────────────▶│
    │  └────────┬─────────┘                          │
    │           │                                    │
    │           │ ◄───────────────────────────────── │ Review
    │           │                                    │
    │           ├───────────────────┐                │
    │           │                   │                │
    │           ▼                   ▼                │
    │  ┌──────────────┐    ┌──────────────┐         │
    │  │   APPROVED   │    │   REJECTED   │         │
    │  └──────────────┘    └──────────────┘         │
    │           │                   │                │
    │  ◄────────┴───────────────────┘                │
    │       Notification                             │
    │                                                │
```

### Leave Request Example

**Submit:**
```http
POST /api/admin/requests
Cookie: admin_token=...
Content-Type: application/json

{
  "type": "leave",
  "title": "Annual Leave - February",
  "description": "Taking annual leave for family vacation",
  "leaveStartDate": "2024-02-01",
  "leaveEndDate": "2024-02-05",
  "leaveReason": "Family vacation"
}
```

**Process (Super Admin):**
```http
POST /api/admin/requests/[id]/process
Authorization: Super Admin
Content-Type: application/json

{
  "action": "approve",
  "responseNote": "Approved. Enjoy your vacation!"
}
```

### Tool Subscription Request Example

**Submit:**
```http
POST /api/admin/requests
Cookie: admin_token=...
Content-Type: application/json

{
  "type": "tool-subscription",
  "title": "GitHub Copilot Subscription",
  "description": "Request for AI coding assistant for improved productivity",
  "toolName": "GitHub Copilot",
  "toolCost": 19,
  "toolDuration": "monthly"
}
```

---

## Notification System

### Notification Types

| Type | Trigger | Recipient |
|------|---------|-----------|
| `task-assigned` | Task assigned by super admin | Target admin |
| `task-completed` | Assigned task completed | Super admin (assigner) |
| `task-updated` | Task updated | Related parties |
| `request-submitted` | New request created | Super admin |
| `request-approved` | Request approved | Requester |
| `request-rejected` | Request rejected | Requester |
| `admin-approved` | Account approved | New admin |
| `admin-rejected` | Account rejected | Applicant |
| `system` | System messages | Target admin |
| `announcement` | Broadcast message | Multiple admins |

### Notification Flow

```
Event Occurs
     │
     ▼
┌─────────────────────────────────────┐
│  Service Layer Creates Notification │
│                                     │
│  notificationService.create({       │
│    type: 'task-assigned',           │
│    title: 'New Task',               │
│    message: 'You have been...',     │
│    recipient: adminId,              │
│    sender: superAdminId,            │
│    refType: 'Task',                 │
│    refId: taskId                    │
│  })                                 │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│     Stored in Database              │
│     isRead: false                   │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Admin Dashboard Shows Badge        │
│  (Unread count)                     │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│  Admin Reads Notification           │
│  markAsRead() called                │
└─────────────────────────────────────┘
```

### Announcements (Broadcast)

Super admin can send announcements to all admins.

```http
POST /api/admin/notifications/announcement
Authorization: Super Admin
Content-Type: application/json

{
  "title": "Team Meeting Tomorrow",
  "message": "Please join the all-hands meeting at 3 PM IST",
  "recipientIds": ["admin-1", "admin-2", "admin-3"]
}
```

---

## Dashboard Features

### Super Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Pending Admins  │  │ Pending Requests│  │ Active Tasks    │             │
│  │       3         │  │       5         │  │      12         │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        TASK RANKINGS                                  │  │
│  │                                                                       │  │
│  │  1. John Doe      - 20/25 tasks (80%)    ████████████████░░░░        │  │
│  │  2. Jane Smith    - 18/30 tasks (60%)    ████████████░░░░░░░░        │  │
│  │  3. Bob Wilson    - 10/15 tasks (67%)    █████████████░░░░░░░        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        QUICK ACTIONS                                  │  │
│  │                                                                       │  │
│  │  [Approve Admins]  [Assign Task]  [Create Common Task]  [Announce]   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ADMIN DASHBOARD                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ My Tasks        │  │ Assigned to Me  │  │ My Requests     │             │
│  │      8          │  │       3         │  │      2          │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        MY TASKS                                       │  │
│  │                                                                       │  │
│  │  ○ Complete documentation          High     Due: Jan 20   [Start]    │  │
│  │  ● Review code changes             Urgent   Due: Jan 18   [Done]     │  │
│  │  ○ Write unit tests               Medium   Due: Jan 22   [Start]    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        COMMON TASKS                                   │  │
│  │                                                                       │  │
│  │  □ Weekly standup notes            Due: Jan 19   [Mark Complete]     │  │
│  │  ☑ Daily status update             Due: Jan 17   (Completed)         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        QUICK ACTIONS                                  │  │
│  │                                                                       │  │
│  │  [New Task]  [Request Leave]  [Request Tool]  [View Profile]         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Summary by Role

### Public Endpoints (No Auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Login (both types) |
| `/api/admin/signup` | POST | Register new admin |

### Admin Endpoints (Authenticated)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/logout` | POST | Logout |
| `/api/admin/profile` | GET | Get own profile |
| `/api/admin/profile` | PUT | Update own profile |
| `/api/admin/password` | POST | Change password |
| `/api/admin/tasks` | GET | Get own tasks |
| `/api/admin/tasks` | POST | Create personal task |
| `/api/admin/tasks/[id]` | PUT | Update task |
| `/api/admin/tasks/[id]` | DELETE | Delete task |
| `/api/admin/tasks/common` | GET | Get common tasks |
| `/api/admin/tasks/common/[id]/complete` | POST | Complete common task |
| `/api/admin/tasks/stats` | GET | Get own stats |
| `/api/admin/notifications` | GET | Get notifications |
| `/api/admin/notifications/[id]` | PUT | Mark as read |
| `/api/admin/notifications/read-all` | POST | Mark all read |
| `/api/admin/requests` | GET | Get own requests |
| `/api/admin/requests` | POST | Create request |
| `/api/admin/requests/[id]` | DELETE | Cancel request |

### Super Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | Get all admins |
| `/api/admin/users/[id]` | GET | Get admin details |
| `/api/admin/users/[id]/approve` | POST | Process approval |
| `/api/admin/users/[id]` | DELETE | Delete admin |
| `/api/admin/tasks/assign` | POST | Assign task |
| `/api/admin/tasks/common` | POST | Create common task |
| `/api/admin/tasks/common/[id]` | PUT | Update common task |
| `/api/admin/tasks/common/[id]` | DELETE | Delete common task |
| `/api/admin/tasks/stats?type=ranking` | GET | Get rankings |
| `/api/admin/requests` | GET | Get all requests |
| `/api/admin/requests/[id]/process` | POST | Process request |
| `/api/admin/notifications/announcement` | POST | Broadcast |

---

## Related Documentation

- [API Reference](./API-REFERENCE.md) - Complete API documentation
- [Authentication](./AUTHENTICATION.md) - Auth flow details
- [Models](./MODELS.md) - Database schemas
- [Services](./SERVICES.md) - Business logic
