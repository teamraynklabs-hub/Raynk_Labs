# RaYnk Labs - Documentation

This documentation covers the complete admin system architecture, API endpoints, and workflows.

## Documentation Index

| File | Description |
|------|-------------|
| [API-REFERENCE.md](./API-REFERENCE.md) | Complete API documentation with endpoints and test data |
| [MODELS.md](./MODELS.md) | Database models and schema documentation |
| [SERVICES.md](./SERVICES.md) | Business logic and service layer documentation |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Authentication flow and security documentation |
| [ADMIN-WORKFLOW.md](./ADMIN-WORKFLOW.md) | Admin system workflow and role-based access |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment variables configuration |

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Configure required variables
MONGODB_URI=your-mongodb-connection-string
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-256-bit-secret-key
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Access Admin Panel

- **URL**: `http://localhost:3000/admin`
- **Super Admin Login**: Use email/password from environment variables
- **Team Admin Login**: Use mobile/password (after signup and approval)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  (Next.js App Router + React + Tailwind CSS)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  /api/admin/* (Protected Routes with JWT)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Services Layer                          │
│  (Business Logic + Validation)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  (Mongoose Models + MongoDB)                                │
└─────────────────────────────────────────────────────────────┘
```

## Role-Based Access Control

### Super Admin (Founder)
- Single user authenticated via environment variables
- Full system access
- Can approve/reject admin signups
- Can manage all admins and content

### Admin (Team Member)
- Signs up with mobile number
- Requires Super Admin approval
- Limited to assigned tasks and personal profile
- Cannot access other admin data

## Key Features

1. **Authentication**
   - JWT-based authentication
   - HTTP-only cookies for security
   - Role-based route protection

2. **Admin Management**
   - Signup with mobile/password
   - Approval workflow
   - Profile management

3. **Task System**
   - Personal tasks (self-created)
   - Assigned tasks (from Super Admin)
   - Common tasks (team-wide)
   - Task ranking by completion

4. **Notifications**
   - Real-time notifications
   - Task assignments
   - Request approvals
   - System announcements

5. **Request System**
   - Leave requests
   - Tool subscriptions
   - Resource requests
