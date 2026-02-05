# Frontend Coding Standards

## TypeScript Standards

- Strict mode enabled
- No `any` types - use proper typing
- Use type inference where clear
- Export types alongside components

## Component Guidelines

### Structure
```tsx
'use client'; // Only if needed

import { ... } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props definition
}

export function Component({ prop }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Naming
- Components: PascalCase
- Props interfaces: ComponentNameProps
- Hooks: useHookName

## Styling Conventions

### Tailwind CSS
- Use utility classes
- Group related utilities
- Use cn() for conditional classes

```tsx
className={cn(
  'base-classes',
  condition && 'conditional-classes'
)}
```

## Import Organization

1. React/Next.js imports
2. External library imports
3. Internal imports (@/)
4. Type imports
5. Style imports
