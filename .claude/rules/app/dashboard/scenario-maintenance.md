---
paths:
  - 'app/dashboard/page.tsx'
  - 'app/dashboard/page.codeyam.tsx'
category: testing
timestamp: 2026-02-03T23:10:00Z
---

## Dashboard Scenario Maintenance

Dashboard has 5 perfected scenarios preserved in CodeYam database (commit 7bd6cf3).

### Scenarios

1. **Activity Explorer**: 7-day streak, all 8 activity types, weather data
2. **Goal Achiever**: 10-day streak, 95%+ goal progress, rainy weather
3. **Wellbeing Check-In**: 0-day streak, struggle state, stormy weather
4. **Empty Dashboard State**: Fresh user, minimal data
5. **Loading Dashboard State**: Loading skeleton UI

### Maintaining Scenarios After Changes

When modifying `app/dashboard/page.tsx`:

1. **Make your changes** to the component
2. **Verify scenarios still work**: Run `codeyam verify` or view at http://localhost:3111
3. **If scenarios break**: Update `page.codeyam.tsx` mock data to match new interface
4. **Regenerate if needed**: Run `codeyam analyze --entity Dashboard 'app/dashboard/page.tsx'`

### Visual States

Component supports `visualState` prop for distinct appearances:
- `peak-performance`: High achievement banner
- `struggling`: Support/recovery banner
- `activity-diversity`: Diversity badge
- `goal-achiever`: Goal-focused display
- `empty`: Empty state UI
- `loading`: Skeleton loading UI

CodeYam automatically generates scenarios, or define custom ones in `page.codeyam.tsx`.

**Learned:** 2026-02-03 from git history analysis and codebase investigation
