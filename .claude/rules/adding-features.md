---
paths:
  - 'app/**/*.tsx'
  - 'components/**/*.tsx'
  - 'scripts/*.sql'
---

# Adding New Feature Workflow

Follow this order for smooth development:

1. **Database**: Create table in `scripts/` (columns, constraints, indexes)
2. **RLS**: Enable RLS and create policies (`auth.uid() = user_id`)
3. **TypeScript**: Add interface matching table schema
4. **Page**: Create `app/dashboard/[feature]/page.tsx` (protected route pattern)
5. **Form**: Create `components/[feature]-form.tsx` (follow form pattern)
6. **View**: Create `components/[feature]-view.tsx` for display
7. **Navigation**: Add link to `components/dashboard-layout.tsx`

Run migration in Supabase SQL Editor before testing.
