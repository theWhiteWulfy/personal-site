# SEO and Analytics Preservation Review

**Status**: Architecture-only document. Produced by Claude (Architect) as a companion to [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md).  
**Purpose**: Define the exact SEO and analytics invariants that must not regress across the upgrade, and the diff-driven verification protocol Jules uses after each phase.

---

## 1. Invariants: Head Component Output

`src/components/Head.astro` (889 lines) produces all SEO metadata. The following output must be character-identical (except for expected asset hash changes) before and after each upgrade phase.

### 1.1 Required stable meta tags

| Tag | Expected value pattern | Risk phase |
|---|---|---|
| `<title>` | `{page title}` — value from `Head.astro` props, default `site.title` | Phase 2, 5 |
| `<meta name="description">` | excerpt or `site.description` | Phase 2, 5 |
| `<link rel="canonical">` | `new URL(Astro.url.pathname, Astro.site)` — must include trailing slash on content routes | Phase 2, 4, 5 |
| `<meta property="og:url">` | `Astro.url` — full URL with origin | Phase 2, 4, 5 |
| `<meta property="og:type">` | `article` for content entries, `website` for others | Phase 2 |
| `<meta property="og:title">` | Same as `<title>` | Phase 2 |
| `<meta property="og:description">` | Same as `<meta name="description">` | Phase 2 |
| `<meta property="og:image">` | `metaImage.src` (absolute URL from `site.image.src`) | Phase 2 |
| `<meta name="twitter:card">` | `summary_large_image` | Phase 2 |
| `<meta name="twitter:creator">` | `@thewhitewulfy` | Phase 2 |
| `<meta name="twitter:url">` | `Astro.url` | Phase 2, 5 |
| `<link rel="alternate" type="application/rss+xml">` | `${Astro.site}rss.xml` — **no trailing slash after `.xml`** (6-K) | Phase 2 |
| `<link rel="canonical" pingback>` | `https://webmention.io/alokprateek.in/xmlrpc` | Phase 2 |
| `<link rel="webmention">` | `https://webmention.io/alokprateek.in/webmention` | Phase 2 |

### 1.2 Trailing-slash and URL invariants

- Content route canonicals end with a trailing slash: `/articles/some-post/`, not `/articles/some-post`.
- File-extension endpoints do **not** end with a trailing slash: `/rss.xml`, not `/rss.xml/`. This is enforced by Astro 6 (change 6-K); any violation causes a 404 in production.
- The `feedUrl` value in `src/config/site.js` is `/rss.xml` — confirm it does not become `/rss.xml/` after upgrade.
- The `<link rel="alternate">` href in `Head.astro` is `${Astro.site}rss.xml`. `Astro.site` value is `https://alokprateek.in/` (with trailing slash from `astro.config.mjs`). Result: `https://alokprateek.in/rss.xml` — correct.

### 1.3 Script execution order (Astro 6 change 6-R)

Astro 6 renders `<script>` and `<style>` in source order (was reversed). The `Head.astro` inline scripts must execute in this order:
1. GA4 `gtag.js` load (deferred)
2. GA4 initialization and config script
3. Microsoft Clarity initialization (conditional on page type)
4. Analytics consent management script (depends on `gtag` and `clarity` being defined)
5. Copy-code button script (deferred, independent)
6. Analytics debugger (dev only, independent)

This order is already the source order in `Head.astro`. Verify in Phase 2 that rendered `<script>` tags appear in this order in the built HTML.

---

## 2. Invariants: Schema.org JSON-LD Output

`src/lib/schema-generators.ts` produces JSON-LD for each `pageType`. The following schema types must appear in the `<head>` for their respective page types after upgrade.

| Page type | Expected schema types in `<script type="application/ld+json">` array |
|---|---|
| `home` | `WebPage`, `BreadcrumbList`, `LocalBusiness`, `Person` |
| `about` | `WebPage`, `BreadcrumbList`, `LocalBusiness`, `Person` |
| `contact` | `WebPage`, `BreadcrumbList`, `LocalBusiness`, `Person` |
| `service` | `WebPage`, `BreadcrumbList`, `LocalBusiness`, `Service` |
| `article` | `Article`, `BreadcrumbList` |
| `faq` | `WebPage`, `BreadcrumbList`, `FAQPage` |
| `resource` | `WebPage`, `BreadcrumbList`, `DigitalDocument` |
| `campaign` | `WebPage`, `BreadcrumbList`, `Event` |
| `default` | `WebPage`, `BreadcrumbList` |

**Fallback chain** (must survive upgrade): if `generatePageSchema()` throws, `safeSchemaGeneration()` returns `null` schemas which are filtered; if the array is empty, a hardcoded minimal `WebPage` schema is injected. The fallback chain is implemented entirely in `Head.astro` frontmatter and is not Astro-version-dependent — but the try/catch behavior must be confirmed in Phase 2.

**Required `@context`**: every JSON-LD block must contain `"@context": "https://schema.org"` and a valid `"@type"`.

---

## 3. Invariants: RSS Feed Output

`src/pages/rss.xml.js` produces `dist/rss.xml`. The following must be stable.

| Property | Expected value |
|---|---|
| Feed title | `site.title` = `Meteoric Teachings` |
| Feed description | `site.description` |
| Feed author | `site.author.name` = `Alok Prateek` |
| Feed stylesheet | `/rss/pretty-feed-v3.xsl` |
| Item title | `item.data.title` |
| Item description | `item.data.excerpt` |
| Item pubDate | dayjs UTC formatted date from `item.data.date` |
| Item link | `/${item.collection}/${item.id}/` (after Phase 4; currently `item.slug`) |
| Collections included | `articles`, `works`, `notes`, `bibliophilediaries`, `saasguide` |
| Collections excluded | `faqs`, `illustrations` |
| Sort order | Descending by `item.data.date` |

**Critical verification**: the only change from Phase 4 is `item.slug` → `item.id`. If the file stem (used as `id` by the glob loader) differs from the historical slug for any existing entry, the RSS link for that entry changes — a regression. Jules must diff `dist/rss.xml` before and after Phase 4.

---

## 4. Invariants: Sitemap Output

`@astrojs/sitemap` integration generates `dist/sitemap-index.xml` and `dist/sitemap-0.xml`.

**Expected behavior**:
- All static page routes included (home, about, contact, articles/*, notes/*, works/*, etc.)
- API routes (`/api/*`) excluded (server-rendered; Astro excludes these by default)
- Gallery and illustration routes included if they are static
- Sitemap index URL: `/sitemap-index.xml` — **no trailing slash** (enforced by 6-K, same as RSS)

**Verification**: diff `dist/sitemap-*.xml` before and after Phase 2. Any newly included or excluded URL is a stop signal requiring Claude review.

---

## 5. Invariants: Analytics Post-Navigation (astro:after-swap Contract)

When `<ClientRouter />` is enabled, Astro fires `astro:after-swap` after each client-side navigation. Seven files attach event listeners to this event. All seven must re-attach correctly after the `<ViewTransitions />` → `<ClientRouter />` rename.

| File | What it re-attaches |
|---|---|
| `src/components/Head.astro` | GA4 + Clarity phone/email click tracking, copy-code buttons |
| `src/components/CampaignCTA.astro` | Campaign analytics event listeners |
| `src/components/CampaignHero.astro` | Campaign analytics event listeners |
| `src/lib/resource-form.js` | Resource download form listeners |
| `src/lib/utm-tracking.ts` | UTM parameter re-capture from URL |
| `src/pages/offers/[...slug].astro` | Offer-page-specific conversion listeners |
| `src/pages/offers/expired.astro` | Expired-offer page listeners |

**Global analytics functions** (exposed by `Head.astro`, must remain callable after navigation):
- `window.trackEngagementEvent(eventName, parameters)`
- `window.trackConversionEvent(eventName, parameters)`
- `window.setAnalyticsConsent(consent: boolean)`
- `window.setOptOutPreference(optOut: boolean)`
- `window.checkAnalyticsConsent(): boolean`
- `window.hasOptedOut(): boolean`

These are defined in a `<script is:inline>` block in `Head.astro`. With `<ClientRouter />`, the head is not re-rendered on navigation, so these globals persist across navigations. They must not be re-defined on each swap (would cause double-listener issues). Verify in Phase 3 smoke test.

---

## 6. Verification Protocol (Jules)

Jules runs this protocol after each phase merges, before Alok reviews.

### Pre-upgrade baseline (run before Phase 1)

```bash
# 1. Build the site on current astro@^4.15.12
npm run build

# 2. Capture pre-upgrade snapshots
cp dist/rss.xml tests/pre-upgrade-rss.xml
cp dist/sitemap-index.xml tests/pre-upgrade-sitemap-index.xml
cp dist/sitemap-0.xml tests/pre-upgrade-sitemap-0.xml

# 3. Capture rendered HTML for one page per collection
# Save to tests/pre-upgrade-html/
# Required: home, about, one article, one note, one work, one illustration,
#            one bibliophilediaries, one saasguide, one faq
```

### After each phase

```bash
# 1. Build on the new branch
npm run build

# 2. Diff RSS
diff tests/pre-upgrade-rss.xml dist/rss.xml

# 3. Diff sitemaps
diff tests/pre-upgrade-sitemap-index.xml dist/sitemap-index.xml
diff tests/pre-upgrade-sitemap-0.xml dist/sitemap-0.xml

# 4. Diff per-page HTML (pipe through sed to strip asset hashes)
# Focus: <title>, <meta name="description">, <link rel="canonical">,
#         og:url, og:image, twitter:url, all JSON-LD <script> blocks

# 5. Check for trailing slash on file-extension endpoints
# In dist/rss.xml header: confirm <?xml-stylesheet href="/rss/pretty-feed-v3.xsl">
# In rendered HTML head: confirm href="...rss.xml" not "...rss.xml/"
```

### Phase 3 analytics smoke test (in addition to above)

1. Deploy the Phase 3 branch to a Cloudflare Pages preview URL.
2. Open browser DevTools → Network tab.
3. Load home page → navigate to an article using the header nav.
4. Confirm `astro:after-swap` fires (add a console.log listener in DevTools).
5. Click a `tel:` link — confirm a `phone_click` event reaches GA4 DebugView.
6. Click a `mailto:` link — confirm an `email_click` event.
7. Load `/offers/` (a campaign page if one exists) — confirm UTM parameters captured.
8. Confirm copy-code button appears and works on the article.

### Stop conditions (any of the following halts the upgrade)

- `dist/rss.xml` item links change for any existing entry (Phase 4)
- Canonical URL changes for any existing content route (any phase)
- JSON-LD schema array loses types or gains unexpected types (any phase)
- API routes return 500 on `npm run cfpreview` (Phase 2)
- Sitemap includes `/api/*` routes (any phase)
- `astro:after-swap` does not fire on navigation (Phase 3)
