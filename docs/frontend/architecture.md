# Frontend Architecture

## Overview

RaYnk Labs frontend is built with Next.js 14+ App Router, utilizing Server Components by default and Client Components where interactivity is required.

## Next.js App Router

### Route Structure
```
app/
├── (public)/              # Route Group - Public Pages
│   ├── page.tsx           → /
│   ├── about/page.tsx     → /about
│   └── ...
├── admin/                 # Admin Routes
│   ├── page.tsx           → /admin (Login)
│   └── dashboard/         → /admin/dashboard/*
└── api/                   # API Routes
```

## Component Architecture

### Server vs Client Components

**Server Components (Default)**
- Fetch data on the server
- Access backend resources directly
- Reduce client JavaScript bundle

**Client Components ('use client')**
- Interactive UI (buttons, forms, modals)
- Browser APIs (localStorage, window)
- Event handlers (onClick, onChange)

## State Management

- **No global state library** - React built-in state is sufficient
- **Server state** - Fetched via API routes
- **UI state** - Component-level useState
- **Form state** - React Hook Form
- **Theme state** - next-themes provider

## Form Management

Using React Hook Form + Zod for all admin forms:
```tsx
const methods = useForm({
  resolver: zodResolver(schema),
});
```
