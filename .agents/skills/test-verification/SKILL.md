---
name: test-verification
description: >-
  Run, diagnose, and triage automated unit, migration, and end-to-end tests across Vitest, Playwright, and local Cloudflare D1 databases.
---

# Test Verification & Diagnostic Skill

Use this skill to autonomously execute the project's test suite, isolate failures, and verify branch readiness prior to committing changes or submitting pull requests.

> **Related SOP**: See [skills/testing.md](../../../skills/testing.md) for test architecture, mock factories, and authoring guidelines.

## Quick Execution Commands

```shell
# 1. Run unit & migration tests
npm run test:unit

# 2. Run database integrity verification
npm run test:db

# 3. Verify TypeScript & Astro build
npx astro check && npm run build

# 4. Run full E2E test suite (requires dev server)
npm run test:e2e
```

## Failure Diagnosis & Resolution Runbook

### 1. D1 Database Route Failures (`tests/unit/api/*.spec.ts`)
- **Symptoms**: `TypeError: Cannot read properties of undefined (reading 'prepare')` or `Database not configured`.
- **Cause**: Route handler accessed `locals.runtime.env.DB` directly without using `getDatabase(locals)` guard.
- **Fix**: Wrap route with `const { DB, errorResponse } = getDatabase(locals); if (errorResponse) return errorResponse;`. Ensure test uses `createMockAPIContext({ db })`.

### 2. Astro Virtual Module Errors (`astro:content`, `astro:transitions`)
- **Symptoms**: `Error: Cannot find module 'astro:content'`.
- **Cause**: Test running without Vitest alias mappings.
- **Fix**: Check `vitest.config.ts` alias configuration; ensure test imports directly from `astro:content` and does not define duplicate `vi.mock('astro:content')`.

### 3. DOM / Window Errors (`ReferenceError: window is not defined`)
- **Symptoms**: Component or analytics test references `window`, `document`, or `sessionStorage`.
- **Fix**: Add `// @vitest-environment jsdom` to the very first line of the test file.

### 4. Build Configuration Assertion Failures (`tests/migration/build-config.spec.ts`)
- **Symptoms**: Assertion error on adapter options or integrations.
- **Cause**: Build configuration (`astro.config.mjs`) was changed without pairing the corresponding test update.
- **Fix**: Update the assertion in `tests/migration/build-config.spec.ts` in the same atomic commit.
