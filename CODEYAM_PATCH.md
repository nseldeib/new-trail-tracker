# CodeYam CLI Patch: Sort Related Entities by Simulation Status

## Overview
Modified the CodeYam CLI installation to prioritize entities with simulations in the "Related Entities" section of the dashboard.

## Patched File
`/Users/nadiaeldeib/.nvm/versions/node/v22.16.0/lib/node_modules/@codeyam/codeyam-cli/codeyam-cli/src/webserver/app/lib/database.js`

## Function Modified
`getRelatedEntities(entity)` - lines 326-329 replaced with sorting logic

## Sorting Priority
The Related Entities are now sorted with the following criteria (in order):

1. **Entities with scenarios** (scenarioCount > 0) appear first
2. **Higher scenario count** takes priority among analyzed entities
3. **Analysis status** priority:
   - `up_to_date` (green) - highest priority
   - `out_of_date` (yellow) - medium priority
   - `not_analyzed` (gray) - lowest priority
4. **Alphabetical** by entity name as final tiebreaker

## Impact
This makes it much easier to find components and functions that have been analyzed and have visual simulation data available when viewing an entity's Related Entities section in the CodeYam dashboard.

## Implementation Details
Added a `sortBySimulations` comparator function that sorts both `importedEntities` and `importingEntities` arrays before returning them.

## Note on Updates
This patch modifies the installed CodeYam CLI package. If you update CodeYam (`npm update @codeyam/codeyam-cli`), this patch will be lost and will need to be reapplied.

## Date Applied
2026-02-04

## Branch
`feature/codeyam-sort-related-entities`
