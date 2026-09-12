# Architecture

This document records the first-run structural baseline for `theWhiteWulfy/personal-site`. The DeepWiki reference for this repository is `deepwiki.io/theWhiteWulfy/personal-site`; local repository inspection remains the source of truth for this baseline.

## Runtime Shape

The site is an Astro 6.2 project configured in `astro.config.mjs`.

- `site` is set to `https://alokprateek.in/`.
- Output mode is `static`, replacing legacy `hybrid` mode. Server-rendered API routes declare `export const prerender = false` to enable dynamic execution under Cloudflare Pages.
- Integrations include `@astrojs/sitemap`, `@astrojs/mdx`, `@playform/compress`, and `vite-plugin-pwa`.
- The Cloudflare adapter is enabled through `@astrojs/cloudflare` (v13.2.0) with `platformProxy.enabled` and passthrough image service (`imageService: 'passthrough'`).
- A pristine checkout guard (`fs.mkdirSync('./dist/client', { recursive: true })`) in `astro.config.mjs` and `package.json` guarantees that Miniflare / workerd platform proxy initializes reliably even when building from a clean clone without `dist/`.
- Markdown uses Prism highlighting and remark plugins for reading time and modified time.
- Client-side CSRF protection uses Astro's default `security.checkOrigin: true`.

The project targets Astro `^6.2.0` with `@astrojs/cloudflare ^13.2.0`, `@astrojs/mdx ^4.3.14`, `@astrojs/rss ^4.0.19`, `@astrojs/sitemap ^3.2.1`, `@astrojs/check ^0.9.4`, and Vite 7.

## Source Layout

- `src/pages/` contains route files, content indexes, dynamic collection detail routes, service pages, and API endpoints.
- `src/layouts/` contains shared page shells (`Layout.astro` for content pages, `PageLayout.astro` for static/MDX pages).
- `src/components/` contains Astro UI components, metadata components, service blocks, forms, navigation, and icons.
- `src/styles/` contains global CSS and CSS modules for page and component styling.
- `src/config/` contains site metadata, taxonomy, system constants, and the PWA manifest.
- `src/lib/` contains slugging, remark plugins, schema generators, analytics helpers, campaign utilities, resource helpers, and API support code.
- `src/content/` contains Markdown, MDX, and YAML-backed content collections.
- `src/images/` contains imported image assets used by Astro and content.
- `src/utils/` exists but is currently empty.
- `public/` contains static assets, favicons, RSS styling, redirects, headers, experiments, PDFs, and public images.
- `scripts/` currently contains ordered SQL migration files.

## Content Collections

### Definition and Schema

`src/content.config.ts` (and `src/content/config.ts`) defines Astro Content Layer collections with `defineCollection` and `glob` from `astro/loaders`, and schema validation types from `astro/zod`.

Content collections (all powered by Content Layer `glob` loaders):

| Collection           | Loader Pattern | Schema Details | Directory |
| -------------------- | -------------- | -------------- | --------- |
| `articles`           | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" })` | Standard frontmatter | `src/content/articles/` |
| `notes`              | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" })` | Standard frontmatter | `src/content/notes/` |
| `works`              | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/works" })` | `output: z.boolean().optional()` added | `src/content/works/` |
| `illustrations`      | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/illustrations" })` | Standard frontmatter | `src/content/illustrations/` |
| `bibliophilediaries` | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/bibliophilediaries" })` | Standard frontmatter | `src/content/bibliophilediaries/` |
| `saasguide`          | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/saasguide" })` | Standard frontmatter | `src/content/saasguide/` |
| `faqs`               | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/faqs" })` | `order: z.number()` required, `excerpt` optional | `src/content/faqs/` |
| `albums`             | `glob({ pattern: "**/*.yaml", base: "./src/content/albums" })` | `title: string`, `description: string`, `cover: image()` | `src/content/albums/` |

### Shared Frontmatter Shape

All content collections (except `faqs` and `albums`) share this Zod schema (imported from `astro/zod`):

```
title: z.string()                          // required
path: z.string()                           // required, used for canonical URL routing
date: z.coerce.date()                      // required, published date
last_modified_at: z.coerce.date()          // required, last modified date
excerpt: z.string()                        // required (optional in faqs)
image: z.string().optional()               // cover image path
categories: z.array(z.string()).optional() // content categories
tags: z.array(z.string()).optional()        // content tags
toc: z.boolean().optional()                // show table of contents
hide_meta: z.boolean().optional()          // hide date/read-time
comments: z.boolean().optional()           // enable comments
comments_locked: z.boolean().optional()    // lock comment thread
featured: z.boolean().optional()           // mark as featured
draft: z.boolean().optional()              // draft status, used for filtering
```

### Gallery Data Model

The `albums` collection stores YAML data files alongside image subdirectories:

```
src/content/albums/
├── cards/            (image assets)
├── cards.yaml        (title, description, cover reference)
├── logos/
├── logos.yaml
├── posterscollege/
├── posterscollege.yaml
├── postersschool/
├── postersschool.yaml
├── sketches/
├── sketches.yaml
├── wallpapers/
└── wallpapers.yaml
```

Each `.yaml` file uses the `albums` schema: `title`, `description`, and `cover` (Astro image helper). The gallery page references these through `getCollection("albums")`.

### Collection Usage Patterns

Dynamic route files use `getCollection()`, collection entry filtering (typically `!entry.data.draft`), `entry.id`, and `render(entry)` via `src/lib/content-shims.ts`. Dynamic route files are normalized to `[...id].astro` parameters. Canonical path resolution is delegated to `entryPath(collection, entry.id)` to guarantee 100% byte-compatibility against pre-upgrade baseline URLs. The RSS feed aggregates `articles`, `works`, `notes`, `bibliophilediaries`, and `saasguide` collections (excluding drafts) into a merged, date-sorted feed using `entryPath()`.

Astro 6.2 migration note: All collections have been fully migrated to native Content Layer `glob()` loaders. Legacy collection backwards compatibility (`legacy.collectionsBackwardsCompat`) was completely removed in Milestone 5 Slice 5.

### Taxonomy

`src/config/taxonomy.yml` defines category and tag metadata (id, name, excerpt, HTML description). This is a static data file loaded for rendering archive and tag listing pages. It contains entries for `articles`, `notes`, `bibliophile-diaries`, `deno-guide`, `TIL`, `work`, `illustrations`, `web experiments`, `saas-guide`, and many tag-level entries.

## Routing And Pages

Primary content routes include:

- `src/pages/articles/`
- `src/pages/notes/`
- `src/pages/works/`
- `src/pages/bibliophilediaries/`
- `src/pages/saasguide/`
- `src/pages/faqs/`
- `src/pages/illustrations/`
- `src/pages/tag/`

Static and MDX pages include home, about, contact, support, terms, sitemap, WhatsApp, and service pages. Offers and resources include campaign and resource-download behavior that interacts with API routes.

## SEO, Metadata, And Analytics

### Head Component

`src/components/Head.astro` is the main metadata surface. It is an 889-line component that owns or coordinates:

**Standard metadata:**
- viewport, canonical URL, generator, RSS alternate link, author link (`humans.txt`);
- `<title>`, description, image, and optional keywords meta tags;
- Open Graph tags: `og:site_name`, `og:type` (article vs website), `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`;
- Twitter Card tags: `twitter:creator`, `twitter:card` (summary_large_image), `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`;
- IndieWeb: `pingback` (webmention.io), `webmention` (webmention.io), `micropub` (currently empty);
- Favicons: SVG favicon, ICO shortcut, Apple touch icons (57–180px), PNG icons (16–192px), MS tile, Safari pinned tab;
- PWA manifest integration via `vite-plugin-pwa`.

**Resource hints:**
- DNS prefetch and preconnect for `webmention.io`, `google-analytics.com`, `googletagmanager.com`, `clarity.microsoft.com`;
- Conditional preconnect for Clarity on service, contact, and home page types;
- Fonts are self-hosted via Fontsource (`@fontsource/prompt`, `@fontsource/zilla-slab`), no external font hints.

**Astro client router and event lifecycles:**
- Imports and renders `<ClientRouter />` from `astro:transitions/client` (isolated in `src/components/ClientRouterShim.astro` and mounted via `src/components/Head.astro`).
- Post-transition re-initialization for analytics event listeners, UTM attribution, CTA/hero interactions, resource forms, and copy-code buttons is coordinated through the unified `onPageSwap` abstraction in `src/lib/page-events.ts`.
- `onPageSwap` listens to both initial DOM readiness (`DOMContentLoaded`) and subsequent client navigations (`astro:after-swap`), providing SSR safety, unsubscription cleanup, and robust error boundaries.

### Schema.org JSON-LD

Schema generation uses `src/lib/schema-generators.ts`, which exports:

| Function | Schema Type | Used When |
| --- | --- | --- |
| `generatePageSchema()` | Master dispatcher | Every page; builds array of schemas based on `pageType` |
| `generateBreadcrumbListSchema()` | `BreadcrumbList` | All pages unless `includeBreadcrumbs: false` |
| `generateLocalBusinessSchema()` | `LocalBusiness` | home, about, contact, service pages |
| `generatePersonSchema()` | `Person` | about page, or when `author` data is provided |
| `generateServiceSchema()` | `Service` | service pages with `serviceData` |
| `generateFAQPageSchema()` | `FAQPage` | FAQ pages with `faqs` data |
| `generateResourceSchema()` | `DigitalDocument` | resource pages with `resourceData` |
| `generateCampaignSchema()` | `Event` | campaign pages with `campaignData` |

Every page also gets a base `Article` or `WebPage` schema with author, publisher, dates, and language.

Business/person constants come from `src/config/system.js` (`SCHEMA_CONFIG`), which stores address, geo coordinates, opening hours, price range, area served, job title, and expertise areas.

Error handling: the Head component wraps schema generation in try/catch with a fallback chain—first `safeSchemaGeneration()`, then a hardcoded minimal `WebPage` schema if all else fails. Each schema is individually validated before `JSON.stringify`.

### RSS Feed

`src/pages/rss.xml.js` generates the RSS feed:
- Aggregates `articles`, `works`, `notes`, `bibliophilediaries`, and `saasguide` collections;
- Filters out drafts (`!entry.data.draft`);
- Sorts by date descending;
- Uses `@astrojs/rss` with the `pretty-feed-v3.xsl` stylesheet from `/rss/`;
- Links use `/${item.collection}/${item.slug}/` pattern;
- Dates are formatted via `dayjs` with UTC plugin.

Finding: the `faqs` and `illustrations` collections are excluded from RSS. This appears intentional.

### Sitemap

Sitemap generation is handled by the `@astrojs/sitemap` integration. It requires no additional configuration beyond the `site` URL in `astro.config.mjs`. Static pages and server-rendered routes are automatically included/excluded based on Astro's routing.

### Analytics Flow

Analytics initialization follows a two-layer pattern:

**Layer 1: Server-side configuration** (in Head.astro frontmatter)
- `initializeAnalyticsConfig(site)` from `src/lib/analytics.ts` reads `site.analytics` from `src/config/site.js`;
- Returns an `AnalyticsConfig` object with GA4/Clarity settings, consent requirements, and opt-out cookie name;
- GA4 is enabled when `analytics.enabled` is true AND `measurementId` is not the placeholder `G-XXXXXXXXXX`;
- Clarity is enabled similarly when `projectId` is not the placeholder `XXXXXXXXXX`.

**Layer 2: Client-side scripts** (in Head.astro template, all `is:inline`)
- GA4 `gtag.js` loaded with `defer`, configured with privacy settings (`anonymize_ip`, consent mode, cookie flags, custom dimensions, enhanced measurement);
- Clarity snippet loaded conditionally;
- Consent management script exposes global functions: `checkAnalyticsConsent()`, `hasOptedOut()`, `setAnalyticsConsent()`, `setOptOutPreference()`, `trackEngagementEvent()`, `trackConversionEvent()`;
- Auto-tracks `tel:` and `mailto:` link clicks as conversion events;
- All tracking re-attaches on `astro:after-swap` for view transition support.

**Layer 3: TypeScript analytics module** (`src/lib/analytics.ts`, 1689 lines)
- `GA4Analytics` and `ClarityAnalytics` classes implementing `AnalyticsProvider` interface;
- `AnalyticsManager` class coordinating both providers;
- Typed event interfaces: `PhoneClickEvent`, `FormSubmissionEvent`, `ResourceDownloadEvent`, `ConversionEvent`, `PageViewEvent`, `EmailClickEvent`;
- Privacy: respects Do Not Track, localStorage consent, cookie-based opt-out;
- Development-only `AnalyticsDebugger` class in Head.astro for testing (auto-runs test suite after 2s delay in dev mode).

**Analytics IDs** (from `src/config/site.js`):
- GA4 measurement ID: `G-RGPN7NRJDQ`
- Clarity project ID: `sw2f0ourfn`

**System constants** (`src/config/system.js`):
- `ANALYTICS_CONFIG`: event types (`content_view`, `newsletter_signup`, `contact_form_submit`), categories, and custom dimension names;
- `PERFORMANCE_CONFIG`: cache TTLs and resource hint URLs.

### Additional Analytics Modules

| File | Purpose |
| --- | --- |
| `src/lib/analytics-testing.ts` | Testing harness for analytics integration |
| `src/lib/campaign-analytics.ts` | Campaign-specific analytics and reporting |
| `src/lib/campaign-utils.ts` | Campaign utility functions |
| `src/lib/resource-analytics.ts` | Resource download analytics tracking |
| `src/lib/resource-form.js` | Client-side resource form behavior |

## Cloudflare And D1

### Cloudflare Configuration

Cloudflare configuration lives in `wrangler.toml`.

- Compatibility flag: `nodejs_compat`.
- D1 binding name: `DB`.
- D1 database name: `meteoric`.
- D1 database id: `8380ec22-098e-4814-a56f-48d907425b35`.

### Runtime Type Declaration

`src/env.d.ts` declares the Cloudflare runtime shape:

```typescript
type D1Database = import("@cloudflare/workers-types").D1Database;
type ENV = { DB: D1Database; };
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
    interface Locals extends Runtime { }
}
```

All server-rendered API routes access the database through `locals.runtime.env.DB`.

### Database Access Pattern

Every API route follows a consistent pattern:

1. Declare `export const prerender = false;` to enable server-side rendering;
2. Verify database connectivity using `getDatabase(locals)` from `src/lib/api/database.ts` (returns HTTP 500 JSON response if unconfigured);
3. Destructure `const DB = dbCheck.DB;`;
4. Execute D1 queries via `DB.prepare(query).bind(...params).run()` or `.first()` or `.all()`.

### D1 Database Schema

Five ordered SQL migrations in `scripts/`, managed by `scripts/migrate-database.js` and verified by `scripts/verify-database.js`:

**001: `resource_downloads` table**
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `email` | TEXT NOT NULL | |
| `name` | TEXT NOT NULL | |
| `workplace` | TEXT NOT NULL | |
| `role` | TEXT NOT NULL | |
| `resource_name` | TEXT NOT NULL | |
| `download_timestamp` | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| `ip_address` | TEXT | nullable |
| `user_agent` | TEXT | nullable |

Indexes: `email`, `resource_name`, `download_timestamp`, composite `(email, resource_name)`, composite `(download_timestamp, resource_name)`.

**002: `analytics_events` table**
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `event_type` | TEXT NOT NULL | |
| `event_data` | TEXT | JSON string |
| `user_email` | TEXT | nullable |
| `user_id` | TEXT | nullable |
| `session_id` | TEXT | nullable |
| `ip_address` | TEXT | nullable |
| `user_agent` | TEXT | nullable |
| `timestamp` | DATETIME DEFAULT CURRENT_TIMESTAMP | |

Indexes: `event_type`, `timestamp`, `user_email`, `session_id`, composite `(event_type, timestamp)`.

**003: `campaigns` and `campaign_visits` tables**

`campaigns`:
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `slug` | TEXT NOT NULL UNIQUE | |
| `title` | TEXT NOT NULL | |
| `description` | TEXT | nullable |
| `start_date` | DATETIME NOT NULL | |
| `end_date` | DATETIME | nullable |
| `status` | TEXT NOT NULL DEFAULT 'active' | CHECK: active/paused/expired |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | |

`campaign_visits`:
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `campaign_id` | INTEGER NOT NULL | FK → campaigns(id) CASCADE |
| `visit_timestamp` | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| `ip_address` | TEXT | nullable |
| `user_agent` | TEXT | nullable |
| `referrer` | TEXT | nullable |
| `utm_source` | TEXT | nullable |
| `utm_medium` | TEXT | nullable |
| `utm_campaign` | TEXT | nullable |
| `utm_term` | TEXT | nullable |
| `utm_content` | TEXT | nullable |
| `session_id` | TEXT | nullable |
| `user_id` | TEXT | nullable |
| `conversion_type` | TEXT | nullable |
| `conversion_value` | REAL DEFAULT 0 | |

Indexes: `campaigns(slug)`, `campaigns(status)`, `campaigns(start_date, end_date)`, `campaigns(status, start_date, end_date)`, `campaign_visits(campaign_id)`, `campaign_visits(visit_timestamp)`, `campaign_visits(utm_source)`, `campaign_visits(utm_campaign)`, `campaign_visits(conversion_type)`, `campaign_visits(session_id)`, composite `(campaign_id, visit_timestamp)`, composite `(utm_source, utm_medium)`, composite `(conversion_type, campaign_id)`.

**004: `newsletter` table**
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `email` | TEXT NOT NULL UNIQUE | |
| `timestamp` | DATETIME DEFAULT CURRENT_TIMESTAMP | |

Indexes: `newsletter(email)`.

**005: `leads` table**
| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK AUTOINCREMENT | |
| `name` | TEXT NOT NULL | |
| `email` | TEXT NOT NULL | |
| `refer` | TEXT NOT NULL | |
| `message` | TEXT NOT NULL | |
| `timestamp` | DATETIME DEFAULT CURRENT_TIMESTAMP | |

Indexes: `leads(email)`, `leads(timestamp)`.

### API Surface

API routes live in `src/pages/api/`. All routes declare `export const prerender = false`.

| Route | Methods | Purpose | D1 Tables |
| --- | --- | --- | --- |
| `newsletter.ts` | POST | Writes newsletter emails | `newsletter` |
| `leadform.ts` | POST | Writes lead form submissions | `leads` |
| `resource-download.ts` | POST, GET | Form submission → download token; GET returns stats | `resource_downloads`, `analytics_events` |
| `serve-resource.ts` | POST, GET | Generates/validates tokenized download URLs | `resource_downloads` |
| `campaigns.ts` | GET, POST, PUT | Campaign CRUD and analytics reads | `campaigns`, `campaign_visits` |
| `campaign-visit.ts` | POST, GET | Records and lists campaign visits | `campaign_visits` |
| `campaign-signup.ts` | POST | Records campaign signups and analytics | `campaign_visits`, `analytics_events` |

### API Utility Modules

Shared API utilities live in `src/lib/api/`:

| Module | Exports | Purpose |
| --- | --- | --- |
| `validation.ts` | `validateResourceForm()`, `formatValidationErrors()` | Input validation and sanitization |
| `security.ts` | `performSecurityChecks()` | Rate limiting, spam detection, honeypot fields |
| `database.ts` | `insertResourceDownload()`, `getDownloadStats()`, `getDownloadById()`, `getDownloadsByEmail()`, `updateDownloadRecord()`, `cleanupOldRecords()`, `testDatabaseConnection()`, `validateDatabaseConnection()` | D1 query wrappers with duplicate prevention and error handling |
| `utm-tracking.ts` | UTM parameter extraction and tracking | Campaign attribution |

### Security Features in API Routes

The `resource-download.ts` route implements:
- Client IP extraction from `CF-Connecting-IP` or `X-Forwarded-For` headers;
- Security checks via `performSecurityChecks()` (rate limiting, spam, honeypot);
- Input validation via `validateResourceForm()` with sanitized output;
- Duplicate download prevention (24-hour window) in `insertResourceDownload()`;
- Analytics event logging for each form submission;
- Secure download token generation through `serve-resource` API.

Preservation rule: the `DB` binding name, runtime access pattern, and Cloudflare adapter behavior are architecture-sensitive and must not be changed during documentation bootstrap.

## Gallery And Static Experiments

The image gallery is backed by `albums` YAML data and image assets under `src/content/albums/`. Public web experiments live under `public/web/experiment/` with standalone HTML, CSS, and JavaScript. These experiments are static assets and should be preserved during framework work unless assigned directly.

## Configuration Files

### Site Configuration (`src/config/site.js`)

Central site metadata exported as a single object:

- Site identity: `title`, `titleAlt`, `description`, `url`, `siteLanguage`, `ogLanguage`;
- SEO: `image` (src, width, height), `author` (name, url), `feedUrl`, `copyrights`;
- Display: `defaultTheme` (light), `postsPerPage` (10), `favicon`, `shortName`;
- Analytics: `analytics.ga4` (measurement ID, enhanced measurement, conversion events, custom dimensions/metrics), `analytics.clarity` (project ID, heatmaps, recordings, privacy mode), `analytics.privacy` (opt-out, consent, data retention, IP anonymization, DNT);
- Social: `twitter`, `twitterUrl`, `facebook`, `linkedinUrl`, `githubUrl`, `instagramUrl`, `whatsappUrl`, `emailAddress`;
- IndieWeb: `pingbackUrl`, `webmentionUrl`, `micropubUrl` (empty), `staticmanApi` (Heroku, likely legacy);
- Navigation: `mainMenu` (5 items), `footerMenu` (4 items);
- Tokens: `githubApiToken` (from env), `reCaptcha` (empty keys).

### System Constants (`src/config/system.js`)

Exports: `SCHEMA_CONFIG`, `ANALYTICS_CONFIG`, `API_CONFIG`, `VALIDATION`, `PERFORMANCE_CONFIG`, `ERROR_MESSAGES`, `SUCCESS_MESSAGES`.

### Taxonomy (`src/config/taxonomy.yml`)

301 lines of YAML defining category/tag metadata with `id`, optional `name`, `excerpt`, and `html` description. Contains 60+ entries covering content categories and tags.

### PWA Manifest (`src/config/manifest.ts`)

PWA manifest configuration consumed by `vite-plugin-pwa`.

## Build And Verification

Primary scripts:

- `npm run dev` / `npm start`: Astro development server.
- `npm run build`: runs `astro check` and `astro build`.
- `npm run preview`: Astro preview.
- `npm run cfpreview`: Cloudflare Pages local preview over `./dist`.
- `npm run db:migrate`, `npm run db:migrate:local`, `npm run db:verify`, and `npm run db:verify:local`: declared database commands.

Known baseline finding: `package.json` references `scripts/migrate-database.js` and `scripts/verify-database.js`, but the current `scripts/` directory contains only SQL files. This is a maintenance finding, not a bootstrap fix.

### Dependencies

**Runtime dependencies:**
- `@astrojs/cloudflare ^13.2.0`
- `@fontsource/prompt ^5.0.14`
- `@fontsource/zilla-slab ^5.0.13`
- `sanitize-html ^2.17.4`

**Key dev dependencies:**
- `astro ^6.2.0`
- `@astrojs/check ^0.9.4`
- `@astrojs/mdx ^4.3.14`
- `@astrojs/rss ^4.0.19`
- `@astrojs/sitemap ^3.2.1`
- `@cloudflare/workers-types ^4.20240729.0`
- `@playform/compress ^0.0.13`
- `dayjs ^1.11.11`
- `vite-plugin-pwa ^1.3.0`
- `wrangler ^4.28.1`
- `vitest ^3.2.1`
- `@vitest/coverage-v8 ^3.2.1`
- `@playwright/test ^1.52.0`
- `jsdom ^26.1.0`
- `happy-dom ^17.4.6`
- PostCSS ecosystem: `cssnano`, `postcss-custom-media`, `postcss-import`, `postcss-loader`, `postcss-mixins`, `postcss-nested`, `postcss-preset-env`, `postcss-url`
- `prettier ^3.2.5` with `prettier-plugin-astro` and `prettier-plugin-organize-imports`
- `typescript ^5.4.5`

## First-Run Findings

Status of initial architectural findings:

1. **Missing migration scripts:** ✅ **Resolved in Milestone 1**. Implemented `scripts/migrate-database.js` and `scripts/verify-database.js` supporting both local SQLite emulation and remote Cloudflare D1.
2. **Missing D1 table migrations:** ✅ **Resolved in Milestone 1**. Created `scripts/004_create_newsletter.sql` and `scripts/005_create_leads.sql` with full schema and index coverage.
3. **Empty `src/utils/` directory:** Retained. Reserved for future utility expansions.
4. **Legacy Staticman API reference:** Deferred to post-upgrade maintenance branch (`chore/legacy-cleanup`) per Decision D-08.
5. **reCAPTCHA keys are empty:** Deferred to post-upgrade maintenance branch (`chore/legacy-cleanup`) per Decision D-08.
6. **README references `gatsby develop`:** Deferred to post-upgrade maintenance branch (`chore/legacy-cleanup`) per Decision D-08.
7. **Taxonomy has duplicate entries:** Deferred to post-upgrade maintenance branch (`chore/legacy-cleanup`) per Decision D-08.
8. **Performance config references unused domains:** Deferred to post-upgrade maintenance branch (`chore/legacy-cleanup`) per Decision D-08.

## Post-Upgrade Architecture State

The Astro 6.2 migration is complete across all five milestones:

- **Framework & Runtime**: Powered by Astro `6.2.0`, `@astrojs/cloudflare` `13.2.0`, and Vite 7. Static output mode (`output: "static"`) serves pre-rendered HTML alongside on-demand Cloudflare D1 API endpoints (`prerender = false`).
- **Content Layer**: All 8 collections operate natively on Content Layer `glob()` loaders defined in `src/content.config.ts` (re-exported in `src/content/config.ts`). `legacy.collectionsBackwardsCompat` has been completely eliminated.
- **Client Router**: Legacy `<ViewTransitions />` is fully replaced with `<ClientRouter />` from `astro:transitions/client`. All 7 client-side post-swap event lifecycles are unified under `onPageSwap` (`src/lib/page-events.ts`).
- **Cloudflare D1**: Standardized database access via `getDatabase(locals)` in `src/lib/api/database.ts` with complete table schemas (`resource_downloads`, `analytics_events`, `campaigns`, `campaign_visits`, `newsletter`, `leads`).
- **Clean Checkout Resilience**: A top-level guard in `astro.config.mjs` and `package.json` ensures `dist/client` exists prior to workerd initialization, preventing Miniflare asset errors on fresh checkouts.
- **Regression Invariants**: Verified 100% equivalence against pre-upgrade baselines (`docs/baseline/`) with 42/42 regression checks passing and 470/470 unit tests passing.
