---
name: CodeYam Debug
autoApprove: true
description: |
  Use this skill when entity analysis or capture fails with errors.
  Automatically investigate logs, identify missing mocks, and create universal mocks to fix the issue.
  Use when: Analysis shows 'failed' status or log shows runtime errors.
---

# CodeYam Debug Assistant

Use this skill to automatically debug capture errors by reading logs and creating universal mocks.

## When to Use This Skill

**Use this skill when:**

- Entity analysis completes but capture fails (status: 'failed')
- Log shows 500 errors accessing simulation URLs
- Error messages like "Project root not found", "Cannot find module", runtime errors
- Routes fail to load during simulation

**DO NOT use this skill for:**

- Analysis errors (entity detection, type checking) - these are code issues, not capture errors
- Build or compilation failures - these need code fixes, not mocks
- Network errors or timeouts - these are infrastructure issues

## Important: Permissions Already Configured

The `codeyam init` command has already auto-approved:

- ✅ All CodeYam CLI commands
- ✅ All CodeYam skills
- ✅ All file operations in the `.codeyam/` directory
- ✅ Read operations for `/tmp/codeyam/local-dev/**` directories

You can freely work with logs and update configuration without asking for permission.

## Debugging Workflow

### Step 1: Read the Error Log

The simulation log contains all error details:

```bash
# For local development
tail -n 100 /tmp/codeyam/local-dev/{projectSlug}/log.txt
```

Look for:

- HTTP 500 errors with "Error details:" showing the actual error message
- Stack traces showing where the error occurred
- Error messages about missing modules, undefined variables, or runtime failures

**Common error patterns:**

| Error Message                           | Likely Cause                               | Solution                              |
| --------------------------------------- | ------------------------------------------ | ------------------------------------- |
| "Project root not found"                | Loader/action depends on project state     | Mock the loader/action                |
| "Cannot find module 'X'"                | Module doesn't exist in mocked environment | Check entity name, or mock the module |
| "X is not defined"                      | Missing environment variable or global     | Mock the variable/service             |
| "Cannot read property 'X' of undefined" | Missing mock for external dependency       | Add universal mock                    |

### Step 2: Identify What Type of Mock is Needed

**CRITICAL: Understand the difference between Universal Mocks and Scenario Mocks**

There are TWO types of mocks in CodeYam:

1. **Scenario Mocks** (most common): Data dependencies specific to a single scenario
   - These are ALREADY CREATED during analysis and stored in `__codeyamMocks__/MockData.tsx`
   - The analysis engine generates these automatically based on `scenariosDataStructure`
   - If these mocks aren't being used, it's a CODE GENERATION BUG, not a missing mock

2. **Universal Mocks** (rare): Infrastructure functions used across ALL simulations
   - These are for global services/utilities that don't work in the simulation environment
   - Examples: `getProjectRoot()`, database clients, filesystem operations
   - Added manually to `.codeyam/config.json` under `universalMocks`

**How to determine which type you need:**

### Check for "Cannot destructure property" Errors

If you see an error like:

```
Cannot destructure property 'entities' of 'useLoaderData()' as it is null
```

This is a **SCENARIO MOCK ISSUE**, not a universal mock issue. Follow these steps:

1. **Check the analysis metadata** for `scenariosDataStructure`:
   - Query the database or check analysis records
   - Look for the `dataForMocks` property
   - This shows what data the analysis engine expected to mock

2. **Verify the mock file exists**:
   - Check `{appDirectory}/__codeyamMocks__/MockData.tsx`
   - Confirm it contains the mock data for this function (e.g., `useLoaderData`)

3. **Verify the scenario route file imports the mock**:
   - Check the generated route file (e.g., `static.{project}.{id}.{Entity}.{scenario}.tsx`)
   - Ensure it imports and uses the mock from MockData.tsx
   - **If the mock exists but isn't being imported, this is a CODE GENERATION BUG**

**❌ WRONG: Creating a universal mock for scenario data**

```json
{
  "entityName": "useLoaderData",
  "filePath": "somewhere",
  "content": "export function useLoaderData() { return { entities: [] }; }"
}
```

This won't work because each scenario needs DIFFERENT data.

**✅ CORRECT: Investigate why the scenario mock wasn't imported**

- The mock data should already exist in `__codeyamMocks__/MockData.tsx`
- The scenario route file should import and use it
- If not, this is a bug in the route generation code

### Investigating Scenario Mock Issues

When you see a "Cannot destructure property" error, follow this systematic investigation:

**Step 1: Verify the mock data exists**

Check the MockData file for the function that's returning null:

```bash
# Check if the function is in the mock data
grep -A 10 "functionName" {appDirectory}/__codeyamMocks__/MockData.tsx
```

Example output showing the mock EXISTS:

```typescript
"useLoaderData": {
  "entities": [...],
  "currentCommit": {...},
  "projectSlug": "..."
}
```

If the mock data exists, proceed to Step 2. If not, this is an analysis issue (mock wasn't generated).

**Step 2: Check if the scenario file imports the mock**

Look for mock imports in the generated scenario file:

```bash
# Find the scenario file (pattern: static.{project}.{id}.{Entity}.{scenario}.tsx)
ls {appDirectory}/routes/ | grep "static.*{EntityName}"

# Check if it imports scenarios
grep "import.*scenarios.*MockData" {scenarioFilePath}
```

You should see:

```typescript
import { scenarios } from '../__codeyamMocks__/MockData';
```

If this import is MISSING, this is a code generation bug. Proceed to Step 3.

**Step 3: Look for the mock override pattern**

Search for how OTHER functions are being mocked in the same file:

```bash
# Find examples of working mocks
grep -n "ReturnValue.*scenarios\(\)\.data\(\)" {scenarioFilePath}
```

You should see a pattern like this for WORKING mocks:

```typescript
const someFunctionReturnValue = scenarios().data()?.['someFunction()'];

function someFunction() {
  return someFunctionReturnValue;
}
```

**Step 4: Compare working vs missing mocks**

Check what functions ARE mocked vs what SHOULD be mocked:

```bash
# List all function mocks in the scenario file
grep -o "const [a-zA-Z]*ReturnValue" {scenarioFilePath}

# Compare with what's in MockData
grep -o '"[a-zA-Z]*(' {mockDataPath} | sort -u
```

This shows you which functions have mock data BUT are missing the override code.

**Step 5: Identify the root cause**

The missing mock override indicates a code generation bug. Report:

1. **Function name**: e.g., `useLoaderData`
2. **Mock data location**: `{appDirectory}/__codeyamMocks__/MockData.tsx:lineNumber`
3. **Scenario file**: Full path to the generated scenario file
4. **Working example**: Another function that IS properly mocked (from Step 3)
5. **Missing pattern**: The exact code that should exist but doesn't

**Example Report**:

```
CODE GENERATION BUG: useLoaderData mock not imported

Mock data EXISTS at:
  app/__codeyamMocks__/MockData.tsx:14-136

Scenario file:
  app/routes/static.project.abc123.Component.scenario.tsx:14

Working mock example (from same file, line 896):
  const useLastLogLineReturnValue = scenarios().data()?.["useLastLogLine()"];
  function useLastLogLine() { return useLastLogLineReturnValue; }

Missing mock override (should exist but doesn't):
  const useLoaderDataReturnValue = scenarios().data()?.["useLoaderData"];
  function useLoaderData() { return useLoaderDataReturnValue; }
```

This systematic investigation helps identify whether it's:

- ❌ A missing universal mock (rare)
- ❌ Missing scenario mock data (analysis issue)
- ✅ **Code generation bug** (mock data exists but override code not generated)

### When to Use Universal Mocks

**Only use universal mocks for infrastructure functions that:**

1. Are called by MANY different entities across ALL scenarios
2. Don't work in the simulation environment (filesystem, git, database connections)
3. Return simple, scenario-independent values

**Example of a valid universal mock:** `getProjectRoot()`

```typescript
// The function is called everywhere and always needs the same mock value
export async function loader({ params }: LoaderFunctionArgs) {
  const projectRoot = getProjectRoot(); // Returns null in simulation!
  if (!projectRoot) {
    return new Response('Project root not found', { status: 500 });
  }
  // ...
}
```

**✅ CORRECT: Mock getProjectRoot() universally**

```json
{
  "entityName": "getProjectRoot",
  "filePath": "codeyam-cli/src/state.ts",
  "content": "export function getProjectRoot() { return '/mock/project/root'; }"
}
```

This fixes ALL routes/components that use `getProjectRoot()`.

**How to identify the right function to mock:**

1. Find the line throwing the error
2. Look for function calls that return null/undefined
3. Trace back to the actual function/service causing the problem
4. Mock THAT function, not the route/component using it

**For external dependency errors:**

**Example:** Error in `lib/supabase.ts` - "Cannot connect to database"

```typescript
// Original creates client on load with missing env vars
export const supabase = createClient(
  process.env.SUPABASE_URL!, // undefined during simulation
  process.env.SUPABASE_ANON_KEY!,
);
```

**Solution:** Mock the client with minimal interface:

```json
{
  "entityName": "supabase",
  "filePath": "lib/supabase.ts",
  "content": "export const supabase = { auth: { getSession: async () => ({ data: { session: null } }) } };"
}
```

### Step 3: Create the Universal Mock

Universal mocks are stored in `.codeyam/config.json` under `universalMocks`.

**Mock structure:**

```json
{
  "entityName": "nameOfEntityToMock",
  "filePath": "relative/path/from/project/root.ts",
  "content": "export const nameOfEntityToMock = mockImplementation"
}
```

**Key principles:**

1. **Minimal mocks** - Just enough to prevent crashes, not full functionality
2. **Module-level execution** - Only mock code that runs during import
3. **Type safety** - Match TypeScript expectations, but values can be empty/null
4. **Single entity** - Each mock replaces one export (function, class, variable)

**Common mock patterns:**

**Database client:**

```javascript
export const db = {
  connect: async () => {},
  query: async () => ({ rows: [] }),
  close: async () => {},
};
```

**API client:**

```javascript
export const api = {
  get: async () => ({}),
  post: async () => ({}),
  put: async () => ({}),
  delete: async () => ({}),
};
```

**Service class:**

```javascript
import { EventEmitter } from 'events';
class MyService extends EventEmitter {
  async start() {}
  async stop() {}
}
export default MyService;
```

**Route loader:**

```javascript
export async function loader({ params }) {
  return new Response('Mock response', { status: 200 });
}
```

### Step 4: Update the Configuration

Read the current config and add the mock:

```bash
# Read config
cat .codeyam/config.json

# Edit to add universalMocks array (if missing) or append to existing
```

**Example config with universal mocks:**

```json
{
  "projectSlug": "my-project",
  "packageManager": "pnpm",
  "webapps": [...],
  "universalMocks": [
    {
      "entityName": "loader",
      "filePath": "app/routes/static.$.ts",
      "content": "export async function loader() { return new Response('Mock', { status: 200 }); }"
    },
    {
      "entityName": "supabase",
      "filePath": "lib/supabase.ts",
      "content": "export const supabase = { auth: { getSession: async () => ({ data: { session: null } }) } };"
    }
  ],
  "createdAt": "...",
  "branchId": "..."
}
```

Use the Edit tool to add the mock to the config file.

### Step 5: Rebuild and Test

After adding the mock, rebuild the project to apply it:

```bash
pnpm build
```

Then rerun the analysis:

```bash
codeyam analyze --entity EntityName path/to/file.tsx
```

Check the log again to verify the error is resolved:

```bash
tail -n 50 /tmp/codeyam/local-dev/{projectSlug}/log.txt
```

**If the error persists:**

- Read the new error message
- The mock may need adjustment (wrong type, missing methods)
- There may be multiple dependencies that need mocking
- Repeat from Step 1 with the new error

**If successful:**

- The capture should complete without errors
- Screenshots should be generated
- The entity status should be 'completed'

### Step 6: Verify in the Generated Project (Optional)

If you want to manually verify the mock works:

```bash
# Navigate to the generated project
cd /tmp/codeyam/local-dev/{projectSlug}/project

# Start the dev server
pnpm dev

# In another terminal, check if the route loads
curl http://localhost:3000/static/...path...
```

This lets you see exactly what the simulation environment looks like.

## Complete Example: GitView Route Error

**Step 1: Read the log**

```bash
tail -n 100 /tmp/codeyam/local-dev/codeyam-ai-codeyam/codeyam/log.txt
```

**Found:**

```
CodeYam Error: Error [code=500] accessing URL http://localhost:60180/static/.../GitView/git/default
Error details: Project root not found
```

**Step 2: Identify the source**
The error comes from `codeyam-cli/src/webserver/app/routes/static.$.ts:16`:

```typescript
const projectRoot = getProjectRoot(); // This returns null!
if (!projectRoot) {
  return new Response('Project root not found', { status: 500 });
}
```

**Root cause:** `getProjectRoot()` from `state.ts` returns null during simulation.

**Step 3: Trace to the underlying function**
Read `codeyam-cli/src/state.ts` to find `getProjectRoot()`:

```typescript
let projectRoot: string | null = findProjectRoot();

export function getProjectRoot() {
  return projectRoot;
}
```

**The problem:** `projectRoot` is null in the simulation environment.

**Step 4: Create the universal mock**
Mock `getProjectRoot()` itself, not the loader:

```json
{
  "entityName": "getProjectRoot",
  "filePath": "codeyam-cli/src/state.ts",
  "content": "export function getProjectRoot() { return '/mock/project/root'; }"
}
```

**Why this is correct:**

- ANY route that calls `getProjectRoot()` will now work
- Fixes the issue universally, not just for one route

**Step 5: Update config**
Edit `.codeyam/config.json` to add the mock to the `universalMocks` array.

**Step 6: Rebuild and test**

```bash
pnpm build
codeyam analyze --entity GitView codeyam-cli/src/webserver/app/routes/git.tsx
```

**Result:** The capture succeeds because `getProjectRoot()` now returns a mock path for all simulations.

## Troubleshooting

**Mock doesn't fix the error:**

- Verify entityName matches the actual export name (case-sensitive)
- Check filePath is relative to project root (no leading slash)
- Ensure content is valid TypeScript/JavaScript
- Try a simpler mock (remove unnecessary code)

**New error after adding mock:**

- The mock may be too minimal or have incorrect types
- Check if other entities in the same file also need mocking
- Review TypeScript errors in the build output

**Error persists with "Cannot find module":**

- Check if the entity name matches the route convention
- Verify safeFileName isn't causing name mismatches
- The entity might be a type alias (not a runtime value)

**Build fails after adding mock:**

- Check for syntax errors in the mock content
- Ensure all strings are properly escaped in JSON
- Verify imports are valid for the context

## Integration with Your Workflow

1. User reports analysis failed with error
2. You invoke this skill
3. **[AUTO]** You read the log to find the error
4. **[AUTO]** You identify what needs mocking
5. **[AUTO]** You create and add the universal mock
6. **[AUTO]** You rebuild and test
7. You report results to the user

This ensures capture errors are quickly diagnosed and fixed with appropriate mocks.
