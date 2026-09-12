# Test And Build Verification SOP

Use this guide before reporting that a branch is ready for review.

## Required Test Commands

Run in this order — each must pass before marking work complete:

```shell
npm run build              # astro check + astro build (0 errors, ~129 pages)
npm run test:unit          # Vitest — 470+ tests across 34+ files
npm run test:regression    # Baseline diff runner (42 checks)
npm run test:db            # D1 schema verification (6 tables)
```

### Optional

```shell
npm run test:unit:coverage  # Vitest with V8 coverage report
npm run test:e2e            # Playwright E2E (requires built dist/ and live server)
npx astro check             # Standalone type-check (already included in build)
```

## Reporting

- Report the exact command and whether it passed or failed.
- If a command fails, include the main failure reason and the owning area.
- Do not describe work as complete until fresh verification has run.
- For unit tests: report count (e.g. `470/470 passed`) not just "tests passed".

## Test Suite Layout

| Suite | Command | File pattern | Count |
|---|---|---|---|
| Unit + regression | `test:unit` | `tests/unit/**/*.spec.ts`, `tests/migration/**/*.spec.ts` | 470+ |
| Baseline diff | `test:regression` | `scripts/verify-baseline-diff.js` | 42 |
| D1 verification | `test:db` | `scripts/verify-database.js` | 6 tables |
| E2E | `test:e2e` | `tests/e2e/**` | (requires live server) |

## Guardrails

- Do not run formatters or generators that rewrite unrelated tracked files.
- Do not run database migrations without explicit approval.
- Do not rely on previous verification from another branch.
- The `esbuild` Windows dev-server arbitrary file read vulnerability (GHSA-g7r4-m6w7-qqqr) is accepted risk — affects dev mode only, not production builds or test runs.
