# Astro v4 → v6 Migration: Comprehensive Test-Creation Task Tickets

> **Generated**: 2026-06-11
> **Repository**: `theWhiteWulfy/personal-site` (Astro v4.15 → v6.2)
> **Testing Stack**: Vitest (unit/component/utility) + Playwright (E2E/integration/SEO)
> **Priority**: Tests MUST be written against the v4 baseline FIRST (to capture current behavior), then re-validated after migration.

---

## Testing Boilerplate & Mock Standards

All sub-agents MUST follow these patterns when creating test files. Do NOT deviate from these conventions.

### Vitest Setup

All Vitest tests must use the following configuration patterns:

**Config file to create**: `vitest.config.ts` (project root)
```
References:
- astro.config.mjs (for path aliases)
- tsconfig.json (for TypeScript paths)

Setup:
- resolve.alias must mirror tsconfig paths: @components → src/components, @lib → src/lib, @config → src/config, @layouts → src/layouts, @styles → src/styles
- test.globals = true
- test.environment = 'node' (for utility tests) or 'jsdom' (for DOM-dependent tests)
- test.setupFiles should point to tests/setup.ts
```

**Setup file to create**: `tests/setup.ts`
```
Contents:
- vi.mock() for 'astro:content' (mock getCollection, defineCollection)
- vi.mock() for 'astro:transitions' (mock ViewTransitions, ClientRouter)
- vi.mock() for 'astro:assets' (mock Image component)
- Global mock for console.error/warn to suppress noise but capture for assertions
```

### Mocking `Astro.props` (for component logic tests)

Astro components cannot be directly imported into Vitest. Instead:
1. **Extract testable logic** from the frontmatter `---` section into separate `.ts` utility functions.
2. **Test the extracted functions** directly in Vitest with mock data.
3. For the template (HTML) output, use **Playwright** to render real pages and assert DOM structure.

Example pattern for testing Head.astro logic:
```typescript
// In test: pass mock props matching the Props interface
const mockProps = {
  title: 'Test Page',
  description: 'Test description',
  dateModified: '2024-01-01T00:00:00Z',
  // ... all required fields from the Props interface
};
```

### Mocking `Astro.url` and `Astro.site`

For functions that depend on `Astro.url` or `Astro.site`, inject the values as parameters:
```typescript
// Instead of: const canonicalURL = new URL(Astro.url.pathname, Astro.site);
// Test as:  const canonicalURL = new URL('/articles/test/', 'https://alokprateek.in/');
```

### Mocking Cloudflare D1 Bindings (`locals.runtime.env.DB`)

For API route tests, create a D1 mock factory:
```typescript
// tests/mocks/d1.ts
export function createMockD1() {
  return {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn().mockResolvedValue({ success: true, meta: { last_row_id: 1, changes: 1 } }),
    first: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue({ results: [] }),
  };
}

export function createMockAPIContext(overrides = {}) {
  return {
    request: new Request('http://localhost/api/test', { method: 'POST' }),
    locals: {
      runtime: {
        env: {
          DB: createMockD1(),
        }
      }
    },
    url: new URL('http://localhost/api/test'),
    ...overrides,
  };
}
```

### Playwright Setup

**Config file to create**: `playwright.config.ts` (project root)
```
References:
- Must use webServer config pointing to `npm run dev` on port 4321
- Set baseURL to http://localhost:4321
- Use chromium project only for CI speed
- Set retries: 1 for CI stability
```

### Test File Naming Convention

| Type | Path Pattern | Example |
|------|-------------|---------|
| Utility unit test | `tests/unit/lib/{filename}.spec.ts` | `tests/unit/lib/slugify.spec.ts` |
| API route test | `tests/unit/api/{filename}.spec.ts` | `tests/unit/api/newsletter.spec.ts` |
| Component logic test | `tests/unit/components/{filename}.spec.ts` | `tests/unit/components/head-logic.spec.ts` |
| E2E page test | `tests/e2e/{feature}.spec.ts` | `tests/e2e/seo-metadata.spec.ts` |
| Migration validation | `tests/migration/{feature}.spec.ts` | `tests/migration/content-layer.spec.ts` |

---

## SECTION 1: Utility & Helper Function Tests

---

### Task ID: TSK-001
* **Target File(s) to Read:** `src/lib/slugify.mjs`
* **Target Test File to Create:** `tests/unit/lib/slugify.spec.ts`
* **Relevant Line Numbers:** Lines 7-14 in `slugify.mjs` (the `slugify` function)
* **Testing Strategy:** Pure function unit test. The `slugify` function is used throughout the site for generating tag URLs (`src/pages/tag/[...slug].astro`) and article paths. Any regression here breaks all taxonomy routes. Test edge cases exhaustively since the Astro 6 Content Layer may change how slugs are consumed.
* **Execution Instructions:**
  1. Import `slugify` from `src/lib/slugify.mjs`.
  2. Write assertions for standard cases: `"Hello World"` → `"hello-world"`.
  3. Write assertions for special characters: `"C++ Programming"` → `"c-programming"` (non-word chars stripped).
  4. Write assertions for multiple spaces: `"  spaced   out  "` → `"spaced-out"`.
  5. Write assertions for multiple dashes: `"test--case"` → `"test-case"`.
  6. Write assertions for leading/trailing dashes: `"-leading-"` → `"leading"`.
  7. Write assertions for dots and underscores (should be preserved): `"file.name_v2"` → `"file.name_v2"`.
  8. Write assertion for empty string input.
  9. Write assertion for numeric-only input: `"12345"` → `"12345"`.

---

### Task ID: TSK-002
* **Target File(s) to Read:** `src/lib/utils.ts`
* **Target Test File to Create:** `tests/unit/lib/utils.spec.ts`
* **Relevant Line Numbers:** Lines 3-8 (`formatDate`), Lines 11-16 (`readingTime`), Lines 18-30 (`getAdjacentPosts`)
* **Testing Strategy:** Pure function unit tests for three utility functions. `readingTime` is used on the home page (`src/pages/index.astro` L115) to calculate reading time from raw HTML body content. `getAdjacentPosts` is used in every `[...slug].astro` page for post navigation. In Astro 6, `entry.slug` may become `entry.id` — these tests lock down the expected interface.
* **Execution Instructions:**
  1. **`formatDate`**: Test with `new Date('2024-01-15')` and assert output matches `"01/15/2024"` format. Test with epoch date. Test with invalid date input.
  2. **`readingTime`**: Test with HTML string of known word count. `"<p>word </p>".repeat(180)` should return `"2 min read"` (180 words / 180 wpm + 1 = 2). Test with empty string. Test with deeply nested HTML tags.
  3. **`getAdjacentPosts`**: Create a mock array of 5 posts with `slug` property. Assert that for the middle post, `nextPost` and `prevPost` are correct. Assert that for the first post, `prevPost` is `undefined`. Assert that for the last post, `nextPost` is `undefined`. Assert that for a non-existent slug, both are `undefined`.

---

### Task ID: TSK-003
* **Target File(s) to Read:** `src/lib/remark-reading-time.mjs`
* **Target Test File to Create:** `tests/unit/lib/remark-reading-time.spec.ts`
* **Relevant Line Numbers:** Lines 1-12 in `remark-reading-time.mjs`
* **Testing Strategy:** Test the remark plugin by invoking it with a mock AST tree and mock `file` object. This plugin injects `data.astro.frontmatter.timeToRead` which is read by every `[...slug].astro` page via `remarkPluginFrontmatter.timeToRead`. Astro 6 may change how remark plugins interact with the content pipeline — this test locks the contract.
* **Execution Instructions:**
  1. Mock the `reading-time` package to return a controlled value: `{ text: '5 min read' }`.
  2. Mock `mdast-util-to-string` to return a known string.
  3. Call `remarkReadingTime()` to get the transform function.
  4. Invoke the transform with a mock tree and a mock `{ data: { astro: { frontmatter: {} } } }` file object.
  5. Assert that `file.data.astro.frontmatter.timeToRead` equals `'5 min read'`.

---

### Task ID: TSK-004
* **Target File(s) to Read:** `src/lib/remark-modified-time.mjs`
* **Target Test File to Create:** `tests/unit/lib/remark-modified-time.spec.ts`
* **Relevant Line Numbers:** Lines 1-9 in `remark-modified-time.mjs`
* **Testing Strategy:** Test the remark plugin that calls `execSync` to get git log timestamps. This plugin injects `data.astro.frontmatter.lastModified`, used in `src/pages/articles/[...slug].astro` L33. Must mock `child_process.execSync` since tests won't have git context.
* **Execution Instructions:**
  1. Mock `child_process` module: `vi.mock('child_process', () => ({ execSync: vi.fn() }))`.
  2. Configure `execSync` mock to return a Buffer or string like `'2024-06-01T12:00:00+05:30'`.
  3. Create a mock file object with `history: ['/path/to/test.md']` and `data: { astro: { frontmatter: {} } }`.
  4. Call `remarkModifiedTime()` and invoke the returned function.
  5. Assert `file.data.astro.frontmatter.lastModified` equals the mocked git timestamp string.
  6. Assert `execSync` was called with the correct git command format: `git log -1 --pretty="format:%cI" "/path/to/test.md"`.

---

### Task ID: TSK-005
* **Target File(s) to Read:** `src/lib/schema-generators.ts`
* **Target Test File to Create:** `tests/unit/lib/schema-generators.spec.ts`
* **Relevant Line Numbers:** Lines 234-301 (`generateLocalBusinessSchema`), Lines 308-341 (`generateServiceSchema`), Lines 348-361 (`generateFAQPageSchema`), Lines 368-379 (`generateBreadcrumbListSchema`), Lines 387-404 (`generateBreadcrumbsFromPath`), Lines 411-451 (`generatePersonSchema`), Lines 462-472 (`safeSchemaGeneration`), Lines 512-552 (`generateResourceSchema`), Lines 559-606 (`generateCampaignSchema`), Lines 614-682 (`generatePageSchema`)
* **Testing Strategy:** These functions generate JSON-LD Schema.org markup. The SEO preservation review (docs/seo_analytics_preservation_review.md) identifies this as HIGH RISK — any regression produces malformed schema that strips rich snippet eligibility. These tests must snapshot the exact schema structure. All functions depend on `@config/site` and `@config/system.js` — mock both.
* **Execution Instructions:**
  1. Mock `@config/site` with a minimal site object containing: `url`, `title`, `titleAlt`, `description`, `author`, `image`, `siteLanguage`, `twitterUrl`, `linkedinUrl`, `githubUrl`, `instagramUrl`.
  2. Mock `@config/system.js` with SCHEMA_CONFIG containing: `BUSINESS` (PHONE, EMAIL, ADDRESS, GEO, OPENING_HOURS, PRICE_RANGE, AREA_SERVED) and `PERSON` (JOB_TITLE, KNOWS_ABOUT).
  3. **`generateBreadcrumbsFromPath`**: Test `/articles/test-post/` returns 3 items: Home, Articles, Test post. Test `/` returns only Home. Test deeply nested path.
  4. **`generateBreadcrumbListSchema`**: Assert output has `@context`, `@type: BreadcrumbList`, correct `position` numbering.
  5. **`generateLocalBusinessSchema`**: Assert all required fields are present. Test override via data parameter.
  6. **`generateServiceSchema`**: Test with full `ServiceData` including `hasOfferCatalog` and `aggregateRating`. Assert nested `@type` annotations.
  7. **`generateFAQPageSchema`**: Test with 3 FAQ items. Assert each has `@type: Question` with nested `acceptedAnswer`.
  8. **`generatePersonSchema`**: Test with defaults. Test with custom overrides.
  9. **`generateResourceSchema`**: Test with full `ResourceData`. Assert `@type: DigitalDocument`.
  10. **`generateCampaignSchema`**: Test with full `CampaignData` including offers array. Assert `@type: Event`.
  11. **`safeSchemaGeneration`**: Test that it returns generator result on success. Test that it returns fallback on thrown error.
  12. **`generatePageSchema`**: Test with `pageType: 'article'` and assert it includes breadcrumbs + base Article schema. Test with `pageType: 'service'` and assert it includes LocalBusiness + Service. Test with `pageType: 'home'` and assert LocalBusiness is included. Test that `includeBreadcrumbs: false` omits breadcrumbs. Test null filtering.

---

### Task ID: TSK-006
* **Target File(s) to Read:** `src/lib/albums.ts`
* **Target Test File to Create:** `tests/unit/lib/albums.spec.ts`
* **Relevant Line Numbers:** Lines 1-20 in `albums.ts`
* **Testing Strategy:** Test `getAlbumImages`. This function uses `import.meta.glob` which is a Vite-specific API. In Vitest, `import.meta.glob` needs to be mocked. The `albums` collection is a `type: 'data'` collection — Astro 6's Content Layer changes data collection handling, making this a migration risk.
* **Execution Instructions:**
  1. Mock `import.meta.glob` to return an object with 3 test keys like `{ '/src/content/albums/trip1/img1.jpg': mockResolver, '/src/content/albums/trip1/img2.jpg': mockResolver, '/src/content/albums/trip2/img3.jpg': mockResolver }`.
  2. Each mock resolver should be `() => Promise.resolve({ default: { src: '/img.jpg', width: 100, height: 100 } })`.
  3. Call `getAlbumImages('trip1')` and assert it returns exactly 2 images (filtered by albumId).
  4. Call `getAlbumImages('nonexistent')` and assert it returns an empty array.
  5. Note: Cannot test randomization deterministically — assert returned array length only.

---

## SECTION 2: API Utility Tests (src/lib/api/)

---

### Task ID: TSK-007
* **Target File(s) to Read:** `src/lib/api/validation.ts`
* **Target Test File to Create:** `tests/unit/api/validation.spec.ts`
* **Relevant Line Numbers:** Lines 35-44 (`sanitizeInput`), Lines 49-77 (`validateEmail`), Lines 82-115 (`validateRequiredField`), Lines 120-142 (`validateResourceName`), Lines 147-197 (`validateResourceForm`), Lines 202-208 (`formatValidationErrors`)
* **Testing Strategy:** Pure function tests for the form validation layer used by `src/pages/api/resource-download.ts`. These functions use `sanitize-html` as a dependency — mock it or use the real package. The Astro 6 upgrade does not change these functions, but they must have baseline coverage before migration to verify API routes remain functional.
* **Execution Instructions:**
  1. **`sanitizeInput`**: Test HTML stripping: `'<script>alert("xss")</script>test'` → `'test'`. Test max length truncation at 500 chars. Test non-string input returns `''`. Test whitespace trimming.
  2. **`validateEmail`**: Test valid email returns `null`. Test empty email returns error with code `REQUIRED`. Test too-long email (>254 chars) returns `TOO_LONG`. Test invalid format returns `INVALID_FORMAT`.
  3. **`validateRequiredField`**: Test empty value with code `REQUIRED`. Test value below minLength with `TOO_SHORT`. Test value above maxLength with `TOO_LONG`. Test valid value returns `null`.
  4. **`validateResourceName`**: Test valid name returns `null`. Test empty returns `REQUIRED`. Test with special characters returns `INVALID_FORMAT`.
  5. **`validateResourceForm`**: Create a mock `FormData` object with all 5 fields. Test valid submission returns `isValid: true` with sanitizedData. Test missing email returns `isValid: false` with error. Test multiple errors returns all errors.
  6. **`formatValidationErrors`**: Test single error returns just the message. Test multiple errors returns comma-joined message.

---

### Task ID: TSK-008
* **Target File(s) to Read:** `src/lib/api/security.ts`
* **Target Test File to Create:** `tests/unit/api/security.spec.ts`
* **Relevant Line Numbers:** Lines 11-24 (SPAM_PATTERNS, COMBINED_SPAM_PATTERN), Lines 27-33 (SPAM_DOMAINS), Lines 47-105 (`checkRateLimit`), Lines 110-154 (`detectSpamContent`), Lines 159-171 (`checkHoneypot`), Lines 176-206 (`performSecurityChecks`), Lines 211-236 (`generateCaptcha`), Lines 241-243 (`verifyCaptcha`)
* **Testing Strategy:** Security utility functions protecting D1-backed API routes. `checkRateLimit` requires a mock D1 database. `detectSpamContent` and `checkHoneypot` are pure functions. These tests are critical because the Cloudflare adapter upgrade (risk #4 in risk inventory) could change how the D1 binding is structured.
* **Execution Instructions:**
  1. **`detectSpamContent`**: Test clean content returns `{ allowed: true }`. Test content matching spam patterns (e.g., `'buy viagra now'`) returns `{ allowed: false }`. Test email from spam domain (`tempmail.org`) returns blocked. Test excessively long content (>1000 chars) is blocked. Test repetitive content (unique word ratio < 0.3) is blocked.
  2. **`checkHoneypot`**: Create a mock `FormData`. Test with empty honeypot fields returns `{ allowed: true }`. Test with filled `website` field returns `{ allowed: false, reason: 'Bot detected via honeypot' }`.
  3. **`checkRateLimit`**: Use the D1 mock from the boilerplate. Mock `first()` to return `{ request_count: 6 }` (above threshold). Assert it returns `{ allowed: false }` with retryAfter. Mock `first()` to return `{ request_count: 2 }` (below threshold). Assert `{ allowed: true }`. Test with email-based limiting similarly.
  4. **`generateCaptcha`**: Assert it returns an object with `challenge` string and `answer` string. Assert the answer is a valid number. Run it 10 times and assert variance (not always the same).
  5. **`verifyCaptcha`**: Test matching answer returns `true`. Test non-matching returns `false`. Test with whitespace returns `true` if trimmed matches.
  6. **`performSecurityChecks`**: Integration test combining all three checks. Test that honeypot is checked first (fails fast). Test that spam check runs after honeypot. Test that rate limit is checked last.

---

### Task ID: TSK-009
* **Target File(s) to Read:** `src/lib/api/database.ts`
* **Target Test File to Create:** `tests/unit/api/database.spec.ts`
* **Relevant Line Numbers:** Lines 40-44 (`validateDatabaseConnection`), Lines 49-111 (`insertResourceDownload`), Lines 116-192 (`getDownloadStats`), Lines 197-215 (`getDownloadById`), Lines 220-245 (`getDownloadsByEmail`), Lines 250-280 (`updateDownloadRecord`), Lines 285-307 (`cleanupOldRecords`), Lines 312-326 (`testDatabaseConnection`)
* **Testing Strategy:** Database operations layer that wraps D1 queries. All functions take `DB` as the first parameter, making them testable with the D1 mock. This module is the MOST CRITICAL for migration validation — risk #4 (Cloudflare adapter) could change how `DB.prepare().bind().run()` chain works.
* **Execution Instructions:**
  1. **`validateDatabaseConnection`**: Test with `null` throws Error. Test with a truthy object does not throw.
  2. **`insertResourceDownload`**: Mock `first()` to return `null` (no duplicate) then mock `run()` to return success. Assert it returns `{ success: true, isDuplicate: false }`. Mock `first()` to return `{ id: 42 }` (duplicate found). Assert it returns `{ success: true, isDuplicate: true, id: 42 }`. Test database error handling — mock `run()` to throw. Assert it rethrows with `query` property set.
  3. **`getDownloadStats`**: Mock all 4 queries (total, unique, breakdown, recent). Assert returned object has correct shape: `{ totalDownloads, uniqueUsers, resourceBreakdown, recentDownloads }`. Test with `dateRange` option. Test with `resourceFilter` option.
  4. **`getDownloadById`**: Mock `first()` to return a record. Assert correct return. Mock to return `null`. Assert `null` return.
  5. **`getDownloadsByEmail`**: Mock `all()` to return results array. Assert correct return.
  6. **`updateDownloadRecord`**: Test with valid updates. Assert `bind()` receives correct args. Test with empty updates returns `false`.
  7. **`cleanupOldRecords`**: Mock `run()` to return `{ meta: { changes: 5 } }`. Assert returns `5`.
  8. **`testDatabaseConnection`**: Mock successful query returns `true`. Mock thrown error returns `false`.

---

### Task ID: TSK-010
* **Target File(s) to Read:** `src/lib/api/utm-tracking.ts`
* **Target Test File to Create:** `tests/unit/api/utm-tracking.spec.ts`
* **Relevant Line Numbers:** Lines 34-332 (`UTMTracker` class), Lines 42-70 (`captureUTMParameters`), Lines 75-116 (`storeUTMParameters`), Lines 121-135 (`getStoredUTMParameters`), Lines 268-278 (`isAttributionExpired`), Lines 309-320 (`getUTMString`), Lines 325-331 (`appendUTMToUrl`)
* **Testing Strategy:** Browser-dependent utility class that uses `window.location`, `sessionStorage`, and `localStorage`. Requires `jsdom` environment in Vitest. The `astro:after-swap` event listener on line 344 ties this to View Transitions — must verify this contract survives the `ClientRouter` migration.
* **Execution Instructions:**
  1. Set Vitest environment to `jsdom` for this test file: `// @vitest-environment jsdom`.
  2. **`captureUTMParameters`**: Mock `window.location.search` with UTM params. Assert all 8 UTM fields are captured. Test with no params returns empty-ish object (only referrer/landing_page if present).
  3. **`storeUTMParameters`**: Call with params and assert `sessionStorage.setItem` and `localStorage.setItem` were called with `campaign_utm_params` key.
  4. **`getStoredUTMParameters`**: Set `sessionStorage` item and assert retrieval. Test fallback to `localStorage` when `sessionStorage` is empty.
  5. **`isAttributionExpired`**: (Private method — test indirectly via `storeUTMParameters`.) Store params with old timestamp (>30 days ago). Call `storeUTMParameters` with new params. Assert the new params override the old ones.
  6. **`getUTMString`**: Store params with `utm_source=google`. Assert output contains `utm_source=google`.
  7. **`appendUTMToUrl`**: Test with URL without query string adds `?`. Test with URL with existing query string adds `&`.
  8. **`clearUTMParameters`**: Call and assert all storage keys are removed.

---

## SECTION 3: API Route Tests (src/pages/api/)

---

### Task ID: TSK-011
* **Target File(s) to Read:** `src/pages/api/newsletter.ts`
* **Target Test File to Create:** `tests/unit/api/newsletter-route.spec.ts`
* **Relevant Line Numbers:** Lines 1-34 in `newsletter.ts`
* **Testing Strategy:** Test the POST handler of the newsletter API endpoint. This is a server-rendered endpoint (`prerender = false`) that uses `locals.runtime.env.DB` to insert into D1. The Cloudflare adapter upgrade (risk #4) could change the shape of `locals.runtime.env`. These tests capture the exact D1 access pattern.
* **Execution Instructions:**
  1. Import the `POST` export from the route file. Use the D1 mock factory from the boilerplate.
  2. Create a mock `Request` with `FormData` containing `subsemail: 'test@example.com'`.
  3. Create a mock `APIContext` with the D1 mock in `locals.runtime.env.DB`.
  4. Call `POST(mockContext)` and assert: response status 200, body contains `{ message: 'Submitted successfully' }`.
  5. Assert `DB.prepare` was called with the correct INSERT query containing `newsletter` table.
  6. Assert `DB.bind` was called with the email value.
  7. **Error case**: Set `locals.runtime.env.DB` to `undefined`. Assert response status 500, body contains `'Database not configured'`.
  8. **Validation case**: Send FormData with non-string email. Assert response status 400.

---

### Task ID: TSK-012
* **Target File(s) to Read:** `src/pages/api/leadform.ts`
* **Target Test File to Create:** `tests/unit/api/leadform-route.spec.ts`
* **Relevant Line Numbers:** Lines 1-37 in `leadform.ts`
* **Testing Strategy:** Similar to TSK-011 but with 4 required fields: `usrname`, `email`, `msg`, `ref`. Tests the D1 INSERT pattern for the `leads` table. Must verify the exact field binding order matches the SQL: `(?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)` = `(name, email, refer, message)`.
* **Execution Instructions:**
  1. Create FormData with all 4 fields: `usrname`, `email`, `msg`, `ref`.
  2. Call `POST` with full mock context. Assert status 200 and success response.
  3. Assert `DB.prepare` received the leads INSERT query.
  4. Assert `DB.bind` received args in order: `name, email, refer, message`.
  5. **Missing field test**: Omit `msg` field. Assert status 400 with `'Missing required fields'`.
  6. **No DB test**: Set `locals` to `{}`. Assert status 500 with `'Database not configured'`.

---

### Task ID: TSK-013
* **Target File(s) to Read:** `src/pages/api/resource-download.ts`, `src/lib/api/validation.ts`, `src/lib/api/security.ts`, `src/lib/api/database.ts`
* **Target Test File to Create:** `tests/unit/api/resource-download-route.spec.ts`
* **Relevant Line Numbers:** Lines 50-191 (POST handler), Lines 194-257 (GET handler) in `resource-download.ts`
* **Testing Strategy:** The most complex API route. It orchestrates security checks → validation → database insert → token generation. Tests must verify the full pipeline and each failure mode. This route imports from 3 other `src/lib/api/` modules — mock at the module level to isolate the route handler logic.
* **Execution Instructions:**
  1. Mock `@/lib/api/validation` module: `validateResourceForm` returns `{ isValid: true, sanitizedData: {...}, errors: [] }`.
  2. Mock `@/lib/api/security` module: `performSecurityChecks` returns `{ allowed: true }`.
  3. Mock `@/lib/api/database` module: `insertResourceDownload` returns `{ success: true, id: 1, isDuplicate: false }`.
  4. **Happy path POST**: Create valid FormData, call POST. Assert status 200, response contains `success: true`.
  5. **Security blocked**: Mock `performSecurityChecks` to return `{ allowed: false, reason: 'Rate limit', retryAfter: 900 }`. Assert status 429 with `Retry-After` header.
  6. **Validation failure**: Mock `validateResourceForm` to return `{ isValid: false, errors: [{field: 'email', message: 'Required', code: 'REQUIRED'}] }`. Assert status 400 with `validationErrors`.
  7. **Database failure**: Mock `insertResourceDownload` to return `{ success: false }`. Assert status 500.
  8. **No DB**: Set `locals.runtime.env.DB` to undefined. Assert status 500.
  9. **GET handler**: Mock `getDownloadStats` to return stats object. Call GET. Assert status 200 with data. Test query param parsing for `limit`, `resource`, `startDate`, `endDate`.

---

## SECTION 4: Component Logic Tests

---

### Task ID: TSK-014
* **Target File(s) to Read:** `src/components/Head.astro`, `src/lib/analytics.ts`
* **Target Test File to Create:** `tests/unit/components/head-logic.spec.ts`
* **Relevant Line Numbers:** Lines 71-96 (props destructuring and defaults), Lines 98-198 (schema generation logic with error handling), Lines 200-204 (analytics config initialization) in `Head.astro`
* **Testing Strategy:** The Head component's frontmatter contains complex logic that should be extracted and tested. Since we cannot import `.astro` files in Vitest, test the underlying functions it calls: `generatePageSchema`, `safeSchemaGeneration`, and `initializeAnalyticsConfig`. Focus on testing the exact data flow: mock props → schema options → generated schemas, verifying the error handling cascade (try/catch → safeSchemaGeneration fallback → minimal WebPage fallback).
* **Execution Instructions:**
  1. Test the schema options assembly: Given mock props matching the `Props` interface at Lines 45-69, verify the `PageSchemaOptions` object is correctly shaped (pageType defaults, author mapping, etc.).
  2. Test the error handling cascade: Mock `generatePageSchema` to throw. Assert `safeSchemaGeneration` catches it and returns fallback. Assert the fallback contains `@type: Article` when `article=true`.
  3. Test the final validation: When `pageSchemas` is empty array, assert the minimal fallback `{ @type: WebPage, @context: schema.org }` is produced.
  4. Test `initializeAnalyticsConfig` with a mock site config containing `analytics.ga4.measurementId` and `analytics.clarity.projectId`. Assert the returned `AnalyticsConfig` object has the correct shape (check `ga4.enabled`, `ga4.measurementId`, `ga4.anonymizeIp`, `clarity.enabled`, etc.).

---

### Task ID: TSK-015
* **Target File(s) to Read:** `src/components/Head.astro`
* **Target Test File to Create:** `tests/unit/components/head-analytics-reinit.spec.ts`
* **Relevant Line Numbers:** Lines 607-628 (astro:after-swap event handler for re-attaching tel: and mailto: click tracking)
* **Testing Strategy:** Test the client-side JavaScript that re-initializes analytics tracking after View Transitions page swaps. This script uses `document.addEventListener('astro:after-swap', ...)` which is THE critical migration point — Astro 6 replaces `<ViewTransitions />` with `<ClientRouter />`. The event name `astro:after-swap` should still fire with `ClientRouter`, but this test must verify the contract. Use `jsdom` environment.
* **Execution Instructions:**
  1. Set `// @vitest-environment jsdom`.
  2. Set up DOM with `<a href="tel:+911234567890">Call</a>` and `<a href="mailto:test@test.com">Email</a>` links.
  3. Create a mock `window.trackConversionEvent` function.
  4. Extract the event handler logic from Lines 607-628 into a callable function and execute it.
  5. Assert that after the handler runs, clicking the tel link calls `trackConversionEvent('phone_click', ...)`.
  6. Assert clicking the mailto link calls `trackConversionEvent('email_click', ...)`.
  7. Dispatch a custom `astro:after-swap` event and verify the handlers are re-attached.

---

### Task ID: TSK-016
* **Target File(s) to Read:** `src/components/FormattedDate.astro`
* **Target Test File to Create:** `tests/e2e/formatted-date.spec.ts`
* **Relevant Line Numbers:** Lines 1-6 in `FormattedDate.astro` (entire file — it's a small component)
* **Testing Strategy:** Playwright E2E test. The `FormattedDate` component renders a `<time>` element with a `datetime` attribute. Verify this renders correctly on a live page.
* **Execution Instructions:**
  1. Navigate to a known article page (e.g., `/articles/` index or a specific article).
  2. Assert that `<time>` elements exist on the page.
  3. Assert that `datetime` attributes contain valid ISO-ish date strings.
  4. Assert the visible text content of the time element is a human-readable date.

---

## SECTION 5: Layout & Page Integration Tests (Playwright E2E)

---

### Task ID: TSK-017
* **Target File(s) to Read:** `src/layouts/Layout.astro`, `src/components/Head.astro`
* **Target Test File to Create:** `tests/e2e/seo-metadata.spec.ts`
* **Relevant Line Numbers:** Layout.astro Lines 79-113 (HTML structure, Head inclusion), Head.astro Lines 208-310 (meta tags, canonical, OG, Twitter, PWA icons)
* **Testing Strategy:** Playwright E2E test to snapshot all SEO-critical HTML elements on key pages. The SEO preservation review explicitly requires (Section "Verification Strategy"): "Inspect the raw HTML of a detail page, index page, and the home page to ensure canonical URLs and JSON-LD schemas remain character-for-character identical." This test creates the v4 baseline.
* **Execution Instructions:**
  1. **Home page (`/`)**: Navigate. Assert `<title>` contains `'Meteoric Teachings'`. Assert `<meta name="description">` exists and has content. Assert `<link rel="canonical">` href equals `https://alokprateek.in/`. Assert `<meta property="og:type">` equals `website`. Assert `<meta property="og:url">` exists. Assert `<meta name="generator">` contains `Astro`. Assert at least one `<script type="application/ld+json">` exists.
  2. **Article page**: Navigate to any article. Assert `<meta property="og:type">` equals `article`. Assert `<link rel="canonical">` contains `/articles/`. Assert JSON-LD script exists with `@type: Article`.
  3. **Services page (`/services/`)**: Navigate. Assert page has JSON-LD schemas. Assert canonical URL is correct.
  4. Assert `<link rel="alternate" type="application/rss+xml">` exists on all pages with correct href.
  5. Assert `<meta name="viewport">` exists on all pages.

---

### Task ID: TSK-018
* **Target File(s) to Read:** `src/components/Head.astro`
* **Target Test File to Create:** `tests/e2e/json-ld-schema.spec.ts`
* **Relevant Line Numbers:** Head.astro Lines 312-351 (schema rendering reduce loop)
* **Testing Strategy:** Playwright E2E test that parses and validates all JSON-LD schemas emitted by the site. This is the primary defense against regression described in risk #6 (Schema and Metadata Regression). Capture exact schema output per page type.
* **Execution Instructions:**
  1. **Home page**: Navigate to `/`. Collect all `script[type="application/ld+json"]` elements. Parse each as JSON. Assert at least one has `@type: WebPage`. Assert at least one has `@type: LocalBusiness` (because `pageType: 'home'` and `includeLocalBusiness: true` on index.astro L42). Assert each schema has valid `@context: https://schema.org`.
  2. **Article page**: Navigate to a known article. Assert JSON-LD contains `@type: Article` with `author`, `publisher`, `dateModified`, `datePublished`. Assert `BreadcrumbList` schema is present with correct hierarchy.
  3. **Contact page**: Navigate to `/contact/`. Assert schemas are present and valid JSON.
  4. **Validate structure**: For each schema found, assert it has `@context` and `@type` fields (matching the validation in Head.astro Lines 133-137).
  5. Snapshot the JSON-LD output of 3 key pages (home, article, service) using `expect(schema).toMatchSnapshot()` to create a v4 baseline.

---

### Task ID: TSK-019
* **Target File(s) to Read:** `src/pages/rss.xml.js`
* **Target Test File to Create:** `tests/e2e/rss-feed.spec.ts`
* **Relevant Line Numbers:** Lines 1-45 in `rss.xml.js`
* **Testing Strategy:** Playwright E2E test to validate the RSS feed output. The SEO review (Section 4) identifies that `item.collection` and `item.slug` are used to generate RSS links — both are at risk of breaking in Astro 6's Content Layer. This test captures the exact XML structure.
* **Execution Instructions:**
  1. Use Playwright's `request.get('/rss.xml')` to fetch the RSS feed.
  2. Assert response status 200 and Content-Type includes `xml`.
  3. Parse the XML body (use a simple regex or DOMParser approach in the test).
  4. Assert `<title>` element contains `'Meteoric Teachings'`.
  5. Assert `<description>` element exists.
  6. Assert at least one `<item>` exists.
  7. For each `<item>`, assert `<link>` starts with `https://alokprateek.in/` and contains a valid collection prefix (articles/, notes/, works/, bibliophilediaries/, saasguide/).
  8. Assert `<pubDate>` exists in each item and is a valid date string.
  9. Assert no `<item>` has a link containing `/faqs/` or `/illustrations/` (these are excluded).

---

### Task ID: TSK-020
* **Target File(s) to Read:** `src/pages/articles/[...slug].astro`, `src/pages/articles/index.astro`
* **Target Test File to Create:** `tests/e2e/article-pages.spec.ts`
* **Relevant Line Numbers:** [...slug].astro Lines 15-23 (getStaticPaths, slug mapping), Lines 31 (post.render()), Lines 39-47 (Layout props), Lines 48-139 (article HTML structure)
* **Testing Strategy:** Playwright E2E test for article detail pages. The content collection review identifies `post.slug` (L20), `post.render()` (L31), and `remarkPluginFrontmatter` (L31) as migration-critical APIs. This test captures the rendered output structure.
* **Execution Instructions:**
  1. **Index page**: Navigate to `/articles/`. Assert page loads (status 200). Assert at least one article entry link exists. Assert each entry link's href starts with `/articles/`.
  2. **Detail page**: Navigate to the first article link found. Assert `<h1>` exists with the article title. Assert the `<article>` element has class `h-entry`. Assert `<time>` elements exist (dt-published or dt-updated). Assert reading time span exists if `remarkPluginFrontmatter.timeToRead` is populated. Assert `<div class="e-content">` exists (content body).
  3. **Post navigation**: Assert `PostNavigation` component renders prev/next links (if applicable — check for the navigation element).
  4. **Tags**: If the article has tags, assert tag links point to `/tag/{slugified-tag}/`.
  5. **Table of Contents**: Assert `<details>` element with summary "Table of contents" exists.

---

### Task ID: TSK-021
* **Target File(s) to Read:** `src/pages/index.astro`
* **Target Test File to Create:** `tests/e2e/home-page.spec.ts`
* **Relevant Line Numbers:** Lines 12-36 (collection fetching), Lines 108-121 (Entry rendering with node.collection and node.slug), Lines 144-218 (navigation entries)
* **Testing Strategy:** Playwright E2E test for the home page. This page uses `node.collection` and `node.slug` (L114) to build links, which are EXACTLY the properties at risk in Astro 6 Content Layer migration (content_collection_review.md §4). Snapshot the link structure.
* **Execution Instructions:**
  1. Navigate to `/`. Assert page loads with status 200.
  2. Assert `<h1>` contains "Automate Your Operations" (the heading text from L49).
  3. Assert "Recent posts" section exists with up to 6 entries.
  4. Assert "Featured articles" section exists with entries.
  5. For each Entry link in recent posts, assert the href follows the pattern `/{collection}/{slug}` (e.g., `/articles/some-post`, `/notes/some-note`).
  6. Assert the "Explore more" section contains links to `/services/`, `/articles/`, `/notes/`, `/works/`, `/contact/`, `/support/`, `/faqs/`, `/tag/`.
  7. Assert the CTA button "Book a free Automation Audit" links to `/contact/`.

---

### Task ID: TSK-022
* **Target File(s) to Read:** `src/pages/404.astro`
* **Target Test File to Create:** `tests/e2e/error-pages.spec.ts`
* **Relevant Line Numbers:** Lines 1-47 in `404.astro` (entire file)
* **Testing Strategy:** Playwright E2E test to verify 404 handling works correctly. During the Astro 6 migration, routing changes could affect which paths trigger the 404 page.
* **Execution Instructions:**
  1. Navigate to a non-existent URL like `/this-page-does-not-exist-12345/`.
  2. Assert the response status is 404.
  3. Assert the page contains a user-friendly "not found" message.
  4. Assert the Layout wrapper still renders (header, footer present).

---

## SECTION 6: View Transitions → ClientRouter Migration Tests

---

### Task ID: TSK-023
* **Target File(s) to Read:** `src/components/Head.astro`
* **Target Test File to Create:** `tests/migration/view-transitions.spec.ts`
* **Relevant Line Numbers:** Head.astro Line 4 (`import { ViewTransitions } from "astro:transitions"`), Line 310 (`<ViewTransitions />`), Lines 607-628 (`astro:after-swap` event handlers), Line 679 (`astro:after-swap` for copy code buttons)
* **Testing Strategy:** **Pre-migration baseline** Playwright E2E test. Verifies that `<ViewTransitions />` is present in the HTML and that client-side navigation (SPA-like transitions) work. After migration to `<ClientRouter />`, re-run this test to verify identical behavior. The risk inventory (§3) and SEO review (§1) both flag this as HIGH priority.
* **Execution Instructions:**
  1. Navigate to the home page `/`.
  2. Check the page source for the View Transitions meta tag or script injection (Astro's `<ViewTransitions />` adds specific `<meta>` and scripts).
  3. Click an internal link (e.g., "Articles" in nav). Assert navigation occurs WITHOUT a full page reload (check `window.__astro_transition` or similar Astro internal state, OR check that the page `beforeunload` event does NOT fire).
  4. After the SPA navigation, assert the new page content loaded correctly.
  5. **Post-navigation analytics**: After SPA navigation, assert that `trackConversionEvent` function is still available on `window` (re-attached by `astro:after-swap` handler).
  6. **Copy code buttons**: Navigate to an article with code blocks. After SPA navigation to another article, assert copy buttons are re-initialized.
  7. **[POST-MIGRATION]**: After replacing `ViewTransitions` with `ClientRouter`, re-run all above assertions. They must all pass identically.

---

### Task ID: TSK-024
* **Target File(s) to Read:** `src/components/Head.astro`, `src/lib/api/utm-tracking.ts`
* **Target Test File to Create:** `tests/migration/after-swap-events.spec.ts`
* **Relevant Line Numbers:** Head.astro Lines 607, 679 (`astro:after-swap`), utm-tracking.ts Line 344 (`astro:after-swap`)
* **Testing Strategy:** Playwright E2E test specifically for the `astro:after-swap` lifecycle event. Three separate scripts in the codebase listen for this event: (1) analytics re-attachment in Head.astro L607, (2) copy code button re-initialization in Head.astro L679, and (3) UTM tracker re-initialization in utm-tracking.ts L344. All three MUST continue to fire after the `ClientRouter` migration.
* **Execution Instructions:**
  1. Navigate to the home page.
  2. Inject a test listener: `page.evaluate(() => { window.__swapFired = false; document.addEventListener('astro:after-swap', () => { window.__swapFired = true; }); })`.
  3. Click an internal navigation link.
  4. Wait for navigation to complete.
  5. Assert `page.evaluate(() => window.__swapFired)` returns `true`.
  6. Assert `page.evaluate(() => typeof window.trackConversionEvent === 'function')` is `true` (analytics re-attached).
  7. Assert `page.evaluate(() => typeof window.trackEngagementEvent === 'function')` is `true`.
  8. If the target page has code blocks, assert copy code buttons exist.

---

## SECTION 7: Content Collections Migration Validation

---

### Task ID: TSK-025
* **Target File(s) to Read:** `src/content/config.ts`
* **Target Test File to Create:** `tests/migration/content-config.spec.ts`
* **Relevant Line Numbers:** Lines 1-158 in `config.ts` (all 8 collection definitions)
* **Testing Strategy:** Vitest test to validate the content collection configuration. Currently uses legacy `defineCollection` with `type: 'content'` pattern. In Astro 6, this must be migrated to use `glob()` or `file()` loaders. This test captures the current schema expectations so the migration can be verified.
* **Execution Instructions:**
  1. Mock `astro:content` module to expose `defineCollection` and `z` from Zod.
  2. Import the `collections` export from `src/content/config.ts`.
  3. Assert `collections` has exactly 8 keys: `articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `faqs`, `saasguide`, `albums`.
  4. For each content collection (articles, notes, works, illustrations, bibliophilediaries, saasguide): Assert the schema expects `title` (string), `path` (string), `date` (coerce.date), `last_modified_at` (coerce.date), `excerpt` (string), optional `draft` (boolean), optional `tags` (string array).
  5. For `faqs` collection: Assert it additionally requires `order` (number) and `excerpt` is optional.
  6. For `albums` collection: Assert it is `type: 'data'` and schema uses `image()` for `cover` field.
  7. **[POST-MIGRATION]**: After converting to `glob()` loaders, re-run. The exported `collections` object must still pass all assertions about field names and types.

---

### Task ID: TSK-026
* **Target File(s) to Read:** `src/pages/articles/[...slug].astro`, `src/pages/notes/[...slug].astro`, `src/pages/rss.xml.js`, `src/pages/index.astro`
* **Target Test File to Create:** `tests/migration/collection-api-surface.spec.ts`
* **Relevant Line Numbers:** articles/[...slug].astro Lines 16-23 (`getCollection`, `post.slug`, `getStaticPaths`), Line 31 (`post.render()`); rss.xml.js Lines 37-42 (`item.collection`, `item.slug`); index.astro Lines 114 (`node.collection`, `node.slug`)
* **Testing Strategy:** Playwright E2E test to verify that the Content Layer API surface produces the same output after migration. This is the most critical migration test — the content_collection_review.md warns that `entry.slug` may become `entry.id` and `entry.render()` API may change. This test captures the CURRENT output to use as a regression baseline.
* **Execution Instructions:**
  1. **Article paths**: Navigate to `/articles/`. Collect all article links. Assert each href matches pattern `/articles/{slug}/`. Store the list of slugs.
  2. **Article rendering**: Navigate to the first article. Assert `<article>` element exists. Assert `Content` component rendered (`.e-content` div has children). Assert `remarkPluginFrontmatter` data is used: reading time span exists, last modified time exists if applicable.
  3. **RSS link generation**: Fetch `/rss.xml`. Parse the item links. Assert they match `/{collection}/{slug}/` pattern. Cross-reference with the article slugs collected in step 1 — any article slug found in the article list should appear as `/articles/{slug}/` in the RSS.
  4. **Home page links**: Navigate to `/`. Collect all Entry links in "Recent posts" and "Featured articles". Assert each follows `/{collection}/{slug}` pattern.
  5. **Tag aggregation**: Navigate to `/tag/`. Assert tags are listed. Navigate to a specific tag page. Assert filtered posts are shown. Assert each post link follows the `/{collection}/{slug}` pattern.

---

### Task ID: TSK-027
* **Target File(s) to Read:** `src/env.d.ts`, `src/pages/api/newsletter.ts`, `src/pages/api/leadform.ts`, `wrangler.toml`
* **Target Test File to Create:** `tests/migration/d1-binding-integrity.spec.ts`
* **Relevant Line Numbers:** env.d.ts Lines 5-14 (D1Database type, ENV, Runtime, Locals), newsletter.ts Lines 9-16 (`locals.runtime.env.DB`), leadform.ts Lines 12-19 (same pattern), wrangler.toml Lines 3-6 (D1 binding config)
* **Testing Strategy:** Vitest test to validate the D1 binding access pattern survives the Cloudflare adapter upgrade. The risk inventory (§4) warns that `locals.runtime.env` structure could change. This test locks the TypeScript type contract and the runtime access pattern used by ALL 7 API routes.
* **Execution Instructions:**
  1. **Type contract test**: Create a mock object matching the `Runtime` type from `@astrojs/cloudflare`. Assert TypeScript accepts `locals.runtime.env.DB` access at the type level (this is a compile-time check — include a `.ts` file that would fail to compile if the type changes).
  2. **Access pattern test**: Create a mock `APIContext` with the nested `locals.runtime.env.DB` structure. Pass it to a function that mirrors the guard check in newsletter.ts Lines 9-14. Assert the function correctly identifies valid vs. missing DB configurations.
  3. **Guard check matrix**: Test the exact guard from the API routes: `!locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB`. Create 4 test cases where each level is undefined/null. Assert all 4 correctly trigger the error response.
  4. **D1 method chain test**: Using the D1 mock, assert the `DB.prepare(query).bind(args).run()` chain works. Assert `DB.prepare(query).bind(args).first()` works. Assert `DB.prepare(query).bind(args).all()` works. These are the 3 D1 patterns used across all API routes.
  5. **[POST-MIGRATION]**: After upgrading `@astrojs/cloudflare`, if the type changes from `import("@astrojs/cloudflare").Runtime<ENV>` to a new shape, this test immediately flags it.

---

## SECTION 8: Build & Configuration Validation

---

### Task ID: TSK-028
* **Target File(s) to Read:** `astro.config.mjs`, `postcss.config.cjs`, `tsconfig.json`
* **Target Test File to Create:** `tests/migration/build-config.spec.ts`
* **Relevant Line Numbers:** astro.config.mjs Lines 13-51 (entire config), specifically Line 17 (`syntaxHighlight: 'prism'`), Line 44 (`output: "hybrid"`), Lines 45-50 (cloudflare adapter config)
* **Testing Strategy:** Vitest test that imports and validates the Astro config structure. The risk inventory (§5) warns about Vite plugin ecosystem compatibility. This test captures the current config shape so that after the Astro 6 upgrade, any removed/renamed options are immediately caught.
* **Execution Instructions:**
  1. Import `astro.config.mjs` and extract the config object.
  2. Assert `config.site` equals `'https://alokprateek.in/'`.
  3. Assert `config.output` equals `'hybrid'` (Astro 6 may change this to `'server'` with different semantics).
  4. Assert `config.markdown.syntaxHighlight` equals `'prism'` (Astro 6 may change default to Shiki).
  5. Assert `config.markdown.remarkPlugins` has length 2 (remarkReadingTime, remarkModifiedTime).
  6. Assert `config.integrations` includes sitemap and mdx.
  7. Assert `config.vite.plugins` includes VitePWA.
  8. Assert `config.adapter` is the cloudflare adapter with `platformProxy.enabled: true` and `imageService: 'passthrough'`.

---

### Task ID: TSK-029
* **Target File(s) to Read:** `src/config/site.js`, `src/config/system.js`
* **Target Test File to Create:** `tests/unit/config/site-config.spec.ts`
* **Relevant Line Numbers:** site.js Lines 66-210 (entire config object), specifically Lines 72 (`url`), Lines 91-95 (`author`), Lines 99-136 (`analytics`)
* **Testing Strategy:** Unit test to validate the site configuration object's integrity. Many components depend on specific properties existing (e.g., `site.url`, `site.author.name`, `site.analytics.ga4.measurementId`). Any property removal during migration would cascade through schema generators, Head component, and analytics.
* **Execution Instructions:**
  1. Import `site` from `src/config/site.js`.
  2. Assert `site.url` equals `'https://alokprateek.in'` (no trailing slash).
  3. Assert `site.title` is a non-empty string.
  4. Assert `site.author.name` and `site.author.url` exist.
  5. Assert `site.image.src`, `site.image.width`, `site.image.height` exist.
  6. Assert `site.siteLanguage` equals `'en'`.
  7. Assert `site.analytics.ga4.measurementId` is a string matching `G-` prefix.
  8. Assert `site.analytics.clarity.projectId` is a non-empty string.
  9. Assert `site.analytics.privacy.anonymizeIp` is `true`.
  10. Assert `site.mainMenu` is an array with expected paths.
  11. Assert `site.footerMenu` is an array with expected paths.

---

## SECTION 9: Sitemap & Feed Validation

---

### Task ID: TSK-030
* **Target File(s) to Read:** `astro.config.mjs` (sitemap integration), `src/pages/rss.xml.js`
* **Target Test File to Create:** `tests/e2e/sitemap.spec.ts`
* **Relevant Line Numbers:** astro.config.mjs Line 15 (sitemap integration)
* **Testing Strategy:** Playwright E2E test for sitemap validation. The SEO review (§3) warns that Astro 6 routing changes could alter which routes appear in the sitemap. API endpoints (`/api/*`) must NOT appear. This test creates the v4 baseline.
* **Execution Instructions:**
  1. Fetch `/sitemap-index.xml` via Playwright request. Assert status 200.
  2. Parse the XML. Assert it contains at least one `<sitemap>` entry with a `<loc>` pointing to a `sitemap-*.xml` file.
  3. Fetch the first sitemap file. Assert it contains `<url>` entries.
  4. Assert NO url contains `/api/` paths (newsletter, leadform, resource-download, etc. must be excluded).
  5. Assert URLs for key pages exist: `/`, `/articles/`, `/notes/`, `/works/`, `/contact/`, `/about/`, `/services/`, `/faqs/`.
  6. Assert all URLs use the canonical domain `https://alokprateek.in`.
  7. Snapshot the complete list of sitemap URLs to detect any additions/removals during migration.

---

## SECTION 10: Testing Infrastructure Setup

---

### Task ID: TSK-031
* **Target File(s) to Read:** `package.json`, `tsconfig.json`
* **Target Test File to Create:** `vitest.config.ts`
* **Relevant Line Numbers:** package.json Lines 1-53, tsconfig.json Lines 1-8
* **Testing Strategy:** Create the Vitest configuration file. This is a prerequisite for all TSK-001 through TSK-029 tickets. The config must mirror the path aliases from `tsconfig.json` and handle both `.ts` and `.mjs` imports.
* **Execution Instructions:**
  1. Read `tsconfig.json` to identify path aliases (should match `@components`, `@lib`, `@config`, `@layouts`, `@styles`).
  2. Create `vitest.config.ts` with: `resolve.alias` mapping all tsconfig paths to `src/` subdirectories, `test.globals: true`, `test.include: ['tests/**/*.spec.ts']`, `test.coverage.provider: 'v8'`.
  3. Create `tests/setup.ts` with global mocks as described in the boilerplate section.
  4. Create `tests/mocks/d1.ts` with the `createMockD1` and `createMockAPIContext` factories.
  5. Add scripts to `package.json`: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:coverage": "vitest run --coverage"`.
  6. Note: Do NOT actually install packages — just create the configuration files. Package installation will be handled separately.

---

### Task ID: TSK-032
* **Target File(s) to Read:** `package.json`, `astro.config.mjs`
* **Target Test File to Create:** `playwright.config.ts`
* **Relevant Line Numbers:** package.json Lines 8-9 (dev script), astro.config.mjs Line 14 (site URL)
* **Testing Strategy:** Create the Playwright configuration file. This is a prerequisite for all E2E tickets (TSK-016 through TSK-030).
* **Execution Instructions:**
  1. Create `playwright.config.ts` with: `baseURL: 'http://localhost:4321'`, `webServer: { command: 'npm run dev', port: 4321, reuseExistingServer: !process.env.CI }`.
  2. Configure single `chromium` project for CI speed.
  3. Set `retries: process.env.CI ? 1 : 0`.
  4. Set `testDir: './tests/e2e'` and `testMatch: '**/*.spec.ts'`.
  5. Set `outputDir: 'tests/results'`.
  6. Add scripts to `package.json`: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.
  7. Create `tests/e2e/.gitkeep` to ensure the directory exists.

---

## Summary: Ticket Dependency Graph

```
TSK-031 (Vitest config) ──┬──→ TSK-001 through TSK-015 (all unit tests)
                          └──→ TSK-025, TSK-027, TSK-028, TSK-029 (migration unit tests)

TSK-032 (Playwright config) ──→ TSK-016 through TSK-024, TSK-026, TSK-030 (all E2E tests)

Critical Path for Migration Validation:
  TSK-025 (content config) + TSK-026 (API surface) + TSK-027 (D1 binding)
  → Run before AND after Astro 6 upgrade
  → Diff results to identify regressions

SEO Preservation (must pass identically before and after):
  TSK-017 (meta tags) + TSK-018 (JSON-LD) + TSK-019 (RSS) + TSK-030 (sitemap)

ClientRouter Migration (run before and after ViewTransitions → ClientRouter swap):
  TSK-023 (transitions baseline) + TSK-024 (after-swap events)
```

---

## Priority Order for Implementation

| Priority | Tickets | Rationale |
|----------|---------|-----------|
| **P0** | TSK-031, TSK-032 | Infrastructure setup — blocks everything else |
| **P1** | TSK-005, TSK-017, TSK-018 | SEO schema + metadata baseline — highest business risk |
| **P1** | TSK-025, TSK-026, TSK-027 | Content Layer + D1 migration validation — highest technical risk |
| **P2** | TSK-023, TSK-024 | ClientRouter migration validation |
| **P2** | TSK-001, TSK-002, TSK-003, TSK-004 | Core utility functions |
| **P2** | TSK-007, TSK-008, TSK-009 | API security/validation/database layer |
| **P3** | TSK-011, TSK-012, TSK-013 | API route handlers |
| **P3** | TSK-014, TSK-015 | Component logic tests |
| **P3** | TSK-019, TSK-020, TSK-021, TSK-030 | Page-level E2E tests |
| **P4** | TSK-006, TSK-010, TSK-016, TSK-022, TSK-028, TSK-029 | Lower-risk utilities and config |
