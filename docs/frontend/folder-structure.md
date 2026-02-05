# Frontend Folder Structure

## Directory Overview

```
src/
├── app/                    # Next.js App Router
├── components/             # Shared React Components
├── features/               # Feature-based Modules
├── lib/                    # Shared Utilities
├── server/                 # Backend Logic
├── types/                  # TypeScript Definitions
└── middleware.ts           # Edge Middleware
```

## Key Directories

### /app - Next.js App Router
- (public)/ - Public route group
- admin/ - Admin section with dashboard
- api/ - API route handlers

### /components - Shared Components
- ui/ - shadcn/ui components
- layout/ - Layout components (Navbar, Footer)
- cards/ - Feature cards
- theme/ - Theme components

### /features - Feature Modules
- admin/ - Admin feature with components, hooks, types

### /server - Backend Logic
- config/ - Configuration
- controllers/ - HTTP handlers
- middlewares/ - Middleware functions
- services/ - Business logic
- repositories/ - Data access
- schemas/ - Zod validation

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | ServiceCard.tsx |
| Hooks | camelCase with 'use' prefix | useAdminCrud.ts |
| Services | camelCase with .service suffix | course.service.ts |
| Controllers | camelCase with .controller suffix | course.controller.ts |
