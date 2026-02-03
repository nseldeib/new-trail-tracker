---
paths:
  - '**/*.codeyam.tsx'
  - 'app/**/*.tsx'
  - 'components/**/*.tsx'
category: architecture
timestamp: 2026-02-03T23:10:00Z
---

## CodeYam Scenario Files Pattern

`.codeyam.tsx` files define test scenarios for CodeYam visual simulation system.

### File Relationship

- **Main file** (`page.tsx`): Production component with optional mock props interface
- **Scenario file** (`page.codeyam.tsx`): Exports `scenarios` object with named test cases

### Pattern

Main component accepts mock props:
```typescript
interface DashboardProps {
  visualState?: "peak-performance" | "struggling" | "empty" | "loading"
  mockWorkouts?: Workout[]
  mockGoals?: Goal[]
  mockUser?: any
}
```

Scenario file imports and provides test data:
```typescript
import Dashboard from "./page"

export const scenarios = {
  "Scenario Name": {
    component: Dashboard,
    props: { visualState: "empty", mockWorkouts: [], mockGoals: [] }
  }
}
```

### When to Create `.codeyam.tsx`

Create when component:
- Has conditional rendering based on data states
- Displays different visual variations
- Needs comprehensive visual documentation

Run `codeyam analyze --entity ComponentName 'path/to/file.tsx'` to generate scenarios automatically, or define manually in `.codeyam.tsx` for precise control.

**Learned:** 2026-02-03 from codebase analysis and user explanation
