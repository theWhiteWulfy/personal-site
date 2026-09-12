# Astro 6.2 Implementation Audit

**Status**: Codex implementation-side audit. Documentation only; no runtime, dependency, or database changes.  
**Purpose**: Capture the code paths and preservation-sensitive contracts Codex must respect before any Astro 6.2 implementation branch lands.  
**Companion documents**: [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md), [`docs/astro_6_2_risk_inventory.md`](./astro_6_2_risk_inventory.md), [`docs/d1_api_contract.md`](./d1_api_contract.md), [`ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## 1. Audit Summary

| Surface | Current implementation fact | Implementation risk |
| --- | --- | --- |
| Client routing | `src/components/Head.astro` imports and renders `<ViewTransitions />`; seven files rely on `astro:after-swap` | High |
| Content collections | Multiple detail, index, home, tag, and RSS routes still rely on `entry.slug`, `entry.collection`, and `entry.render()` | High |
| Cloudflare adapter | `astro.config.mjs`, `src/env.d.ts`, `wrangler.toml`, and all 7 API routes assume `locals.runtime.env.DB` | High |
| Vite/PostCSS | `vite-plugin-pwa`, `@playform/compress`, and the full PostCSS chain are pinned to the Astro 4.15 baseline | High |
| Markdown/rendering | `markdown.syntaxHighlight` is `prism`; remark plugins are local modules; `npm run build` hard-requires `astro check` | Medium |
| Legacy content config | `src/content/config.ts` still uses legacy `defineCollection({ type: ... })` and `z` from `astro:content` | High |

---

## 2. `<ViewTransitions />` and `astro:after-swap` Contract

### 2.1 Primary wiring

- `src/components/Head.astro`
  - Imports `ViewTransitions` from `astro:transitions`.
  - Renders `<ViewTransitions />` near the top-level head/body transition boundary.

This file is the single router-enabling surface that future Astro 6 work will change to `<ClientRouter />`.

### 2.2 Listener inventory

The following files currently register `astro:after-swap` listeners and therefore depend on client-side navigation staying alive:

- `src/components/Head.astro`
- `src/components/CampaignCTA.astro`
- `src/components/CampaignHero.astro`
- `src/lib/resource-form.js`
- `src/lib/api/utm-tracking.ts`
- `src/pages/offers/[...slug].astro`
- `src/pages/offers/expired.astro`

### 2.3 Global helper contract re-bound after swap

`src/components/Head.astro` defines or exposes these browser globals and re-attachment helpers that must remain callable after navigation:

- `checkAnalyticsConsent`
- `trackEngagementEvent`
- `trackConversionEvent`
- `addCopyCodeButtons`

Implementation note:

- `Head.astro` assigns analytics helpers onto `window`.
- `Head.astro` also re-attaches `tel:` and `mailto:` conversion listeners after swap.
- `addCopyCodeButtons()` runs on both `DOMContentLoaded` and `astro:after-swap`.

Preservation rule:

- Any future helper extraction must keep the same call timing and the same public `window.*` contract until Jules validates the post-swap behavior on preview.

---

## 3. `entry.slug`, `entry.render()`, and `entry.collection` Inventory

### 3.1 Detail routes still using `slug` and `render()`

These routes still build static paths with `post.slug`, compare against `Astro.params.slug`, and/or call `await post.render()`:

- `src/pages/articles/[...slug].astro`
- `src/pages/notes/[...slug].astro`
- `src/pages/works/[...slug].astro`
- `src/pages/bibliophilediaries/[...slug].astro`
- `src/pages/saasguide/[...slug].astro`
- `src/pages/faqs/[...slug].astro`

Shared implementation pattern:

- `getStaticPaths()` returns `params: { slug: post.slug }`
- The page-level render path calls `await post.render()`
- Adjacent-post logic passes `Astro.params.slug` into `getAdjacentPosts(...)`

### 3.2 Index and aggregate routes still building URLs from `collection` + `slug`

These routes still construct content URLs with `/${entry.collection}/${entry.slug}` or equivalent:

- `src/pages/index.astro`
- `src/pages/articles/index.astro`
- `src/pages/notes/index.astro`
- `src/pages/works/index.astro`
- `src/pages/bibliophilediaries/index.astro`
- `src/pages/saasguide/index.astro`
- `src/pages/faqs/index.astro`
- `src/pages/tag/[...slug].astro`
- `src/pages/rss.xml.js`

Additional aggregate route to preserve:

- `src/pages/tag/index.astro` does not emit entry URLs directly, but it aggregates tags from the same legacy collection entries and remains part of the review surface.

### 3.3 Route mismatch to record before any shim work

The task list referenced `src/pages/illustrations/[...slug].astro`, but the current repo does **not** have that route.

Actual illustrations surfaces:

- `src/pages/illustrations/index.astro`
- `src/pages/illustrations/[...id].astro`

Implementation fact:

- Illustrations are currently backed by the `albums` data collection, not by a slugged content collection.
- `src/pages/illustrations/index.astro` links with `path={`/illustrations/${item.id}`}`.
- `src/pages/illustrations/[...id].astro` already uses `album.id` in `getStaticPaths()`.

Preservation rule:

- Future `slug` to `id` shims should treat illustrations separately from article-like collections to avoid forcing a fake slug migration where none exists today.

### 3.4 `getAdjacentPosts` discrepancy to track

The six `[...slug].astro` detail routes import `getAdjacentPosts` from `src/lib/utils.ts`, but the current baseline copy of `src/lib/utils.ts` in this branch only exposes `formatDate()` and `readingTime()`.

Implementation note:

- This appears to be a branch-state inconsistency worth re-verifying before any runtime branch touches the detail routes.
- It is not fixed in this documentation branch.

---

## 4. Cloudflare Adapter and D1 Wiring Audit

### 4.1 `astro.config.mjs` adapter block

Current adapter settings:

- Adapter: `@astrojs/cloudflare`
- `output: "hybrid"`
- `platformProxy.enabled: true`
- `imageService: "passthrough"`

These settings are implementation-sensitive because Astro 5 removes `output: "hybrid"` and the adapter major version changes in the Astro 6 line.

### 4.2 Runtime typing

`src/env.d.ts` currently declares:

- `D1Database` from `@cloudflare/workers-types`
- `ENV` with binding `DB`
- `Runtime` from `@astrojs/cloudflare`
- `App.Locals extends Runtime`

Preservation rule:

- Keep `DB` as the exact binding name and keep the runtime typing synchronized with the adapter version. Do not rewrite this shape casually in the upgrade branch.

### 4.3 `wrangler.toml` invariants

Current Cloudflare invariants:

- `compatibility_flags = ["nodejs_compat"]`
- `binding = "DB"`
- `database_name = "meteoric"`
- `database_id = "8380ec22-098e-4814-a56f-48d907425b35"`

These values are contractually tied to the API routes and to the D1 architecture document.

### 4.4 All seven API routes confirm server-only DB access

Audited route set:

- `src/pages/api/newsletter.ts`
- `src/pages/api/leadform.ts`
- `src/pages/api/resource-download.ts`
- `src/pages/api/serve-resource.ts`
- `src/pages/api/campaigns.ts`
- `src/pages/api/campaign-visit.ts`
- `src/pages/api/campaign-signup.ts`

Observed implementation facts:

- All 7 export `const prerender = false`
- All 7 reach D1 through `locals.runtime.env.DB`
- `newsletter.ts` and `leadform.ts` still use a verbose null-check instead of the optional-chaining guard used elsewhere

Preservation rule:

- Any guard normalization in a later runtime branch must preserve response status codes and error JSON shapes, because downstream forms may implicitly depend on them.

---

## 5. Vite, PWA, and PostCSS Chain

### 5.1 Vite/plugin surfaces in `astro.config.mjs`

Current build-time integrations and plugins:

- `@astrojs/mdx`
- `@astrojs/sitemap`
- `@playform/compress`
- `vite-plugin-pwa`

Current Vite-specific config:

- `vite.logLevel = "warn"`
- `vite.build.rollupOptions.external = ["dist/workbox-*.js", "public/web/experiment/js/*.js"]`
- `VitePWA({ registerType: "autoUpdate", manifest, workbox: { globDirectory: "dist", globPatterns: [...], navigateFallback: null } })`

### 5.2 PostCSS plugin order from `postcss.config.cjs`

Configured plugin order:

1. `postcss-import`
2. `postcss-url`
3. `postcss-mixins`
4. `postcss-nested`
5. `postcss-custom-media`
6. `postcss-preset-env`
7. `cssnano`

### 5.3 Current baseline package versions

These are the versions pinned in `package.json` on the Astro 4.15 baseline:

| Package | Current version |
| --- | --- |
| `astro` | `^4.15.12` |
| `@astrojs/check` | `^0.7.0` |
| `@astrojs/cloudflare` | `^11.0.1` |
| `@astrojs/mdx` | `^3.1.0` |
| `@astrojs/rss` | `^4.0.6` |
| `@astrojs/sitemap` | `^3.1.5` |
| `@cloudflare/workers-types` | `^4.20240729.0` |
| `@playform/compress` | `^0.0.13` |
| `vite-plugin-pwa` | `^0.16.4` |
| `postcss-import` | `^16.1.0` |
| `postcss-mixins` | `^10.0.1` |
| `postcss-nested` | `^6.0.1` |
| `postcss-custom-media` | `^8.0.2` |
| `postcss-preset-env` | `^9.5.14` |
| `postcss-url` | `^10.1.3` |
| `cssnano` | `^7.0.2` |

Implementation note:

- This audit records the current known-good baseline, not a final Astro 6 target matrix.
- Any future version-bump branch should keep this plugin list intact until Jules or Gemini proves a required replacement.

---

## 6. Markdown, Remark, and `astro check`

### 6.1 Markdown surface

`astro.config.mjs` currently sets:

- `markdown.syntaxHighlight = "prism"`
- `markdown.remarkPlugins = [remarkReadingTime, remarkModifiedTime]`

Remark plugin module sources:

- `src/lib/remark-reading-time.mjs`
- `src/lib/remark-modified-time.mjs`

Preservation rule:

- Treat Prism as the current baseline contract. If Astro 6 defaults or docs favor Shiki, that is still a deliberate migration decision, not an automatic cleanup.

### 6.2 Build command coupling

`package.json` currently defines:

- `"build": "astro check && astro build"`

Implementation risk:

- Any Astro 6 dependency bump must keep `astro check` working in lockstep with `@astrojs/check`, otherwise the build script fails before the actual site build starts.

---

## 7. `src/content/config.ts` Freeze

Current implementation facts:

- `src/content/config.ts` imports `defineCollection` and `z` from `astro:content`
- All 8 collections still use the legacy `defineCollection({ type: "content" | "data" })` shape
- `albums` remains a data collection with `cover: image()`

Preservation rule:

- Keep `src/content/config.ts` unchanged until a reviewed migration branch exists.
- Do not front-run the Content Layer loader migration in the same branch as router, adapter, or Vite changes.

---

## 8. Codex Implementation Guardrails

Before any runtime implementation branch starts, preserve these contracts:

1. `src/components/Head.astro` remains the single router/analytics/copy-code coordination point until the `<ClientRouter />` work is verified.
2. Collection routes that still use `entry.slug`, `entry.collection`, and `entry.render()` should be isolated behind shims rather than edited ad hoc across every page.
3. `locals.runtime.env.DB`, binding name `DB`, and `wrangler.toml` invariants remain unchanged unless the branch is explicitly about adapter/runtime wiring.
4. The current PostCSS and Vite plugin chain should be treated as a preservation surface, not incidental config.
5. `src/pages/illustrations/[...id].astro` is already on an `id`-based route and should not be forced into the article-style slug migration path.
