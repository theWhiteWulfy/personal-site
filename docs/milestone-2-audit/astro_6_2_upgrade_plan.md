# Astro 4.15 → 6.2 Phased Upgrade Plan

**Status**: Architecture-only document. Documentation produced by Claude (Architect).
**Scope**: This is the single entry point for Codex, Gemini, and Jules during the Astro upgrade. It captures every breaking-change delta, the per-collection Content Layer recipe, the phased execution slices, the decisions Alok must approve before code lands, and the URL/canonical behavior to preserve.
**No code changes are made by this document.** Implementation will happen in subsequent branches owned by Codex, with Jules verifying.

---

## Cross-References

This plan should be read alongside three companion documents:

- [`docs/astro_6_2_risk_inventory.md`](./astro_6_2_risk_inventory.md) — initial risk register identifying the six high-risk surfaces (collections, `entry.slug`/`entry.render()`, `<ViewTransitions />`, Cloudflare adapter, Vite/Postcss, schema/metadata).
- [`docs/content_collection_review.md`](./content_collection_review.md) — audit of every touchpoint that depends on the legacy collection API (detail pages, indexes, taxonomy, RSS, gallery).
- [`docs/seo_analytics_preservation_review.md`](./seo_analytics_preservation_review.md) — SEO and analytics regression risks tied to the upgrade.
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — first-run baseline; "Upgrade Risks" section now points back to this plan.

---

## 1. Breaking-Change Deltas: 4.15.12 → 6.2

This section enumerates every breaking change in Astro 5.0 and Astro 6.0 that is **relevant to this repository**, based on the current code at `astro@^4.15.12` with `output: "hybrid"`, `@astrojs/cloudflare ^11.0.1`, `@astrojs/mdx ^3.1.0`, `@astrojs/rss ^4.0.6`, `@astrojs/sitemap ^3.1.5`, `vite-plugin-pwa ^0.16.4`, and the Vite 5 generation. Items confirmed not applicable are noted with `N/A`.

Sources: [Astro v5 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v5/), [Astro v6 upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/), [@astrojs/cloudflare CHANGELOG](https://github.com/withastro/astro/blob/next/packages/integrations/cloudflare/CHANGELOG.md). Content was rephrased for compliance with licensing restrictions.

### 1.1 Astro 5.0 deltas applicable to this repo

| # | Change | Surface in this repo | Severity | Phase |
|---|---|---|---|---|
| 5-A | `output: "hybrid"` is removed; merged into `output: "static"` (which now also supports per-route `prerender = false`) | `astro.config.mjs` | High (build will fail) | Phase 2 |
| 5-B | `<ViewTransitions />` renamed to `<ClientRouter />` (alias still present in v5) | `src/components/Head.astro` | High | Phase 3 |
| 5-C | Vite 6 (was Vite 5) | `astro.config.mjs`, PostCSS plugin chain, `vite-plugin-pwa` | High (compat) | Phase 2 |
| 5-D | `@astrojs/mdx` v4 required (project on v3) | `package.json`, MDX rendering | Medium | Phase 2 |
| 5-E | Legacy v2 Content Collections API moves to maintenance mode; auto-compat exists, with caveats | `src/content/config.ts`, every page using `getCollection`, `entry.slug`, `entry.render()` | High | Phase 2 (compat) → Phase 5 (loader) |
| 5-F | `legacy.collections` flag introduced as opt-in for unchanged behavior | `astro.config.mjs` | Optional | Phase 2 |
| 5-G | CSRF protection default flips from `false` to `true` (`security.checkOrigin`) | All POST API routes (`newsletter.ts`, `leadform.ts`, `resource-download.ts`, `serve-resource.ts`, `campaigns.ts`, `campaign-visit.ts`, `campaign-signup.ts`) | High | Phase 2 |
| 5-H | `<script>` tags no longer hoisted, no longer auto-bundled, no longer auto-inlined when conditionally rendered | `src/components/Head.astro` (analytics, copy-code), `src/layouts/Layout.astro` | Medium | Phase 2 |
| 5-I | Route priority changed: redirects, injected routes, file-based routes share priority rules | `public/_redirects` (Cloudflare-side, not Astro injected — likely N/A), `src/pages/` | Low | Phase 2 |
| 5-J | TypeScript: recommended `include: [".astro/types.d.ts", "**/*"]` and `exclude: ["dist"]`; `src/env.d.ts` only needed for custom configs | `tsconfig.json`, `src/env.d.ts` | Low (we keep `src/env.d.ts` for D1 types) | Phase 2 |
| 5-K | `paginate()` URLs now include `base` automatically | None — `base` is not configured | N/A | — |
| 5-L | `params` no longer auto-decoded | `getStaticPaths` in dynamic routes | Low (slugs are kebab-case ASCII, no encoded chars) | Phase 4 audit |
| 5-M | Non-boolean HTML attributes serialize value explicitly (`data-x="false"` vs presence-only) | All `data-*` and string-valued attributes in components | Low-Medium | Phase 2 verification |
| 5-N | `Astro.glob()` deprecated (still works in v5) | None — repo does not use `Astro.glob()` | N/A | — |
| 5-O | Squoosh image service removed | None — `imageService: 'passthrough'` configured | N/A | — |
| 5-P | Lit integration removed | None | N/A | — |
| 5-Q | `compiledContent()` becomes async | None — repo does not import Markdown modules manually | N/A | — |
| 5-R | `astro:content` blocked on the client | None — collections are only used server-side | N/A | — |
| 5-S | Shiki `css-variables` token renames | None — repo uses Prism (`syntaxHighlight: 'prism'`) | N/A | — |
| 5-T | Image endpoint config shape change | None — image service is passthrough | N/A | — |

### 1.2 Astro 6.0 deltas applicable to this repo

| # | Change | Surface in this repo | Severity | Phase |
|---|---|---|---|---|
| 6-A | Node 22.12.0 minimum | Cloudflare Pages build env, local dev | High (deployment env) | Phase 1 verification |
| 6-B | Vite 7 (from Vite 6) | All Vite plugins | High | Phase 2 |
| 6-C | Vite Environment API integration; integration hooks and HMR access patterns change | Internal only — repo does not author custom integrations | Low | — |
| 6-D | Zod 4 (from Zod 3) | `src/content/config.ts`, any other Zod usage | Medium | Phase 2 |
| 6-E | Shiki 4 | None (Prism in use) | N/A | — |
| 6-F | `@astrojs/cloudflare` major version bump to v13 with significant changes; refer to that adapter's CHANGELOG | `astro.config.mjs`, `src/env.d.ts`, all `src/pages/api/*.ts` | High | Phase 2 |
| 6-G | Legacy content collections backwards compatibility removed; `legacy.collections` flag removed; `legacy.collectionsBackwardsCompat` is the new temporary migration helper | `src/content/config.ts`, all consumers of `entry.slug` / `entry.render()` | High | Phase 2 (compat flag) → Phase 5 (full migration) |
| 6-H | `<ViewTransitions />` removed entirely | `src/components/Head.astro` | High (must already be on `<ClientRouter />` from Phase 3) | Phase 3 |
| 6-I | `Astro.glob()` removed | None | N/A | — |
| 6-J | `astro:schema` and `z` from `astro:content` deprecated; import `z` from `astro/zod` | `src/content/config.ts` (currently `import { defineCollection, z } from "astro:content"`) | Low | Phase 2 |
| 6-K | Endpoints with a file extension cannot be accessed with a trailing slash, regardless of `build.trailingSlash` | `/rss.xml`, `/sitemap-index.xml`, `/sitemap-0.xml`, any client links to these | Medium | Phase 2 (verify `feedUrl` and outgoing links) |
| 6-L | `import.meta.env` values are always inlined; non-public env vars no longer auto-replaced with `process.env`; coercion stops (e.g. `"true"` stays a string) | `src/lib/analytics.ts`, `src/config/site.js` (`githubApiToken: import.meta.env.PUBLIC_GH_TOKEN` style usage) | Medium | Phase 2 audit |
| 6-M | Markdown heading ID generation no longer strips trailing hyphens for headings ending in special characters | Any in-content anchor links, table-of-contents output | Low | Phase 4 audit |
| 6-N | `getStaticPaths()` returning numeric `params` no longer permitted | All `[...slug].astro` use string slugs already | N/A | — |
| 6-O | Default image service crops by default; never upscales; rasterizes SVGs when `format` is set | None — image service is passthrough | N/A | — |
| 6-P | `i18n.routing.redirectToDefaultLocale` default flips to `false` | None — i18n not configured | N/A | — |
| 6-Q | CommonJS config files removed (`.cjs`, `.cts`) | None — `astro.config.mjs` already ESM | N/A | — |
| 6-R | `<script>` and `<style>` rendered in source order (was reversed by default) | `src/components/Head.astro`, layouts, components with stacked styles | Medium | Phase 2 verification |
| 6-S | Experimental flags now stable: `csp`, `fonts`, `liveContentCollections`, `preserveScriptOrder`, `staticImportMetaEnv`, `headingIdCompat`, `failOnPrerenderConflict` | Config cleanup if any were toggled — none are toggled in this repo | N/A | — |
| 6-T | `getImage()` throws when called on the client | Not used on client | N/A | — |
| 6-U | Various Adapter API changes (`SSRManifest` shape, `app.render()` signature, `entrypointResolution`, `NodeApp` deprecated, `routes` on `astro:build:done` removed, Rollup output config moved under `vite.environments.client.build.rollupOptions.output`) | Internal to adapters — handled by `@astrojs/cloudflare` v13 | N/A (adapter handles) | — |

### 1.3 Companion dependency deltas (forced by Astro 5/6)

| Dependency | Current | v5 target | v6 target | Notes |
|---|---|---|---|---|
| `astro` | `^4.15.12` | `^5.x` | `^6.x` | Driver of the upgrade |
| `@astrojs/cloudflare` | `^11.0.1` | v12 | v13 | Read its CHANGELOG before each phase; major API churn |
| `@astrojs/mdx` | `^3.1.0` | `^4.x` | latest matching | Must bump together with v5 |
| `@astrojs/rss` | `^4.0.6` | latest matching v5 | latest matching v6 | API stable; version bump only |
| `@astrojs/sitemap` | `^3.1.5` | latest matching v5 | latest matching v6 | Verify `/sitemap-index.xml` URL behavior under 6-K |
| `@astrojs/check` | `^0.7.0` | latest | latest | Tied to `typescript`/Astro |
| `@playform/compress` | `^0.0.13` | verify | verify | Pre-release; check Vite 7 compat |
| `vite-plugin-pwa` | `^0.16.4` | needs Vite 6 + v0.20.x or `@vite-pwa/astro` | needs Vite 7 | Most likely needs swap to `@vite-pwa/astro` integration |
| PostCSS chain (`postcss-import`, `postcss-nested`, `postcss-mixins`, `postcss-custom-media`, `postcss-preset-env`, `cssnano`) | various | verify against Vite 6 | verify against Vite 7 | Trial build catches breakage |
| `@cloudflare/workers-types` | `^4.20240729.0` | latest | latest | Tied to Workers runtime |
| `wrangler` | `^4.28.1` | latest | latest | Independent of Astro |
| Node | unspecified | 18.20+ | **22.12.0+** | `.nvmrc` to be added |

---

## 2. Per-Collection Content Layer Migration Recipes

The repository defines eight collections in `src/content/config.ts`: seven Markdown/MDX content collections and one YAML data collection (`albums`). All are legacy `type: "content"` or `type: "data"` style. This section gives Codex the exact loader, schema, and slug strategy for each.

### 2.1 General migration shape

The Content Layer pattern is:

```ts
import { defineCollection } from "astro:content";
import { z } from "astro/zod";              // 6-J: was `astro:content` in 4.x
import { glob, file } from "astro/loaders"; // new in v5

const collectionName = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/<dir>" }),
  schema: z.object({ /* ... */ }),
});
```

Key differences from the legacy API:

- No `type: "content" | "data"`. The loader determines that.
- `entry.slug` is replaced by `entry.id` (the file path stem, slugified by glob).
- `entry.render()` is replaced by `import { render } from "astro:content"; const { Content } = await render(entry);`.
- Sort order from `getCollection()` is non-deterministic. Every consumer must sort explicitly. (Most index pages already do.)
- `getEntry(collection, key)` returns `Entry | undefined` (was always-defined for static keys in legacy mode).
- `image().refine()` is unsupported in collection schemas. None of our schemas use `.refine()` on `image()`, so this is informational.

### 2.2 Recipe per collection

| Collection | Type | Loader | Schema field deltas | Slug strategy |
|---|---|---|---|---|
| `articles` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" })` | None — schema unchanged from current shape | `entry.id` is the path stem (e.g. `my-post`); replace `entry.slug` with `entry.id` everywhere |
| `notes` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" })` | None | Same as above |
| `works` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/works" })` | Keep `output: z.boolean().optional()` | Same as above |
| `illustrations` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/illustrations" })` | None | Same as above |
| `bibliophilediaries` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/bibliophilediaries" })` | None | Same as above |
| `saasguide` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/saasguide" })` | None | Same as above |
| `faqs` | content | `glob({ pattern: "**/*.{md,mdx}", base: "./src/content/faqs" })` | Keep `order: z.number()`, `excerpt` optional | Same as above |
| `albums` | data | `glob({ pattern: "**/*.yaml", base: "./src/content/albums" })` (preferred) **or** `file()` per album | `cover: image()` works the same in Content Layer; the `image()` helper is still available via the `schema: ({ image }) => z.object({ ... })` callback | `entry.id` is the YAML file stem (e.g. `cards`, `logos`); the gallery page already keys on the YAML basename |

### 2.3 Render-call replacements

In every `[...slug].astro` route, replace:

```ts
const { Content, headings, remarkPluginFrontmatter } = await post.render();
```

with:

```ts
import { render } from "astro:content";
const { Content, headings, remarkPluginFrontmatter } = await render(post);
```

### 2.4 RSS link replacements

In `src/pages/rss.xml.js`, replace the link template:

```js
link: `/${item.collection}/${item.slug}/`
```

with:

```js
link: `/${item.collection}/${item.id}/`
```

Trailing slash behavior is governed by `build.trailingSlash` (default `"ignore"` is fine for non-extension routes; the v6 file-extension rule 6-K does not apply here because these are pretty URLs).

### 2.5 getStaticPaths replacements

In every dynamic route under `src/pages/<collection>/[...slug].astro`, the params mapping changes from:

```ts
params: { slug: post.slug }
```

to:

```ts
params: { slug: post.id }
```

The `post.id` value from `glob()` is already filename-derived and slug-shaped, so URL output will match the legacy behavior for all current entries. Codex should still diff one rendered detail page per collection (per Jules's diff protocol in the SEO preservation review) to confirm.

---

## 3. Phased Migration Strategy

The upgrade is sliced into five reviewable phases. Each phase is its own branch, owned by Codex, verified by Jules, and architecturally reviewed by Claude. **No phase combines documentation and code.** Branch names listed are recommendations.

### Phase 1 — Dependency Dry-Run (no code edits)

**Branch**: `chore/astro-6-2-dry-run` (throwaway, never merged)
**Owner**: Codex
**Verifier**: Jules
**Goal**: Empirically confirm the dependency upgrade path before touching any code.

Steps:

1. Branch from `main`. Bump `astro`, `@astrojs/cloudflare`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, and `vite-plugin-pwa` (or replacement) to their latest 6.x-compatible versions.
2. Add `.nvmrc` with `22.12.0`.
3. Run `npm install` and capture the resolution log.
4. Run `npm run build` and capture every error verbatim. Do not fix any error. The branch's purpose is the error log, not a green build.
5. Run `npx astro check` and capture diagnostics.
6. Discard the branch. Commit the captured logs as evidence in `docs/astro_6_2_decisions.md` (created in Milestone 5).

**Success criterion**: a complete error catalog that confirms the deltas in §1 and reveals any unforeseen issues.

### Phase 2 — Version Bumps with Legacy Compat Preserved

**Branch**: `chore/astro-6-bump-with-legacy-compat`
**Owner**: Codex
**Verifier**: Jules
**Goal**: Land Astro 6 + Cloudflare adapter v13 + Vite 7 with the project building green, while keeping `<ViewTransitions />` (still works as `<ClientRouter />` rename in v5; for v6 the rename is mandatory — see Phase 3 caveat below) and keeping legacy collections via `legacy.collectionsBackwardsCompat`.

Caveat: in v6 `<ViewTransitions />` is fully removed. Phase 2 therefore actually ships `<ClientRouter />` already (a non-functional rename — see Phase 3 for the verification work). The phase ordering reflects review surface, not technical separability.

Concrete edits in this phase:

1. `package.json`: bump `astro`, all `@astrojs/*` packages, `vite-plugin-pwa` (or swap to `@vite-pwa/astro`), update `@cloudflare/workers-types` and `typescript` if needed.
2. `astro.config.mjs`:
   - Remove `output: "hybrid"` (5-A). The default `static` mode now supports per-route opt-out via `prerender = false`.
   - Add `legacy: { collectionsBackwardsCompat: true }` (6-G). This buys time before Phase 5.
   - Confirm `security.checkOrigin` (5-G). Decision: see §4.
   - Verify Cloudflare adapter import shape against v13 CHANGELOG.
3. `src/content/config.ts`: change `import { z } from "astro:content"` to `import { z } from "astro/zod"` (6-J). No schema edits otherwise.
4. `src/components/Head.astro`: rename `<ViewTransitions />` to `<ClientRouter />` and update the import (5-B / 6-H).
5. `tsconfig.json`: add `"include": [".astro/types.d.ts", "**/*"]`, `"exclude": ["dist"]` (5-J). Keep `src/env.d.ts` because it carries the D1 runtime declaration.
6. `.nvmrc`: pin `22.12.0` (6-A).
7. Audit `src/lib/analytics.ts` and `src/config/site.js` for `import.meta.env` usage that relied on `process.env` substitution or coercion (6-L).
8. Audit `<script>` and `<style>` order in `src/components/Head.astro` and any layout (6-R).

**Verification gate**: `npm run build` passes. `astro check` passes. Local `npm run cfpreview` passes. RSS, sitemap, and one detail page per content collection match the pre-upgrade diff captured by Jules.

### Phase 3 — Verify the `<ClientRouter />` swap

**Branch**: `chore/astro-6-client-router-verification`
**Owner**: Codex
**Verifier**: Jules
**Goal**: The component rename is mechanical, but the post-swap event lifecycle (especially `astro:after-swap`) is the riskiest behavior change because it gates analytics, copy-code, campaign analytics, UTM tracking, and resource form behavior.

Steps:

1. Confirm `astro:after-swap` still fires with `<ClientRouter />` enabled.
2. Run the analytics consent and tracking smoke test on a deployed preview: load home → navigate to an article → fire a `tel:` click → confirm the event reached GA4 and Clarity.
3. Confirm copy-code buttons re-attach after a transition.
4. Confirm `CampaignCTA.astro`, `CampaignHero.astro`, `resource-form.js`, `utm-tracking.ts`, `offers/[...slug].astro`, `offers/expired.astro` re-attach their listeners after navigation.
5. Diff canonical, OG, and JSON-LD tags before and after navigation on the same page (per Jules's protocol).

**Decision point** — see §4: should the project keep `<ClientRouter />` or remove client-side routing entirely and fall back to the native MPA flow?

### Phase 4 — `entry.slug` / `entry.render()` audit-and-replace

**Branch**: `chore/astro-6-collection-api-audit`
**Owner**: Codex
**Verifier**: Jules
**Goal**: Even with `legacy.collectionsBackwardsCompat` keeping the API alive, the project should migrate consumers off `entry.slug` and `entry.render()` because v7 will drop the flag entirely.

Audit targets (full list in [`docs/content_collection_review.md`](./content_collection_review.md)):

- `src/pages/articles/[...slug].astro`
- `src/pages/notes/[...slug].astro`
- `src/pages/works/[...slug].astro`
- `src/pages/illustrations/[...slug].astro`
- `src/pages/bibliophilediaries/[...slug].astro`
- `src/pages/saasguide/[...slug].astro`
- `src/pages/faqs/[...slug].astro`
- `src/pages/tag/[...slug].astro` and `src/pages/tag/index.astro`
- `src/pages/rss.xml.js`
- Index pages for each collection
- Gallery pages consuming `albums`

Replacements per §2.3, §2.4, §2.5.

**Verification gate**: identical rendered HTML for one detail page per collection, identical `dist/rss.xml`, identical `dist/sitemap-*.xml`. Trailing-slash audit under 6-K (verify `feedUrl` in `src/config/site.js` and any internal links to `/rss.xml`).

### Phase 5 — Optional Content Layer Loader Migration

**Branch**: `feat/astro-6-content-layer-loaders`
**Owner**: Codex
**Verifier**: Jules
**Goal**: Replace `src/content/config.ts` with the loader-based shape and remove `legacy.collectionsBackwardsCompat`.

Per §2.2 recipes. After Phase 5:

- Remove `legacy.collectionsBackwardsCompat` from `astro.config.mjs`.
- Verify `albums` data collection round-trips through the gallery pages (image resolution via `image()` helper still works in the loader-based shape).
- Final diff pass against pre-upgrade baseline.

**Stop condition**: if any consumer of `entry.id` versus `entry.slug` produces a URL drift, Phase 5 should pause and Claude should re-baseline before continuing.

---

## 4. Decisions Requiring Alok's Approval

The following decisions cannot be made silently by Codex. Each is presented with options and the recommended choice. Codex must wait for explicit confirmation before acting.

### 4.1 Keep `<ClientRouter />` or remove client-side routing?

| Option | Effect | Recommendation |
|---|---|---|
| A. Keep `<ClientRouter />` (mechanical rename of `<ViewTransitions />`) | Client-side navigation continues to work; `astro:after-swap` continues to fire; analytics, copy-code, campaign and resource scripts must keep their re-attachment listeners. | **Recommended.** The repo has seven files (`Head.astro`, `CampaignCTA.astro`, `CampaignHero.astro`, `resource-form.js`, `utm-tracking.ts`, `offers/[...slug].astro`, `offers/expired.astro`) that already implement the contract. Removing routing is a bigger change than keeping it. |
| B. Remove `<ClientRouter />` and rely on native MPA navigation | Simpler mental model; eliminates a class of regression risk; full page reload between routes; analytics re-init on every load (already handled). All `astro:after-swap` listeners become dead code and can be removed. | Defer for a future cleanup unless Alok wants to simplify. |

### 4.2 Cloudflare adapter v11 → v13 acceptance

| Option | Effect | Recommendation |
|---|---|---|
| A. Bump `@astrojs/cloudflare` to v13 in lockstep with Astro 6 | Required path. `locals.runtime.env.DB` access pattern is preserved per the adapter's CHANGELOG; verify on local D1 preview before merging. | **Recommended (and necessary).** |
| B. Stay on Astro 5 (and adapter v12) for now | Defers Vite 7, Node 22, and Zod 4 work. | Not recommended; v5 has no LTS. |

### 4.3 `legacy.collectionsBackwardsCompat` flag duration

| Option | Effect | Recommendation |
|---|---|---|
| A. Use the flag through Phase 4, drop it in Phase 5 | Two-step migration; smaller diffs per phase. | **Recommended.** |
| B. Migrate to Content Layer in one shot during Phase 2 | Single big diff; higher review surface; longer time-to-merge. | Not recommended unless Alok wants fewer branches. |

### 4.4 `albums` (data collection) loader

| Option | Effect | Recommendation |
|---|---|---|
| A. `glob({ pattern: "**/*.yaml", base: "./src/content/albums" })` | Mirrors current behavior; one loader covers all albums. | **Recommended.** |
| B. `file("./src/content/albums/<name>.yaml")` per album | Explicit but verbose; harder to add a new album. | Not recommended. |

### 4.5 `vite-plugin-pwa` strategy

| Option | Effect | Recommendation |
|---|---|---|
| A. Keep `vite-plugin-pwa` and bump it to a Vite 7 compatible release | Mechanical version bump if upstream releases support. | First choice if available. |
| B. Swap to `@vite-pwa/astro` (the Astro-native integration) | Maintained by the same team for Astro 5/6; cleaner integration point; small config surface change. | **Recommended fallback** if (A) is not viable. |
| C. Drop PWA support during the upgrade | Reduces blast radius but ships a regression. | Not recommended. |

Alok must confirm the PWA path before Phase 2.

### 4.6 CSRF default flip (`security.checkOrigin: true`)

| Option | Effect | Recommendation |
|---|---|---|
| A. Accept the new default (`true`) | All POST API routes will reject requests where the `Origin` header does not match the URL. The site posts forms to its own origin, so this is the correct posture. | **Recommended.** |
| B. Override to `false` | Preserves v4 behavior; weakens security. | Not recommended. |

### 4.7 `output: "hybrid"` removal

| Option | Effect | Recommendation |
|---|---|---|
| A. Remove `output: "hybrid"` and rely on default + per-route `prerender = false` | All API routes already declare `export const prerender = false;`. Behavior is preserved. | **Recommended (and required for v5/v6).** |

### 4.8 Drop legacy `staticmanApi` and Gatsby-era references during the upgrade?

`src/config/site.js` still references a Heroku Staticman API and a `gatsby develop` command appears in `README.md`. These are unrelated to the upgrade but are tempting to clean up.

| Option | Recommendation |
|---|---|
| A. Defer cleanup to a separate `chore/legacy-cleanup` branch | **Recommended.** Keep the upgrade scope tight. |
| B. Bundle into Phase 2 | Not recommended; muddies the diff. |

---

## 5. Trailing Slash and `Astro.url` Behavior After Upgrade

The repository's canonical URLs, OpenGraph URLs, and Twitter Card URLs are produced by `src/components/Head.astro` from `Astro.url`. SEO regression risk hinges on three behaviors.

### 5.1 `Astro.url` shape

`Astro.url` is a standard `URL` instance. Astro 5 and 6 do not change this. The relevant guarantees:

- `Astro.url.pathname` reflects the current route path (e.g. `/articles/some-post/`).
- `Astro.url.origin` reflects the configured `site` (`https://alokprateek.in`).
- `Astro.url.href` is the full URL, used for canonical emission.

No code change is needed for the canonical URL emission itself, provided `site` in `astro.config.mjs` is preserved.

### 5.2 Trailing slash on content routes

The repo does not configure `build.trailingSlash` explicitly, so it inherits the default `"ignore"`. This means content routes like `/articles/foo/` and `/articles/foo` are both accepted. The current `Head.astro` canonical and OG URL emission should continue to produce the same URL shape after upgrade.

**Action**: capture the canonical URL of one page per content collection before Phase 2. Diff after Phase 2 and after Phase 5. Any drift is an immediate stop-the-upgrade signal.

### 5.3 Trailing slash on file-extension endpoints (Astro 6, change 6-K)

Astro 6 forbids accessing `/rss.xml/` (with trailing slash). Only `/rss.xml` is valid.

**Action items for Phase 2**:

- Inspect `src/config/site.js` `feedUrl`. If it ends with `/`, fix it (e.g. `https://alokprateek.in/rss.xml`, not `.../rss.xml/`).
- Inspect `src/components/Head.astro` for any RSS alternate `<link rel="alternate">` href that ends with `/` after `.xml`.
- Inspect `public/_redirects` for any rule that 301s to `/rss.xml/`. Update to `/rss.xml`.
- Inspect any internal anchor in MDX content linking to `/rss.xml/` or `/sitemap-index.xml/`.

Sitemap index URLs follow the same rule (`/sitemap-index.xml`, `/sitemap-0.xml`, never with trailing slash).

### 5.4 `Astro.site` versus `import.meta.env.SITE` inside `getStaticPaths`

Astro 6 deprecates accessing `Astro` inside `getStaticPaths()`. The repo does not currently access `Astro.site` inside any `getStaticPaths()` block (the dynamic routes only use `getCollection()`), so this is informational. If a future change introduces `Astro.site` use inside `getStaticPaths()`, it must be replaced with `import.meta.env.SITE`.

---

## 6. Out-of-Scope for This Plan

The following are deliberately not addressed here. They are tracked in their respective task lists or in [`ARCHITECTURE.md`](../ARCHITECTURE.md) "First-Run Findings".

- D1 missing-table migrations (`newsletter`, lead form table) — owned by Milestone 3 in `claude_tasks.md`, then by Codex.
- Missing `scripts/migrate-database.js` and `scripts/verify-database.js` — owned by Milestone 3, then by Codex.
- `wrangler.toml` invariants — owned by Milestone 3.
- SEO output pinning (the canonical/OG/JSON-LD/RSS/sitemap byte-level invariants) — owned by Milestone 4.
- Diff-driven verification protocol — owned by Milestone 4 and Jules.

---

## 7. Sequencing Summary

```
Phase 1 (chore/astro-6-2-dry-run) — capture errors
   │
   ▼
Phase 2 (chore/astro-6-bump-with-legacy-compat) — green build with legacy flag
   │
   ▼
Phase 3 (chore/astro-6-client-router-verification) — verify after-swap contract
   │
   ▼
Phase 4 (chore/astro-6-collection-api-audit) — replace entry.slug / entry.render()
   │
   ▼
Phase 5 (feat/astro-6-content-layer-loaders) — drop legacy flag
```

Each phase is its own PR, reviewed by Claude (architecture), implemented by Codex, verified by Jules. Gemini is consulted on metadata-touching edits.
