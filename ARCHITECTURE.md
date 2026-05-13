# Architecture

This document records the first-run structural baseline for `theWhiteWulfy/personal-site`. The DeepWiki reference for this repository is `deepwiki.io/theWhiteWulfy/personal-site`; local repository inspection remains the source of truth for this baseline.

## Runtime Shape

The site is an Astro 4.15 project configured in `astro.config.mjs`.

- `site` is set to `https://alokprateek.in/`.
- Output mode is `hybrid`, so static pages and server-rendered API routes coexist.
- Integrations include `@astrojs/sitemap`, `@astrojs/mdx`, `@playform/compress`, and `vite-plugin-pwa`.
- The Cloudflare adapter is enabled through `@astrojs/cloudflare` with `platformProxy.enabled` and passthrough image service behavior.
- Markdown uses Prism highlighting and remark plugins for reading time and modified time.

The project currently targets Astro `^4.15.12` with `@astrojs/cloudflare ^11.0.1`, `@astrojs/mdx ^3.1.0`, and `@astrojs/rss ^4.0.6`.

## Source Layout

- `src/pages/` contains route files, content indexes, dynamic collection detail routes, service pages, and API endpoints.
- `src/layouts/` contains shared page shells.
- `src/components/` contains Astro UI components, metadata components, service blocks, forms, navigation, and icons.
- `src/styles/` contains global CSS and CSS modules for page and component styling.
- `src/config/` contains site metadata, taxonomy, system constants, and the PWA manifest.
- `src/lib/` contains slugging, remark plugins, schema generators, analytics helpers, campaign utilities, resource helpers, and API support code.
- `src/content/` contains Markdown, MDX, and YAML-backed content collections.
- `src/images/` contains imported image assets used by Astro and content.
- `public/` contains static assets, favicons, RSS styling, redirects, headers, experiments, PDFs, and public images.
- `scripts/` currently contains ordered SQL migration files.

## Content Collections

`src/content/config.ts` defines Astro content collections with `defineCollection` from `astro:content`.

Content collections:

- `articles`
- `notes`
- `works`
- `illustrations`
- `bibliophilediaries`
- `saasguide`
- `faqs`

Data collection:

- `albums`

The collections use the Astro 4 legacy-style shape with `type: "content"` and `type: "data"`. Dynamic route files use `getCollection()`, collection entry filtering, `entry.slug`, and `entry.render()`.

Astro 6.2 planning note: do not proactively migrate these collections to the Astro 5+ loader pattern during the baseline. The official Astro v6 upgrade path indicates that automatic legacy collection compatibility is removed in v6, and the project should first use a phased compatibility strategy before any content-layer migration.

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

`src/components/Head.astro` is the main metadata surface.

It owns or coordinates:

- viewport, canonical URL, generator, RSS alternate, author links, and favicon links;
- title, description, image, keyword, Open Graph, and Twitter metadata;
- IndieWeb pingback, webmention, and micropub links;
- Schema.org JSON-LD generation through `src/lib/schema-generators.ts`;
- Google Analytics 4 and Microsoft Clarity initialization through `src/lib/analytics.ts`;
- analytics consent and opt-out browser helpers;
- copy-code button behavior for rendered content;
- Astro view transition setup.

Astro 6.2 planning note: the current metadata component imports `ViewTransitions` from `astro:transitions` and renders `<ViewTransitions />`. Astro 6 removes that API in favor of the newer client router component, so this must be handled in a dedicated compatibility branch without mixing in unrelated UI changes.

## Cloudflare And D1

Cloudflare configuration lives in `wrangler.toml`.

- Compatibility flag: `nodejs_compat`.
- D1 binding name: `DB`.
- D1 database name: `meteoric`.
- D1 database id: `8380ec22-098e-4814-a56f-48d907425b35`.

Runtime typing is declared in `src/env.d.ts`, where `App.Locals` extends the Cloudflare runtime and exposes `locals.runtime.env.DB`.

The D1 binding is used by API routes and helpers for newsletter signups, lead forms, resource downloads, campaign visits, campaign signups, campaign management, analytics, and security checks.

Preservation rule: the `DB` binding name, runtime access pattern, and Cloudflare adapter behavior are architecture-sensitive and must not be changed during documentation bootstrap.

## API Surface

API routes live in `src/pages/api/`.

- `newsletter.ts` writes newsletter emails to D1.
- `leadform.ts` writes lead form submissions to D1.
- `resource-download.ts` validates resource download requests, performs security checks, writes download records, and logs analytics.
- `serve-resource.ts` validates tokenized access and serves protected resource downloads.
- `campaigns.ts` provides campaign management and analytics reads.
- `campaign-visit.ts` records and lists campaign visits.
- `campaign-signup.ts` records campaign signups and analytics events.

Shared API utilities live in `src/lib/api/`, including validation, security, UTM tracking, and database helpers.

## Gallery And Static Experiments

The image gallery is backed by `albums` YAML data and image assets under `src/content/albums/`. Public web experiments live under `public/web/experiment/` with standalone HTML, CSS, and JavaScript. These experiments are static assets and should be preserved during framework work unless assigned directly.

## Build And Verification

Primary scripts:

- `npm run dev` / `npm start`: Astro development server.
- `npm run build`: runs `astro check` and `astro build`.
- `npm run preview`: Astro preview.
- `npm run cfpreview`: Cloudflare Pages local preview over `./dist`.
- `npm run db:migrate`, `npm run db:migrate:local`, `npm run db:verify`, and `npm run db:verify:local`: declared database commands.

Known baseline finding: `package.json` references `scripts/migrate-database.js` and `scripts/verify-database.js`, but the current `scripts/` directory contains only SQL files. This is a maintenance finding, not a bootstrap fix.

## Upgrade Risks

- Astro 6 legacy collection compatibility requires deliberate handling before any migration to loaders.
- `entry.render()` and `entry.slug` usage must be audited before removing legacy compatibility.
- `<ViewTransitions />` must be replaced in a focused compatibility branch.
- Cloudflare adapter and runtime typing should be checked against the target Astro and adapter versions before dependency upgrades.
- SEO metadata, schema output, RSS, sitemap, and analytics scripts have high regression impact and need build plus rendered-output verification.
- D1 API routes depend on `locals.runtime.env.DB`; local and Cloudflare preview behavior should be verified after runtime changes.
