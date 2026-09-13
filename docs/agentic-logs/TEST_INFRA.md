# Testing Infrastructure: Astro 4.15 to Astro 6.2 Migration

This document outlines the test architecture, test harnesses, verification methodology, and execution instructions for the Astro 4.15 to Astro 6.2 migration project.

---

## 1. Overview

Migrating from Astro 4.15 to Astro 6.2 entails substantial architectural changes across routing, client-side navigation (`ViewTransitions` to `ClientRouter`), the Content Layer (`defineCollection` to `astro/loaders`), and Cloudflare D1 SSR integration.

To ensure zero regressions across SEO invariants, content schemas, RSS syndication, sitemaps, and runtime event listeners, the project utilizes a **4-Tier Regression Verification Suite** executed via a dedicated runner in `scripts/verify-baseline-diff.js`.

---

## 2. 4-Tier Test Architecture & Methodology

The regression test suite is organized into 4 progressive verification tiers:

```
+-------------------------------------------------------------------------+
|                  4-TIER REGRESSION TEST ARCHITECTURE                    |
+-------------------------------------------------------------------------+
| Tier 1: Feature Coverage                                                |
|   * All 8 Content Collections defined, exported, and populated          |
|   * RSS Feed generation with standard 2.0 schema and item constraints    |
|   * Sitemap index and shard generation with endpoint filtering          |
|   * All 7 API routes export prerender = false and call getDatabase()    |
+-------------------------------------------------------------------------+
| Tier 2: Boundary & Corner Cases                                         |
|   * Trailing slash normalization (no .xml/ file-extension trailing slash) |
|   * Canonical URLs end with '/' on all content detail and index routes   |
|   * Open Graph & Twitter Card social metadata completeness and format   |
|   * Schema.org JSON-LD scripts are valid JSON with @context and @type   |
|   * Database guard returns 500 on missing DB binding; 404 page exists   |
+-------------------------------------------------------------------------+
| Tier 3: Cross-Feature Interactions                                      |
|   * ClientRouter lifecycle: 8 post-swap listener points across 7 files   |
|   * Rendered HTML pages include post-swap scripts for copy buttons/track |
|   * Global analytics helper functions on window and consent cookies     |
|   * Collection data taxonomy + BreadcrumbList JSON-LD hierarchical trees |
+-------------------------------------------------------------------------+
| Tier 4: Real-World Regression Diff Against Baseline Snapshots           |
|   * Direct equivalence diff of 9 HTML pages against docs/baseline/      |
|   * RSS feed channel metadata & zero-link-drift item diff               |
|   * Sitemap index shard references and zero-drift URL set diff          |
+-------------------------------------------------------------------------+
```

### Tier 1: Feature Coverage
- **Collections Architecture**: Confirms `src/content/config.ts` exports all 8 collections (`articles`, `notes`, `works`, `illustrations`, `bibliophilediaries`, `faqs`, `saasguide`, `albums`), content directories exist, and output directories are populated in `dist/`.
- **RSS Feed Generation**: Validates `dist/rss.xml` exists, conforms to RSS 2.0, has valid channel metadata, emits valid items with RFC 2822 timestamps, and restricts items strictly to permitted collections (`articles`, `notes`, `works`, `bibliophilediaries`, `saasguide`), excluding non-syndicated collections (`faqs`, `illustrations`, `albums`).
- **Sitemaps Integration**: Validates `dist/sitemap-index.xml` references `dist/sitemap-0.xml`, contains core static routes and content collection URLs, and strictly excludes server-rendered `/api/*` routes.
- **API Route Configs**: Verifies all 7 API routes in `src/pages/api/` export `prerender = false` for Cloudflare Workers SSR and guard database access with `getDatabase(locals)`.

### Tier 2: Boundary & Corner Cases
- **URL Normalization**: Enforces that XML endpoints (`/rss.xml`, `/sitemap-index.xml`, `/sitemap-0.xml`) do NOT contain trailing slashes (`.xml/`). Ensures content routes consistently have trailing slashes in `<link rel="canonical">` without duplicate slashes.
- **Open Graph & Twitter Card Tags**: Ensures `og:site_name`, `og:title`, `og:url`, `og:type` (`article` vs `website`), `twitter:card` (`summary_large_image`), and `twitter:creator` (`@thewhitewulfy`) are correctly formatted and match page metadata.
- **JSON-LD Schema Verification**: Validates all embedded `<script type="application/ld+json">` elements are syntactically valid JSON with `@context: "https://schema.org"` and valid `@type` definitions. Verifies page-specific types: `WebPage`, `BreadcrumbList`, and `Person` on home page; `Article` and `BreadcrumbList` on article detail pages.
- **Error Fallbacks & 404 Invariants**: Verifies `getDatabase` returns HTTP 500 when `locals.runtime.env.DB` is absent. Confirms `dist/404.html` exists with responsive viewport meta and title.

### Tier 3: Cross-Feature Interactions
- **Client Router Lifecycle**: Ensures all 8 post-swap listener points across 7 files are registered (`astro:after-swap` or `onPageSwap` shim):
  1. `src/components/Head.astro` (tel/mailto click tracking)
  2. `src/components/Head.astro` (addCopyCodeButtons reattachment)
  3. `src/components/CampaignCTA.astro` (`initCampaignCTA`)
  4. `src/components/CampaignHero.astro` (`initCountdownTimer`)
  5. `src/lib/api/utm-tracking.ts` (`UTMTracker.initialize`)
  6. `src/lib/resource-form.js` (`initializeResourceForms`)
  7. `src/pages/offers/[...slug].astro` (`initCampaignAnalytics`)
  8. `src/pages/offers/expired.astro` (`trackExpiredCampaignVisit`)
- **Analytics Consent & Opt-Out**: Validates inline script defines `window.checkAnalyticsConsent`, `window.hasOptedOut`, `window.setAnalyticsConsent`, `window.setOptOutPreference`, `window.trackEngagementEvent`, `window.trackConversionEvent`, and references cookies `'analytics_consent'` and `'meteoric_analytics_consent'`.
- **Collection Data & Taxonomy**: Confirms collection detail pages render hierarchical BreadcrumbList JSON-LD and main content semantic elements (`<main>` / `<article>` and `<h1>`).

### Tier 4: Real-World Regression Diff Against Baseline Snapshots
- **HTML Equivalence Diff**: Compares rendered output in `dist/` against the 9 pre-upgrade snapshots stored in `docs/baseline/`:
  - `docs/baseline/index.html` <-> `dist/index.html`
  - `docs/baseline/article-migrating-to-astro.html` <-> `dist/articles/migrating-to-astro/index.html`
  - `docs/baseline/bibliophilediaries-basics.html` <-> `dist/bibliophilediaries/basics/index.html`
  - `docs/baseline/faq-pricing.html` <-> `dist/faqs/pricing/index.html`
  - `docs/baseline/illustration-cards.html` <-> `dist/illustrations/cards/index.html`
  - `docs/baseline/note-day-0.html` <-> `dist/notes/day-0/index.html`
  - `docs/baseline/saasguide-getting-started.html` <-> `dist/saasguide/getting-started/index.html`
  - `docs/baseline/tag-academic.html` <-> `dist/tag/academic/index.html`
  - `docs/baseline/work-baario.html` <-> `dist/works/baario/index.html`
  - Assertions: `<title>`, canonical `<link rel="canonical">`, `<meta name="description">`, `og:title`, `og:url`, `og:type`, `<h1>` heading text, JSON-LD `@type` sequence and count.
- **RSS Feed Invariant Diff**: Compares `dist/rss.xml` against `docs/baseline/rss.xml` for channel title, description, link, exact item count (25 items), and item links to detect URL drift.
- **Sitemap Invariant Diff**: Compares `dist/sitemap-index.xml` and `dist/sitemap-0.xml` against `docs/baseline/` counterparts for exact shard loc and exact URL set equivalence (0 missing, 0 unexpected).

---

## 3. Runner Command and Execution Instructions

### Prerequisites
The regression runner evaluates the built distribution in `dist/`. Always build the site before running the regression suite:

```bash
npm run build
```

### Execution Commands

```bash
# Run full 4-tier regression suite
npm run test:regression

# Direct invocation
node scripts/verify-baseline-diff.js

# Run specific tiers (e.g. Tier 1 and Tier 4)
node scripts/verify-baseline-diff.js --tier=1,4

# Run with verbose diagnostic traces
node scripts/verify-baseline-diff.js --verbose

# Display help
node scripts/verify-baseline-diff.js --help
```

### Related Test Suites

| Command | Purpose | Runner | Scope |
|---|---|---|---|
| `npm run test:regression` | 4-Tier regression & baseline diff | Node.js / JSDOM | Build output, SEO invariants, baseline snapshots |
| `npm run test:unit` | Unit test suite | Vitest | Components, shims, configs, database helpers |
| `npm run test:db` / `npm run db:verify:local` | Database schema & migration verification | Node.js / SQLite | D1 tables, columns, indexes |
| `npm run test:e2e` | Browser end-to-end suite | Playwright | Dev server page rendering, user interaction |

---

## 4. Invariant Tolerance and Stop Signals

| Invariant | Tolerance | Action on Violation |
|---|---|---|
| Page `<title>` | 0% (Exact match) | Stop upgrade; investigate frontmatter or layout title generation |
| Canonical URL | 0% (Exact match) | Stop upgrade; investigate trailing slash or base URL drift |
| RSS Item `<link>` | 0% (Exact match) | Stop upgrade; RSS link drift breaks existing subscribers |
| Sitemap URL Set | 0% (Exact match) | Stop upgrade; missing URLs cause search engine deindexing |
| Sitemap `/api/*` URLs | 0 permitted | Stop upgrade; server-rendered endpoints must not be crawled |
| JSON-LD `@type` sequence | 0% (Exact match) | Stop upgrade; rich snippet schemas missing |
| `astro:after-swap` listeners | 8 of 8 required | Stop upgrade; client router will fail to rebind listeners |
| Asset Hashes (`_astro/*.js`, `*.css`) | Expected to differ | Permitted across build cycles and framework upgrades |
| Build timestamps (`dateModified` in JSON-LD) | Permitted | Timestamps update to reflect current build time |

---

## 5. File and Artifact Layout

- `scripts/verify-baseline-diff.js`: Core regression verification runner.
- `docs/baseline/`: Reference pre-upgrade baseline files (HTML, RSS, sitemaps, API contracts).
- `dist/`: Built production artifacts evaluated by the test runner.
- `src/`: Source code subject to architectural and schema checks.
- `package.json`: Contains `"test:regression": "node scripts/verify-baseline-diff.js"`.
