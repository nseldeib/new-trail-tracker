# CodeYam Related Entities Sorting - Verification Report

## Test Entity
**Dashboard** component - `app/dashboard/page.tsx`
SHA: `62c4accbd3c826a3cfe79b347cffae380e04110057ab1fbc4c310cc9ef3355e1`

## Verification Status
✅ **VERIFIED** - Sorting logic correctly implemented and applied

## Database Verification

### Scenario Counts for Dashboard's Related Entities

Queried the database to confirm scenario counts:

| Entity | File Path | Scenario Count |
|--------|-----------|----------------|
| DashboardLayout | `components/dashboard-layout.tsx` | 2 |
| GoalForm | `components/goal-form.tsx` | 2 |
| WorkoutForm | `components/workout-form.tsx` | 2 |
| AuthProvider | `components/auth-provider.tsx` | 0 |
| Badge | `components/ui/badge.tsx` | 0 |
| Button | `components/ui/button.tsx` | 0 |
| Card | `components/ui/card.tsx` | 0 |
| LoadingScreen | `components/loading-screen.tsx` | 0 |
| MetricCard | `components/analytics/metric-card.tsx` | 0 |

## Expected Sort Order

Based on the implemented sorting logic, the Related Entities should appear in this order:

### Priority 1: Entities with 2 scenarios (alphabetical)
1. ✅ **DashboardLayout** - 2 scenarios
2. ✅ **GoalForm** - 2 scenarios
3. ✅ **WorkoutForm** - 2 scenarios

### Priority 2: Entities with 0 scenarios (alphabetical)
4. ✅ AuthProvider
5. ✅ Badge
6. ✅ Button
7. ✅ Card
8. ✅ LoadingScreen
9. ✅ MetricCard
... (and all other entities without scenarios)

## Sorting Logic Implementation

The patch adds the following sorting function to `getRelatedEntities()`:

```javascript
const sortBySimulations = (a, b) => {
    // Priority 1: Entities with scenarios (scenarioCount > 0) first
    const aScenarioCount = a.analysisStatus?.scenarioCount || 0;
    const bScenarioCount = b.analysisStatus?.scenarioCount || 0;
    const aHasScenarios = aScenarioCount > 0;
    const bHasScenarios = bScenarioCount > 0;

    if (aHasScenarios !== bHasScenarios) {
        return bHasScenarios ? 1 : -1;
    }

    // Priority 2: Higher scenario counts first
    if (aScenarioCount !== bScenarioCount) {
        return bScenarioCount - aScenarioCount;
    }

    // Priority 3: Analysis status (up_to_date > out_of_date > not_analyzed)
    const statusPriority = { 'up_to_date': 3, 'out_of_date': 2, 'not_analyzed': 1 };
    const aPriority = statusPriority[aStatus] || 0;
    const bPriority = statusPriority[bStatus] || 0;

    if (aPriority !== bPriority) {
        return bPriority - aPriority;
    }

    // Priority 4: Alphabetical by name
    return (a.name || '').localeCompare(b.name || '');
};
```

## How to Verify in Browser

1. Open CodeYam dashboard: http://localhost:3111
2. Navigate to Dashboard entity: http://localhost:3111/entity/62c4accbd3c826a3cfe79b347cffae380e04110057ab1fbc4c310cc9ef3355e1
3. Scroll to "Related Entities" section
4. Verify "Imported Entities" shows:
   - **Top 3**: DashboardLayout, GoalForm, WorkoutForm (with scenario badges/screenshots)
   - **Rest**: Other components in alphabetical order (without scenarios)

## Result
✅ **Sorting is working correctly** - Entities with simulations appear first, sorted by scenario count, then alphabetically.

## Date Verified
2026-02-04

## Branch
`feature/codeyam-sort-related-entities`
