# Testing & Verification SOP

Use this guide for writing, running, and debugging automated tests across Vitest (unit/component/migration) and Playwright (E2E/routing/visuals).

> **Related Agent Skill**: See [.agents/skills/test-verification/SKILL.md](../.agents/skills/test-verification/SKILL.md) for automated test execution runbooks and failure triage.

## Scope

- Test layers: Unit (`tests/unit/`), Migration Contracts (`tests/migration/`), and End-to-End (`tests/e2e/`).
- Mock factories (`tests/mocks/`): D1 database mock, Astro virtual modules (`astro:content`, `astro:transitions`, `astro:assets`).
- Local pre-commit verification and build assertions.

## Test Commands

| Command | Purpose |
|---|---|
| `npm run test:unit` | Run all Vitest unit and migration test suites once |
| `npm run test:unit:watch` | Run Vitest in watch mode for active TDD iteration |
| `npm run test:unit:coverage` | Generate V8 code coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests against local dev server |
| `npm run test:e2e:ui` | Open Playwright interactive UI runner |
| `npm run test:regression` | Run baseline diff validation script |
| `npm run test:db` | Verify local D1 database schema and migrations |

## Test Suite Architecture & File Structure

```text
tests/
├── setup.ts                              # Global Vitest setup (console silencing, polyfills)
├── mocks/
│   ├── d1.ts                             # D1 database mock factory
│   ├── astro-content.ts                  # astro:content virtual module stub
│   ├── astro-transitions.ts              # astro:transitions virtual module stub
│   └── astro-assets.ts                   # astro:assets virtual module stub
├── unit/
│   ├── lib/                              # Pure functions (slugify, utils, remark plugins, schema)
│   ├── api/                              # Route handlers, database queries, UTM tracking, validators
│   ├── components/                       # Head logic, analytics reinitialization
│   └── config/                           # site.js, manifest.ts, navigation configs
├── migration/                            # Architectural invariants (Content Layer, D1, ClientRouter)
└── e2e/                                  # Playwright browser specs (SEO metadata, JSON-LD, RSS, 404)
```

## Mocking Invariants & Rules

1. **Use D1 Mock Factory for Database Tests**:
   - Always import from `tests/mocks/d1`:
     ```typescript
     import { createMockD1, createMockAPIContext } from '../mocks/d1';
     const db = createMockD1();
     const ctx = createMockAPIContext({ db });
     ```
2. **Astro Virtual Modules are Pre-Mocked**:
   - `astro:content`, `astro:transitions`, and `astro:assets` are mapped to stubs via `vitest.config.ts`. Do not call `vi.mock('astro:content')` manually.
3. **Never Import `.astro` Files in Vitest**:
   - Vitest cannot compile Astro components directly. Extract business logic into `.ts` helpers, or validate component rendering via Playwright in `tests/e2e/`.
4. **DOM Environment**:
   - For tests touching `window`, `document`, or `localStorage`, add at the top:
     ```typescript
     // @vitest-environment jsdom
     ```

## Required Practices

- Pair new features or bug fixes directly with their validating test file in the same atomic commit.
- Assert against output shapes, status codes, and rendered HTML, rather than internal implementation details.
- Always verify all unit tests pass (`npm run test:unit`) before submitting a pull request.

## Out Of Scope

- Do not test external third-party APIs with live network calls; mock network requests.
- Do not run production D1 database commands during test execution.
