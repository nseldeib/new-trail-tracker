# Debug Scenario or Analysis

When a user asks to debug a scenario or analysis (e.g., `/debug-codeyam [ID]`), use this systematic process.

## Goal

Determine whether a capture failure can be fixed locally (via database changes) or requires a CodeYam engine fix. Either way, produce a detailed debug report.

## Definition of Done

**Debugging is NOT complete until one of these conditions is met:**

1. **SUCCESS (Database Fix)**: Issue fixed via database/config changes, screenshots recaptured, ALL screenshot files verified on disk AND visually inspected
2. **SUCCESS (File Fix)**: Issue fixed via tmp folder edits, screenshots recaptured with `--capture-only`, ALL screenshot files verified AND visually inspected, changes documented for CodeYam team
3. **UNFIXABLE**: Issue cannot be fixed locally (rare), documented in final report with full details

---

## Debug Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 0: Query database for scenario status (DO THIS FIRST!)        │
│          Check ALL scenarios in the analysis for failures           │
│          Retrieve the analysis id to use in the debug command       │
│                    │                                                │
│                    ▼                                                │
│  Step 1: codeyam debug [ANALYSIS ID]  (generates files to inspect)  │
│  Step 2: Identify error type from logs/output                       │
│  Step 3: Diagnose root cause category (1-4)                         │
│  Step 4: Attempt fix (database edit or universal mock)              │
│  Step 5: Verify locally (curl returns 200)                          │
│                   │                                                 │
│         ┌─────────┴─────────┐                                       │
│         ▼                   ▼                                       │
│   Fix worked           Fix didn't work                              │
│   (DB changes)              │                                       │
│         │                   ▼                                       │
│         │         Step 5a: Fix code in tmp folder                   │
│         │         (edit files directly, track changes)              │
│         │                   │                                       │
│         │                   ▼                                       │
│         │         Verify without regenerating                       │
│         │                   │                                       │
│         ▼                   ▼                                       │
│   Step 6: Recapture    Step 6: Recapture --capture-only             │
│   (normal)             (preserves file fixes)                       │
│         │                   │                                       │
│         └─────────┬─────────┘                                       │
│                   ▼                                                 │
│   Step 7: Verify screenshots (check for client-side errors)         │
│                   │                                                 │
│                   ▼                                                 │
│   Verify ALL files exist on disk                                    │
│                   │                                                 │
│                   ▼                                                 │
│   ✅ DONE - Produce Final Debug Report                              │
│   (document ALL changes for CodeYam team)                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What You Can and Cannot Modify

**NEVER modify the client's original source code in the workspace.** Only modify files in the tmp folder.

**You CAN modify:**

- Data in the local SQLite database (`.codeyam/db.sqlite3`)
- Universal mocks in `.codeyam/universal-mocks`
- **Files in `/tmp/codeyam/local-dev/{slug}/project/`** - These are temporary copies used for simulation
  - Generated mock files in `__codeyamMocks__/` directories
  - Layout/route files that wrap scenarios
  - Any generated code that has errors
- Mock data files for testing

**IMPORTANT**: When you edit files in the tmp folder, you MUST use `codeyam recapture --capture-only` when recapturing, otherwise your changes will be overwritten! Be sure to address all issues so that the simulation runs correctly. Then, if one of the issues required editing code in the tmp directory you MUST use `codeyam recapture --capture-only`, but if only data was changed then as long as that data is updated in the local database as well you can run `codeyam recapture` and have the system overwrite the tmp project code and use the valid data from the database.

---

## Step 0: Check for Other Failing Scenarios (MANDATORY FIRST STEP)

**DO NOT run `codeyam debug` yet!** First, query the database to check if other scenarios in the same analysis are also failing.

```bash
# First, get the analysis ID (if you have a scenario ID)
sqlite3 .codeyam/db.sqlite3 "SELECT analysis_id FROM scenarios WHERE id = 'SCENARIO_ID'"

# Then check ALL scenarios for that analysis
sqlite3 .codeyam/db.sqlite3 "
SELECT
  s.id,
  s.name,
  json_extract(s.metadata, '$.screenshotPaths') as screenshots
FROM scenarios s
WHERE s.analysis_id = 'ANALYSIS_ID'
"

# Check for errors in scenario status
sqlite3 .codeyam/db.sqlite3 "
SELECT json_extract(status, '$.scenarios') FROM analyses WHERE id = 'ANALYSIS_ID'
"
```

**If multiple scenarios are failing, ASK THE USER** whether to fix just the requested scenario or all failing scenarios.

### Check for Client-Side Errors in Screenshots

**IMPORTANT:** Even if the database shows no errors and screenshots exist, the scenario may still have a client-side error. Use the Read tool to view the screenshot file and check for:

- Red error boundaries or error messages in the rendered UI
- "Something went wrong" or similar error text
- Blank/white screens that should have content
- React error overlays

```bash
# View the screenshot to check for client-side errors
# Use the Read tool on the screenshot path from the database
```

If the screenshot shows a client-side error, proceed to Step 1 to debug it.

---

## Step 1: Run Debug Command

```bash
codeyam debug ANALYSIS_ID
```

Output includes:

- **Project path**: `/tmp/codeyam/local-dev/{slug}/project`
- **Start command**: How to run the dev server
- **URL**: Where to access the scenario
- **Log path**: Where to watch for errors

---

## Step 2: Identify the Error Type

Read the log file or error output to categorize the issue:

| Error Type                         | Symptoms                            | Likely Category                          |
| ---------------------------------- | ----------------------------------- | ---------------------------------------- |
| **Syntax error in generated file** | `Unexpected token`, `Parse error`   | Category 4 (mock code writing)           |
| **Runtime error**                  | `TypeError`, `ReferenceError`       | Category 1-3 (data issue) or 4           |
| **Missing mock**                   | `Cannot read property of undefined` | Category 1-2 (missing in data structure) |
| **Wrong mock type**                | `X is not a function`               | Category 3-4 (wrong data or mock code)   |

---

## Step 3: Diagnose Root Cause Category

This is the most important step. Determine WHERE in the pipeline the bug originated.

### The 4 Error Categories

| Category | What's Wrong                                         | Where to Check            | Fixable Locally?       |
| -------- | ---------------------------------------------------- | ------------------------- | ---------------------- |
| **1**    | Missing attribute in `isolatedDataStructure`         | `entities.metadata`       | Sometimes (re-analyze) |
| **2**    | Attribute not merged into `mergedDataStructure`      | `analyses.metadata`       | Sometimes (re-analyze) |
| **3**    | Data structure complete, but scenario data wrong     | `scenarios.metadata`      | Yes (edit mockData)    |
| **4**    | Data complete, but mock code/mock data written wrong | Generated files in `/tmp` | **No (engine bug)**    |

### Diagnostic Queries

```bash
# Category 1: Check isolatedDataStructure
# Is the attribute traced at all in the entity?
sqlite3 .codeyam/db.sqlite3 \
  "SELECT json_extract(metadata, '$.isolatedDataStructure') FROM entities WHERE sha = 'ENTITY_SHA'" \
  | python3 -m json.tool

# Category 2: Check mergedDataStructure
# Was the attribute properly merged from dependencies?
sqlite3 .codeyam/db.sqlite3 \
  "SELECT json_extract(metadata, '$.mergedDataStructure') FROM analyses WHERE id = 'ANALYSIS_ID'" \
  | python3 -m json.tool

# Category 2 (also check): scenariosDataStructure
sqlite3 .codeyam/db.sqlite3 \
  "SELECT json_extract(metadata, '$.scenariosDataStructure') FROM analyses WHERE id = 'ANALYSIS_ID'" \
  | python3 -m json.tool

# Category 3: Check scenario mockData
# Did the LLM generate correct mock data?
sqlite3 .codeyam/db.sqlite3 \
  "SELECT json_extract(metadata, '$.data.mockData') FROM scenarios WHERE id = 'SCENARIO_ID'" \
  | python3 -m json.tool
```

### Diagnosis Flow

1. **Start with the error** - What attribute/value is missing or wrong at runtime?
2. **Check `isolatedDataStructure`** - Is the attribute traced in the entity? If missing → Category 1
3. **Check `mergedDataStructure`** - Is the attribute present after merging? If missing → Category 2
4. **Check `scenariosDataStructure`** - Is the data structure for mocks correct? If wrong → Category 2
5. **Check scenario `mockData`** - Does the scenario have correct mock values? If wrong → Category 3
6. **Check generated mock code** - Is the mock code syntactically/semantically correct? If wrong → **Category 4 (engine bug)**
7. **Check generated imports** - Are the imports correct? Are entities containing environment variables mocked out? If wrong → **Category 4 (engine bug)**

### Category 4 Indicators (Engine Bug)

The issue is Category 4 if:

- All data structures in the database look correct
- The scenario's mockData has the right keys and values
- BUT the generated mock code has syntax errors, wrong structure, or doesn't match the data
- Database edits don't fix the generated code (it regenerates wrong)

---

## Step 4: Attempt Fix

### For Categories 1-2 (Data Structure Issues)

These usually require re-running analysis. You can try:

```bash
# Delete the analysis and re-analyze
codeyam analyze --entity EntityName path/to/file.tsx
```

### For Category 3 (Scenario Data Issues)

Fix the mockData directly in the database:

```bash
# Export metadata
sqlite3 .codeyam/db.sqlite3 "SELECT metadata FROM scenarios WHERE id = 'SCENARIO_ID'" > /tmp/metadata.json

# Edit with Python
python3 << 'EOF'
import json
with open('/tmp/metadata.json') as f:
    data = json.loads(f.read())

# Fix the mockData
data['data']['mockData']['keyName'] = {"fixed": "value"}

with open('/tmp/metadata_fixed.json', 'w') as f:
    f.write(json.dumps(data))
EOF

# Update database (use Python to avoid escaping issues)
python3 << 'EOF'
import sqlite3
import json

with open('/tmp/metadata_fixed.json') as f:
    metadata = f.read()

conn = sqlite3.connect('.codeyam/db.sqlite3')
conn.execute("UPDATE scenarios SET metadata = ? WHERE id = 'SCENARIO_ID'", (metadata,))
conn.commit()
conn.close()
EOF
```

### For Category 4 (Code Generation Issues)

**CAN be fixed locally by editing files in the tmp folder!** See Step 5a below.

After fixing, use `codeyam recapture --capture-only` to capture without regenerating the (now-fixed) files.

### Universal Mocks (for infrastructure dependencies)

You can use universal mocks to mock out functions that are not detected by the analysis (are not part of the dependency tree). This often includes things like middleware or functions that run on startup and require environment variables.

## Quick Reference: Mock Path Decision Tree

```
Where is the error coming from?
│
├── node_modules package (e.g., @prisma/client, @supabase/supabase-js)
│   └── Mock path: .codeyam/universal-mocks/node_modules/{package}.ts
│       Example: .codeyam/universal-mocks/node_modules/@prisma/client.ts
│
└── Project file (e.g., lib/db.ts, packages/prisma/index.ts)
    └── Mock path: .codeyam/universal-mocks/{same-path-as-original}
        Example: .codeyam/universal-mocks/lib/db.ts
        Example: .codeyam/universal-mocks/packages/prisma/index.ts
```

## Quick Reference: Mock Writing Rules

**BEFORE writing any mock:**

1. Read the original file first
2. Note all its export names exactly

**WHEN writing the mock:**

1. Export names MUST match exactly (case-sensitive)
2. ALL code MUST be inside exports (no helper variables outside)
3. Keep it minimal - empty methods are fine

**AFTER writing the mock:**

```bash
codeyam validate-mock .codeyam/universal-mocks/{path-to-your-mock}
```

---

## Step 5: Verify Database Fixes Locally

After making **database changes** (Categories 1-3):

1. **Re-run `codeyam debug ID`** to regenerate scenario files with updated data
2. **Start the dev server** and curl the URL to check for errors:
   ```bash
   curl -s http://localhost:3112/static/... | head -50
   ```
3. **Check for 200 response** (no `statusCode:500`)

**If verification fails and you've already tried database fixes:** Proceed to Step 5a to fix code directly.

---

## Step 5a: Fix Code Issues in Tmp Folder (Category 4)

If the error is in bad imports, generated code or mock files, you can fix them directly in the tmp folder:

### Locate the Problematic File

Files are in `/tmp/codeyam/local-dev/{slug}/project/`. Common locations:

- **Generated mocks**: `__codeyamMocks__/MockData_*.tsx` or `__codeyamMocks__/MockCode_*.tsx`
- **Scenario layouts**: `app/static/{projectSlug}/{analysisId}/{entitySlug}/{scenarioSlug}/`
- **Route files**: `app/routes/` or `pages/` depending on framework

### Make the Fix

Edit the problematic file directly using the Edit tool. Common fixes include:

- **Syntax errors**: Fix missing brackets, commas, or quotes in generated code
- **Wrong import paths**: Correct import statements
- **Missing exports**: Add missing named or default exports
- **Type errors**: Fix TypeScript type issues
- **Wrong mock structure**: Adjust the shape of generated mock data

### Track Your Changes (MANDATORY)

For every file you edit, record:

- The full file path
- What you changed (brief description)
- The before/after code (for the final report)

### Verify Without Regenerating

After editing files, **do NOT run `codeyam debug` again** (it would overwrite your changes).

Instead, manually start the dev server:

```bash
cd /tmp/codeyam/local-dev/{slug}/project
npm run dev  # or pnpm dev / yarn dev
```

Then curl the scenario URL to verify the fix works:

```bash
curl -s http://localhost:3112/static/codeyam-sample | head -50
```

---

## Change Tracking (MANDATORY)

**You MUST track all changes for the final report.** This is essential for the CodeYam team to fix engine bugs.

### Database Changes

For each database modification, record:

| Table       | Record ID | Field Path                   | Before    | After       |
| ----------- | --------- | ---------------------------- | --------- | ----------- |
| `scenarios` | `abc123`  | `metadata.data.mockData.key` | `"wrong"` | `"correct"` |

### File Changes

For each file modification in the tmp folder, record:

| File Path                                            | Change Description                    |
| ---------------------------------------------------- | ------------------------------------- |
| `/tmp/.../project/__codeyamMocks__/MockData_xyz.tsx` | Fixed missing comma in object literal |

Include the actual diff:

```diff
--- before
+++ after
@@ -10,3 +10,3 @@
-  key: "value"
+  key: "value",
   anotherKey: "value2"
```

---

## Step 6: Recapture Screenshots

**Only proceed here if Step 5 or 5a verification passed.**

### Choose the Right Recapture Mode

**If you only made DATABASE changes (Categories 1-3):**

```bash
codeyam recapture SCENARIO_ID
```

This will regenerate the tmp folder files using the updated database data, then capture screenshots.

**If you made FILE changes in the tmp folder (Category 4):**

```bash
codeyam recapture SCENARIO_ID --capture-only
```

**CRITICAL**: The `--capture-only` flag preserves your manual file fixes. Without this flag, your changes would be overwritten!

### Verify Files After Capture

```bash
# Check database for screenshot paths
sqlite3 .codeyam/db.sqlite3 "SELECT name, json_extract(metadata, '$.screenshotPaths') FROM scenarios WHERE analysis_id = 'ANALYSIS_ID'"

# Verify files actually exist
find .codeyam/captures -name "*.png" -path "*ANALYSIS_ID*" -mmin -5
```

---

## Step 7: Verify Screenshots for Client-Side Errors

**IMPORTANT**: Even if capture completes successfully, the screenshots may show client-side errors!

### View the Screenshots

Use the Read tool to view each captured screenshot file:

```bash
# Get the screenshot path from the database
sqlite3 .codeyam/db.sqlite3 "SELECT json_extract(metadata, '$.screenshotPaths[0]') FROM scenarios WHERE id = 'SCENARIO_ID'"
```

Then read the screenshot file to visually inspect it.

### Check for These Issues

- **Red error boundaries** or React error overlays
- **"Something went wrong"** or similar error text
- **Blank/white screens** that should have content
- **Missing components** or broken layouts
- **Console errors** shown in error overlays

If the screenshot shows a dedicated 500 page with no clear error then you may want to find and comment out any error boundary logic that is catching errors and preventing you from easily reading them.

### If Screenshot Shows Errors

1. The fix didn't fully work - go back to Step 5 or 5a
2. Check the log file for additional error details:
   ```bash
   tail -100 /tmp/codeyam/local-dev/{slug}/codeyam/log.txt
   ```
3. Fix the remaining issues
4. Run recapture again (with `--capture-only` if you edited files)

---

## Final Debug Report (MANDATORY)

**Always produce this report**, whether the issue was fixed or identified as an engine bug.

---

## Debug Session Report

### Issue Summary

**Error:** `[Exact error message, e.g., "Transform failed: Unexpected token at line 66"]`

**Entity:** `[Entity name]` in `[file/path.tsx]`

**Root Cause Category:** [1, 2, 3, or 4]

**Outcome:** [Fixed via database changes / Fixed via file edits (engine bug) / Unfixable]

### Affected Scenarios

| Scenario ID | Name     | Analysis ID     | Status               |
| ----------- | -------- | --------------- | -------------------- |
| `[id]`      | `[name]` | `[analysis-id]` | [Fixed / Engine bug] |

### Root Cause Category Determination

**Category identified:** [1 / 2 / 3 / 4]

**Evidence:**

- [ ] **Category 1** (isolatedDataStructure): [What was missing/wrong in entity metadata?]
- [ ] **Category 2** (mergedDataStructure): [What was missing/wrong after merge?]
- [ ] **Category 3** (scenario mockData): [What was wrong in the LLM-generated data?]
- [ ] **Category 4** (mock code writing): [What was wrong in the generated code?]

**How determined:**
[Explain what you checked and what you found. Include relevant JSON snippets.]

### Database Changes Made (if any)

| Table     | Record ID | Field Path | Before        | After         |
| --------- | --------- | ---------- | ------------- | ------------- |
| `[table]` | `[id]`    | `[path]`   | `[old value]` | `[new value]` |

**SQL/Python commands used:**

```sql
[Include the exact commands]
```

### File Changes Made (if any)

If you edited files in the tmp folder to fix Category 4 issues:

| File Path                                                | Change Description         |
| -------------------------------------------------------- | -------------------------- |
| `/tmp/codeyam/local-dev/{slug}/project/path/to/file.tsx` | [Brief description of fix] |

**Diffs:**

```diff
--- before
+++ after
@@ -line,count +line,count @@
-[old code]
+[new code]
```

**Recapture command used:**

```bash
codeyam recapture SCENARIO_ID --capture-only
```

### For Category 4 (Code Generation Bug) - Required Details

If this is an engine bug, include:

**What the data looks like (correct):**

```json
[Show the relevant data structure from the database that looks correct]
```

**What the generated code looks like (wrong):**

```javascript
[Show the problematic generated mock code]
```

**What the generated code should look like:**

```javascript
[Show what correct code would look like]
```

**Pattern/Edge case:**
[Describe the pattern that causes this bug, e.g., "Function call signatures like '()' in array item schemas get converted to empty computed property keys"]

### Verification

- [ ] Scenario loads without errors (curl returns 200)
- [ ] Screenshots recaptured successfully
- [ ] Used `--capture-only` flag (if file changes were made)
- [ ] Screenshot files verified to exist on disk
- [ ] Screenshots visually inspected - no client-side errors visible
- [ ] All changes documented above for CodeYam team

---

## Saving and Uploading the Report (MANDATORY)

After completing the debug session, **you MUST save the report**:

1. **Write the report to file:**

   ```bash
   # Write the full "Debug Session Report" section above to this file
   # Use the Write tool to save to:
   .codeyam/debug-report.md
   ```

2. **Ask user if they want to upload:**
   After saving, ask the user: "Would you like me to upload this debug report to CodeYam for the team to review?"

- If the user response affirmatively then run `codeyam report --upload` to upload the report.

The report will be:

- Included in the delta tarball at the root level for easy access
- Stored in the database metadata for searchability
- Available to CodeYam engineers when they download the report

---

### Helper Queries

```bash
# Get scenario details
sqlite3 .codeyam/db.sqlite3 "SELECT id, analysis_id, name FROM scenarios WHERE id = 'ID'"

# Get entity for analysis
sqlite3 .codeyam/db.sqlite3 "SELECT e.name, e.file_path FROM entities e JOIN analyses a ON e.sha = a.entity_sha WHERE a.id = 'ANALYSIS_ID'"

# List all scenarios for an analysis
sqlite3 .codeyam/db.sqlite3 "SELECT id, name FROM scenarios WHERE analysis_id = 'ANALYSIS_ID'"

# Check for dependent analyses
sqlite3 .codeyam/db.sqlite3 "SELECT json_extract(metadata, '$.dependentAnalyses') FROM analyses WHERE id = 'ANALYSIS_ID'" | python3 -m json.tool
```
