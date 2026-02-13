---
paths:
  - 'lib/activity-types.ts'
---

# Activity Types System

- Single source of truth: `ACTIVITY_TYPES` array in `lib/activity-types.ts`
- To add new activity: Add to array with `{ value, label, emoji }` format
- Goals use filtered list (`GOAL_ACTIVITY_TYPES`) excluding yoga/strength
- Used across forms, filters, and displays via `getActivityEmoji()` and `getActivityLabel()` helpers
