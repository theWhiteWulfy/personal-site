# Claude Tasks

Claude Opus / Anti-Gravity is the Architect. This file owns deep architecture documentation, structural analysis, and repository evaluation.

## Active: First-Run Baseline

- [x] Review the full Astro project structure and document the architectural map in `ARCHITECTURE.md`.
- [x] Document the content collection model, including `src/content/config.ts`, collection folders, and gallery data.
- [x] Document SEO, schema, RSS, sitemap, analytics, and metadata flow.
- [x] Document Cloudflare deployment shape, D1 binding `DB`, and API route database access patterns.
- [x] Record first-run findings without changing runtime code, UI, migrations, or dependencies.

## Upcoming: Astro 6.2 Architecture Review

- [ ] Compare the current Astro 4.15 architecture against the Astro 6.2 upgrade guide.
- [ ] Define a phased migration strategy that temporarily preserves legacy collection behavior.
- [ ] Identify architecture decisions that need Alok review before implementation.
- [ ] Keep `central_milestones.md` milestone-level and put detailed architecture tasks here.

## Boundaries

- Do not edit app logic or UI components.
- Do not migrate content collections.
- Do not change Cloudflare D1 bindings.
- Do not commit directly to `main`.
