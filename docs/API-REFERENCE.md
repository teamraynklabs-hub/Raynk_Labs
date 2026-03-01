# RaYnk Labs - API Reference

Complete API documentation with endpoints, request/response formats, and test data.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in HTTP-only cookie (`admin_token`).

---

## Authentication Endpoints

### POST /api/admin/login

Login for Super Admin (email) or Regular Admin (mobile).

**Super Admin Login (Founder)**

```json
// Request
POST /api/admin/login
Content-Type: application/json

{
  "email": "founder@raynklabs.com",
  "password": "SuperSecure@123"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "super-admin-founder",
      "name": "Founder",
      "role": "super-admin",
      "profile": {
        "email": "founder@raynklabs.com"
      }
    },
    "isSuperAdmin": true
  }
}
```

**Regular Admin Login (Team Member)**

```json
// Request
POST /api/admin/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "Admin@123456"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "507f1f77bcf86cd799439011",
      "mobile": "9876543210",
      "name": "John Doe",
      "role": "admin",
      "status": "approved",
      "profile": {
        "email": "john@example.com",
        "github": "https://github.com/johndoe"
      }
    },
    "isSuperAdmin": false
  }
}

// Error Response (401 Unauthorized)
{
  "success": false,
  "message": "Invalid mobile number or password",
  "code": "UNAUTHORIZED"
}

// Error Response (403 Forbidden - Pending Approval)
{
  "success": false,
  "message": "Your account is pending approval",
  "code": "FORBIDDEN"
}
```

---

### POST /api/admin/signup

Register new admin account (pending approval).

```json
// Request
POST /api/admin/signup
Content-Type: application/json

{
  "name": "John Doe",
  "mobile": "9876543210",
  "password": "Admin@123456",
  "confirmPassword": "Admin@123456"
}

// Response (201 Created)
{
  "success": true,
  "message": "Signup successful! Your account is pending approval.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "mobile": "9876543210",
    "name": "John Doe",
    "role": "admin",
    "status": "pending",
    "profile": {},
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}

// Error Response (409 Conflict)
{
  "success": false,
  "message": "An account with this mobile number already exists",
  "code": "CONFLICT"
}

// Error Response (400 Validation)
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    "mobile: Invalid Indian mobile number (10 digits starting with 6-9)",
    "password: Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
  ]
}
```

---

### POST /api/admin/logout

Logout current admin (clears JWT cookie).

```json
// Request
POST /api/admin/logout

// Response (200 OK)
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/admin/verify

Verify current authentication status.

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "admin": {
      "adminId": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

---

## Admin Management Endpoints (Super Admin Only)

### GET /api/admin/users

List all admins.

```json
// Request
GET /api/admin/users
GET /api/admin/users?status=pending

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "mobile": "9876543210",
      "name": "John Doe",
      "role": "admin",
      "status": "approved",
      "profile": {
        "email": "john@example.com"
      },
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "mobile": "9876543211",
      "name": "Jane Smith",
      "role": "admin",
      "status": "pending",
      "profile": {},
      "createdAt": "2024-01-14T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/admin/users

Approve, reject, hold, or suspend an admin.

```json
// Approve Admin
POST /api/admin/users
Content-Type: application/json

{
  "adminId": "507f1f77bcf86cd799439012",
  "action": "approve"
}

// Response (200 OK)
{
  "success": true,
  "message": "Admin approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "approved",
    "approvedAt": "2024-01-15T10:30:00.000Z"
  }
}

// Reject Admin
{
  "adminId": "507f1f77bcf86cd799439012",
  "action": "reject",
  "reason": "Incomplete profile information"
}

// Suspend Admin
{
  "adminId": "507f1f77bcf86cd799439012",
  "action": "suspend"
}
```

---

### GET /api/admin/users/[id]

Get admin by ID.

```json
// Request
GET /api/admin/users/507f1f77bcf86cd799439011

// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "mobile": "9876543210",
    "name": "John Doe",
    "role": "admin",
    "status": "approved",
    "profile": {
      "email": "john@example.com",
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  }
}
```

---

### PUT /api/admin/users/[id]

Update admin profile.

```json
// Request
PUT /api/admin/users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "John D. Doe",
  "profile": {
    "email": "johndoe@example.com",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "portfolio": "https://johndoe.dev"
  }
}

// Response (200 OK)
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John D. Doe",
    "profile": {
      "email": "johndoe@example.com",
      "github": "https://github.com/johndoe"
    }
  }
}
```

---

### DELETE /api/admin/users/[id]

Delete admin (Super Admin only).

```json
// Request
DELETE /api/admin/users/507f1f77bcf86cd799439011

// Response (200 OK)
{
  "success": true,
  "message": "Admin deleted successfully"
}
```

---

## Profile Endpoints

### GET /api/admin/profile

Get current admin profile.

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "mobile": "9876543210",
    "name": "John Doe",
    "role": "admin",
    "status": "approved",
    "profile": {
      "email": "john@example.com",
      "github": "https://github.com/johndoe"
    }
  }
}
```

---

### PUT /api/admin/profile

Update current admin profile.

```json
// Request
PUT /api/admin/profile
Content-Type: application/json

{
  "name": "John Doe Updated",
  "profile": {
    "instagram": "https://instagram.com/johndoe"
  }
}

// Response (200 OK)
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## Task Endpoints

### GET /api/admin/tasks

Get personal tasks.

```json
// Request
GET /api/admin/tasks
GET /api/admin/tasks?status=todo
GET /api/admin/tasks?assigned=true

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "title": "Complete API documentation",
      "description": "Write docs for all endpoints",
      "status": "in-progress",
      "priority": "high",
      "adminId": "507f1f77bcf86cd799439011",
      "isAssigned": false,
      "dueDate": "2024-01-20T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "title": "Review PR #42",
      "status": "todo",
      "priority": "urgent",
      "adminId": "507f1f77bcf86cd799439011",
      "assignedBy": "super-admin-founder",
      "isAssigned": true,
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

---

### POST /api/admin/tasks

Create personal task.

```json
// Request
POST /api/admin/tasks
Content-Type: application/json

{
  "title": "Implement dark mode",
  "description": "Add dark mode toggle to settings",
  "priority": "medium",
  "dueDate": "2024-01-25",
  "notes": "Reference design system"
}

// Response (201 Created)
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439023",
    "title": "Implement dark mode",
    "status": "todo",
    "priority": "medium",
    "isAssigned": false
  }
}
```

---

### PUT /api/admin/tasks/[id]

Update task.

```json
// Request
PUT /api/admin/tasks/507f1f77bcf86cd799439021
Content-Type: application/json

{
  "status": "completed",
  "notes": "Completed ahead of schedule"
}

// Response (200 OK)
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "status": "completed",
    "completedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

### DELETE /api/admin/tasks/[id]

Delete personal task (cannot delete assigned tasks).

```json
// Request
DELETE /api/admin/tasks/507f1f77bcf86cd799439021

// Response (200 OK)
{
  "success": true,
  "message": "Task deleted successfully"
}

// Error Response (403)
{
  "success": false,
  "message": "Cannot delete assigned tasks",
  "code": "FORBIDDEN"
}
```

---

### POST /api/admin/tasks/assign (Super Admin Only)

Assign task to admin.

```json
// Request
POST /api/admin/tasks/assign
Content-Type: application/json

{
  "adminId": "507f1f77bcf86cd799439011",
  "title": "Deploy v2.0 to production",
  "description": "Follow deployment checklist",
  "priority": "urgent",
  "dueDate": "2024-01-16"
}

// Response (201 Created)
{
  "success": true,
  "message": "Task assigned successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439024",
    "title": "Deploy v2.0 to production",
    "adminId": "507f1f77bcf86cd799439011",
    "assignedBy": "super-admin-founder",
    "isAssigned": true
  }
}
```

---

### GET /api/admin/tasks/common

Get common tasks (visible to all admins).

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "title": "Daily standup attendance",
      "description": "Mark attendance for daily standup",
      "completedBy": [
        {
          "adminId": "507f1f77bcf86cd799439011",
          "completedAt": "2024-01-15T09:00:00.000Z"
        }
      ],
      "createdBy": "super-admin-founder",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/admin/tasks/common (Super Admin Only)

Create common task.

```json
// Request
POST /api/admin/tasks/common
Content-Type: application/json

{
  "title": "Weekly code review",
  "description": "Review and approve pending PRs",
  "dueDate": "2024-01-20"
}

// Response (201 Created)
{
  "success": true,
  "message": "Common task created successfully"
}
```

---

### POST /api/admin/tasks/common/[id]

Mark common task as completed.

```json
// Request
POST /api/admin/tasks/common/507f1f77bcf86cd799439031

// Response (200 OK)
{
  "success": true,
  "message": "Task marked as completed"
}
```

---

### GET /api/admin/tasks/stats

Get task statistics.

```json
// Personal stats (default)
GET /api/admin/tasks/stats

{
  "success": true,
  "data": {
    "total": 10,
    "todo": 3,
    "inProgress": 4,
    "completed": 3,
    "assigned": 2
  }
}

// Common task stats
GET /api/admin/tasks/stats?type=common

// Ranking (Super Admin only)
GET /api/admin/tasks/stats?type=ranking

{
  "success": true,
  "data": [
    {
      "adminId": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "totalTasks": 15,
      "completedTasks": 12,
      "completionRate": 80
    },
    {
      "adminId": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "totalTasks": 10,
      "completedTasks": 8,
      "completionRate": 80
    }
  ]
}
```

---

## Notification Endpoints

### GET /api/admin/notifications

Get notifications.

```json
// Request
GET /api/admin/notifications
GET /api/admin/notifications?isRead=false
GET /api/admin/notifications?limit=10

// Response (200 OK)
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439041",
        "type": "task-assigned",
        "title": "New Task Assigned",
        "message": "You have been assigned: Deploy v2.0",
        "recipient": "507f1f77bcf86cd799439011",
        "sender": "super-admin-founder",
        "refType": "Task",
        "refId": "507f1f77bcf86cd799439024",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### POST /api/admin/notifications

Mark all notifications as read.

```json
// Response (200 OK)
{
  "success": true,
  "message": "5 notifications marked as read",
  "data": {
    "count": 5
  }
}
```

---

### PUT /api/admin/notifications/[id]

Mark single notification as read.

```json
// Request
PUT /api/admin/notifications/507f1f77bcf86cd799439041

// Response (200 OK)
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### DELETE /api/admin/notifications/[id]

Delete notification.

```json
// Request
DELETE /api/admin/notifications/507f1f77bcf86cd799439041

// Response (200 OK)
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Request Endpoints (Leave, Tool Subscriptions)

### GET /api/admin/requests

Get requests.

```json
// My requests
GET /api/admin/requests
GET /api/admin/requests?status=pending

// All requests (Super Admin only)
GET /api/admin/requests?all=true

// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "type": "leave",
      "title": "Annual Leave Request",
      "description": "Family vacation",
      "requestedBy": "507f1f77bcf86cd799439011",
      "leaveStartDate": "2024-02-01T00:00:00.000Z",
      "leaveEndDate": "2024-02-05T00:00:00.000Z",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439052",
      "type": "tool-subscription",
      "title": "Canva Pro Subscription",
      "description": "Need for design work",
      "toolName": "Canva Pro",
      "toolCost": 12.99,
      "toolDuration": "monthly",
      "status": "approved",
      "processedBy": "super-admin-founder",
      "processedAt": "2024-01-14T15:00:00.000Z"
    }
  ]
}
```

---

### POST /api/admin/requests

Create new request.

**Leave Request**

```json
// Request
POST /api/admin/requests
Content-Type: application/json

{
  "type": "leave",
  "title": "Sick Leave",
  "description": "Not feeling well",
  "leaveStartDate": "2024-01-20",
  "leaveEndDate": "2024-01-21",
  "leaveReason": "Medical appointment"
}

// Response (201 Created)
{
  "success": true,
  "message": "Request submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439053",
    "type": "leave",
    "status": "pending"
  }
}
```

**Tool Subscription Request**

```json
{
  "type": "tool-subscription",
  "title": "Figma Pro",
  "description": "Required for UI/UX design collaboration",
  "toolName": "Figma Professional",
  "toolCost": 15,
  "toolDuration": "monthly"
}
```

---

### POST /api/admin/requests/[id] (Super Admin Only)

Process request (approve/reject/hold).

```json
// Approve
POST /api/admin/requests/507f1f77bcf86cd799439051
Content-Type: application/json

{
  "action": "approve",
  "responseNote": "Approved. Enjoy your vacation!"
}

// Reject
{
  "action": "reject",
  "responseNote": "Please provide more details about the dates"
}

// Hold
{
  "action": "hold",
  "responseNote": "Pending budget review"
}

// Response (200 OK)
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "status": "approved",
    "processedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

### DELETE /api/admin/requests/[id]

Cancel request (only pending requests).

```json
// Request
DELETE /api/admin/requests/507f1f77bcf86cd799439051

// Response (200 OK)
{
  "success": true,
  "message": "Request cancelled successfully"
}

// Error (400)
{
  "success": false,
  "message": "Only pending requests can be cancelled"
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing with Postman

### Import Collection

1. Create new collection "RaYnk Labs API"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000/api`
3. Import the test data from this documentation

### Test Flow

1. **Super Admin Login** → Save token (auto-set in cookie)
2. **Admin Signup** → Create test admin
3. **Approve Admin** → Approve the test admin
4. **Admin Login** → Login as approved admin
5. **Test CRUD** → Test tasks, notifications, requests

### Sample Test Data

```javascript
// Environment Variables
{
  "baseUrl": "http://localhost:3000/api",
  "superAdminEmail": "founder@raynklabs.com",
  "superAdminPassword": "SuperSecure@123",
  "testMobile": "9876543210",
  "testPassword": "Admin@123456"
}
```
