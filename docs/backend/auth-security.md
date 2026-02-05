# Authentication & Security

## Authentication Flow

### Login Process

1. Admin submits email/password to `/api/admin/login`
2. Credentials validated with Zod schema
3. Compared against environment variables
4. JWT token generated with 7-day expiry
5. Token stored in HTTP-only secure cookie
6. Redirect to dashboard

### Token Structure

```typescript
interface AdminJWTPayload {
  adminId: string;
  email: string;
  role: 'admin' | 'super-admin';
  iat?: number;  // Issued at
  exp?: number;  // Expiration
}
```

### Cookie Configuration

```typescript
response.cookies.set('admin_token', token, {
  httpOnly: true,                              // Prevents XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',                          // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24 * 7,                   // 7 days
});
```

## Route Protection

### Edge Middleware

The middleware (`src/middleware.ts`) runs at the edge and protects routes before they reach the server:

```typescript
// Protected routes
const PROTECTED_ROUTES = ['/admin/dashboard'];

// Middleware logic
if (isProtectedRoute && !isValidToken) {
  return NextResponse.redirect('/admin');
}
```

### API Auth Guard

For API routes, use `requireAdmin()`:

```typescript
import { requireAdmin } from '@/lib/auth/authGuard';

export async function POST(req: Request) {
  // This throws UnauthorizedError if not authenticated
  const admin = await requireAdmin();

  // Only reaches here if authenticated
  // admin.email, admin.role available
}
```

## Security Best Practices

### 1. JWT Verification

The auth guard **actually verifies** JWT tokens (not just checking existence):

```typescript
// src/lib/auth/authGuard.ts
export async function requireAdmin(): Promise<AdminJWTPayload> {
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    throw new UnauthorizedError('No token');
  }

  // Actually verify the token
  const payload = verifyJWT(token);  // Throws if invalid

  return payload;
}
```

### 2. Input Validation

All inputs validated with Zod:

```typescript
// src/server/schemas/index.ts
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

### 3. Credentials Storage

- Admin credentials in environment variables
- Never in client code
- Never in version control

### 4. Error Messages

Generic errors to prevent information leakage:

```typescript
// Good
throw new UnauthorizedError('Invalid credentials');

// Bad - reveals too much
throw new Error('User with email admin@test.com not found');
```

## Environment Variables

Required for authentication:

```env
JWT_SECRET=<secure-random-string>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

Generate JWT secret:
```bash
openssl rand -base64 32
```
