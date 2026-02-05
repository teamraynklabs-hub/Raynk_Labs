# RaYnk Labs - System Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS EDGE MIDDLEWARE                             │
│                    (JWT Verification, Route Protection)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────┐
│       PUBLIC PAGES              │   │         ADMIN DASHBOARD             │
│   (Server Components)           │   │        (Protected Routes)           │
│                                 │   │                                     │
│ • Home (/)                      │   │ • /admin (Login)                    │
│ • About (/about)                │   │ • /admin/dashboard                  │
│ • Services (/services)          │   │ • /admin/dashboard/[feature]        │
│ • Courses (/courses)            │   │                                     │
│ • Projects (/projects)          │   │                                     │
│ • Team (/team)                  │   │                                     │
│ • Contact (/contact)            │   │                                     │
└─────────────────────────────────┘   └─────────────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API ROUTES (/api/*)                               │
│                        (Thin Controllers Layer)                              │
│                                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   courses    │ │   services   │ │   projects   │ │     team     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │  softwares   │ │    hero      │ │    about     │ │  community   │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                        │
│  │   meetups    │ │  upcoming    │ │ submissions  │                        │
│  └──────────────┘ └──────────────┘ └──────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER (Business Logic)                       │
│                                                                             │
│  • Validation (Zod Schemas)                                                 │
│  • Business Rules                                                           │
│  • Data Transformation                                                      │
│  • Error Handling                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REPOSITORY LAYER (Data Access)                         │
│                                                                             │
│  • MongoDB Operations                                                       │
│  • Query Building                                                           │
│  • Connection Management                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────┐
│         MongoDB Atlas           │   │           Cloudinary                 │
│         (Database)              │   │         (Image Storage)              │
└─────────────────────────────────┘   └─────────────────────────────────────┘
```

## Data Flow

### 1. Public Content Display
```
User Request → Next.js Page → API Route → Service → Repository → MongoDB
                                                                    ↓
User ← React Component ← JSON Response ← Service ← Repository ← Data
```

### 2. Admin Content Management
```
Admin Action → API Route → Auth Guard → Service → Zod Validation → Repository → MongoDB
                              ↓                                                    ↓
Admin ← JSON Response ← Error Handler ← Service ← Repository ← Updated Data
```

### 3. Image Upload Flow
```
FormData (with image) → API Route → Upload Utility → Cloudinary
                                         ↓
                                    Image URL
                                         ↓
                                    MongoDB (stored as CloudinaryImage)
```

## Authentication Flow

```
┌──────────────┐     POST /api/admin/login      ┌─────────────────┐
│  Admin       │────────────────────────────────▶│   Login API     │
│  Login Form  │                                │                  │
└──────────────┘                                └────────┬─────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │  Validate with Zod  │
                                              │  Check Credentials  │
                                              └────────┬────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │  Generate JWT       │
                                              │  (7-day expiry)     │
                                              └────────┬────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────────┐
                                              │  Set HTTP-only      │
                                              │  Cookie             │
                                              └────────┬────────────┘
                                                        │
                                                        ▼
┌──────────────┐      Redirect to /admin/dashboard     │
│   Dashboard  │◀──────────────────────────────────────┘
└──────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 18 | UI Framework |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Animation | Framer Motion | UI Animations |
| Icons | Lucide React | Icon Library |
| Backend | Next.js API Routes | REST API |
| Validation | Zod | Runtime type checking |
| Database | MongoDB + Mongoose 9 | Data persistence |
| Auth | JWT + jose | Authentication |
| Images | Cloudinary | Image CDN & storage |
| Type Safety | TypeScript 5 | Static typing |

## Key Design Decisions

### 1. Server-First Architecture
- Server Components by default
- Client Components only when interactivity needed
- API routes for data mutations

### 2. Layered Backend
- **Controllers** (API Routes): HTTP handling only
- **Services**: Business logic, validation
- **Repositories**: Database operations

### 3. Security First
- JWT stored in HTTP-only cookies
- Edge middleware for route protection
- Zod validation on all inputs
- No credentials in client code

### 4. Soft Deletes
- Content uses `isActive` flag
- Preserves data integrity
- Easy restore functionality
