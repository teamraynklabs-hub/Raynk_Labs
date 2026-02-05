# Backend Architecture

## Layered Architecture

The backend follows a clean layered architecture pattern:

```
┌─────────────────────────────────────────┐
│           API Routes (Controllers)       │  ← HTTP handling
├─────────────────────────────────────────┤
│             Services Layer               │  ← Business logic
├─────────────────────────────────────────┤
│           Repositories Layer             │  ← Data access
├─────────────────────────────────────────┤
│          Models (Mongoose)               │  ← Schema definitions
├─────────────────────────────────────────┤
│              MongoDB                     │  ← Database
└─────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── app/api/                    # API Routes (Controllers)
│   ├── admin/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── verify/route.ts
│   ├── courses/route.ts
│   ├── services/route.ts
│   └── ...
│
├── server/                     # Backend business logic
│   ├── repositories/           # Data access layer
│   │   ├── base.repository.ts  # Abstract base class
│   │   ├── course.repository.ts
│   │   └── ...
│   │
│   ├── services/               # Business logic layer
│   │   ├── course.service.ts
│   │   └── ...
│   │
│   ├── schemas/                # Zod validation schemas
│   │   └── index.ts
│   │
│   └── utils/                  # Backend utilities
│       ├── errors.ts           # Error handling
│       └── upload.ts           # File upload helpers
│
└── lib/
    ├── auth/                   # Authentication
    │   ├── authGuard.ts        # Route protection
    │   └── jwt.ts              # JWT utilities
    │
    ├── models/                 # Mongoose models
    │   ├── Course.ts
    │   └── ...
    │
    ├── mongodb.ts              # DB connection
    └── cloudinary.ts           # Image upload
```

## API Route Pattern

All API routes follow this pattern:

```typescript
// src/app/api/[resource]/route.ts

import { NextResponse } from 'next/server';
import { resourceService } from '@/server/services';
import { handleApiError } from '@/server/utils/errors';
import { requireAdmin } from '@/lib/auth/authGuard';

// GET - Public (no auth)
export async function GET() {
  try {
    const data = await resourceService.getAll();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Admin only
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const result = await resourceService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Service Layer Pattern

Services handle business logic and validation:

```typescript
// src/server/services/course.service.ts

import { courseRepository } from '@/server/repositories';
import { courseCreateSchema } from '@/server/schemas';
import { NotFoundError } from '@/server/utils/errors';

class CourseService {
  async getAll() {
    return courseRepository.findActive();
  }

  async create(data: unknown) {
    // Zod validation
    const validated = courseCreateSchema.parse(data);

    // Business logic
    return courseRepository.create({
      ...validated,
      isActive: true,
    });
  }
}
```

## Repository Pattern

Repositories handle database operations:

```typescript
// src/server/repositories/course.repository.ts

import { BaseRepository } from './base.repository';
import CourseModel from '@/lib/models/Course';

class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(CourseModel);
  }

  async findActive() {
    return this.findAll({ isActive: true }, { sort: { order: 1 } });
  }
}
```

## Error Handling

Centralized error handling with custom error classes:

```typescript
// Custom errors
throw new NotFoundError('Course');
throw new ValidationError(['Title is required']);
throw new UnauthorizedError('Invalid token');

// Handled by
handleApiError(error) // Returns proper HTTP response
```
