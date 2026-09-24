# [Metoric Teachings](https://alokprateek.in) Source Code

Personal blog and portfolio of Alok Prateek — built with Astro 6, deployed on Cloudflare Pages.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6.4](https://astro.build) — static output, `@astrojs/cloudflare` adapter |
| Runtime | [Cloudflare Pages](https://pages.cloudflare.com) + [Cloudflare D1](https://developers.cloudflare.com/d1/) |
| Styling | PostCSS (custom media, nesting, mixins, preset-env, cssnano) |
| Content | Astro Content Layer — `glob()` loaders, MDX, YAML |
| PWA | `vite-plugin-pwa` with workbox |
| Type checking | TypeScript 5, `@astrojs/check` |
| Testing | Vitest (unit + regression), Playwright (E2E) |
| Formatting | Prettier + `prettier-plugin-astro` |

## Getting Started

### 1. Install dependencies

```shell
npm install
```

### 2. Start the dev server

```shell
npm run dev
```

The site is available at `http://localhost:4321`.

### 3. Build for production

```shell
npm run build
```

Runs `astro check` (type-check) then `astro build`. Output goes to `dist/` (`dist/client/` for static assets and `dist/server/` for Cloudflare server/worker assets). Cloudflare Pages deployment destination directory is configured to `dist/client`.

### 4. Preview on Cloudflare locally

```shell
npm run cfpreview
```

Serves the build via `wrangler dev --config dist/server/wrangler.json` with Cloudflare D1 bindings.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Astro dev server |
| `npm run build` | Type-check (`astro check`) + build |
| `npm run preview` | Astro preview server |
| `npm run cfpreview` | Wrangler-powered Cloudflare Pages preview |
| `npm run test:unit` | Run all Vitest unit + regression tests |
| `npm run test:unit:watch` | Vitest in watch mode |
| `npm run test:unit:coverage` | Vitest with V8 coverage |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test:regression` | Baseline diff regression runner (`scripts/verify-baseline-diff.js`) |
| `npm run test:db` | Verify D1 schema locally (`scripts/verify-database.js --local`) |
| `npm run db:migrate` | Run D1 migrations against remote |
| `npm run db:migrate:local` | Run D1 migrations against local SQLite |
| `npm run db:verify` | Verify remote D1 schema |
| `npm run db:verify:local` | Verify local D1 schema |

## Project Structure

```
.
├── public/                 # Static assets, favicons, RSS XSL, _headers, _redirects
├── src/
│   ├── components/         # Astro UI components (Head.astro, ClientRouterShim.astro, …)
│   ├── config/             # Site metadata, taxonomy, PWA manifest
│   ├── content/            # Markdown, MDX, YAML content + config.ts
│   ├── images/             # Image assets imported by Astro
│   ├── layouts/            # Layout.astro, PageLayout.astro
│   ├── lib/                # Utilities: slugging, remark plugins, analytics, shims
│   │   ├── content-shims.ts  # entryPath(), renderEntry() for Astro 6 Content Layer
│   │   └── page-events.ts    # onPageSwap() for astro:after-swap lifecycle
│   ├── pages/              # Routes, collection indexes, API endpoints
│   └── styles/             # Global CSS + CSS modules
├── scripts/                # DB migration/verification scripts, baseline diff runner
├── tests/                  # Vitest unit suites, Playwright E2E
├── docs/                   # Project documentation (see below)
├── skills/                 # Agent SOPs for recurring work patterns
├── .kiro/                  # Kiro IDE steering files and feature specs
├── astro.config.mjs        # Astro + Vite + integrations config
├── wrangler.toml           # Cloudflare D1 binding (DB / meteoric)
├── tsconfig.json           # TypeScript config with scoped path aliases
└── postcss.config.cjs      # PostCSS plugin chain
```

## Content Collections

All 8 collections use Astro Content Layer `glob()` loaders (`astro/loaders`). Schemas use `astro/zod`.

| Collection | Type | Source |
|---|---|---|
| `articles` | Content (MD/MDX) | `src/content/articles/` |
| `notes` | Content (MD/MDX) | `src/content/notes/` |
| `works` | Content (MD/MDX) | `src/content/works/` |
| `illustrations` | Content (MD/MDX) | `src/content/illustrations/` |
| `bibliophilediaries` | Content (MD/MDX) | `src/content/bibliophilediaries/` |
| `saasguide` | Content (MD/MDX) | `src/content/saasguide/` |
| `faqs` | Content (MD/MDX) | `src/content/faqs/` |
| `albums` | Data (YAML) | `src/content/albums/` |

Dynamic collection routes use `entry.id` (not `entry.slug`) and `renderEntry(entry)` from `src/lib/content-shims.ts`.

### Content frontmatter reference

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes | Page title |
| `path` | `string` | yes | Canonical URL path |
| `date` | `datetime` | yes | Published date |
| `last_modified_at` | `datetime` | yes | Last modified date |
| `excerpt` | `string` | yes | Description for listings and SEO |
| `image` | `string` | — | Cover image path (relative to MD file) |
| `categories` | `string[]` | — | Content categories |
| `tags` | `string[]` | — | Content tags |
| `toc` | `boolean` | — | Show table of contents |
| `hide_meta` | `boolean` | — | Hide date/read-time |
| `comments` | `boolean` | — | Enable comments |
| `comments_locked` | `boolean` | — | Lock comment thread |
| `featured` | `boolean` | — | Mark as featured |
| `draft` | `boolean` | — | Draft status (filtered from production) |

### Figures

```html
<figure>
  <img src="../../images/image.jpeg" alt="">
  <figcaption><p>Figure caption.</p></figcaption>
</figure>
```

Two-column and three-column variants use `class="two-column"` / `class="three-column"`.

### Thumbnail gallery

```html
<ul class="gallery-thumbnails">
  <li>
    <a href="../../images/thumbnail-1.jpeg">
      <img src="../../images/image-1.jpeg" alt="">
    </a>
  </li>
</ul>
```

### Browser frame

```html
<div class="browser-frame">
  <img src="../../images/webpage.jpeg" alt="">
</div>
```

### Button links

```html
<p>
  <a href="#" class="btn">Link label</a>
</p>
```

## Documentation

```
docs/
├── architecture/           # ARCHITECTURE.md — full system baseline
├── agentic-logs/           # Migration task files, original request, test reports
├── milestone-2-audit/      # Astro 6 breakage matrix, decisions, risk inventory, upgrade plan
├── milestone-3-d1/         # D1 API contract, API route review
├── milestone-4-content/    # SEO invariants, content collection review, analytics, campaigns
├── milestone-5-upgrade/    # Performance and resource-gating testing guides
├── kiro/                   # Mirror of .kiro/ steering docs and feature specs
├── baseline/               # Pre-upgrade HTML/XML snapshots for regression diffing
├── superpowers/            # Feature specs
└── tasks/                  # Granular task breakdowns
```

## Skills Directory

The `skills/` directory codifies standard operating procedures for recurring work:

| File | Covers |
|---|---|
| `documentation.md` | Architecture notes, README, agent task files |
| `content_edition.md` | Adding/editing MD, MDX, YAML content |
| `frontend_changes.md` | Astro components, layouts, CSS, pages |
| `backend_changes.md` | API routes, D1 helpers, analytics endpoints |
| `database_management.md` | D1 bindings, migrations, local verification |
| `deployment.md` | Cloudflare adapter, `_headers`, wrangler, previews |
| `test_and_build_verification.md` | Build gate, test suites, reporting |
| `astro-content-layer.md` | Adding/modifying collections with `glob()` loaders |
| `astro-client-router.md` | `<ClientRouter />`, `onPageSwap`, event lifecycle |
| `cloudflare-d1.md` | D1 binding usage, migration ordering, local verification |
| `cloudflare_pages_diagnostics.md` | Cloudflare Pages API querying, build logs, deployment retries |
| `human-agent-handoff.md` | Milestone handoff protocol, HUMAN_TASKS.md, and state tracking |
| `pwa.md` | Progressive Web App, service worker lifecycle, Workbox caching |
| `testing.md` | Vitest and Playwright conventions, D1 mocks, and build verification |

## Branch Workflow

- **Never commit directly to `main`.**
- Branch prefixes: `feature/`, `docs/`, `maintenance/`, `content/`
- One branch per task; Alok reviews and merges into `main`.
- Preserve SEO metadata, Cloudflare D1 bindings, and HTML structure unless a reviewed task explicitly changes them.
- Treat React components as read-only unless Alok explicitly assigns React work.

## Cloudflare D1

| Property | Value |
|---|---|
| Binding name | `DB` |
| Database name | `meteoric` |
| Database ID | `8380ec22-098e-4814-a56f-48d907425b35` |
| Compatibility flag | `nodejs_compat` |

Runtime access: `locals.runtime.env.DB`. All API routes validate the binding via `getDatabase(locals)` in `src/lib/api/database.ts`.

## Path Aliases

Configured in `tsconfig.json`. Use explicit prefixes only — wildcard `@*` aliases break Vite 7 dev mode by shadowing `@vite/env` internals.

| Alias | Resolves to |
|---|---|
| `@/*` | `src/*` |
| `@components/*` | `src/components/*` |
| `@config/*` | `src/config/*` |
| `@layouts/*` | `src/layouts/*` |
| `@lib/*` | `src/lib/*` |
| `@styles/*` | `src/styles/*` |

## Migration History

This site migrated from Astro 4.15 to Astro 6 as **Project Astro-Ascension** (v5.0.0 release). The full migration plan, decisions log, task files, and test reports are in `docs/agentic-logs/` and `docs/milestone-*` subdirectories. See `docs/architecture/ARCHITECTURE.md` for the current system baseline.
