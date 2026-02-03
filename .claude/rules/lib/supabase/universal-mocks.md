---
paths:
  - 'lib/supabase/**/*.ts'
  - '.codeyam/universal-mocks/**/*.ts'
category: architecture
timestamp: 2026-02-03T23:10:00Z
---

## Supabase Universal Mocks

Universal mocks in `.codeyam/universal-mocks/lib/supabase/` replace real Supabase clients during CodeYam simulations.

### When Mocks Are Used

- **CodeYam simulations**: Automatically injected when `codeyam analyze` runs
- **Production**: Real clients from `lib/supabase/` are used
- **No manual switching needed**: CodeYam's module resolution handles substitution

### Mock Structure

Mocks return empty data by default:
```typescript
export function createClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      // ... other auth methods
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      // ... chainable query methods
    })
  } as any
}
```

### Providing Mock Data

Pass data via component props (not by modifying universal mocks):
```typescript
// In page.codeyam.tsx
props: {
  mockWorkouts: [{id: "1", activity_type: "running", ...}]
}
```

Component uses mock when provided:
```typescript
const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts || [])
```

**Learned:** 2026-02-03 from user explanation and analysis of `.codeyam/universal-mocks/`
