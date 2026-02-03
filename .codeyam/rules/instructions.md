# Claude Rules Guide

Rules provide context-specific guidance when working in files matching their `paths` patterns.

## Core Principles

1. **One concept per rule** - Each rule should cover a single topic. If you're documenting two unrelated things, create two rules.
2. **Paths must match content scope** - A rule about one specific file should have that file in `paths`, not a broad `**/*.ts` pattern.
3. **Be concise** - Every word costs context. Use bullets and tables.

## When to Create a New Rule

Create a new rule when:

- You learn something non-obvious about the codebase
- You make a mistake and want to prevent it in the future
- The user explains something that isn't clear from the code
- An existing rule is covering multiple unrelated topics (split it)

## Path Specificity

The `paths` field controls when the rule is shown. Match the scope of your content:

| Content Scope | Path Pattern            | Example                                                |
| ------------- | ----------------------- | ------------------------------------------------------ |
| Single file   | `'path/to/file.ts'`     | Rule about `processExpression.ts` specifically         |
| Related files | `'path/to/feature*.ts'` | Rule about `generateExecutionFlows*.ts` files          |
| Directory     | `'path/to/dir/**/*.ts'` | Rule about the queue system in `utils/queue/`          |
| Cross-cutting | Multiple specific paths | Testing rule with paths to test configs and test files |

**Anti-pattern**: Don't use `'**/*.ts'` for a rule about one specific feature.

## File Structure

Rules mirror the source code structure:

| Source Location      | Rule Location                           |
| -------------------- | --------------------------------------- |
| `src/api/auth.ts`    | `.claude/rules/src/api/auth.md`         |
| `src/utils/queue/**` | `.claude/rules/src/utils/queue.md`      |
| Test configuration   | `.claude/rules/testing/jest-configs.md` |

## Required Frontmatter

```yaml
---
paths:
  - 'specific/path/to/file.ts'
  - 'another/specific/path/*.ts'
category: architecture | testing | faq
timestamp: 2026-01-30T00:00:00Z
---
```

| Field       | Purpose                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `paths`     | Glob patterns - be specific to avoid loading rules unnecessarily                                   |
| `category`  | `architecture` (design/data flow), `testing` (test commands/patterns), `faq` (gotchas/workarounds) |
| `timestamp` | ISO 8601 - update when rule is reviewed                                                            |

## Content Guidelines

### Be Actionable

- Good: "Run `pnpm test:api` for API tests"
- Bad: "Make sure to run the appropriate tests"

### Focus on What, Not What Not

- Good: "Auth tokens are stored in httpOnly cookies via `src/auth/cookies.ts`"
- Bad: "WARNING: Don't store tokens in localStorage!"

### Keep Rules Short

- Target 30-50 lines
- If a rule exceeds 60 lines, consider splitting it

## Categories

**architecture** - Design decisions, file relationships, data flow

- "These three files must change together because..."
- "Data flows from X → Y → Z"

**testing** - Test commands, mock patterns, fixtures

- "Run tests with: `pnpm test path/to/test.ts`"
- "Must run `pnpm pretest` first because..."

**faq** - Gotchas, workarounds, common questions

- "If you see error X, it means Y"
- "This looks wrong but is intentional because..."
