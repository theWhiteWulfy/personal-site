# Astro 4.15 to 6.2 Risk Inventory

This document outlines the upgrade risks identified during the baseline review of `theWhiteWulfy/personal-site` before initiating the Astro 4.15 to 6.2 upgrade.

## 1. Content Collections Legacy Compatibility
- **Risk**: Astro 5 introduced the Content Layer API, and Astro 6 removes automatic legacy compatibility for collections without loaders.
- **Impact**: Breaking changes for the current `src/content/config.ts` which uses `defineCollection` without the newer loader pattern.
- **Locations**: `src/content/config.ts` and all dynamically generated pages using `getCollection()`.
- **Mitigation**: A dedicated migration branch must update `src/content/config.ts` to use Astro 6 compatible loaders (e.g., `glob()` loader) for existing Markdown and YAML collections before completing the version bump.

## 2. API Changes: `entry.slug` and `entry.render()`
- **Risk**: The legacy content collection API provides `entry.slug` and `entry.render()`. In newer Astro content layers (Astro 5+), `slug` might be handled differently or exposed as `id`, and rendering mechanisms have evolved.
- **Impact**: All detail pages will break if these properties are undefined.
- **Locations**: `src/pages/articles/[...slug].astro`, `src/pages/notes/[...slug].astro`, etc.
- **Mitigation**: Audit and update property access across all `[...slug].astro` files to ensure compatibility with the updated Content Layer output.

## 3. View Transitions Removal
- **Risk**: Astro 6 completely removes the `<ViewTransitions />` component, replacing it with the `<ClientRouter />` component.
- **Impact**: The site's client-side routing, view transitions, and associated event hooks (like `astro:after-swap`) will break if not updated.
- **Locations**: `src/components/Head.astro` where `<ViewTransitions />` is imported and used, and client scripts using `document.addEventListener('astro:after-swap', ...)`.
- **Mitigation**: Replace `<ViewTransitions />` with `<ClientRouter />` from `astro:transitions` and verify that `astro:after-swap` events still trigger correctly for analytics re-initialization.

## 4. Cloudflare Adapter and D1 Bindings
- **Risk**: The upgrade to Astro 6 will likely require a major version bump of `@astrojs/cloudflare`. Changes to how `locals.runtime.env` is structured or provided could break API routes.
- **Impact**: All server-side endpoints interacting with D1 databases (`newsletter.ts`, `leadform.ts`, `resource-download.ts`, etc.) will fail, causing data loss or broken features.
- **Locations**: `src/env.d.ts`, `wrangler.toml`, and all files in `src/pages/api/`.
- **Mitigation**: Carefully review the release notes for `@astrojs/cloudflare` alongside Astro 6. Verify that `locals.runtime.env.DB` remains accessible and the runtime shapes align.

## 5. Build and Vite Plugin Ecosystem
- **Risk**: Astro 6 utilizes a newer version of Vite. This can cause compatibility issues with older PostCSS plugins, `vite-plugin-pwa`, and MDX/RSS integrations.
- **Impact**: The build process may fail, or the generated output (like PWA manifests or CSS) may be incorrect.
- **Locations**: `astro.config.mjs`, `postcss.config.cjs`, `package.json`.
- **Mitigation**: Perform a trial build (`npm run build`) in isolation after bumping dependencies. Test local preview and Cloudflare preview thoroughly. Check all PostCSS plugin compatibilities.

## 6. Schema and Metadata Regression
- **Risk**: Changes in Astro's rendering pipeline or the `Astro.url` object could affect the output of canonical URLs, JSON-LD schemas, and Open Graph tags.
- **Impact**: Negative SEO impact if canonical URLs change or schemas become malformed.
- **Locations**: `src/components/Head.astro`, `src/lib/schema-generators.ts`.
- **Mitigation**: Diff the generated HTML output of key pages before and after the upgrade to ensure zero metadata drift.
