---
paths:
  - 'lib/supabase/**/*.ts'
  - 'scripts/*.sql'
---

# Supabase RLS Testing

- RLS policies MUST use `auth.uid() = user_id` for user-specific data
- Test policies: Sign in as different users and verify data isolation
- Common issue: "No rows returned" usually means RLS policy blocks the query (check `auth.uid()` matches)
- Debug with Supabase SQL Editor: `SELECT auth.uid()` to verify authenticated user
- All tables with `user_id` column must have RLS enabled and policies for SELECT, INSERT, UPDATE, DELETE
