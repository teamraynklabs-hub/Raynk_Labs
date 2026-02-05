# Environment Variables Documentation

This document describes all environment variables used in the RaYnk Labs application.

## Table of Contents

- [Quick Setup](#quick-setup)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Security Best Practices](#security-best-practices)

---

## Quick Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your values
nano .env.local
```

---

## Required Variables

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/raynklabs` |

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raynklabs?retryWrites=true&w=majority
```

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | Random 256-bit string |
| `SUPER_ADMIN_EMAIL` | Founder login email | `founder@raynklabs.com` |
| `SUPER_ADMIN_PASSWORD` | Founder login password | Secure password |

```env
# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-replace-with-actual-random-string

# Super Admin (Founder) Credentials
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-super-secure-founder-password
```

**Generating a secure JWT secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Cloudinary (Image Uploads)

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

---

## Optional Variables

### Security Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `MAX_LOGIN_ATTEMPTS` | Failed logins before lockout | `5` |
| `LOCKOUT_DURATION_MINUTES` | Account lockout duration | `15` |

```env
# Account Lockout
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
```

### OTP Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `OTP_LENGTH` | Length of OTP code | `6` |
| `OTP_EXPIRY_MINUTES` | OTP validity duration | `10` |

```env
# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
```

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Application

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Complete `.env.example`

```env
# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raynklabs?retryWrites=true&w=majority

# ============================================
# AUTHENTICATION
# ============================================
# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-replace-with-actual-random-string

# Super Admin (Founder) Credentials
# IMPORTANT: Change these in production!
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-super-secure-founder-password

# Legacy support (optional, use SUPER_ADMIN_* instead)
# ADMIN_EMAIL=founder@raynklabs.com
# ADMIN_PASSWORD=your-password

# ============================================
# SECURITY
# ============================================
# Account Lockout
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# CLOUDINARY (Image Uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# APPLICATION
# ============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/raynklabs-dev
```

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://raynklabs.com
MONGODB_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/raynklabs
```

### Testing

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/raynklabs-test
```

---

## Security Best Practices

### Do's

1. **Use strong secrets**: Generate random strings for JWT_SECRET
2. **Use environment files**: Never hardcode secrets in code
3. **Different secrets per environment**: Use unique secrets for dev/staging/production
4. **Rotate secrets periodically**: Change JWT_SECRET and passwords regularly
5. **Use HTTPS in production**: Set `NEXT_PUBLIC_APP_URL` with https://

### Don'ts

1. **Never commit `.env` files**: Add to `.gitignore`
2. **Never log secrets**: Avoid logging environment variables
3. **Never expose in client code**: Only use `NEXT_PUBLIC_` prefix for public values
4. **Never share credentials**: Each developer should have their own credentials
5. **Never use default passwords**: Always change example passwords

### Gitignore Entry

```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## Validation

The application validates required environment variables on startup:

```typescript
// JWT_SECRET validation (in jwt.ts)
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return secret;
})();

// Super Admin credentials validation (in admin.service.ts)
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

if (!superAdminEmail || !superAdminPassword) {
  throw new Error('Super admin credentials not configured');
}
```

---

## Troubleshooting

### "JWT_SECRET environment variable is not defined"

Make sure you have set the JWT_SECRET in your `.env.local` file:
```env
JWT_SECRET=your-secret-key
```

### "Super admin credentials not configured"

Set the super admin credentials:
```env
SUPER_ADMIN_EMAIL=founder@raynklabs.com
SUPER_ADMIN_PASSWORD=your-password
```

### MongoDB connection failed

1. Check if MONGODB_URI is correct
2. Verify network access to MongoDB cluster
3. Check IP whitelist in MongoDB Atlas
4. Verify username and password

### Cloudinary upload failed

1. Verify CLOUDINARY_CLOUD_NAME
2. Check CLOUDINARY_API_KEY
3. Verify CLOUDINARY_API_SECRET
4. Check upload presets in Cloudinary dashboard

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - Auth flow details
- [API Reference](./API-REFERENCE.md) - API endpoints
- [Admin Workflow](./ADMIN-WORKFLOW.md) - Admin system
