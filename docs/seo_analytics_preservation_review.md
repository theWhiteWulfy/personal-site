# SEO and Analytics Preservation Review

This document evaluates the risks to SEO and analytics integrations during the proposed Astro 6 upgrade.

## 1. Metadata and Head Component
`src/components/Head.astro` is a massive component (889 lines) that centralizes all metadata.
- **Risks**:
  - **View Transitions**: It uses `<ViewTransitions />` from `astro:transitions`. Astro 6 replaces this with `<ClientRouter />`. If the router behaves differently regarding script execution or head merging, SEO metrics could fluctuate.
  - **Event Re-attachment**: Analytics depend on `document.addEventListener('astro:after-swap', ...)`. If `<ClientRouter />` alters this event lifecycle, client-side tracking (like pageviews or Clarity re-initialization) might drop off for SPA-like navigations.
  - **Astro.url**: Many canonical URL generations and Open Graph URLs rely on `Astro.url`. Any changes to trailing slash configuration or URL parsing in Astro 6 could result in duplicate content issues or mismatched canonicals.

## 2. Schema.org JSON-LD Output
`src/lib/schema-generators.ts` builds complex schemas based on page types.
- **Risks**:
  - The fallback chain in `Head.astro` uses `safeSchemaGeneration()`. If underlying Astro API changes cause unhandled exceptions during rendering, the site falls back to a minimal `WebPage` schema, stripping rich snippet eligibility.
  - Data sources for schemas often come from `Astro.props` passed down from content collections. If frontmatter schema or formatting changes (e.g., date formats), invalid JSON-LD could be produced.

## 3. Sitemap
Sitemap generation is handled by `@astrojs/sitemap`.
- **Risks**:
  - Astro 6 routing changes or adapter changes (Cloudflare hybrid mode) might alter which routes are statically discoverable.
  - Need to verify that server-rendered API endpoints (`/api/*`) continue to be excluded from the sitemap.
  - Ensure the sitemap configuration in `astro.config.mjs` remains valid with the upgraded `@astrojs/sitemap` version required for Astro 6.

## 4. RSS Feed
The RSS feed is manually constructed in `src/pages/rss.xml.js`.
- **Risks**:
  - It relies on `dayjs` for UTC date formatting.
  - Link generation depends on `item.collection` and `item.slug`. As noted in the content collection review, changes to these properties via the Content Layer API will directly break RSS syndication links.
  - `@astrojs/rss` dependency must be bumped alongside Astro.

## Verification Strategy
Before merging the Astro 6 upgrade branch, the following verifications MUST be performed:
1. Diff the generated output of `dist/sitemap-index.xml` and `dist/rss.xml`.
2. Inspect the raw HTML of a detail page, index page, and the home page to ensure canonical URLs and JSON-LD schemas remain character-for-character identical (excluding expected hash changes for built assets).
3. Verify client-side analytics events trigger correctly on initial load and after a client-side navigation.
