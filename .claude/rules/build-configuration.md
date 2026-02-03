---
paths:
  - 'next.config.mjs'
  - 'package.json'
category: faq
timestamp: 2026-02-03T23:10:00Z
---

## Build Configuration

`next.config.mjs` disables build-time error checking for rapid development.

### Current Settings

```javascript
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
images: { unoptimized: true }
```

### Why Errors Are Ignored

Allows deployment and development to proceed despite:
- ESLint warnings (code style issues)
- TypeScript type errors (type safety issues)
- Unoptimized images (faster builds, larger bundles)

### Development Workflow

1. **During development**: Fix errors shown in IDE and terminal
2. **For production deploys**: These settings allow deploy even with warnings
3. **Recommended**: Run `pnpm lint` and check TypeScript before committing

### Package Manager

Use `pnpm` for all operations:
```bash
pnpm install     # Add dependencies
pnpm dev         # Start dev server
pnpm build       # Production build
```

**Do not use** `npm` or `yarn` - package manager is `pnpm` (see `pnpm-lock.yaml`).

**Learned:** 2026-02-03 from codebase investigation and next.config.mjs analysis
