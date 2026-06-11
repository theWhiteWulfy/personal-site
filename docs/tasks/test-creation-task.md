# Test-Creation Task Queue

> **Prerequisites**: Read [`testing-guidelines.md`](./testing-guidelines.md) first. It contains mock usage rules, naming conventions, and architecture facts you will need.
> **Infrastructure**: `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, and all mocks in `tests/mocks/` are already created.
> **Install first**: Run `npm install` and `npx playwright install chromium` before executing any task.

---

## Priority Order

| Priority | Tickets | Rationale |
|----------|---------|-----------|
| **P1** | TSK-005, TSK-017, TSK-018 | SEO schema + metadata baseline — highest business risk |
| **P1** | TSK-025, TSK-026, TSK-027 | Content Layer + D1 migration validation — highest technical risk |
| **P2** | TSK-023, TSK-024 | ClientRouter migration validation |
| **P2** | TSK-001, TSK-002, TSK-003, TSK-004 | Core utility functions |
| **P2** | TSK-007, TSK-008, TSK-009 | API security/validation/database layer |
| **P3** | TSK-011, TSK-012, TSK-013 | API route handlers |
| **P3** | TSK-014, TSK-015 | Component logic tests |
| **P3** | TSK-019, TSK-020, TSK-021, TSK-030 | Page-level E2E tests |
| **P4** | TSK-006, TSK-010, TSK-016, TSK-022, TSK-028, TSK-029 | Lower-risk utilities and config |

---

## Dependency Graph

```
All Vitest tests depend on:  vitest.config.ts, tests/setup.ts, tests/mocks/*
All Playwright tests depend on: playwright.config.ts, running dev server (port 4321)

Critical Path for Migration Validation:
  TSK-025 (content config) + TSK-026 (API surface) + TSK-027 (D1 binding)
  → Run before AND after Astro 6 upgrade → Diff results to identify regressions

SEO Preservation (must pass identically before and after):
  TSK-017 (meta tags) + TSK-018 (JSON-LD) + TSK-019 (RSS) + TSK-030 (sitemap)

ClientRouter Migration (run before and after ViewTransitions → ClientRouter swap):
  TSK-023 (transitions baseline) + TSK-024 (after-swap events)
```

---

## SECTION 1: Utility & Helper Function Tests

---

### Task ID: TSK-001
* **Target File(s) to Read:** [`src/lib/slugify.mjs`](../../src/lib/slugify.mjs)
* **Target Test File to Create:** `tests/unit/lib/slugify.spec.ts`
* **Relevant Line Numbers:** Lines 7-14 (the `slugify` function)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 2](./testing-guidelines.md) — no special mocks needed, this is a pure function.
* **Testing Strategy:** Pure function unit test. The `slugify` function is used throughout the site for generating tag URLs (`src/pages/tag/[...slug].astro`) and article paths. Any regression here breaks all taxonomy routes. Test edge cases exhaustively since the Astro 6 Content Layer may change how slugs are consumed.
* **Execution Instructions:**
  1. Import `slugify` from `@lib/slugify.mjs`.
  2. Write assertions for standard cases: `"Hello World"` → `"hello-world"`.
  3. Write assertions for special characters: `"C++ Programming"` → `"c-programming"` (non-word chars stripped).
  4. Write assertions for multiple spaces: `"  spaced   out  "` → `"spaced-out"`.
  5. Write assertions for multiple dashes: `"test--case"` → `"test-case"`.
  6. Write assertions for leading/trailing dashes: `"-leading-"` → `"leading"`.
  7. Write assertions for dots and underscores (preserved): `"file.name_v2"` → `"file.name_v2"`.
  8. Write assertion for empty string input.
  9. Write assertion for numeric-only input: `"12345"` → `"12345"`.

---

### Task ID: TSK-002
* **Target File(s) to Read:** [`src/lib/utils.ts`](../../src/lib/utils.ts)
* **Target Test File to Create:** `tests/unit/lib/utils.spec.ts`
* **Relevant Line Numbers:** Lines 3-8 (`formatDate`), Lines 11-16 (`readingTime`), Lines 18-30 (`getAdjacentPosts`)
* **Guidelines Reference:** See [testing-guidelines.md §6](./testing-guidelines.md) — note that `getAdjacentPosts` uses `post.slug` which becomes `post.id` in Astro 6.
* **Testing Strategy:** Pure function unit tests. `readingTime` is used on the home page (`src/pages/index.astro` L115) to calculate reading time from raw HTML body content. `getAdjacentPosts` is used in every `[...slug].astro` page for post navigation.
* **Execution Instructions:**
  1. **`formatDate`**: Test with `new Date('2024-01-15')` and assert output matches `"01/15/2024"` format. Test with epoch date. Test with invalid date input.
  2. **`readingTime`**: Test with HTML string of known word count. `"<p>word </p>".repeat(180)` should return `"2 min read"` (180 words / 180 wpm + 1 = 2). Test with empty string. Test with deeply nested HTML tags.
  3. **`getAdjacentPosts`**: Create a mock array of 5 posts with `slug` property. Assert that for the middle post, `nextPost` and `prevPost` are correct. Assert that for the first post, `prevPost` is `undefined`. Assert that for the last post, `nextPost` is `undefined`. Assert that for a non-existent slug, both are `undefined`.

---

### Task ID: TSK-003
* **Target File(s) to Read:** [`src/lib/remark-reading-time.mjs`](../../src/lib/remark-reading-time.mjs)
* **Target Test File to Create:** `tests/unit/lib/remark-reading-time.spec.ts`
* **Relevant Line Numbers:** Lines 1-12
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 6](./testing-guidelines.md) — mock the DEPENDENCIES (`reading-time`, `mdast-util-to-string`), not the function under test.
* **Testing Strategy:** Test the remark plugin by invoking it with a mock AST tree and mock `file` object. This plugin injects `data.astro.frontmatter.timeToRead` which is read by every `[...slug].astro` page via `remarkPluginFrontmatter.timeToRead`.
* **Execution Instructions:**
  1. Mock the `reading-time` package to return a controlled value: `{ text: '5 min read' }`.
  2. Mock `mdast-util-to-string` to return a known string.
  3. Call `remarkReadingTime()` to get the transform function.
  4. Invoke the transform with a mock tree and a mock `{ data: { astro: { frontmatter: {} } } }` file object.
  5. Assert that `file.data.astro.frontmatter.timeToRead` equals `'5 min read'`.

---

### Task ID: TSK-004
* **Target File(s) to Read:** [`src/lib/remark-modified-time.mjs`](../../src/lib/remark-modified-time.mjs)
* **Target Test File to Create:** `tests/unit/lib/remark-modified-time.spec.ts`
* **Relevant Line Numbers:** Lines 1-9
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 6](./testing-guidelines.md) — mock `child_process.execSync`.
* **Testing Strategy:** Test the remark plugin that calls `execSync` to get git log timestamps. This plugin injects `data.astro.frontmatter.lastModified`, used in `src/pages/articles/[...slug].astro` L33.
* **Execution Instructions:**
  1. Mock `child_process` module: `vi.mock('child_process', () => ({ execSync: vi.fn() }))`.
  2. Configure `execSync` mock to return a Buffer or string like `'2024-06-01T12:00:00+05:30'`.
  3. Create a mock file object with `history: ['/path/to/test.md']` and `data: { astro: { frontmatter: {} } }`.
  4. Call `remarkModifiedTime()` and invoke the returned function.
  5. Assert `file.data.astro.frontmatter.lastModified` equals the mocked git timestamp string.
  6. Assert `execSync` was called with the correct git command format: `git log -1 --pretty="format:%cI" "/path/to/test.md"`.

---

### Task ID: TSK-005
* **Target File(s) to Read:** [`src/lib/schema-generators.ts`](../../src/lib/schema-generators.ts)
* **Target Test File to Create:** `tests/unit/lib/schema-generators.spec.ts`
* **Relevant Line Numbers:** L234-301 (`generateLocalBusinessSchema`), L308-341 (`generateServiceSchema`), L348-361 (`generateFAQPageSchema`), L368-379 (`generateBreadcrumbListSchema`), L387-404 (`generateBreadcrumbsFromPath`), L411-451 (`generatePersonSchema`), L462-472 (`safeSchemaGeneration`), L512-552 (`generateResourceSchema`), L559-606 (`generateCampaignSchema`), L614-682 (`generatePageSchema`)
* **Guidelines Reference:** See [testing-guidelines.md §6](./testing-guidelines.md) — these functions depend on `@config/site` and `@config/system.js`. The Vitest aliases resolve these, but you must mock both modules.
* **Testing Strategy:** JSON-LD Schema.org markup generators. The SEO preservation review identifies this as HIGH RISK. Tests must snapshot the exact schema structure. All functions depend on `@config/site` and `@config/system.js`.
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
  12. **`generatePageSchema`**: Test with `pageType: 'article'` — assert breadcrumbs + base Article schema. Test with `pageType: 'service'` — assert LocalBusiness + Service. Test with `pageType: 'home'` — assert LocalBusiness included. Test `includeBreadcrumbs: false` omits breadcrumbs. Test null filtering.

---

### Task ID: TSK-006
* **Target File(s) to Read:** [`src/lib/albums.ts`](../../src/lib/albums.ts)
* **Target Test File to Create:** `tests/unit/lib/albums.spec.ts`
* **Relevant Line Numbers:** Lines 1-20
* **Guidelines Reference:** See [testing-guidelines.md §5](./testing-guidelines.md) — `import.meta.glob` is a Vite-specific API that must be mocked.
* **Testing Strategy:** Test `getAlbumImages`. This function uses `import.meta.glob` which needs mocking. The `albums` collection is `type: 'data'` — Astro 6's Content Layer changes data collection handling.
* **Execution Instructions:**
  1. Mock `import.meta.glob` to return an object with 3 test keys like `{ '/src/content/albums/trip1/img1.jpg': mockResolver, '/src/content/albums/trip1/img2.jpg': mockResolver, '/src/content/albums/trip2/img3.jpg': mockResolver }`.
  2. Each mock resolver should be `() => Promise.resolve({ default: { src: '/img.jpg', width: 100, height: 100 } })`.
  3. Call `getAlbumImages('trip1')` and assert it returns exactly 2 images (filtered by albumId).
  4. Call `getAlbumImages('nonexistent')` and assert it returns an empty array.
  5. Note: Cannot test randomization deterministically — assert returned array length only.

---

## SECTION 2: API Utility Tests (`src/lib/api/`)

---

### Task ID: TSK-007
* **Target File(s) to Read:** [`src/lib/api/validation.ts`](../../src/lib/api/validation.ts)
* **Target Test File to Create:** `tests/unit/api/validation.spec.ts`
* **Relevant Line Numbers:** L35-44 (`sanitizeInput`), L49-77 (`validateEmail`), L82-115 (`validateRequiredField`), L120-142 (`validateResourceName`), L147-197 (`validateResourceForm`), L202-208 (`formatValidationErrors`)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 1](./testing-guidelines.md) — use `createMockFormData` from `tests/mocks/d1.ts` for FormData construction.
* **Testing Strategy:** Pure function tests for the form validation layer. These functions use `sanitize-html` — use the real package (it's in `dependencies`).
* **Execution Instructions:**
  1. **`sanitizeInput`**: Test HTML stripping: `'<script>alert("xss")</script>test'` → `'test'`. Test max length truncation at 500 chars. Test non-string input returns `''`. Test whitespace trimming.
  2. **`validateEmail`**: Test valid email returns `null`. Test empty email returns error with code `REQUIRED`. Test too-long email (>254 chars) returns `TOO_LONG`. Test invalid format returns `INVALID_FORMAT`.
  3. **`validateRequiredField`**: Test empty value → `REQUIRED`. Test below minLength → `TOO_SHORT`. Test above maxLength → `TOO_LONG`. Test valid value → `null`.
  4. **`validateResourceName`**: Test valid name → `null`. Test empty → `REQUIRED`. Test special characters → `INVALID_FORMAT`.
  5. **`validateResourceForm`**: Create a mock `FormData` with all 5 fields. Test valid submission returns `isValid: true` with `sanitizedData`. Test missing email returns `isValid: false`. Test multiple errors.
  6. **`formatValidationErrors`**: Test single error returns just the message. Test multiple errors returns comma-joined message.

---

### Task ID: TSK-008
* **Target File(s) to Read:** [`src/lib/api/security.ts`](../../src/lib/api/security.ts)
* **Target Test File to Create:** `tests/unit/api/security.spec.ts`
* **Relevant Line Numbers:** L11-24 (SPAM_PATTERNS), L27-33 (SPAM_DOMAINS), L47-105 (`checkRateLimit`), L110-154 (`detectSpamContent`), L159-171 (`checkHoneypot`), L176-206 (`performSecurityChecks`), L211-236 (`generateCaptcha`), L241-243 (`verifyCaptcha`)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 1](./testing-guidelines.md) — use `createMockD1()` for `checkRateLimit`.
* **Testing Strategy:** Security utility functions. `checkRateLimit` requires a mock D1 database. `detectSpamContent` and `checkHoneypot` are pure functions. These tests are critical because the Cloudflare adapter upgrade could change the D1 binding structure.
* **Execution Instructions:**
  1. **`detectSpamContent`**: Test clean content → `{ allowed: true }`. Test spam patterns (e.g., `'buy viagra now'`) → `{ allowed: false }`. Test spam email domain → blocked. Test long content (>1000 chars) → blocked. Test repetitive content → blocked.
  2. **`checkHoneypot`**: Create a mock `FormData`. Empty honeypot fields → `{ allowed: true }`. Filled `website` field → `{ allowed: false }`.
  3. **`checkRateLimit`**: Use `createMockD1()`. Mock `first()` to return `{ request_count: 6 }` (above threshold) → `{ allowed: false }`. Mock below threshold → `{ allowed: true }`. Test email-based limiting.
  4. **`generateCaptcha`**: Assert returns `{ challenge, answer }`. Assert answer is a valid number. Run 10 times and assert variance.
  5. **`verifyCaptcha`**: Test matching → `true`. Non-matching → `false`. Whitespace trimming.
  6. **`performSecurityChecks`**: Integration test combining all three. Verify honeypot checked first (fails fast). Spam check runs second. Rate limit last.

---

### Task ID: TSK-009
* **Target File(s) to Read:** [`src/lib/api/database.ts`](../../src/lib/api/database.ts)
* **Target Test File to Create:** `tests/unit/api/database.spec.ts`
* **Relevant Line Numbers:** L40-44 (`validateDatabaseConnection`), L49-111 (`insertResourceDownload`), L116-192 (`getDownloadStats`), L197-215 (`getDownloadById`), L220-245 (`getDownloadsByEmail`), L250-280 (`updateDownloadRecord`), L285-307 (`cleanupOldRecords`), L312-326 (`testDatabaseConnection`)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 1](./testing-guidelines.md) — use `createMockD1()`. See [testing-guidelines.md §6](./testing-guidelines.md) for the D1 method chain pattern.
* **Testing Strategy:** Database operations layer wrapping D1 queries. ALL functions take `DB` as first parameter. This module is the MOST CRITICAL for migration — risk #4 (Cloudflare adapter) could change how the D1 chain works.
* **Execution Instructions:**
  1. **`validateDatabaseConnection`**: `null` throws Error. Truthy object does not throw.
  2. **`insertResourceDownload`**: Mock `first()` → `null` (no duplicate), then `run()` → success. Assert `{ success: true, isDuplicate: false }`. Mock `first()` → `{ id: 42 }` (duplicate). Assert `{ success: true, isDuplicate: true, id: 42 }`. Test error handling.
  3. **`getDownloadStats`**: Mock all 4 queries. Assert returned shape: `{ totalDownloads, uniqueUsers, resourceBreakdown, recentDownloads }`. Test `dateRange` and `resourceFilter` options.
  4. **`getDownloadById`**: Mock `first()` → record or `null`.
  5. **`getDownloadsByEmail`**: Mock `all()` → results array.
  6. **`updateDownloadRecord`**: Test with valid updates. Test empty updates returns `false`.
  7. **`cleanupOldRecords`**: Mock `run()` → `{ meta: { changes: 5 } }`. Assert returns `5`.
  8. **`testDatabaseConnection`**: Success → `true`. Error → `false`.

---

### Task ID: TSK-010
* **Target File(s) to Read:** [`src/lib/api/utm-tracking.ts`](../../src/lib/api/utm-tracking.ts)
* **Target Test File to Create:** `tests/unit/api/utm-tracking.spec.ts`
* **Relevant Line Numbers:** L34-332 (`UTMTracker` class), L42-70 (`captureUTMParameters`), L75-116 (`storeUTMParameters`), L121-135 (`getStoredUTMParameters`), L268-278 (`isAttributionExpired`), L309-320 (`getUTMString`), L325-331 (`appendUTMToUrl`)
* **Guidelines Reference:** This test requires `// @vitest-environment jsdom` at the top. See [testing-guidelines.md §2](./testing-guidelines.md).
* **Testing Strategy:** Browser-dependent utility class using `window.location`, `sessionStorage`, `localStorage`. The `astro:after-swap` listener on L344 ties this to View Transitions.
* **Execution Instructions:**
  1. Add `// @vitest-environment jsdom` at the top of the test file.
  2. **`captureUTMParameters`**: Mock `window.location.search` with UTM params. Assert all 8 UTM fields captured. Test with no params returns sparse object.
  3. **`storeUTMParameters`**: Call with params, assert `sessionStorage.setItem` and `localStorage.setItem` called with `campaign_utm_params` key.
  4. **`getStoredUTMParameters`**: Set `sessionStorage` item, assert retrieval. Test fallback to `localStorage`.
  5. **`isAttributionExpired`**: Test indirectly via `storeUTMParameters` with old timestamp (>30 days) — new params should override.
  6. **`getUTMString`**: Store params with `utm_source=google`. Assert output contains `utm_source=google`.
  7. **`appendUTMToUrl`**: Test URL without query string adds `?`. Test URL with existing query string adds `&`.
  8. **`clearUTMParameters`**: Call and assert all storage keys removed.

---

## SECTION 3: API Route Tests (`src/pages/api/`)

---

### Task ID: TSK-011
* **Target File(s) to Read:** [`src/pages/api/newsletter.ts`](../../src/pages/api/newsletter.ts)
* **Target Test File to Create:** `tests/unit/api/newsletter-route.spec.ts`
* **Relevant Line Numbers:** Lines 1-34
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 1](./testing-guidelines.md) — use `createMockAPIContext` and `createMockAPIContextNoDB`. See [testing-guidelines.md §6](./testing-guidelines.md) for the D1 access pattern.
* **Testing Strategy:** Test the POST handler. This endpoint uses `locals.runtime.env.DB` to insert into D1. The Cloudflare adapter upgrade could change the shape of `locals.runtime.env`.
* **Execution Instructions:**
  1. Import the `POST` export from the route file. Use `createMockAPIContext`.
  2. Create a mock `Request` with `FormData` containing `subsemail: 'test@example.com'`.
  3. Call `POST(mockContext)` and assert: response status 200, body contains `{ message: 'Submitted successfully' }`.
  4. Assert `DB.prepare` was called with INSERT query for `newsletter` table.
  5. Assert `DB.bind` was called with the email value.
  6. **Error case**: Use `createMockAPIContextNoDB()`. Assert response status 500, body contains `'Database not configured'`.
  7. **Validation case**: Send FormData with non-string email. Assert response status 400.

---

### Task ID: TSK-012
* **Target File(s) to Read:** [`src/pages/api/leadform.ts`](../../src/pages/api/leadform.ts)
* **Target Test File to Create:** `tests/unit/api/leadform-route.spec.ts`
* **Relevant Line Numbers:** Lines 1-37
* **Guidelines Reference:** Same as TSK-011.
* **Testing Strategy:** Similar to TSK-011 but with 4 required fields: `usrname`, `email`, `msg`, `ref`. Tests the D1 INSERT for the `leads` table. Verify binding order: `(?1, ?2, ?3, ?4)` = `(name, email, refer, message)`.
* **Execution Instructions:**
  1. Create FormData with all 4 fields: `usrname`, `email`, `msg`, `ref`.
  2. Call `POST` with full mock context. Assert status 200 and success.
  3. Assert `DB.prepare` received the leads INSERT query.
  4. Assert `DB.bind` received args in order: `name, email, refer, message`.
  5. **Missing field test**: Omit `msg`. Assert status 400 with `'Missing required fields'`.
  6. **No DB test**: Use `createMockAPIContextNoDB()`. Assert status 500.

---

### Task ID: TSK-013
* **Target File(s) to Read:** [`src/pages/api/resource-download.ts`](../../src/pages/api/resource-download.ts), [`src/lib/api/validation.ts`](../../src/lib/api/validation.ts), [`src/lib/api/security.ts`](../../src/lib/api/security.ts), [`src/lib/api/database.ts`](../../src/lib/api/database.ts)
* **Target Test File to Create:** `tests/unit/api/resource-download-route.spec.ts`
* **Relevant Line Numbers:** L50-191 (POST handler), L194-257 (GET handler)
* **Guidelines Reference:** Mock the three imported `@/lib/api/` modules at the module level. See [testing-guidelines.md §5](./testing-guidelines.md).
* **Testing Strategy:** Most complex API route. Orchestrates security → validation → DB insert → token generation. Tests must verify the full pipeline and each failure mode.
* **Execution Instructions:**
  1. Mock `@/lib/api/validation`: `validateResourceForm` → `{ isValid: true, sanitizedData: {...}, errors: [] }`.
  2. Mock `@/lib/api/security`: `performSecurityChecks` → `{ allowed: true }`.
  3. Mock `@/lib/api/database`: `insertResourceDownload` → `{ success: true, id: 1, isDuplicate: false }`.
  4. **Happy path POST**: Valid FormData → status 200, `success: true`.
  5. **Security blocked**: Mock → `{ allowed: false, reason: 'Rate limit', retryAfter: 900 }`. Assert status 429 with `Retry-After` header.
  6. **Validation failure**: Mock → `{ isValid: false, errors: [...] }`. Assert status 400 with `validationErrors`.
  7. **Database failure**: Mock → `{ success: false }`. Assert status 500.
  8. **No DB**: `createMockAPIContextNoDB()` → status 500.
  9. **GET handler**: Mock `getDownloadStats`. Call GET. Assert status 200 with data. Test query param parsing.

---

## SECTION 4: Component Logic Tests

---

### Task ID: TSK-014
* **Target File(s) to Read:** [`src/components/Head.astro`](../../src/components/Head.astro), [`src/lib/analytics.ts`](../../src/lib/analytics.ts)
* **Target Test File to Create:** `tests/unit/components/head-logic.spec.ts`
* **Relevant Line Numbers:** Head.astro L71-96 (props/defaults), L98-198 (schema generation with error handling), L200-204 (analytics config)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 3](./testing-guidelines.md) — do NOT import `.astro` files. Test the functions Head.astro CALLS.
* **Testing Strategy:** Test the underlying functions: `generatePageSchema`, `safeSchemaGeneration`, `initializeAnalyticsConfig`. Focus on the error handling cascade.
* **Execution Instructions:**
  1. Test schema options assembly: Given mock props matching the `Props` interface at L45-69, verify `PageSchemaOptions` is correctly shaped.
  2. Test error handling: Mock `generatePageSchema` to throw. Assert `safeSchemaGeneration` catches and returns fallback with `@type: Article` when `article=true`.
  3. Test final validation: When `pageSchemas` is empty, assert minimal `{ @type: WebPage, @context: schema.org }` fallback.
  4. Test `initializeAnalyticsConfig` with mock site config. Assert returned `AnalyticsConfig` has correct shape (`ga4.enabled`, `ga4.measurementId`, `clarity.enabled`, etc.).

---

### Task ID: TSK-015
* **Target File(s) to Read:** [`src/components/Head.astro`](../../src/components/Head.astro)
* **Target Test File to Create:** `tests/unit/components/head-analytics-reinit.spec.ts`
* **Relevant Line Numbers:** L607-628 (`astro:after-swap` handler for tel/mailto click re-attachment)
* **Guidelines Reference:** Add `// @vitest-environment jsdom` at top. See [testing-guidelines.md §2](./testing-guidelines.md).
* **Testing Strategy:** Test the client-side JS that re-initializes analytics tracking after View Transitions page swaps. This is THE critical migration point — Astro 6 replaces `<ViewTransitions />` with `<ClientRouter />`.
* **Execution Instructions:**
  1. Set `// @vitest-environment jsdom`.
  2. Set up DOM with `<a href="tel:+911234567890">Call</a>` and `<a href="mailto:test@test.com">Email</a>`.
  3. Create mock `window.trackConversionEvent`.
  4. Extract the handler logic from L607-628 into a callable function and execute it.
  5. Assert clicking tel link calls `trackConversionEvent('phone_click', ...)`.
  6. Assert clicking mailto link calls `trackConversionEvent('email_click', ...)`.
  7. Dispatch `astro:after-swap` event and verify handlers re-attach.

---

## SECTION 5: E2E Page Tests (Playwright)

---

### Task ID: TSK-016
* **Target File(s) to Read:** [`src/components/FormattedDate.astro`](../../src/components/FormattedDate.astro)
* **Target Test File to Create:** `tests/e2e/formatted-date.spec.ts`
* **Relevant Line Numbers:** Lines 1-6
* **Guidelines Reference:** This is a Playwright test — see [testing-guidelines.md §2](./testing-guidelines.md) for how to run E2E tests.
* **Testing Strategy:** Playwright E2E test. Verify `<time>` elements render correctly with valid `datetime` attributes.
* **Execution Instructions:**
  1. Navigate to a known article page.
  2. Assert `<time>` elements exist.
  3. Assert `datetime` attributes contain valid date strings.
  4. Assert visible text is a human-readable date.

---

### Task ID: TSK-017
* **Target File(s) to Read:** [`src/layouts/Layout.astro`](../../src/layouts/Layout.astro), [`src/components/Head.astro`](../../src/components/Head.astro)
* **Target Test File to Create:** `tests/e2e/seo-metadata.spec.ts`
* **Relevant Line Numbers:** Layout.astro L79-113, Head.astro L208-310
* **Guidelines Reference:** The SEO preservation review ([`docs/seo_analytics_preservation_review.md`](../seo_analytics_preservation_review.md)) explicitly requires diffing these elements before and after migration.
* **Testing Strategy:** Playwright E2E test to snapshot all SEO-critical HTML elements. This creates the v4 baseline.
* **Execution Instructions:**
  1. **Home page (`/`)**: Assert `<title>` contains `'Meteoric Teachings'`. Assert `<meta name="description">` exists. Assert `<link rel="canonical">` href equals `https://alokprateek.in/`. Assert `<meta property="og:type">` = `website`. Assert `<meta name="generator">` contains `Astro`. Assert `<script type="application/ld+json">` exists.
  2. **Article page**: Assert `<meta property="og:type">` = `article`. Assert canonical contains `/articles/`. Assert JSON-LD `@type: Article`.
  3. **Services page**: Assert JSON-LD schemas exist. Assert canonical URL correct.
  4. Assert `<link rel="alternate" type="application/rss+xml">` exists on all pages.
  5. Assert `<meta name="viewport">` exists on all pages.

---

### Task ID: TSK-018
* **Target File(s) to Read:** [`src/components/Head.astro`](../../src/components/Head.astro)
* **Target Test File to Create:** `tests/e2e/json-ld-schema.spec.ts`
* **Relevant Line Numbers:** L312-351 (schema rendering loop)
* **Guidelines Reference:** See [`docs/seo_analytics_preservation_review.md`](../seo_analytics_preservation_review.md) §2 for schema regression risks.
* **Testing Strategy:** Playwright E2E test parsing and validating all JSON-LD schemas. Primary defense against risk #6 (Schema and Metadata Regression). Capture exact output per page type.
* **Execution Instructions:**
  1. **Home page (`/`)**: Collect all `script[type="application/ld+json"]`. Parse as JSON. Assert `@type: WebPage` and `@type: LocalBusiness` present. Assert valid `@context: https://schema.org`.
  2. **Article page**: Assert `@type: Article` with `author`, `publisher`, `dateModified`, `datePublished`. Assert `BreadcrumbList` present.
  3. **Contact page**: Assert schemas present and valid JSON.
  4. Validate each schema has `@context` and `@type` fields.
  5. **Snapshot** the JSON-LD of 3 key pages using `expect(schema).toMatchSnapshot()`.

---

### Task ID: TSK-019
* **Target File(s) to Read:** [`src/pages/rss.xml.js`](../../src/pages/rss.xml.js)
* **Target Test File to Create:** `tests/e2e/rss-feed.spec.ts`
* **Relevant Line Numbers:** Lines 1-45
* **Guidelines Reference:** RSS uses `item.collection` and `item.slug` — both at risk in Astro 6 (see [`docs/content_collection_review.md`](../content_collection_review.md) §4).
* **Testing Strategy:** Playwright E2E test to validate RSS feed XML structure.
* **Execution Instructions:**
  1. Fetch `/rss.xml` via `request.get()`. Assert status 200 and Content-Type includes `xml`.
  2. Assert `<title>` contains `'Meteoric Teachings'`.
  3. Assert `<description>` exists.
  4. Assert at least one `<item>` exists.
  5. For each `<item>`, assert `<link>` contains a valid collection prefix (articles/, notes/, works/, bibliophilediaries/, saasguide/).
  6. Assert `<pubDate>` exists with valid date.
  7. Assert NO item link contains `/faqs/` or `/illustrations/`.

---

### Task ID: TSK-020
* **Target File(s) to Read:** [`src/pages/articles/[...slug].astro`](../../src/pages/articles/%5B...slug%5D.astro), [`src/pages/articles/index.astro`](../../src/pages/articles/index.astro)
* **Target Test File to Create:** `tests/e2e/article-pages.spec.ts`
* **Relevant Line Numbers:** [...slug].astro L15-23, L31, L39-47, L48-139
* **Guidelines Reference:** See [`docs/content_collection_review.md`](../content_collection_review.md) — `post.slug` (L20), `post.render()` (L31), `remarkPluginFrontmatter` (L31) are migration-critical APIs.
* **Testing Strategy:** Playwright E2E test for article pages. Captures rendered output structure.
* **Execution Instructions:**
  1. **Index**: Navigate to `/articles/`. Assert at least one article entry link exists. Assert hrefs start with `/articles/`.
  2. **Detail**: Navigate to first article. Assert `<h1>` exists. Assert `.h-entry` article class. Assert `<time>` elements exist. Assert `.e-content` div has children.
  3. **Post navigation**: Assert prev/next links render (if applicable).
  4. **Tags**: Assert tag links point to `/tag/{slugified-tag}/`.
  5. **Table of Contents**: Assert `<details>` with "Table of contents" summary exists.

---

### Task ID: TSK-021
* **Target File(s) to Read:** [`src/pages/index.astro`](../../src/pages/index.astro)
* **Target Test File to Create:** `tests/e2e/home-page.spec.ts`
* **Relevant Line Numbers:** L12-36 (collection fetching), L108-121 (Entry with `node.collection`/`node.slug`), L144-218 (nav entries)
* **Guidelines Reference:** `node.collection` and `node.slug` (L114) are EXACTLY the properties at risk — see [`docs/content_collection_review.md`](../content_collection_review.md).
* **Testing Strategy:** Playwright E2E test for the home page. Snapshot the link structure.
* **Execution Instructions:**
  1. Navigate to `/`. Assert status 200.
  2. Assert `<h1>` contains "Automate Your Operations".
  3. Assert "Recent posts" section with up to 6 entries.
  4. Assert "Featured articles" section with entries.
  5. Assert Entry links follow `/{collection}/{slug}` pattern.
  6. Assert "Explore more" section contains links to `/services/`, `/articles/`, `/notes/`, `/works/`, `/contact/`, `/support/`, `/faqs/`, `/tag/`.
  7. Assert CTA button links to `/contact/`.

---

### Task ID: TSK-022
* **Target File(s) to Read:** [`src/pages/404.astro`](../../src/pages/404.astro)
* **Target Test File to Create:** `tests/e2e/error-pages.spec.ts`
* **Relevant Line Numbers:** Lines 1-47
* **Testing Strategy:** Playwright E2E test for 404 handling.
* **Execution Instructions:**
  1. Navigate to `/this-page-does-not-exist-12345/`.
  2. Assert response status 404.
  3. Assert user-friendly "not found" message.
  4. Assert Layout wrapper renders (header, footer present).

---

## SECTION 6: View Transitions → ClientRouter Migration Tests

---

### Task ID: TSK-023
* **Target File(s) to Read:** [`src/components/Head.astro`](../../src/components/Head.astro)
* **Target Test File to Create:** `tests/migration/view-transitions.spec.ts`
* **Relevant Line Numbers:** Head.astro L4 (import), L310 (`<ViewTransitions />`), L607-628 (`astro:after-swap`), L679 (`astro:after-swap` for copy code)
* **Guidelines Reference:** Risk inventory §3 and SEO review §1 flag this as HIGH priority. See [testing-guidelines.md §6](./testing-guidelines.md) for transition event names.
* **Testing Strategy:** **Pre-migration baseline** Playwright E2E test. Verifies View Transitions presence and SPA navigation. After migration to `ClientRouter`, re-run to verify identical behavior.
* **Execution Instructions:**
  1. Navigate to `/`.
  2. Check page source for View Transitions meta/scripts.
  3. Click an internal link. Assert navigation occurs WITHOUT full page reload.
  4. Assert new page content loaded correctly.
  5. After SPA navigation, assert `trackConversionEvent` is still available on `window`.
  6. Navigate to an article with code blocks. After SPA navigation to another, assert copy buttons re-initialize.
  7. **[POST-MIGRATION]**: Re-run all — must pass identically.

---

### Task ID: TSK-024
* **Target File(s) to Read:** [`src/components/Head.astro`](../../src/components/Head.astro), [`src/lib/api/utm-tracking.ts`](../../src/lib/api/utm-tracking.ts)
* **Target Test File to Create:** `tests/migration/after-swap-events.spec.ts`
* **Relevant Line Numbers:** Head.astro L607, L679; utm-tracking.ts L344
* **Guidelines Reference:** Three separate scripts listen for `astro:after-swap`. All three MUST continue to fire after the `ClientRouter` migration.
* **Testing Strategy:** Playwright E2E test specifically for `astro:after-swap` lifecycle event.
* **Execution Instructions:**
  1. Navigate to home page.
  2. Inject test listener: `page.evaluate(() => { window.__swapFired = false; document.addEventListener('astro:after-swap', () => { window.__swapFired = true; }); })`.
  3. Click an internal navigation link.
  4. Wait for navigation.
  5. Assert `window.__swapFired` is `true`.
  6. Assert `window.trackConversionEvent` is a function.
  7. Assert `window.trackEngagementEvent` is a function.
  8. If target page has code blocks, assert copy buttons exist.

---

## SECTION 7: Content Collections Migration Validation

---

### Task ID: TSK-025
* **Target File(s) to Read:** [`src/content/config.ts`](../../src/content/config.ts)
* **Target Test File to Create:** `tests/migration/content-config.spec.ts`
* **Relevant Line Numbers:** Lines 1-158 (all 8 collection definitions)
* **Guidelines Reference:** See [testing-guidelines.md §5 Rule 2](./testing-guidelines.md) — `astro:content` is pre-mocked via `tests/mocks/astro-content.ts`.
* **Testing Strategy:** Vitest test validating content collection configuration. Captures current schema expectations for migration verification.
* **Execution Instructions:**
  1. Import `collections` from `src/content/config.ts`.
  2. Assert `collections` has 8 keys: `articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `faqs`, `saasguide`, `albums`.
  3. For content collections: Assert schema expects `title` (string), `path` (string), `date` (coerce.date), `last_modified_at` (coerce.date), `excerpt` (string), optional `draft` (boolean), optional `tags` (string array).
  4. For `faqs`: Assert `order` (number) required and `excerpt` optional.
  5. For `albums`: Assert `type: 'data'` and schema uses `image()` for `cover`.
  6. **[POST-MIGRATION]**: After converting to `glob()` loaders, re-run.

---

### Task ID: TSK-026
* **Target File(s) to Read:** [`src/pages/articles/[...slug].astro`](../../src/pages/articles/%5B...slug%5D.astro), [`src/pages/rss.xml.js`](../../src/pages/rss.xml.js), [`src/pages/index.astro`](../../src/pages/index.astro)
* **Target Test File to Create:** `tests/migration/collection-api-surface.spec.ts`
* **Relevant Line Numbers:** articles/[...slug].astro L16-23; rss.xml.js L37-42; index.astro L114
* **Guidelines Reference:** See [`docs/content_collection_review.md`](../content_collection_review.md) — `entry.slug` may become `entry.id`, `entry.render()` changes to `render(entry)`.
* **Testing Strategy:** Playwright E2E test verifying Content Layer API surface produces same output after migration. MOST critical migration test.
* **Execution Instructions:**
  1. **Article paths**: Navigate to `/articles/`. Collect all links. Assert each matches `/articles/{slug}/`.
  2. **Article rendering**: Navigate to first article. Assert `<article>`, `.e-content`, reading time, last modified.
  3. **RSS links**: Fetch `/rss.xml`. Assert item links match `/{collection}/{slug}/`. Cross-reference with article list.
  4. **Home page links**: Navigate to `/`. Assert Entry links follow `/{collection}/{slug}` pattern.
  5. **Tag aggregation**: Navigate to `/tag/`. Assert tags listed. Navigate to specific tag. Assert filtered posts shown with correct link patterns.

---

### Task ID: TSK-027
* **Target File(s) to Read:** [`src/env.d.ts`](../../src/env.d.ts), [`src/pages/api/newsletter.ts`](../../src/pages/api/newsletter.ts), [`src/pages/api/leadform.ts`](../../src/pages/api/leadform.ts), [`wrangler.toml`](../../wrangler.toml)
* **Target Test File to Create:** `tests/migration/d1-binding-integrity.spec.ts`
* **Relevant Line Numbers:** env.d.ts L5-14; newsletter.ts L9-16; leadform.ts L12-19; wrangler.toml L3-6
* **Guidelines Reference:** See [testing-guidelines.md §6](./testing-guidelines.md) for D1 access pattern and binding structure. Risk inventory §4.
* **Testing Strategy:** Vitest test validating D1 binding access pattern survives Cloudflare adapter upgrade.
* **Execution Instructions:**
  1. **Access pattern test**: Create mock `APIContext` with `locals.runtime.env.DB`. Test the guard: `!locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB`. Create 4 cases where each level is undefined.
  2. **D1 method chain test**: Using `createMockD1()`, assert `DB.prepare(query).bind(args).run()` works. Assert `.first()` works. Assert `.all()` works.
  3. **[POST-MIGRATION]**: After upgrading `@astrojs/cloudflare`, if type changes from `Runtime<ENV>`, this test flags it.

---

## SECTION 8: Build & Configuration Validation

---

### Task ID: TSK-028
* **Target File(s) to Read:** [`astro.config.mjs`](../../astro.config.mjs), [`postcss.config.cjs`](../../postcss.config.cjs), [`tsconfig.json`](../../tsconfig.json)
* **Target Test File to Create:** `tests/migration/build-config.spec.ts`
* **Relevant Line Numbers:** astro.config.mjs L13-51
* **Guidelines Reference:** Risk inventory §5 warns about Vite plugin compatibility.
* **Testing Strategy:** Vitest test importing and validating Astro config structure. Captures current config shape so removed/renamed options are caught.
* **Execution Instructions:**
  1. Import `astro.config.mjs`.
  2. Assert `config.site` = `'https://alokprateek.in/'`.
  3. Assert `config.output` = `'hybrid'` (removed in Astro 5; becomes default `static` with per-route `prerender = false`).
  4. Assert `config.markdown.syntaxHighlight` = `'prism'`.
  5. Assert `config.markdown.remarkPlugins` has length 2.
  6. Assert integrations include sitemap and mdx.
  7. Assert Vite plugins include VitePWA.
  8. Assert adapter is cloudflare with `platformProxy.enabled: true` and `imageService: 'passthrough'`.

---

### Task ID: TSK-029
* **Target File(s) to Read:** [`src/config/site.js`](../../src/config/site.js), [`src/config/system.js`](../../src/config/system.js)
* **Target Test File to Create:** `tests/unit/config/site-config.spec.ts`
* **Relevant Line Numbers:** site.js L66-210
* **Guidelines Reference:** Many components depend on specific properties existing. See [testing-guidelines.md §6](./testing-guidelines.md).
* **Testing Strategy:** Unit test validating site configuration object's integrity.
* **Execution Instructions:**
  1. Import `site` from `@config/site.js`.
  2. Assert `site.url` = `'https://alokprateek.in'` (no trailing slash).
  3. Assert `site.title` is non-empty string.
  4. Assert `site.author.name` and `site.author.url` exist.
  5. Assert `site.image.src`, `.width`, `.height` exist.
  6. Assert `site.siteLanguage` = `'en'`.
  7. Assert `site.analytics.ga4.measurementId` matches `G-` prefix.
  8. Assert `site.analytics.clarity.projectId` is non-empty string.
  9. Assert `site.analytics.privacy.anonymizeIp` = `true`.
  10. Assert `site.mainMenu` is array with expected paths.
  11. Assert `site.footerMenu` is array with expected paths.

---

## SECTION 9: Sitemap Validation

---

### Task ID: TSK-030
* **Target File(s) to Read:** [`astro.config.mjs`](../../astro.config.mjs)
* **Target Test File to Create:** `tests/e2e/sitemap.spec.ts`
* **Relevant Line Numbers:** astro.config.mjs L15 (sitemap integration)
* **Guidelines Reference:** SEO review §3 warns Astro 6 routing changes could alter sitemap routes. API endpoints must NOT appear.
* **Testing Strategy:** Playwright E2E test for sitemap validation. Creates v4 baseline.
* **Execution Instructions:**
  1. Fetch `/sitemap-index.xml` via `request.get()`. Assert status 200.
  2. Parse XML. Assert at least one `<sitemap>` entry.
  3. Fetch the first sitemap file. Assert `<url>` entries exist.
  4. Assert NO url contains `/api/` paths.
  5. Assert key pages exist: `/`, `/articles/`, `/notes/`, `/works/`, `/contact/`, `/about/`, `/services/`, `/faqs/`.
  6. Assert all URLs use `https://alokprateek.in`.
  7. Snapshot complete URL list for migration diff.
