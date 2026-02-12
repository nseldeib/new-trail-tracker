# Claude Rules Guide

Rules provide context-specific guidance when working in files matching their `paths` patterns.

## Core Principles

1. **One concept per rule** - Each rule should cover a single topic. If you're documenting two unrelated things, create two rules.
2. **Paths must match content scope** - A rule about one specific file should have that file in `paths`, not a broad `**/*.ts` pattern.
3. **Keep rules SHORT** - Most rules should be **1-4 bullets**. Only complex multi-file architectural overviews should exceed ~10 lines. Every word costs context.

### Good vs Bad Rule Length

**Good** — a typical rule (4 bullets):

```markdown
---
paths:
  - 'packages/ai/src/lib/generateMockData.ts'
---

# Mock Data Generation

- Entry point: `generateMockData()` in `generateMockData.ts`
- Uses `convertDotNotation` to transform flat schema into nested objects
- Schema entry ORDER matters — `key[]` must come before `key[].property` or arrays get overwritten
- Test with exact ordering from database, not just same entries
```

**Bad** — same info bloated to 40+ lines with unnecessary headers, restating what the code says, and paragraphs instead of bullets.

## When to Create a New Rule

Create a new rule when:

- You learn something non-obvious about the codebase
- You make a mistake and want to prevent it in the future
- The user explains something that isn't clear from the code
- An existing rule is covering multiple unrelated topics (split it)

## Before Creating: What Makes a Rule Valuable?

A rule earns its place when it meets these criteria:

1. **Beyond the code** — It captures knowledge that reading the source alone wouldn't reveal (historical context, non-obvious interactions, gotchas).
2. **Explains "why" over "what"** — Gotchas, non-obvious behavior, architectural decisions. (Function signatures, bug fixes, and limitations are already visible in code.)
3. **Prevents real mistakes** — It would have saved someone from a past confusion or bug, not just a "nice to know."

### Examples

**✅ Worth documenting:**

- Where to add new functionality
- An overview of all files, classes, functions, etc used in a particular part of the repo
- Debugging strategies for a particular area of the repo
- "Use `pnpm test` to run tests" (if there is more than one way to run tests and this way is preferred)

Skip things like "The auth module handles authentication" or "This function takes X and returns Y" — Claude can read the code and infer these.

## Path Specificity

The `paths` field controls when the rule is shown. Match the scope of your content:

| Content Scope | Path Pattern            | Example                                                |
| ------------- | ----------------------- | ------------------------------------------------------ |
| Single file   | `'path/to/file.ts'`     | Rule about `processExpression.ts` specifically         |
| Related files | `'path/to/feature*.ts'` | Rule about `generateExecutionFlows*.ts` files          |
| Directory     | `'path/to/dir/**/*.ts'` | Rule about the queue system in `utils/queue/`          |
| Cross-cutting | Multiple specific paths | Testing rule with paths to test configs and test files |

Match path specificity to content scope — use `'path/to/feature.ts'` for a single-feature rule, not `'**/*.ts'`.

## File Placement

Place each rule at the **deepest common directory** shared by all its `paths` entries:

1. Take all paths from the rule's frontmatter
2. Strip filenames — keep only the directory portions
3. Find the longest shared directory prefix
4. Place the rule `.md` file in `.claude/rules/<that-prefix>/`

| Paths in frontmatter                                       | Deepest common dir     | Rule location                                  |
| ---------------------------------------------------------- | ---------------------- | ---------------------------------------------- |
| `packages/ai/src/lib/foo.ts`, `packages/ai/src/lib/bar.ts` | `packages/ai/src/lib/` | `.claude/rules/packages/ai/src/lib/foo-bar.md` |
| `packages/ai/src/lib/a.ts`, `packages/ai/src/utils/b.ts`   | `packages/ai/src/`     | `.claude/rules/packages/ai/src/a-and-b.md`     |
| `packages/ai/**`, `packages/types/**`                      | `packages/`            | `.claude/rules/packages/ai-types.md`           |
| `src/api/auth.ts` (single file)                            | `src/api/`             | `.claude/rules/src/api/auth.md`                |

Reserve the top level of `.claude/rules/` for rules whose paths genuinely span the entire repo.

## Required Frontmatter

```yaml
---
paths:
  - 'specific/path/to/file.ts'
  - 'another/specific/path/*.ts'
---
```

| Field   | Purpose                                                          |
| ------- | ---------------------------------------------------------------- |
| `paths` | Glob patterns - be specific to avoid loading rules unnecessarily |

**Note:** Audit dates live in `.claude/codeyam-rule-state.json` (managed by `codeyam memory touch`). Keep rule frontmatter limited to `paths`.

## Content Guidelines

### Be Actionable

- Good: "Run `pnpm test:api` for API tests"
- Bad: "Make sure to run the appropriate tests"

### Focus on What to Do

- "Auth tokens are stored in httpOnly cookies via `src/auth/cookies.ts`" tells the reader exactly where to look and what pattern to follow.

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
