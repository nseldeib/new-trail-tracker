---
paths:
  - 'lib/supabase/**/*.ts'
  - 'app/**/*.tsx'
  - 'components/**/*.tsx'
category: architecture
timestamp: 2026-02-03T23:15:00Z
---

## Supabase Client Usage

Three client types for different execution contexts.

### Client Selection

**Client Components** (`'use client'`)
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()  // Synchronous
```

**Server Components** (no 'use client')
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()  // Async - requires await
```

**Middleware** (`middleware.ts`)
```typescript
import { updateSession } from '@/lib/supabase/middleware'
return await updateSession(request)
```

### Key Differences

| Context | Import | Call | Cookie Access |
|---------|--------|------|---------------|
| Client Component | `client.ts` | `createClient()` | Browser cookies |
| Server Component | `server.ts` | `await createClient()` | Next.js cookies() |
| Middleware | `middleware.ts` | `updateSession(req)` | Request cookies |

### Common Pattern in Client Components

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data } = await supabase.from('workouts').select('*')
    }
    loadData()
  }, [])
}
```

### Important

- **Always use `await`** with server client: `await createClient()`
- **Never use `await`** with browser client: `createClient()` (not async)
- Middleware handles session refresh automatically for all routes

**Learned:** 2026-02-03 from Supabase client implementation analysis
