# Astro 6.2 Breakage Matrix

## Overview
This matrix cross-walks Astro 5.0 and 6.0 breaking changes against the current repository state to identify required actions before upgrading.

| Change | Affected Files | Severity | Owner | Mitigation Branch |
| :--- | :--- | :--- | :--- | :--- |
| **Deprecated APIs** (`Astro.glob`, `getEntryBySlug`, `Astro.cookies` shape, etc.) | None found. A full repo sweep confirmed that these legacy APIs are not present in `.astro`, `.ts`, `.js`, or `.mjs` files. | Low | Gemini | N/A |
| **`astro:transitions`** | `src/components/Head.astro` (uses `<ViewTransitions />`) | Low | Gemini | N/A |
| **Vite Major Bump** | Ecosystem plugins such as `vite-plugin-pwa` may require updates for Vite 6 compatibility. | High | Codex | `maintenance/astro-deps-dry-run` |
| **Node Engine Bump** | `package.json` needs to enforce `>=18.17.1` or `>=20.3.0` depending on the final Astro 6 requirement. | Medium | Codex | `maintenance/astro-deps-dry-run` |
| **Content Layer API** | Existing collections (`src/content/config.ts`) may need to migrate from `defineCollection` to `Loader` APIs if custom loading is required, though existing MDX collections should still work. | Medium | Claude | `feature/astro-6-entry-api` |
| **`@astrojs/cloudflare`** | The Cloudflare adapter might have changed how `locals.runtime.env` is shaped or its deployment dependencies (`wrangler`). | High | Codex | `docs/d1-api-review` |

## Dependency Audit (`package.json`)
- `astro`: Currently `^4.15.12`. Needs to be pinned to `^6.2.0`.
- `@astrojs/cloudflare`: Currently `^11.0.1`. Must be updated alongside Astro.
- `@astrojs/check`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`: Ensure matching ^6.0.0 versions or their respective Astro 6 compatible versions.
- `vite-plugin-pwa`: Currently `^0.16.4`. Needs verification against Vite 6.
- `typescript`: Currently `^5.4.5`. Safe to bump to `^5.5.x` or higher.
- `wrangler`: Currently `^4.28.1`. Keep updated for latest D1 API support.

## Content Layer Recipes Review
- No direct usage of `Astro.glob` or `getEntryBySlug` was found.
- The 8 collections should migrate using the standard `glob()` loader to avoid URL or RSS link drift.
