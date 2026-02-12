---
name: codeyam:power-rules
autoApprove: true
description: |
  Generate and maintain Claude Rules for your codebase based on thorough analysis.
  Use when: User wants to set up power rules, document confusing areas, or ensure
  Claude has proper context for working in the codebase.
---

# CodeYam Power Rules Assistant

This skill helps you generate and maintain Claude Rules (`.claude/rules/`) that provide context-specific guidance. The goal is robust coverage of anything confusing while avoiding documentation of things Claude can intuit.

## When to Use This Skill

- Initial setup: User asks to "set up power rules" or "generate claude rules"
- Maintenance: After completing complex work where lessons should be preserved
- Review: Periodically to ensure rules are accurate and up-to-date

---

## Phase 1: Setup (First Run Only)

Check if this is the first time running power rules.

### 1A. Add Documentation Section to CLAUDE.md

If CLAUDE.md doesn't contain a "Power Rules" or "Automated Architectural Documentation" section, add:

```markdown
## Automated Architectural Documentation (Claude Rules via CodeYam)

This project uses significant documentation stored as Claude Rules (`.claude/rules`).
It is your responsibility to add to, update, and improve this documentation.
We focus on three categories of documentation:

1. Architecture

- Any time there is a specific relationship between files please capture the architecture
- Note how the files relate, how data flows, and how changes should be approached

2. Testing

- For complex areas of the app where both manual and automated testing is complex track:
  - Helpful commands used in debugging and testing
  - Where test files are located if it is not obvious (and the command to run them if not obvious)

3. FAQ

- If you are ever confused about something that does not fit into the above categories document it here.
- Anything you have to figure out or ask the user about should be captured here.

During each development session modify and add appropriate rules to track anything that is at all confusing.
Ask clarifying questions to ensure you are not documenting anything inaccurate.
After each development session review and improve all appropriate rules to ensure they are accurate, concise, and up-to-date.
Always focus on positive instructions explaining how it works, what to run, where to find things, etc in concise terms. Do not add warnings unless necessary. Do not state anything obvious.
All rules must be as concise as possible. Look for opportunities to improve how concise it is worded. We want to minimize the impact on the context window.
When adding a new rules document see `.codeyam/rules/instructions.md` for instructions on where to create the rule and the format to use.
```

### 1B. Create Instructions File

Create `.codeyam/rules/instructions.md` with the content from the Instructions File section at the end of this document.

### 1C. Install Pre-commit Hook

Check if the project uses Husky (`.husky/` directory exists).

**If using Husky**, append to `.husky/pre-commit`:

```bash
# CodeYam Power Rules Check
if [ -f ".codeyam/bin/power-rules-hook.sh" ]; then
  .codeyam/bin/power-rules-hook.sh
fi
```

**If not using Husky**, create or append to `.git/hooks/pre-commit`.

Ensure `.codeyam/bin/power-rules-hook.sh` exists and is executable (`chmod +x`).

---

## Phase 2: Deep Codebase Analysis

Perform thorough analysis to identify areas that may be confusing. The goal is to find everything that might trip up someone (or Claude) working in this codebase.

### 2A. Analyze Git Commit Messages for Problem Signals

Look for commits indicating gotchas, workarounds, or complexity:

```bash
# Find commits with problem-indicating keywords
git log --oneline --since="6 months ago" --grep="fix" --grep="bug" --grep="workaround" --grep="hack" --grep="revert" --grep="oops" --grep="forgot" --grep="actually" --all-match | head -30

# Find commits with long messages (indicate complex changes)
git log --since="6 months ago" --format="%h %s" | awk 'length($0) > 80' | head -20

# Find reverted commits
git log --oneline --since="6 months ago" --grep="revert" -i | head -10
```

For interesting commits, examine the full message and changes:

```bash
git show <commit-hash> --stat
git log -1 --format="%B" <commit-hash>
```

### 2B. Identify Files with High Churn or Complexity Signals

```bash
# Files changed most frequently (last 6 months)
git log --since="6 months ago" --name-only --pretty=format: | sort | uniq -c | sort -rn | head -30

# Files with many different authors (tribal knowledge risk)
git shortlog -sn --since="6 months ago" -- . | head -20

# Files frequently modified together (hidden dependencies)
git log --since="6 months ago" --name-only --pretty=format: | awk '/^$/{if(NR>1)print "---"}; /./{print}' | head -100
```

Look for patterns where the same 2-3 files appear together repeatedly.

### 2C. Scan for Developer Notes in Code

```bash
# Find TODO, FIXME, HACK, XXX, NOTE comments
grep -rn "TODO\|FIXME\|HACK\|XXX\|NOTE:" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" --include="*.rb" --include="*.go" --include="*.java" --include="*.rs" . 2>/dev/null | head -50

# Find "workaround" or "hack" mentions in comments
grep -rni "workaround\|hack\|temporary\|legacy" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" . 2>/dev/null | head -30
```

### 2D. Analyze Project Structure

```bash
# Get directory structure (2 levels deep)
find . -type d -maxdepth 3 | grep -v node_modules | grep -v .git | grep -v dist | grep -v build | head -50

# Find config files
find . -name "*.config.*" -o -name "*.rc" -o -name ".env*" -o -name "tsconfig*" -o -name "package.json" 2>/dev/null | grep -v node_modules | head -30

# Find test directories
find . -type d -name "*test*" -o -type d -name "*spec*" -o -type d -name "__tests__" 2>/dev/null | grep -v node_modules | head -20
```

### 2E. Check for Environment and Configuration Complexity

```bash
# Find environment variable references
grep -rn "process.env\|os.environ\|ENV\[" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.py" . 2>/dev/null | head -30

# Find multiple config files that might conflict or confuse
ls -la *.config.* .*.rc tsconfig*.json 2>/dev/null
```

### 2F. Review Existing Documentation

Read these files if they exist:

- `README.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `docs/` directory
- Any `*.md` files in the root

Note what's already documented and what gaps exist.

### 2G. Examine Import/Dependency Patterns

```bash
# Find files with many imports (high coupling)
for f in $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" 2>/dev/null | grep -v node_modules | head -100); do
  count=$(grep -c "^import\|^from\|require(" "$f" 2>/dev/null || echo 0)
  if [ "$count" -gt 15 ]; then
    echo "$count $f"
  fi
done | sort -rn | head -20

# Find commonly imported local modules (core utilities)
grep -rh "from '\.\|from \"\.\|require('\.\|require(\"\." --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | sort | uniq -c | sort -rn | head -20
```

---

## Phase 3: Cluster and Prioritize Findings

After gathering signals, organize them by area/module:

1. **Group findings by directory** - Which parts of the codebase have the most signals?
2. **Identify themes**:
   - Architecture patterns (how things connect)
   - Testing complexity (special setup needed)
   - Configuration/environment gotchas
   - Historical workarounds still in place
   - Non-obvious conventions

3. **Score areas** - More signals = higher priority for documentation

Create a mental map of:

- Which directories/modules are most complex?
- What relationships exist between different parts?
- Where are the gotchas hiding?

---

## Phase 4: Ask Specific Questions

Based on your analysis, ask the user specific questions about the actual findings. Reference the concrete evidence you found (file names, commit messages, code patterns) and ask about the substance.

Always include "I'm not sure - please investigate" as an option so users can delegate investigation to you.

### Question Format

Ask about the **specific finding**, not the file generally:

**For high-churn files with concerning commits:**

> "ScopeDataStructure.ts has commits mentioning 'exponential blowup' and 'execution flows'. What causes this blowup? When does it happen?"
>
> Options: [Explain the cause] [I'm not sure - please investigate]

**For files frequently modified together:**

> "`src/api/auth.ts` and `src/middleware/session.ts` are modified together in 12 commits. Why do these need to change together?"
>
> Options: [Explain the relationship] [I'm not sure - please investigate]

**For commits with workaround language:**

> "Commit `abc123` says 'workaround for webpack issue'. What's the underlying issue and what's the workaround?"
>
> Options: [Explain] [I'm not sure - please investigate]

**For multiple config files:**

> "There are 3 tsconfig files. When is each one used?"
>
> Options: [Explain usage] [I'm not sure - please investigate]

**For TODO/FIXME comments:**

> "There's a FIXME in `src/parser.ts:142` about 'handle nested callbacks'. What's the issue with nested callbacks here?"
>
> Options: [Explain] [I'm not sure - please investigate]

**For test organization:**

> "Tests are split between `__tests__/` folders and colocated `*.test.ts` files. When should each approach be used?"
>
> Options: [Explain convention] [I'm not sure - please investigate]

### Process

1. Group related questions by area/module
2. Ask 2-3 questions at a time, wait for answers
3. If user says "I'm not sure - please investigate":
   - Read the relevant code, commits, and context yourself
   - Analyze the patterns and behavior
   - Document your findings based on what you discover
4. Move to next area after capturing answers

---

## Phase 5: Generate Rules

For each area where you have enough information, create a rule file.

### Rule File Guidelines:

1. **Location mirrors code structure**
   - Rule for `src/api/` → `.claude/rules/src/api/architecture.md`
   - Rule for testing patterns → `.claude/rules/testing-patterns.md`

2. **Paths must be specific**
   - Good: `paths: ['src/api/**/*.ts']`
   - Bad: `paths: ['**/*.ts']` (too broad, wastes context)

3. **Content should be actionable**
   - Focus on "how to" and "what to know"
   - Avoid warnings unless truly critical
   - Be concise - every word costs context

4. **Timestamp must be current**
   - Use ISO 8601 format: `2026-01-27T15:30:00Z`
   - This enables the pre-commit hook enforcement

### Rule Template:

```markdown
---
paths:
  - 'specific/path/**/*.ts'
category: architecture | testing | faq
timestamp: [CURRENT_ISO_TIMESTAMP]
---

## [Clear, Descriptive Title]

[Concise explanation of what this covers]

### [Section as appropriate]

[Specific, actionable content]

**Learned:** [DATE] from [context - e.g., "analysis of git history", "discussion with user"]
```

---

## Phase 6: Final Review

After generating rules based on your analysis and user answers:

1. **Present a summary** of all rules created
2. **Ask the user:**

   > "I've created rules covering [list areas]. Are there any other areas of the codebase that you know are confusing or have tribal knowledge that I might have missed?"

3. **Generate any additional rules** based on their response

4. **Suggest viewing rules in the dashboard:**

   > "Run `codeyam` to open the dashboard and view all rules in the Rules tab."

5. **Remind the user** to commit the new rules:
   ```
   git add .claude/rules/ .codeyam/rules/
   git commit -m "Add Power Rules for Claude Code"
   ```

---

## Ongoing Maintenance

### When Claude Should Update Rules

- After fixing a bug that revealed a gotcha
- After making an architectural decision
- When code patterns change
- When asking "why does this work this way?" and learning the answer
- When receiving clarification from the user about any confusion

### Pre-commit Hook Behavior

The pre-commit hook **blocks commits** when:

- Code files matching a rule's `paths` are modified
- The rule's `timestamp` is older than the code changes

To proceed:

1. Review the flagged rule(s)
2. Update content if needed
3. Update the `timestamp` to current time
4. Stage and commit

---

## Instructions File Content

Create `.codeyam/rules/instructions.md` with this content:

```markdown
# Power Rules Guide

## Creating a New Rule

1. **Ask the user** what they want to document (architecture, testing pattern, or gotcha/FAQ)
2. **Read the relevant source files** to understand the patterns
3. **Ask clarifying questions** if anything is unclear
4. **Determine the file location** - rules mirror the source code structure (see below)
5. **Create the rule file** with proper YAML frontmatter and concise content
6. **Remind the user** to commit the rule and suggest running `codeyam` to view it in the dashboard

## File Locations

Rules mirror the source code structure:

| Source Path          | Rule Path                                 |
| -------------------- | ----------------------------------------- |
| `src/api/auth.ts`    | `.claude/rules/src/api/auth.md`           |
| `src/utils/**`       | `.claude/rules/src/utils/architecture.md` |
| Project-wide testing | `.claude/rules/testing-patterns.md`       |

## YAML Frontmatter (Required)

Every rule file MUST have this structure:

## \`\`\`yaml

paths:

- 'specific/path/\*_/_.ts'
- 'another/path/\*.tsx'
  category: architecture | testing | faq
  timestamp: 2026-01-27T15:30:00Z

---

\`\`\`

### Fields

| Field       | Required | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `paths`     | Yes      | Glob patterns - be specific to avoid wasting context |
| `category`  | Yes      | `architecture`, `testing`, or `faq`                  |
| `timestamp` | Yes      | ISO 8601 - must update when reviewing rule           |

### Timestamp Enforcement

The pre-commit hook blocks commits when:

- You modify files matching a rule's `paths`
- The rule's `timestamp` is older than your changes

To proceed: review the rule, update timestamp, commit.

## Content Guidelines

### Be Specific and Actionable

- Good: "Run `pnpm test:api` for API tests, `pnpm test:ui` for component tests"
- Bad: "Make sure to run the appropriate tests"

### Be Concise

Every word costs context window space. Trim aggressively.

### Focus on Positive Instructions

- Good: "Auth tokens are stored in httpOnly cookies managed by `src/auth/cookies.ts`"
- Bad: "WARNING: Don't store tokens in localStorage!"

### Include Provenance

End with: `**Learned:** YYYY-MM-DD from [context]`

## Categories

**architecture** - Design decisions, file relationships, data flow, "why X is done this way"

**testing** - Test commands, mock patterns, fixtures, "how to test X"

**faq** - Gotchas, workarounds, common questions, "if you see X, do Y"
```
