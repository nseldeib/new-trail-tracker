---
paths:
  - 'scripts/*.sql'
---

# Database Migration Workflow

- Create migration files in `scripts/` with descriptive names (e.g., `migrate-workouts-table-fixed.sql`)
- Run migrations directly in Supabase SQL Editor (web dashboard)
- Pattern: CREATE TABLE → ENABLE RLS → CREATE POLICIES → CREATE INDEXES
- Always include RLS policies filtering by `auth.uid() = user_id` for user-specific tables
- Test with check scripts (e.g., `check-workouts-table-structure.sql`) after running migrations
