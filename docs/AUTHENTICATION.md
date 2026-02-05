# Authentication Documentation

This document describes the authentication system in the RaYnk Labs application.

## Table of Contents

- [Overview](#overview)
- [Authentication Types](#authentication-types)
- [JWT Implementation](#jwt-implementation)
- [Password Handling](#password-handling)
- [Auth Guard](#auth-guard)
- [Cookie Management](#cookie-management)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)

---

## Overview

The application uses a dual authentication system:

1. **Super Admin (Founder)**: Authenticated via environment variables
2. **Regular Admin (Team Members)**: Authenticated via database credentials

```
Authentication Flow Overview
============================

            ┌─────────────────────────────────────────────┐
            │              Login Request                   │
            └─────────────────┬───────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────────────┐
            │     Has email? (Super Admin Route)          │
            └─────────────────┬───────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │ YES                               │ NO
            ▼                                   ▼
    ┌───────────────────┐             ┌───────────────────┐
    │ Validate vs ENV   │             │ Find in Database  │
    │ SUPER_ADMIN_EMAIL │             │ by mobile number  │
    │ SUPER_ADMIN_PASS  │             │                   │
    └─────────┬─────────┘             └─────────┬─────────┘
              │                                 │
              │                       ┌─────────┴─────────┐
              │                       │ Check Status      │
              │                       │ (approved only)   │
              │                       └─────────┬─────────┘
              │                                 │
              │                       ┌─────────┴─────────┐
              │                       │ Verify Password   │
              │                       │ (bcrypt compare)  │
              │                       └─────────┬─────────┘
              │                                 │
              └─────────────┬───────────────────┘
                            │
                            ▼
              ┌─────────────────────────────────┐
              │      Generate JWT Token         │
              │    (adminId, email, role)       │
              └─────────────┬───────────────────┘
                            │
                            ▼
              ┌─────────────────────────────────┐
              │  Set HTTP-Only Cookie           │
              │  (admin_token)                  │
              └─────────────────────────────────┘
```

---

## Authentication Types

### Super Admin (Founder)

- **Credentials Source**: Environment variables
- **Login Field**: Email
- **Admin ID**: `'super-admin-founder'` (fixed)
- **Role**: `'super-admin'`
- **Status**: Always `'approved'`

**Environment Variables:**
```env
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-secure-password
```

### Regular Admin (Team Member)

- **Credentials Source**: MongoDB database
- **Login Field**: Mobile number (10 digits, starts with 6-9)
- **Admin ID**: MongoDB ObjectId
- **Role**: `'admin'`
- **Status**: Requires approval (`'pending'` → `'approved'`)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## JWT Implementation

**File:** `src/lib/auth/jwt.ts`

### Token Structure

```typescript
interface AdminJWTPayload {
  adminId: string;      // 'super-admin-founder' or MongoDB ObjectId
  email: string;        // Email for super admin, mobile/email for admin
  role: 'admin' | 'super-admin';
  iat?: number;         // Issued at (auto-generated)
  exp?: number;         // Expiry (auto-generated)
}
```

### Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Secret | `JWT_SECRET` env var | Must be set in environment |
| Expiry | 7 days | Token validity period |
| Algorithm | HS256 | Default jsonwebtoken algorithm |

### Functions

#### `signJWT(payload)`

Creates a signed JWT token.

```typescript
import { signJWT } from '@/lib/auth/jwt';

const token = signJWT({
  adminId: 'super-admin-founder',
  email: 'founder@raynklabs.com',
  role: 'super-admin'
});
```

#### `verifyJWT(token)`

Verifies and decodes a JWT token.

```typescript
import { verifyJWT } from '@/lib/auth/jwt';

try {
  const payload = verifyJWT(token);
  console.log(payload.adminId, payload.role);
} catch (error) {
  // Token expired or invalid
}
```

#### `decodeJWT(token)`

Decodes without verification (for reading claims).

```typescript
import { decodeJWT } from '@/lib/auth/jwt';

const payload = decodeJWT(token);
// Returns null if invalid
```

#### `isTokenExpired(token)`

Checks if token is expired.

```typescript
import { isTokenExpired } from '@/lib/auth/jwt';

if (isTokenExpired(token)) {
  // Redirect to login
}
```

#### `shouldRefreshToken(token, thresholdMs?)`

Checks if token should be refreshed (default: expires within 1 day).

```typescript
import { shouldRefreshToken } from '@/lib/auth/jwt';

if (shouldRefreshToken(token)) {
  // Refresh the token
}
```

---

## Password Handling

**File:** `src/lib/auth/password.ts`

Uses bcrypt for secure password hashing.

### Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Salt Rounds | 10 | bcrypt work factor |

### Functions

#### `hashPassword(password)`

Hashes a plain text password.

```typescript
import { hashPassword } from '@/lib/auth/password';

const hashedPassword = await hashPassword('SecurePass123!');
// $2a$10$...
```

#### `comparePassword(password, hashedPassword)`

Compares plain text with hash.

```typescript
import { comparePassword } from '@/lib/auth/password';

const isValid = await comparePassword('SecurePass123!', hashedPassword);
// true or false
```

---

## Auth Guard

**File:** `src/lib/auth/authGuard.ts`

Server-side authentication utilities for API routes.

### Functions

#### `requireAdmin()`

Verifies authentication for protected routes.

```typescript
import { requireAdmin } from '@/lib/auth/authGuard';

export async function GET() {
  try {
    const admin = await requireAdmin();
    // admin.adminId, admin.role, admin.email
    return NextResponse.json({ data: admin });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Throws:**
- `UnauthorizedError` - No token provided
- `TokenExpiredError` - Token has expired
- `InvalidTokenError` - Token is malformed

#### `requireSuperAdmin()`

Verifies super admin authentication.

```typescript
import { requireSuperAdmin } from '@/lib/auth/authGuard';

export async function POST(req: Request) {
  try {
    const admin = await requireSuperAdmin();
    // Only super admin reaches here
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Throws:**
- All errors from `requireAdmin()`
- `UnauthorizedError` - Not a super admin

#### `optionalAdmin()`

Gets admin info without requiring authentication.

```typescript
import { optionalAdmin } from '@/lib/auth/authGuard';

export async function GET() {
  const admin = await optionalAdmin();
  if (admin) {
    // Show personalized content
  } else {
    // Show public content
  }
}
```

#### `isAuthenticated()`

Check authentication status without throwing.

```typescript
import { isAuthenticated } from '@/lib/auth/authGuard';

const isLoggedIn = await isAuthenticated();
```

#### `getAuthToken()`

Get the raw token from cookies.

```typescript
import { getAuthToken } from '@/lib/auth/authGuard';

const token = await getAuthToken();
```

---

## Cookie Management

### Cookie Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Name | `admin_token` | Cookie name |
| HTTP Only | `true` | Not accessible via JavaScript |
| Secure | `true` (production) | HTTPS only in production |
| Same Site | `lax` | CSRF protection |
| Max Age | 7 days | Matches JWT expiry |
| Path | `/` | Available site-wide |

### Setting Cookie (Login)

```typescript
// In login API route
const response = NextResponse.json({ success: true, data: { admin } });

response.cookies.set('admin_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});

return response;
```

### Clearing Cookie (Logout)

```typescript
// In logout API route
const response = NextResponse.json({ success: true, message: 'Logged out' });

response.cookies.set('admin_token', '', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 0,
  path: '/',
});

return response;
```

---

## Security Features

### Account Lockout

Protects against brute force attacks.

| Setting | Environment Variable | Default |
|---------|---------------------|---------|
| Max Attempts | `MAX_LOGIN_ATTEMPTS` | 5 |
| Lockout Duration | `LOCKOUT_DURATION_MINUTES` | 15 minutes |

**Flow:**
```
Login Attempt Failed
        │
        ▼
Increment loginAttempts
        │
        ▼
┌───────────────────────────────────┐
│ loginAttempts >= MAX_ATTEMPTS?    │
└───────────────────┬───────────────┘
                    │
        ┌───────────┴───────────┐
        │ YES                   │ NO
        ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│ Set lockUntil     │   │ Allow retry       │
│ (current + 15min) │   │                   │
└───────────────────┘   └───────────────────┘
```

### Admin Status Checks

Regular admins must have `status: 'approved'` to log in.

| Status | Login Allowed | Message |
|--------|---------------|---------|
| `pending` | No | "Your account is pending approval" |
| `approved` | Yes | - |
| `rejected` | No | "Your account has been rejected" |
| `suspended` | No | "Your account has been suspended" |

### OTP for Password Change

Password changes require OTP verification.

| Setting | Environment Variable | Default |
|---------|---------------------|---------|
| OTP Length | `OTP_LENGTH` | 6 digits |
| OTP Expiry | `OTP_EXPIRY_MINUTES` | 10 minutes |

**Flow:**
```
Request OTP → Generate 6-digit OTP → Store in DB → Send via SMS
        │
        ▼
Enter OTP + Current Password + New Password
        │
        ▼
Verify OTP → Verify Current Password → Hash New Password → Update
```

---

## API Endpoints

### Login

**Super Admin:**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "founder@raynklabs.com",
  "password": "your-password"
}
```

**Regular Admin:**
```http
POST /api/admin/login
Content-Type: application/json

{
  "mobile": "9876543210",
  "password": "SecurePass123!"
}
```

### Signup

```http
POST /api/admin/signup
Content-Type: application/json

{
  "name": "John Doe",
  "mobile": "9876543210",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

### Logout

```http
POST /api/admin/logout
```

### Get Current Profile

```http
GET /api/admin/profile
Cookie: admin_token=...
```

### Change Password

```http
POST /api/admin/password
Cookie: admin_token=...
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "otp": "123456"
}
```

---

## Frontend Integration

### Login Form

```typescript
async function handleLogin(email: string, password: string) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Important for cookies
  });

  const data = await response.json();

  if (data.success) {
    // Cookie is automatically set
    // Redirect to dashboard
    router.push('/admin/dashboard');
  } else {
    // Show error message
    setError(data.message);
  }
}
```

### Protected API Calls

```typescript
async function fetchProtectedData() {
  const response = await fetch('/api/admin/tasks', {
    credentials: 'include', // Send cookies with request
  });

  if (response.status === 401) {
    // Token expired or invalid
    router.push('/admin/login');
    return;
  }

  const data = await response.json();
  return data;
}
```

### Logout

```typescript
async function handleLogout() {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  });

  // Redirect to login
  router.push('/admin/login');
}
```

### Auth Context (React)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status on mount
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/admin/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ... login, logout implementations

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Environment Variables Summary

```env
# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here

# Super Admin Credentials
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-super-secure-password

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
```

---

## Related Documentation

- [API Reference](./API-REFERENCE.md) - Full API documentation
- [Models](./MODELS.md) - Admin model schema
- [Services](./SERVICES.md) - AdminService details
- [Admin Workflow](./ADMIN-WORKFLOW.md) - Approval process
