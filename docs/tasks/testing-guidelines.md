# Testing Guidelines — Astro v4→v6 Migration

> **Audience**: Junior coding agents (Gemma/Flash) executing test-creation tickets.
> **Last updated**: 2026-06-11
> **Companion file**: [`test-creation-task.md`](./test-creation-task.md) — the task queue.

---

## 1. Purpose & Strategy

We are building a **pre-migration test suite** for an **Astro v4.15** site deployed to **Cloudflare Pages** with a **D1 database**. These tests capture the current behavior so that regressions are detected when upgrading to **Astro v6.2**.

**Key principle**: Write tests that assert the v4 OUTPUT (rendered HTML, API responses, schema JSON), not the v4 implementation details. This way, the same tests validate v6 correctness.

### What we are testing

| Layer | Tool | Directory |
|-------|------|-----------|
| Utility functions (`src/lib/`) | Vitest | `tests/unit/lib/` |
| API utilities (`src/lib/api/`) | Vitest | `tests/unit/api/` |
| API route handlers (`src/pages/api/`) | Vitest | `tests/unit/api/` |
| Component logic (extracted from `.astro`) | Vitest | `tests/unit/components/` |
| Config validation (`src/config/`) | Vitest | `tests/unit/config/` |
| Migration contracts (content layer, D1, transitions) | Vitest | `tests/migration/` |
| Page rendering, SEO, sitemaps, RSS | Playwright | `tests/e2e/` |

---

## 2. Running Tests

### Prerequisites

After cloning the repo, install dependencies:
```bash
npm install
npx playwright install chromium
```

### Commands

| Command | What it does |
|---------|-------------|
| `npm run test:unit` | Run all Vitest unit tests once |
| `npm run test:unit:watch` | Run Vitest in watch mode (re-runs on file change) |
| `npm run test:unit:coverage` | Run unit tests with V8 coverage report |
| `npm run test:e2e` | Run all Playwright E2E tests (auto-starts dev server) |
| `npm run test:e2e:ui` | Open Playwright's interactive UI for debugging |

### Environment Notes

- **Vitest** uses `node` environment by default. For tests needing DOM APIs (e.g., `window`, `document`, `localStorage`), add this comment at the top of the test file:
  ```typescript
  // @vitest-environment jsdom
  ```
- **Playwright** auto-starts `npm run dev` on port 4321. If the dev server is already running, it reuses it.

---

## 3. Repository Reference Documents

Before writing any test, check these files for architectural context:

| Document | Path | Contains |
|----------|------|----------|
| Architecture baseline | [`ARCHITECTURE.md`](../../ARCHITECTURE.md) | Full structural baseline — source layout, content collections, API surface, D1 schema, analytics flow |
| Risk inventory | [`docs/astro_6_2_risk_inventory.md`](../astro_6_2_risk_inventory.md) | Six migration risks ranked by severity |
| SEO preservation | [`docs/seo_analytics_preservation_review.md`](../seo_analytics_preservation_review.md) | Metadata, schema, sitemap, RSS regression risks |
| Content collections | [`docs/content_collection_review.md`](../content_collection_review.md) | Every file using `getCollection`, `entry.slug`, `entry.render()` |
| Test & build SOP | [`skills/test_and_build_verification.md`](../../skills/test_and_build_verification.md) | Commands to run before marking a branch ready |

---

## 4. Test File Naming Convention

```
tests/
├── setup.ts                              # Global Vitest setup (auto-loaded)
├── mocks/
│   ├── d1.ts                             # D1 database mock factory
│   ├── astro-content.ts                  # astro:content virtual module stub
│   ├── astro-transitions.ts              # astro:transitions virtual module stub
│   └── astro-assets.ts                   # astro:assets virtual module stub
├── unit/
│   ├── lib/
│   │   ├── slugify.spec.ts               # TSK-001
│   │   ├── utils.spec.ts                 # TSK-002
│   │   ├── remark-reading-time.spec.ts   # TSK-003
│   │   ├── remark-modified-time.spec.ts  # TSK-004
│   │   ├── schema-generators.spec.ts     # TSK-005
│   │   └── albums.spec.ts               # TSK-006
│   ├── api/
│   │   ├── validation.spec.ts            # TSK-007
│   │   ├── security.spec.ts             # TSK-008
│   │   ├── database.spec.ts             # TSK-009
│   │   ├── utm-tracking.spec.ts         # TSK-010
│   │   ├── newsletter-route.spec.ts     # TSK-011
│   │   ├── leadform-route.spec.ts       # TSK-012
│   │   └── resource-download-route.spec.ts # TSK-013
│   ├── components/
│   │   ├── head-logic.spec.ts           # TSK-014
│   │   └── head-analytics-reinit.spec.ts # TSK-015
│   └── config/
│       └── site-config.spec.ts          # TSK-029
├── migration/
│   ├── view-transitions.spec.ts          # TSK-023 (Playwright)
│   ├── after-swap-events.spec.ts        # TSK-024 (Playwright)
│   ├── content-config.spec.ts           # TSK-025 (Vitest)
│   ├── collection-api-surface.spec.ts   # TSK-026 (Playwright)
│   ├── d1-binding-integrity.spec.ts     # TSK-027 (Vitest)
│   └── build-config.spec.ts            # TSK-028 (Vitest)
├── e2e/
│   ├── formatted-date.spec.ts           # TSK-016
│   ├── seo-metadata.spec.ts            # TSK-017
│   ├── json-ld-schema.spec.ts          # TSK-018
│   ├── rss-feed.spec.ts               # TSK-019
│   ├── article-pages.spec.ts           # TSK-020
│   ├── home-page.spec.ts              # TSK-021
│   ├── error-pages.spec.ts            # TSK-022
│   └── sitemap.spec.ts                # TSK-030
└── results/                            # Playwright output (gitignored)
```

---

## 5. Mock Usage Rules

### Rule 1: Use the D1 Mock Factory for ALL API tests

```typescript
import { createMockD1, createMockAPIContext, createMockAPIContextNoDB, createMockFormData } from '../mocks/d1';

// Happy path: DB is available
const ctx = createMockAPIContext({
  request: new Request('http://localhost/api/newsletter', {
    method: 'POST',
    body: createMockFormData({ subsemail: 'test@example.com' }),
  }),
});

// Error path: No DB configured
const ctxNoDB = createMockAPIContextNoDB();

// Customize D1 responses:
const db = createMockD1();
db.first.mockResolvedValue({ id: 42, email: 'found@test.com' });
const ctxCustom = createMockAPIContext({ db });
```

### Rule 2: Astro Virtual Modules are Pre-Mocked

The `vitest.config.ts` aliases resolve `astro:content`, `astro:transitions`, and `astro:assets` to stub files in `tests/mocks/`. You do NOT need to call `vi.mock('astro:content')` — it's already handled.

To customize the mock behavior in a specific test:

```typescript
import { getCollection } from 'astro:content';
import { vi } from 'vitest';

vi.mocked(getCollection).mockResolvedValue([
  { slug: 'test-post', data: { title: 'Test', draft: false, date: new Date() } },
]);
```

### Rule 3: Never Import `.astro` Files in Vitest

Astro components (`.astro` files) cannot be imported into Vitest — they require the Astro compiler. Instead:

1. **Extract testable logic** from the frontmatter `---` block into `.ts` files, OR
2. **Test the functions the component calls** (e.g., `generatePageSchema`, `initializeAnalyticsConfig`), OR
3. **Use Playwright** to test the rendered HTML output of the component.

### Rule 4: Console Suppression

`tests/setup.ts` mocks `console.warn` and `console.error` to reduce noise. To assert that a function logged a warning:

```typescript
import { vi } from 'vitest';

it('logs a warning when schema is invalid', () => {
  myFunction();
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('invalid'));
});
```

---

## 6. Key Architecture Facts for Test Writers

These facts are extracted from [`ARCHITECTURE.md`](../../ARCHITECTURE.md). Do NOT guess at these values — use them exactly.

### Path Alias Resolution

The `tsconfig.json` uses a single wildcard alias:
```json
{ "paths": { "@*": ["./src/*"] } }
```
This means `@lib/utils` → `src/lib/utils`, `@components/Head.astro` → `src/components/Head.astro`, etc.

The Vitest config maps this to explicit aliases for each subdirectory.

### Content Collection Properties

In **Astro v4** (current), collection entries have:
- `entry.slug` — the filesystem-derived slug
- `entry.data` — parsed frontmatter
- `entry.collection` — the collection name string
- `entry.render()` — returns `{ Content, headings, remarkPluginFrontmatter }`
- `entry.body` — raw Markdown body

In **Astro v6** (target), these change to:
- `entry.id` — replaces `entry.slug`
- `render(entry)` — top-level function replaces `entry.render()`
- `entry.body` — may be renamed or restructured

### D1 Access Pattern

Every API route follows this pattern (from `ARCHITECTURE.md` §Cloudflare and D1):
```typescript
export const prerender = false;
if (!locals?.runtime?.env?.DB) { return 500 response; }
const { DB } = locals.runtime.env;
await DB.prepare(query).bind(...params).run(); // or .first() or .all()
```

### Site URL

The canonical site URL is `https://alokprateek.in` (no trailing slash in `site.js`), but `astro.config.mjs` has `site: 'https://alokprateek.in/'` (with trailing slash). Canonical URLs are built from `Astro.url.pathname` + `Astro.site`.

---

## 7. Writing a Good Test — Checklist

- [ ] Test file follows the naming convention from Section 4
- [ ] All imports use `@lib/`, `@config/`, etc. aliases (not relative `../../src/` paths)
- [ ] D1 tests use `createMockD1()` from `tests/mocks/d1.ts`
- [ ] No `.astro` files are imported in Vitest tests
- [ ] jsdom-dependent tests have `// @vitest-environment jsdom` at the top
- [ ] Assertions test OUTPUT/BEHAVIOR, not implementation details
- [ ] Edge cases are covered: empty input, null, missing fields, error paths
- [ ] Each `describe` block maps to a single exported function
- [ ] Test file references its Task ID in a top-level comment

---

## 8. What NOT to Do

1. **Do NOT install packages** — package installation is handled by the maintainer after reviewing `package.json` changes.
2. **Do NOT modify source code** — your job is to create TEST files only.
3. **Do NOT run `npm run build`** unless your task ticket explicitly says to.
4. **Do NOT write tests for CSS** — styling is out of scope.
5. **Do NOT hardcode absolute file paths** — use aliases.
6. **Do NOT mock functions you're testing** — mock only their DEPENDENCIES.
7. **Do NOT include raw source code from target files in your tests** — read the files and write assertions against their behavior.
